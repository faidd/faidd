import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';
import { ConfigService, FaiddConfig } from '../services/config.service.js';

export class OnboardingService {
  constructor(private configService: ConfigService) {}

  // Starts the Sovereign Journey interactive flow

  async runJourney(): Promise<void> {
    console.log(chalk.bold.blue('\nStarting your Sovereign Journey...\n'));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'developerName',
        message: 'What is your Sovereign Name (Architect/Developer)?',
        default: process.env.USER || 'Architect',
      },
      {
        type: 'input',
        name: 'projectName',
        message: 'Name of the perimeter you are securing?',
        default: path.basename(process.cwd()),
      },
      {
        type: 'list',
        name: 'ide',
        message: 'Primary IDE for development?',
        choices: ['VS Code', 'Cursor', 'Zed', 'JetBrains', 'Other'],
      },
      {
        type: 'input',
        name: 'aiAssistant',
        message: 'Which AI Agent is currently assisting you?',
        default: 'Unknown AI Agent',
      },
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Establish FAIDD Sovereign Guardrails in this directory?',
        default: true,
      }
    ]);

    if (!answers.confirm) {
      console.log(chalk.red('\nSovereign initialization aborted.'));
      process.exit(0);
    }

    const config: FaiddConfig = {
      projectName: answers.projectName,
      developerName: answers.developerName,
      environment: {
        ide: answers.ide,
        aiAssistant: answers.aiAssistant,
      },
      governance: {
        mode: 'sovereign',
        enforceReadOnly: true,
      },
      metadata: {
        createdAt: new Date().toISOString(),
        version: '0.2.0',
      }
    };

    // Scaffolding physical structures
    await this.configService.scaffoldHierarchy();
    
    // Saving governance law
    await this.configService.save(config);
    
    console.log(chalk.bold.green('\n✅ Perimeter sealed successfully.'));
    console.log(chalk.dim('Hierarchy generated: .faiddrc.json, _faidd/, faidd/\n'));
  }
}
