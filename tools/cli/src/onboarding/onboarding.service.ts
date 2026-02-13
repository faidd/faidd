// onboarding.service.ts — interactive first-run setup flow
import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';
import { GovernanceService } from '../services/governance.service.js';
import { Governance } from '../services/config.service.js';
import { ScaffoldService } from '../services/scaffold.service.js';

export class OnboardingService {
  constructor(
    private govService: GovernanceService,
    private scaffoldService: ScaffoldService
  ) {}

  // run the first-time setup flow
  async runJourney(): Promise<void> {
    console.log(chalk.bold.blue('\nInitiating FAIDD setup...'));
    console.log(chalk.dim('Identify yourself to establish your perimeter.\n'));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'architect',
        message: 'Your name?',
        default: process.env.USER || 'Architect',
      },
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name?',
        default: path.basename(process.cwd()),
      },
      {
        type: 'list',
        name: 'ide',
        message: 'Primary IDE?',
        choices: ['Cursor', 'VS Code', 'Claude Code', 'Codex', 'OpenCode', 'Other'],
      },
      {
        type: 'input',
        name: 'aiAssistant',
        message: 'AI assistant?',
        default: 'Claude',
      },
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Set up FAIDD in this directory?',
        default: true,
      },
    ]);

    if (!answers.confirm) {
      console.log(chalk.red('\nSetup aborted.'));
      process.exit(0);
    }

    const governance: Governance = {
      projectName: answers.projectName,
      architect: answers.architect,
      environment: {
        ide: answers.ide,
        aiAssistant: answers.aiAssistant,
      },
      security: {
        level: 'SOVEREIGN',
        readOnlyBunker: true,
      },
      metadata: {
        establishedAt: new Date().toISOString(),
        version: '0.2.0',
      },
    };

    await this.scaffoldService.scaffold(process.cwd());
    await this.govService.save(governance);

    console.log(chalk.bold.green('\n✅ FAIDD perimeter established.'));
  }
}
