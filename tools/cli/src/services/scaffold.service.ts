// scaffold.service.ts — creates the physical bunker + brain directory structure
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export class ScaffoldService {
  // create the full directory structure for a FAIDD installation
  async scaffold(projectDir: string, bunkerName: string = '_faidd'): Promise<void> {
    // the Bunker — system core, read-only target
    const bunkerFolders = [
      'rules',     // [NEW] Governance Rules
      'sessions',  // [NEW] Session History
      'rights',    // [NEW] Permissions Matrix
      'agents',    // [NEW] AI Mindsets & Instructions
      'bin',       // [NEW] Daemon Binaries (M1)
      'resources', // [NEW] Static Assets & Templates
      '_config',
      '_config/custom', // [NEW] User Overrides
      '_memory',
    ];

    // the Brain — operational workspace
    const brainFolders = [
      'ledger',   // Mission logs (M4)
      'analysis', // Deep strategic dives
      'planning', // Feature plans
      'audit',    // Integrity records
      'logic',    // [NEW] Business logic
    ];

    console.log(chalk.dim('\nEstablishing directory structure...'));

    for (const folder of bunkerFolders) {
      const fullPath = path.join(projectDir, bunkerName, folder);
      await fs.ensureDir(fullPath);
      this.logCreated(`${bunkerName}/${folder}`);
    }

    for (const folder of brainFolders) {
      const fullPath = path.join(projectDir, 'faidd', folder);
      await fs.ensureDir(fullPath);
      this.logCreated(`faidd/${folder}`);
    }

    // add faidd entries to .gitignore if it exists
    await this.updateGitignore(projectDir, bunkerName);
  }

  // create module-specific subdirectory inside the bunker
  async scaffoldModule(bunkerDir: string, moduleId: string): Promise<void> {
    const moduleDirs = ['agents', 'tasks', 'tools', 'workflows'];
    for (const dir of moduleDirs) {
      await fs.ensureDir(path.join(bunkerDir, moduleId, dir));
    }
  }

  // -- private --

  private async updateGitignore(projectDir: string, bunkerName: string) {
    const gitignorePath = path.join(projectDir, '.gitignore');
    if (!(await fs.pathExists(gitignorePath))) return;

    const content = await fs.readFile(gitignorePath, 'utf8');
    const marker = '# FAIDD';
    if (content.includes(marker)) return;

    const entries = [
      '',
      marker,
      `${bunkerName}/_memory/`,
      '.faiddrc.json',
      '',
    ].join('\n');

    await fs.appendFile(gitignorePath, entries);
    this.logCreated('.gitignore updated');
  }

  private logCreated(what: string) {
    console.log(`${chalk.blue('◈')} ${chalk.dim(what)}`);
  }
}
