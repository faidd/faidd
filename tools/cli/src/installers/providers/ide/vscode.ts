import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { IProvider, ProviderMetadata } from '../registry.js';

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
    
    // Setting up workspace settings for FAIDD
    const settings = {
        "files.exclude": {
            "_faidd/sessions": true
        },
        "search.exclude": {
            "_faidd/sessions": true
        }
    };

    await fs.writeJSON(path.join(vscodePath, 'settings.json'), settings, { spaces: 2 });
    console.log(`${chalk.blue('◈')} ${chalk.dim('VSCode settings optimized.')}`);
  }
}
