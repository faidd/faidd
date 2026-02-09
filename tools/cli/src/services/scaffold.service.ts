import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

/**
 * Scaffolding Service
 * Responsible for creating the physical Sovereign Hierarchy.
 */
export class ScaffoldService {
  private readonly bunkerPath = '_faidd';
  private readonly brainPath = 'faidd';

  async scaffold(projectDir: string): Promise<void> {
    const bunkerFolders = [
      'rules',
      'agents',
      'sessions',
      'bin'
    ];

    const brainFolders = [
      'ledger',
      'analysis',
      'planning',
      'audit'
    ];

    console.log(chalk.dim('\nEstablishing Sovereign Perimeter...'));

    // 1. Create the Bunker (_faidd) - READ-ONLY TARGET
    for (const folder of bunkerFolders) {
      const fullPath = path.join(projectDir, this.bunkerPath, folder);
      await fs.ensureDir(fullPath);
      console.log(`${chalk.blue('◈')} ${chalk.dim('Bunker secured:')} ${this.bunkerPath}/${folder}`);
    }

    // 2. Create the Operational Brain (faidd)
    for (const folder of brainFolders) {
      const fullPath = path.join(projectDir, this.brainPath, folder);
      await fs.ensureDir(fullPath);
      console.log(`${chalk.blue('◈')} ${chalk.dim('Brain initialized:')} ${this.brainPath}/${folder}`);
    }

    // 3. Create basic .gitignore entry
    const gitignorePath = path.join(projectDir, '.gitignore');
    if (await fs.pathExists(gitignorePath)) {
      const content = await fs.readFile(gitignorePath, 'utf8');
      if (!content.includes('_faidd/sessions')) {
        await fs.appendFile(gitignorePath, '\n# FAIDD Sensitive Data\n_faidd/sessions/\n.faiddrc.json\n');
        console.log(`${chalk.blue('◈')} ${chalk.dim('Guardrails added to .gitignore')}`);
      }
    }
  }
}
