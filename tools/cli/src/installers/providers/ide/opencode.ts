import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { IProvider, ProviderMetadata } from '../registry.js';

/**
 * OpenCode Provider
 * Implements a FLAT structure for command delivery.
 * Required for tools that don't support nested command hierarchies.
 */
export class OpenCodeProvider implements IProvider {
  readonly metadata: ProviderMetadata = {
    name: 'opencode',
    displayName: 'OpenCode IDE',
    category: 'IDE'
  };

  private readonly configDir = '.opencode';
  private readonly agentsDir = 'agent';
  private readonly commandsDir = 'command';

  async detect(projectDir: string): Promise<boolean> {
    return fs.pathExists(path.join(projectDir, this.configDir));
  }

  async setup(projectDir: string): Promise<void> {
    const baseDir = path.join(projectDir, this.configDir);
    const agentsDir = path.join(baseDir, this.agentsDir);
    const commandsDir = path.join(baseDir, this.commandsDir);

    await fs.ensureDir(agentsDir);
    await fs.ensureDir(commandsDir);

    // Flat file generation example (B-Mad style)
    const readmeContent = [
        '# FAIDD Sovereign Perimeter',
        '',
        'This IDE is restricted. Only authorized FAIDD commands are injected here.',
        'Architecture: FLAT DELIVERY MODEL.'
    ].join('\n');

    await fs.writeFile(path.join(baseDir, 'FAIDD_STATUS.md'), readmeContent);
    console.log(`${chalk.blue('◈')} ${chalk.dim('OpenCode flat perimeter established.')}`);
  }
}
