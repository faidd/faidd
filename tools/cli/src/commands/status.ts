import { Command } from 'commander';
import chalk from 'chalk';
import { GovernanceService } from '../services/governance.service.js';
import { displayBanner, displayStatus } from '../ui/banner.js';

export function registerStatusCommand(program: Command, govService: GovernanceService) {
  program
    .command('status')
    .description('Show Sovereign integrity report')
    .action(async () => {
      displayBanner();
      if (await govService.exists()) {
        const gov = await govService.load();
        displayStatus('ELITE-PREMIUM', 'AUDITED');
        console.log(chalk.bold('--- Sovereign Governance Registry ---'));
        console.log(JSON.stringify(gov, null, 2));
      } else {
        console.log(chalk.yellow('No Sovereign Perimeter detected. Run `faidd init` to seal.'));
      }
    });
}
