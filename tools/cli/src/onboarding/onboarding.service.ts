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
    
    console.log(chalk.cyan(`? Installation directory: ${chalk.white(process.cwd())}`));

    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Install to this directory?',
        default: true,
      },
      {
        type: 'checkbox',
        name: 'tools',
        message: 'Select tools to configure (Space to select, Enter to confirm):',
        choices: [
          { name: 'Cursor', checked: true },
          { name: 'VS Code' },
          { name: 'Claude Code' },
          { name: 'Codex' },
          { name: 'OpenCode' }
        ],
        validate: (answer) => {
          if (answer.length < 1) {
            return 'You must choose at least one tool.';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'architect',
        message: 'What shall the agents call you?',
        default: process.env.USER || 'Architect',
      },
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name?',
        default: path.basename(process.cwd()),
      },
      {
        type: 'input',
        name: 'aiAssistant',
        message: 'Preferred AI Assistant?',
        default: 'Claude',
      },
    ]);

    if (!answers.confirm) {
      console.log(chalk.red('\nSetup aborted.'));
      process.exit(0);
    }

    // Map tools to Governance (taking the first selected as primary IDE for now)
    const primaryIde = answers.tools[0] || 'Cursor';

    const governance: Governance = {
      projectName: answers.projectName,
      architect: answers.architect,
      environment: {
        ide: primaryIde,
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
    console.log(chalk.dim(`Installed to: ${process.cwd()}`));
    console.log(chalk.dim(`Modules: core, faidd-cli`));
  }
}
