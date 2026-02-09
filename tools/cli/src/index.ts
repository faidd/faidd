#!/usr/bin/env node
import { Command } from 'commander';
import { displayBanner, displayStatus } from './ui/banner.js';
import { ConfigService } from './services/config.service.js';
import { OnboardingService } from './onboarding/onboarding.service.js';

const program = new Command();
const configService = new ConfigService();
const onboardingService = new OnboardingService(configService);

program
  .name('faidd')
  .description('FAIDD Sovereign CLI - Perception Layer')
  .version('0.1.5');

// Default action
program
  .action(async () => {
    displayBanner();
    
    if (!(await configService.exists())) {
      await onboardingService.runJourney();
    } else {
      const config = await configService.load();
      console.log(`FAIDD Active | Sovereign: ${config.developerName} | Perimeter: ${config.projectName}\n`);
      displayStatus('ALPHA-1', 'OPERATIONAL');
    }
  });


  // Command: init
  // Re-scaffolds or updates the sovereign perimeter.
 
program
  .command('init')
  .description('Initialize or re-seal the Sovereign Hierarchy')
  .action(async () => {
    displayBanner();
    await onboardingService.runJourney();
  });


  // Command: status
  // Provides a deep audit report of the perimeter.
 
program
  .command('status')
  .description('Show Sovereign integrity report')
  .action(async () => {
    displayBanner();
    if (await configService.exists()) {
      const config = await configService.load();
      displayStatus('ALPHA-1', 'VERIFIED');
      console.log('--- Configuration Report ---');
      console.log(JSON.stringify(config, null, 2));
    } else {
      console.log('No Sovereign Perimeter found. Run `faidd init` to seal.');
    }
  });

program.parse(process.argv);
