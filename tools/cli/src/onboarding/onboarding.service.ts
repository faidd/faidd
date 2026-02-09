import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';
import { GovernanceService, FaiddGovernance } from '../services/governance.service.js';
import { ScaffoldService } from '../services/scaffold.service.js';

export class OnboardingService {
  constructor(
    private govService: GovernanceService,
    private scaffoldService: ScaffoldService
  ) {}

  // Starts the Sovereign Journey interactive flow
  async runJourney(): Promise<void> {
    console.log(chalk.bold.blue('\nInitiating Sovereign Journey Phase...'));
    console.log(chalk.dim('Identify yourself to establish authority.\n'));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'architect',
        message: 'Name of the Sovereign Architect?',
        default: process.env.USER || 'Architect',
      },
      {
        type: 'input',
        name: 'projectName',
        message: 'Project Perimeter Name?',
        default: path.basename(process.cwd()),
      },
      {
        type: 'list',
        name: 'ide',
        message: 'Primary Command Center (IDE)?',
        choices: ['Cursor', 'VS Code', 'Zed', 'JetBrains', 'Other'],
      },
      {
        type: 'input',
        name: 'aiAssistant',
        message: 'Which AI Entity is assisting you?',
        default: 'Unknown AI Entity',
      },
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Seal this perimeter under FAIDD Sovereignty?',
        default: true,
      }
    ]);

    if (!answers.confirm) {
      console.log(chalk.red('\nSovereignty establishment aborted. Exiting.'));
      process.exit(0);
    }

    const governance: FaiddGovernance = {
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
        version: '0.1.5',
      }
    };

    // 1. Scaffolding physical hierarchy
    await this.scaffoldService.scaffold(process.cwd());
    
    // 2. Saving the Law
    await this.govService.save(governance);
    
    console.log(chalk.bold.green('\n✅ SOVEREIGN PERIMETER VERIFIED.'));
  }
}
