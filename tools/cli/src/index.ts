#!/usr/bin/env node
import { Command } from 'commander';
import { displayBanner, displayStatus } from './ui/banner.js';
import { GovernanceService } from './services/governance.service.js';
import { ScaffoldService } from './services/scaffold.service.js';
import { OnboardingService } from './onboarding/onboarding.service.js';

const program = new Command();
const govService = new GovernanceService();
const scaffoldService = new ScaffoldService();
const onboardingService = new OnboardingService(govService, scaffoldService);

program
  .name('faidd')
  .description('FAIDD Sovereign CLI - Elite Perception Layer')
  .version('0.1.5');

// Main Entry Point Logic
program
  .action(async () => {
    displayBanner();
    
    if (!(await govService.exists())) {
      await onboardingService.runJourney();
    } else {
      try {
        const gov = await govService.load();
        console.log(`FAIDD Active | Architect: ${gov.architect} | Perimeter: ${gov.projectName}\n`);
        displayStatus('ELITE-ALPHA', 'VERIFIED');
      } catch (error) {
        console.error(error.message);
        process.exit(1);
      }
    }
  });

// Command: init
program
  .command('init')
  .description('Initialize or re-seal the Sovereign Hierarchy')
  .action(async () => {
    displayBanner();
    await onboardingService.runJourney();
  });

// Command: status
program
  .command('status')
  .description('Show Sovereign integrity report')
  .action(async () => {
    displayBanner();
    if (await govService.exists()) {
      const gov = await govService.load();
      displayStatus('ELITE-ALPHA', 'AUDITED');
      console.log('--- Sovereign Governance Registry ---');
      console.log(JSON.stringify(gov, null, 2));
    } else {
      console.log('No Sovereign Perimeter detected. Run `faidd init` to seal.');
    }
  });

program.parse(process.argv);
