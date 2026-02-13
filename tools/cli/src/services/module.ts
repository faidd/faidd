// module.ts — module install, update, remove, and discovery
import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import chalk from 'chalk';
import YAML from 'yaml';

export interface ModuleMeta {
  id: string;
  code: string;
  name: string;
  description: string;
  version: string;
  path: string;
  dependencies: string[];
  isCustom: boolean;
  defaultSelected: boolean;
}

export interface InstallResult {
  success: boolean;
  module: string;
  path: string;
}

export class ModuleService {
  private bunkerName = '_faidd';
  private customPaths = new Map<string, string>();

  // configurable source root (where src/modules/ lives)
  constructor(private sourceRoot: string = '') {}

  setBunkerName(name: string) {
    this.bunkerName = name;
  }

  setCustomPaths(paths: Map<string, string>) {
    this.customPaths = paths;
  }

  // -- discovery --

  // list all available modules from the source tree
  async listAvailable(): Promise<{ modules: ModuleMeta[]; custom: ModuleMeta[] }> {
    const modules: ModuleMeta[] = [];
    const custom: ModuleMeta[] = [];

    const modulesDir = path.join(this.sourceRoot, 'src', 'modules');
    if (!(await fs.pathExists(modulesDir))) return { modules, custom };

    const entries = await fs.readdir(modulesDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === 'core') continue;

      const modulePath = path.join(modulesDir, entry.name);
      const meta = await this.readModuleMeta(modulePath, entry.name);
      if (!meta) continue;

      if (meta.isCustom) {
        custom.push(meta);
      } else {
        modules.push(meta);
      }
    }

    return { modules, custom };
  }

  // read module.yaml metadata from a module directory
  async readModuleMeta(modulePath: string, fallbackName: string): Promise<ModuleMeta | null> {
    // look for config in multiple places
    const candidates = [
      path.join(modulePath, 'module.yaml'),
      path.join(modulePath, '_module-installer', 'module.yaml'),
      path.join(modulePath, '_module-installer', 'custom.yaml'),
      path.join(modulePath, 'custom.yaml'),
    ];

    let configPath: string | null = null;
    for (const candidate of candidates) {
      if (await fs.pathExists(candidate)) {
        configPath = candidate;
        break;
      }
    }

    if (!configPath) return null;

    try {
      const content = await fs.readFile(configPath, 'utf8');
      const config = YAML.parse(content) as Record<string, unknown>;
      const isCustom = configPath.includes('custom.yaml');

      return {
        id: (config.code as string) ?? fallbackName,
        code: (config.code as string) ?? fallbackName,
        name: (config.name as string) ?? this.humanize(fallbackName),
        description: (config.description as string) ?? '',
        version: (config.version as string) ?? '1.0.0',
        path: modulePath,
        dependencies: (config.dependencies as string[]) ?? [],
        isCustom,
        defaultSelected: (config.default_selected as boolean) ?? false,
      };
    } catch {
      return null;
    }
  }

  // find where a module's source files live (custom paths, src/modules, etc.)
  async findSource(moduleCode: string): Promise<string | null> {
    // priority: custom paths first
    if (this.customPaths.has(moduleCode)) {
      return this.customPaths.get(moduleCode)!;
    }

    // search src/modules by reading each module.yaml
    const modulesDir = path.join(this.sourceRoot, 'src', 'modules');
    if (!(await fs.pathExists(modulesDir))) return null;

    const entries = await fs.readdir(modulesDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const modulePath = path.join(modulesDir, entry.name);
      const meta = await this.readModuleMeta(modulePath, entry.name);
      if (meta && meta.code === moduleCode) {
        return modulePath;
      }
    }

    return null;
  }

  // -- install --

  async install(
    moduleCode: string,
    bunkerDir: string,
    options: {
      moduleConfig?: Record<string, unknown>;
      onFile?: (filePath: string) => void;
    } = {}
  ): Promise<InstallResult> {
    const sourcePath = await this.findSource(moduleCode);
    if (!sourcePath) {
      throw new Error(`Source for module '${moduleCode}' not found.`);
    }

    const targetPath = path.join(bunkerDir, moduleCode);

    // clean install: remove old version if exists
    if (await fs.pathExists(targetPath)) {
      await fs.remove(targetPath);
    }

    // copy with filtering — skip installer-only files, sidecars, sub-modules
    await this.copyWithFiltering(sourcePath, targetPath, options);

    // handle agent sidecar directories -> _memory
    await this.deploySidecars(sourcePath, moduleCode, bunkerDir);

    return { success: true, module: moduleCode, path: targetPath };
  }

  // -- update --

  async update(
    moduleCode: string,
    bunkerDir: string,
    force: boolean = false
  ): Promise<InstallResult> {
    const sourcePath = await this.findSource(moduleCode);
    if (!sourcePath) throw new Error(`Source for module '${moduleCode}' not found.`);

    const targetPath = path.join(bunkerDir, moduleCode);
    if (!(await fs.pathExists(targetPath))) throw new Error(`Module '${moduleCode}' is not installed.`);

    if (force) {
      // force: wipe and reinstall
      await fs.remove(targetPath);
      return this.install(moduleCode, bunkerDir);
    }

    // smart sync: only overwrite files the user hasn't modified
    await this.smartSync(sourcePath, targetPath);

    return { success: true, module: moduleCode, path: targetPath };
  }

  // -- remove --

  async remove(moduleCode: string, bunkerDir: string): Promise<{ success: boolean; module: string }> {
    const targetPath = path.join(bunkerDir, moduleCode);
    if (!(await fs.pathExists(targetPath))) throw new Error(`Module '${moduleCode}' is not installed.`);

    await fs.remove(targetPath);

    // also clean up sidecar in _memory
    const memoryDir = path.join(bunkerDir, '_memory');
    if (await fs.pathExists(memoryDir)) {
      const entries = await fs.readdir(memoryDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.endsWith('-sidecar')) {
          await fs.remove(path.join(memoryDir, entry.name));
        }
      }
    }

    return { success: true, module: moduleCode };
  }

  // check if a module is installed
  async isInstalled(moduleCode: string, bunkerDir: string): Promise<boolean> {
    return fs.pathExists(path.join(bunkerDir, moduleCode));
  }

  // -- private --

  // copy module source to target, skipping files that shouldn't be deployed
  private async copyWithFiltering(
    sourcePath: string,
    targetPath: string,
    options: { moduleConfig?: Record<string, unknown>; onFile?: (path: string) => void } = {}
  ) {
    const files = await this.walkRelative(sourcePath);

    for (const file of files) {
      // skip directories that are handled separately or aren't deployed
      if (file.startsWith('sub-modules/')) continue;
      if (file.startsWith('_module-installer/')) continue;
      if (file === 'module.yaml') continue;
      if (file === 'custom.yaml') continue;
      if (file.endsWith('.agent.yaml')) continue; // compiled separately
      if (this.isSidecarPath(file)) continue;

      const src = path.join(sourcePath, file);
      const dest = path.join(targetPath, file);

      await fs.ensureDir(path.dirname(dest));

      // text files get placeholder replacement
      if (this.isTextFile(file)) {
        let content = await fs.readFile(src, 'utf8');
        content = content.replaceAll('_bmad', this.bunkerName);
        await fs.writeFile(dest, content);
      } else {
        await fs.copy(src, dest);
      }

      options.onFile?.(dest);
    }
  }

  // smart sync: only overwrite files that haven't been modified by the user
  private async smartSync(sourcePath: string, targetPath: string) {
    const files = await this.walkRelative(sourcePath);

    for (const file of files) {
      if (file.startsWith('sub-modules/') || file.startsWith('_module-installer/')) continue;
      if (file === 'module.yaml' || file === 'custom.yaml') continue;
      if (this.isSidecarPath(file)) continue;

      const src = path.join(sourcePath, file);
      const dest = path.join(targetPath, file);

      if (!(await fs.pathExists(dest))) {
        // new file — just copy it
        await fs.ensureDir(path.dirname(dest));
        await fs.copy(src, dest);
        continue;
      }

      // compare checksums to detect user modifications
      const srcHash = await this.hash(src);
      const destHash = await this.hash(dest);
      if (srcHash !== destHash) {
        // file was modified — don't overwrite
        if (process.env.FAIDD_VERBOSE === 'true') {
          console.log(chalk.dim(`  Preserving modified: ${file}`));
        }
      }
    }
  }

  // copy agent sidecar directories to _memory
  private async deploySidecars(sourcePath: string, moduleCode: string, bunkerDir: string) {
    const agentsDir = path.join(sourcePath, 'agents');
    if (!(await fs.pathExists(agentsDir))) return;

    const entries = await fs.readdir(agentsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || !entry.name.endsWith('-sidecar')) continue;

      const agentName = entry.name.replace('-sidecar', '');
      const sidecarSrc = path.join(agentsDir, entry.name);
      const sidecarDest = path.join(bunkerDir, '_memory', `${agentName}-sidecar`);

      await fs.ensureDir(sidecarDest);
      await fs.copy(sidecarSrc, sidecarDest, { overwrite: false });
    }
  }

  // -- utils --

  private async walkRelative(dir: string): Promise<string[]> {
    const results: string[] = [];
    const walk = async (current: string, prefix: string) => {
      const entries = await fs.readdir(current, { withFileTypes: true });
      for (const entry of entries) {
        const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          await walk(path.join(current, entry.name), rel);
        } else {
          results.push(rel);
        }
      }
    };
    await walk(dir, '');
    return results;
  }

  private async hash(filePath: string): Promise<string> {
    const content = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(content).digest('hex').slice(0, 12);
  }

  private isSidecarPath(file: string): boolean {
    return file.split('/').some(seg => seg.endsWith('-sidecar'));
  }

  private isTextFile(file: string): boolean {
    const ext = path.extname(file).toLowerCase();
    return ['.md', '.xml', '.yaml', '.yml', '.txt', '.json', '.toml', '.mdc'].includes(ext);
  }

  private humanize(slug: string): string {
    return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
}
