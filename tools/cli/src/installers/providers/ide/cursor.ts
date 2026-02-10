import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { IProvider, ProviderMetadata } from '../registry.js';

export class CursorProvider implements IProvider {
  readonly metadata: ProviderMetadata = {
    name: 'cursor',
    displayName: 'Cursor IDE',
    category: 'IDE'
  };

  private readonly configDir = '.cursor';
  private readonly rulesDir = 'rules';
  
  async detect(projectDir: string): Promise<boolean> {
    return fs.pathExists(path.join(projectDir, this.configDir));
  }

  async setup(projectDir: string): Promise<void> {
    const rulesPath = path.join(projectDir, this.configDir, this.rulesDir);
    await fs.ensureDir(rulesPath);
    
    // Scaffolding Cursor-specific rules
    // In Elite v2.1, we link to the system bunker rules
    const instructions = [
      '# FAIDD Governance Rules',
      '',
      '- ALWAYS respect the Read-Only status of the `_faidd/` directory.',
      '- LOG every significant architectural decision in `faidd/ledger/`.',
      '- ADHERE to the Sovereign Governance principles defined in `.faiddrc.json`.'
    ].join('\n');

    await fs.writeFile(path.join(rulesPath, 'faidd.md'), instructions);
    console.log(`${chalk.blue('◈')} ${chalk.dim('Cursor rules active.')}`);
  }
}
