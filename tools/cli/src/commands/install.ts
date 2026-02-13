import { Command } from 'commander';
import chalk from 'chalk';
import { InstallerService } from '../services/installer.js';
import { displayBanner } from '../ui/banner.js';

export function registerInstallCommand(program: Command, installer: InstallerService) {
  program
    .command('install')
    .description('Install modules and configure IDEs (Idempotent)')
    .option('-f, --force', 'Force re-installation')
    .action(async (options) => {
      displayBanner();
      console.log(chalk.cyan('Running installation...'));
      await installer.run({ force: options.force });
    });
}
