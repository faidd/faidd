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
  private readonly commandsDir = 'commands';
  
  async detect(projectDir: string): Promise<boolean> {
    return fs.pathExists(path.join(projectDir, this.configDir));
  }

  async setup(projectDir: string): Promise<void> {
    const cursorPath = path.join(projectDir, this.configDir);
    const rulesPath = path.join(cursorPath, this.rulesDir);
    const commandsPath = path.join(cursorPath, this.commandsDir, 'faidd');

    await fs.ensureDir(rulesPath);
    await fs.ensureDir(commandsPath);
    
    // Core Instructions
    const instructions = [
      '# FAIDD CONSTITUTION',
      '',
      '- **Bunker (`_faidd/`)**: SYSTEM CORE. READ-ONLY FOR AGENTS.',
      '- **Brain (`faidd/`)**: OPERATIONAL WORKSPACE. LOG EVERYTHING.',
      '- **Registry**: Refer to `.faiddrc.json` for technical context.'
    ].join('\n');

    await fs.writeFile(path.join(rulesPath, 'faidd.md'), instructions);
    console.log(`${chalk.blue('◈')} ${chalk.dim('Cursor Elite configuration deployed.')}`);
  }
}
