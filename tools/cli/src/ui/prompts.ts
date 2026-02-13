// prompts.ts — consistent UI prompts wrapper
import inquirer from 'inquirer';
import chalk from 'chalk';

export class PromptManager {
  async confirm(message: string, defaultValue = false): Promise<boolean> {
    const { result } = await inquirer.prompt<{ result: boolean }>([
      {
        type: 'confirm',
        name: 'result',
        message: chalk.cyan(message),
        default: defaultValue,
      },
    ]);
    return result;
  }

  async select<T>(message: string, choices: { name: string; value: T }[], defaultVal?: T): Promise<T> {
    const { result } = await inquirer.prompt<{ result: T }>([
      {
        type: 'list',
        name: 'result',
        message: chalk.cyan(message),
        choices,
        default: defaultVal,
      },
    ]);
    return result;
  }

  async input(message: string, defaultValue?: string): Promise<string> {
    const { result } = await inquirer.prompt<{ result: string }>([
      {
        type: 'input',
        name: 'result',
        message: chalk.cyan(message),
        default: defaultValue,
      },
    ]);
    return result;
  }
  
  async password(message: string): Promise<string> {
      const { result } = await inquirer.prompt<{ result: string }>([
          {
              type: 'password',
              name: 'result',
              message: chalk.cyan(message),
              mask: '*'
          }
      ]);
      return result;
  }
}

export const prompts = new PromptManager();
