// detector.ts — detects existing FAIDD installations and legacy formats
import fs from 'fs-extra';
import path from 'path';
import YAML from 'yaml';

export interface InstallationInfo {
  installed: boolean;
  path: string;
  version: string | null;
  hasCore: boolean;
  modules: ModuleInfo[];
  ides: string[];
  manifest: Record<string, unknown> | null;
}

export interface ModuleInfo {
  id: string;
  path: string;
  version: string;
  name?: string;
  description?: string;
}

export interface LegacyInfo {
  hasLegacy: boolean;
  legacyCore: boolean;
  legacyModules: { name: string; path: string }[];
  paths: string[];
}

export class Detector {
  // check if a FAIDD installation exists in the given bunker directory
  async detect(bunkerDir: string): Promise<InstallationInfo> {
    const result: InstallationInfo = {
      installed: false,
      path: bunkerDir,
      version: null,
      hasCore: false,
      modules: [],
      ides: [],
      manifest: null,
    };

    if (!(await fs.pathExists(bunkerDir))) return result;

    // try reading the manifest first — it's the source of truth
    const manifestPath = path.join(bunkerDir, '_config', 'manifest.yaml');
    if (await fs.pathExists(manifestPath)) {
      try {
        const raw = await fs.readFile(manifestPath, 'utf8');
        const manifest = YAML.parse(raw) as Record<string, unknown>;
        result.manifest = manifest;
        result.version = (manifest.version as string) ?? null;
        result.installed = true;

        if (Array.isArray(manifest.ides)) {
          result.ides = manifest.ides.filter((ide: unknown) => typeof ide === 'string');
        }

        // use manifest's module list if available
        if (Array.isArray(manifest.modules)) {
          for (const moduleId of manifest.modules as string[]) {
            const info = await this.readModuleConfig(bunkerDir, moduleId);
            result.modules.push(info);
          }
        }
      } catch {
        // corrupt manifest — fall through to directory scan
      }
    }

    // check for core
    const corePath = path.join(bunkerDir, 'core');
    if (await fs.pathExists(corePath)) {
      result.hasCore = true;

      // grab version from core config if we don't have one yet
      if (!result.version) {
        const coreVersion = await this.readVersionFromConfig(path.join(corePath, 'config.yaml'));
        if (coreVersion) result.version = coreVersion;
      }
    }

    // fallback: scan directories if manifest didn't give us modules
    if (result.modules.length === 0) {
      const entries = await fs.readdir(bunkerDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory() || entry.name === 'core' || entry.name.startsWith('_')) continue;
        const configPath = path.join(bunkerDir, entry.name, 'config.yaml');
        if (await fs.pathExists(configPath)) {
          const info = await this.readModuleConfig(bunkerDir, entry.name);
          result.modules.push(info);
        }
      }
    }

    if (result.hasCore || result.modules.length > 0) {
      result.installed = true;
    }

    return result;
  }

  // detect legacy installation formats (_faidd-method, .faidd, etc)
  async detectLegacy(projectDir: string): Promise<LegacyInfo> {
    const result: LegacyInfo = {
      hasLegacy: false,
      legacyCore: false,
      legacyModules: [],
      paths: [],
    };

    // check for old-style _faidd-method folder
    const legacyCorePath = path.join(projectDir, '_faidd-method');
    if (await fs.pathExists(legacyCorePath)) {
      result.hasLegacy = true;
      result.legacyCore = true;
      result.paths.push(legacyCorePath);
    }

    // check for dot-prefixed module folders (legacy convention)
    const entries = await fs.readdir(projectDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || !entry.name.startsWith('.')) continue;
      // skip known non-faidd dot folders
      if (['.git', '.vscode', '.idea', '.cursor', '.claude'].some(s => entry.name.startsWith(s))) continue;

      const modulePath = path.join(projectDir, entry.name);
      const hasManifest = await fs.pathExists(path.join(modulePath, 'install-manifest.yaml'));
      const hasConfig = await fs.pathExists(path.join(modulePath, 'config.yaml'));

      if (hasManifest || hasConfig) {
        result.hasLegacy = true;
        result.legacyModules.push({ name: entry.name.slice(1), path: modulePath });
        result.paths.push(modulePath);
      }
    }

    return result;
  }

  // check if migration from legacy is needed
  async checkMigrationNeeded(projectDir: string, bunkerDir: string) {
    const current = await this.detect(bunkerDir);
    const legacy = await this.detectLegacy(projectDir);
    return {
      needed: legacy.hasLegacy && !current.installed,
      canMigrate: legacy.hasLegacy,
      legacy,
      current,
    };
  }

  // -- helpers --

  private async readModuleConfig(bunkerDir: string, moduleId: string): Promise<ModuleInfo> {
    const modulePath = path.join(bunkerDir, moduleId);
    const info: ModuleInfo = { id: moduleId, path: modulePath, version: 'unknown' };
    const configPath = path.join(modulePath, 'config.yaml');

    if (await fs.pathExists(configPath)) {
      try {
        const raw = await fs.readFile(configPath, 'utf8');
        const config = YAML.parse(raw) as Record<string, unknown>;
        info.version = (config.version as string) ?? 'unknown';
        info.name = (config.name as string) ?? moduleId;
        info.description = config.description as string | undefined;
      } catch { /* ignore */ }
    }
    return info;
  }

  private async readVersionFromConfig(configPath: string): Promise<string | null> {
    if (!(await fs.pathExists(configPath))) return null;
    try {
      const raw = await fs.readFile(configPath, 'utf8');
      const config = YAML.parse(raw) as Record<string, unknown>;
      return (config.version as string) ?? null;
    } catch {
      return null;
    }
  }
}
