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

import { InstallerService } from './services/installer.js';

import { registerInitCommand } from './commands/init.js';
import { registerInstallCommand } from './commands/install.js';
import { registerStatusCommand } from './commands/status.js';

// ... (imports remain)

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const program = new Command();
const govService = new GovernanceService();
const scaffoldService = new ScaffoldService();
const onboardingService = new OnboardingService(govService, scaffoldService);
const registry = createRegistry();
const installer = new InstallerService(registry, process.cwd());

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
  .version('0.2.0');

// Main Entry Point Logic (Default Action)
program
  .action(async () => {
    displayBanner();
    
    if (!(await govService.exists())) {
        const messages = await loadMessages();
        console.log(extractSection(messages, 'START_MESSAGE'));
        
        // 1. Run sovereign onboarding
        await onboardingService.runJourney();
        
        // 2. Run installation pipeline
        console.log(chalk.bold.cyan('\nInitiating Elite Installation Pipeline...'));
        await installer.run();

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

// Register Commands
registerInitCommand(program, onboardingService, installer);
registerInstallCommand(program, installer);
registerStatusCommand(program, govService);

program.parse(process.argv);
