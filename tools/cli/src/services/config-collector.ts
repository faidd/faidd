// config-collector.ts — interactive config collection from module schemas
import inquirer from 'inquirer';
import chalk from 'chalk';
import YAML from 'yaml';
import fs from 'fs-extra';
import path from 'path';

// a question schema as defined in module.yaml files
export interface ConfigQuestion {
  name: string;
  type: 'text' | 'select' | 'confirm' | 'multiselect';
  message: string;
  default?: unknown;
  choices?: { name: string; value: string }[];
  required?: boolean;
  when?: string; // conditional — name of another field that must be truthy
}

export interface ModuleSchema {
  name: string;
  code: string;
  description?: string;
  install_config?: ConfigQuestion[];
}

export class ConfigCollector {
  // collect config for a single module based on its schema
  async collectModuleConfig(
    moduleSchema: ModuleSchema,
    existingConfig: Record<string, unknown> = {}
  ): Promise<Record<string, unknown>> {
    const questions = moduleSchema.install_config;
    if (!questions || questions.length === 0) return existingConfig;

    console.log(chalk.cyan(`\n  Configuring module: ${moduleSchema.name}`));

    const answers: Record<string, unknown> = { ...existingConfig };

    for (const q of questions) {
      // skip if already has a value (quick update mode)
      if (answers[q.name] !== undefined) continue;

      // check conditional visibility
      if (q.when && !answers[q.when]) continue;

      const answer = await this.askQuestion(q);
      answers[q.name] = answer;
    }

    return answers;
  }

  // collect config for multiple modules
  async collectAll(
    schemas: ModuleSchema[],
    existingConfigs: Map<string, Record<string, unknown>> = new Map()
  ): Promise<Map<string, Record<string, unknown>>> {
    const configs = new Map<string, Record<string, unknown>>();

    for (const schema of schemas) {
      const existing = existingConfigs.get(schema.code) ?? {};
      const config = await this.collectModuleConfig(schema, existing);
      configs.set(schema.code, config);
    }

    return configs;
  }

  // load a module schema from its module.yaml
  async loadModuleSchema(modulePath: string): Promise<ModuleSchema | null> {
    const yamlPath = path.join(modulePath, 'module.yaml');
    if (!(await fs.pathExists(yamlPath))) return null;

    try {
      const content = await fs.readFile(yamlPath, 'utf8');
      return YAML.parse(content) as ModuleSchema;
    } catch {
      return null;
    }
  }

  // replace placeholder values in defaults (e.g. {project-name})
  replacePlaceholders(value: string, context: Record<string, string>): string {
    let result = value;
    for (const [key, replacement] of Object.entries(context)) {
      result = result.replaceAll(`{${key}}`, replacement);
    }
    return result;
  }

  // -- helpers --

  private async askQuestion(q: ConfigQuestion): Promise<unknown> {
    switch (q.type) {
      case 'text': {
        const { value } = await inquirer.prompt([{
          type: 'input',
          name: 'value',
          message: q.message,
          default: q.default as string | undefined,
        }]);
        return value;
      }

      case 'select': {
        const { value } = await inquirer.prompt([{
          type: 'list',
          name: 'value',
          message: q.message,
          choices: q.choices ?? [],
          default: q.default,
        }]);
        return value;
      }

      case 'confirm': {
        const { value } = await inquirer.prompt([{
          type: 'confirm',
          name: 'value',
          message: q.message,
          default: q.default ?? true,
        }]);
        return value;
      }

      case 'multiselect': {
        const { value } = await inquirer.prompt([{
          type: 'checkbox',
          name: 'value',
          message: q.message,
          choices: q.choices ?? [],
        }]);
        return value;
      }

      default:
        return q.default ?? '';
    }
  }
}
