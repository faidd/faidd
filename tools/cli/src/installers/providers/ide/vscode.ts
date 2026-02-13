// vscode.ts — VS Code / VS Code Insiders provider
// manages workspace settings, extension recommendations, and security exclusions
import path from 'path';
import chalk from 'chalk';
import { IProvider, ProviderMetadata } from '../registry.js';
import { BaseProvider } from '../base.provider.js';

export class VSCodeProvider extends BaseProvider implements IProvider {
  readonly metadata: ProviderMetadata = {
    name: 'vscode',
    displayName: 'VS Code',
    category: 'IDE',
  };

  constructor() {
    super('vscode', 'VS Code');
  }

  async detect(projectDir: string): Promise<boolean> {
    return this.exists(path.join(projectDir, '.vscode'));
  }

  async setup(projectDir: string): Promise<void> {
    console.log(chalk.cyan(`Setting up ${this.displayName}...`));

    const vscodeDir = path.join(projectDir, '.vscode');
    await this.ensureDir(vscodeDir);

    // 1. workspace settings — exclude bunker from search/watchers
    await this.deploySettings(vscodeDir);

    // 2. extension recommendations
    await this.deployExtensions(vscodeDir);

    this.logSuccess('Setup complete.');
  }

  private async deploySettings(vscodeDir: string) {
    const settingsPath = path.join(vscodeDir, 'settings.json');
    const existing = await this.exists(settingsPath)
      ? await this.readJson<Record<string, unknown>>(settingsPath)
      : {};

    // merge faidd-specific settings without overwriting user's config
    const faidSettings: Record<string, unknown> = {
      // exclude bunker from file watchers (performance)
      'files.watcherExclude': {
        ...(existing['files.watcherExclude'] as Record<string, boolean> || {}),
        [`**/${this.bunkerName}/_memory/**`]: true,
      },
      // exclude from search
      'search.exclude': {
        ...(existing['search.exclude'] as Record<string, boolean> || {}),
        [`**/${this.bunkerName}/_memory/**`]: true,
      },
      // mark bunker as read-only hint
      'files.readonlyInclude': {
        ...(existing['files.readonlyInclude'] as Record<string, boolean> || {}),
        [`**/${this.bunkerName}/**`]: true,
      },
    };

    const merged = { ...existing, ...faidSettings };
    await this.writeJson(path.join(vscodeDir, 'settings.json'), merged);
    this.logInfo('Workspace settings updated.');
  }

  private async deployExtensions(vscodeDir: string) {
    const extPath = path.join(vscodeDir, 'extensions.json');
    const existing = await this.exists(extPath)
      ? await this.readJson<{ recommendations?: string[] }>(extPath)
      : {};

    const recommendations = new Set(existing.recommendations || []);
    // useful extensions for working with FAIDD
    recommendations.add('esbenp.prettier-vscode');

    await this.writeJson(extPath, {
      ...existing,
      recommendations: Array.from(recommendations),
    });
    this.logInfo('Extension recommendations updated.');
  }
}
