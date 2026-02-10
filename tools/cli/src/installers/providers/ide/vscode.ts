import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { IProvider, ProviderMetadata } from '../registry.js';

/**
 * VSCode Provider (Elite)
 * Handles workspace settings, file exclusions, and extension recommendations.
 */
export class VSCodeProvider implements IProvider {
  readonly metadata: ProviderMetadata = {
    name: 'vscode',
    displayName: 'Visual Studio Code',
    category: 'IDE'
  };

  private readonly configDir = '.vscode';

  async detect(projectDir: string): Promise<boolean> {
    return fs.pathExists(path.join(projectDir, this.configDir));
  }

  async setup(projectDir: string): Promise<void> {
    const vscodePath = path.join(projectDir, this.configDir);
    await fs.ensureDir(vscodePath);

    const settingsPath = path.join(vscodePath, 'settings.json');
    let settings: any = {};

    if (await fs.pathExists(settingsPath)) {
      try {
        settings = await fs.readJson(settingsPath);
      } catch (e) {
        settings = {};
      }
    }

    // Apply FAIDD Security Exclusions
    settings['files.exclude'] = {
      ...settings['files.exclude'],
      '**/_faidd/sessions/**': true,
      '**/faidd/ledger/**': false // Allow viewing the ledger
    };

    settings['search.exclude'] = {
      ...settings['search.exclude'],
      '**/_faidd/sessions/**': true
    };

    // UI Polish for VSCode
    settings['workbench.colorCustomizations'] = {
        ...settings['workbench.colorCustomizations'],
        "statusBar.background": "#1a1a1a",
        "statusBar.foreground": "#ffffff"
    };

    await fs.writeJson(settingsPath, settings, { spaces: 2 });

    // Extension Recommendations
    const extensionsPath = path.join(vscodePath, 'extensions.json');
    const extensions = {
      recommendations: [
        'modularai.faidd-elite', // Simulated extension
        'tamasfe.even-better-toml',
        'esbenp.prettier-vscode'
      ]
    };
    await fs.writeJson(extensionsPath, extensions, { spaces: 2 });

    console.log(`${chalk.blue('◈')} ${chalk.dim('VSCode workspace secured and optimized.')}`);
  }
}
