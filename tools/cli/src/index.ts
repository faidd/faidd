#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

import { displayBanner, displayStatus } from './ui/banner.js';
import { GovernanceService } from './services/governance.service.js';
import { ScaffoldService } from './services/scaffold.service.js';
import { OnboardingService } from './onboarding/onboarding.service.js';
import { createRegistry } from './installers/providers/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const program = new Command();
const govService = new GovernanceService();
const scaffoldService = new ScaffoldService();
const onboardingService = new OnboardingService(govService, scaffoldService);
const registry = createRegistry();

const loadMessages = async () => {
    const msgPath = path.join(__dirname, 'installers/install-messages.md');
    if (await fs.pathExists(msgPath)) {
        return await fs.readFile(msgPath, 'utf8');
    }
    return '';
};

const extractSection = (content: string, section: string) => {
    const regex = new RegExp(`## ${section}\\n([\\s\\S]*?)(?=\\n##|$)`);
    const match = content.match(regex);
    return match ? match[1].trim() : '';
};

program
  .name('faidd')
  .description('FAIDD Sovereign CLI - Elite Perception Layer')
  .version('0.1.5');

// Main Entry Point Logic
program
  .action(async () => {
    displayBanner();
    
    if (!(await govService.exists())) {
        const messages = await loadMessages();
        console.log(extractSection(messages, 'START_MESSAGE'));
        await onboardingService.runJourney();
        
        // Post-onboarding: Automated Discovery & Setup
        console.log(chalk.bold.cyan('\nInitiating Elite Automated Discovery...'));
        const detected = await registry.detectAll(process.cwd());
        
        for (const provider of detected) {
            console.log(`${chalk.blue('◈')} ${chalk.dim('Detected:')} ${provider.metadata.displayName}`);
            await provider.setup(process.cwd());
        }

        console.log('\n' + extractSection(messages, 'END_MESSAGE'));
    } else {
      try {
        const gov = await govService.load();
        console.log(`FAIDD Active | Architect: ${gov.architect} | Perimeter: ${gov.projectName}\n`);
        displayStatus('ELITE-PREMIUM', 'VERIFIED');
      } catch (error) {
        console.error(chalk.red('FATAL GOVERNANCE ERROR:'), error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    }
  });

// Command: init
program
  .command('init')
  .description('Force re-initialization of the Sovereign Hierarchy')
  .action(async () => {
    displayBanner();
    await onboardingService.runJourney();
    
    const detected = await registry.detectAll(process.cwd());
    for (const provider of detected) {
        await provider.setup(process.cwd());
    }
    
    const messages = await loadMessages();
    console.log('\n' + extractSection(messages, 'END_MESSAGE'));
  });

// Command: status
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

program.parse(process.argv);
