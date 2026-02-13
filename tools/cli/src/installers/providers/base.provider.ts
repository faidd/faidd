// base.provider.ts — shared foundation for all IDE providers
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import YAML from 'yaml';

export abstract class BaseProvider {
  protected bunkerName = '_faidd';

  constructor(
    protected readonly id: string,
    protected readonly displayName: string
  ) {}

  // let the installer set a custom bunker folder name
  setBunkerName(name: string) {
    this.bunkerName = name;
  }

  // -- logging --

  protected logInfo(msg: string) {
    console.log(chalk.dim(`  - ${msg}`));
  }

  protected logSuccess(msg: string) {
    console.log(chalk.green(`✓ ${this.displayName}: ${msg}`));
  }

  protected logWarn(msg: string) {
    console.log(chalk.yellow(`⚠ ${this.displayName}: ${msg}`));
  }

  // -- fs helpers (thin wrappers to avoid repeating fs-extra everywhere) --

  protected async ensureDir(dirPath: string) {
    await fs.ensureDir(dirPath);
  }

  protected async exists(targetPath: string): Promise<boolean> {
    return fs.pathExists(targetPath);
  }

  protected async remove(targetPath: string) {
    await fs.remove(targetPath);
  }

  protected async writeFile(filePath: string, content: string) {
    await fs.ensureDir(path.dirname(filePath));
    // replace _bmad placeholder with actual bunker name
    const processed = content.replaceAll('_bmad', this.bunkerName);
    await fs.writeFile(filePath, processed);
  }

  protected async readFile(filePath: string): Promise<string> {
    return fs.readFile(filePath, 'utf8');
  }

  protected async copyFile(src: string, dest: string) {
    await fs.ensureDir(path.dirname(dest));

    // for text files, replace _bmad placeholder during copy
    const ext = path.extname(src).toLowerCase();
    const textExts = ['.md', '.xml', '.yaml', '.yml', '.txt', '.json', '.toml', '.mdc'];
    if (textExts.includes(ext)) {
      let content = await fs.readFile(src, 'utf8');
      content = content.replaceAll('_bmad', this.bunkerName);
      await fs.writeFile(dest, content);
    } else {
      await fs.copy(src, dest);
    }
  }

  protected async readJson<T = unknown>(filePath: string): Promise<T> {
    return fs.readJson(filePath) as Promise<T>;
  }

  protected async writeJson(filePath: string, data: unknown, spaces: number = 2) {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeJson(filePath, data, { spaces });
  }

  protected async readYaml<T = Record<string, unknown>>(filePath: string): Promise<T> {
    const content = await fs.readFile(filePath, 'utf8');
    return YAML.parse(content) as T;
  }

  // -- content processing --

  // replace all standard placeholders in content destined for IDE command files
  protected processContent(
    content: string,
    projectDir: string
  ): string {
    return content
      .replaceAll('_bmad', this.bunkerName)
      .replaceAll('{project-root}', projectDir);
  }

  // scan a directory for files matching specific extensions
  protected async scanDir(
    dir: string,
    extensions: string | string[] = '.md'
  ): Promise<{ name: string; path: string; ext: string }[]> {
    if (!(await this.exists(dir))) return [];

    const exts = Array.isArray(extensions) ? extensions : [extensions];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const results: { name: string; path: string; ext: string }[] = [];

    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (!exts.includes(ext)) continue;

      results.push({
        name: path.basename(entry.name, ext),
        path: path.join(dir, entry.name),
        ext,
      });
    }

    return results;
  }

  // get the standard agent activation header (consistent across all IDEs)
  protected getActivationHeader(): string {
    return [
      'You must fully embody this agent and follow all instructions exactly.',
      '',
      '<agent-activation CRITICAL="TRUE">',
      '1. LOAD the FULL agent file.',
      '2. READ its entire contents — persona, menu, and instructions.',
      '3. FOLLOW every step in the <activation> section precisely.',
      '4. DISPLAY the welcome/greeting.',
      '5. PRESENT the numbered menu and WAIT for user input.',
      '</agent-activation>',
    ].join('\n');
  }
}
