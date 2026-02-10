import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import os from 'os';
import { IProvider, ProviderMetadata } from '../registry.js';
import { DiscoveryService } from '../../../services/discovery.service.js';
import { GeneratorService } from '../../../services/generator.service.js';

/**
 * Codex Provider (Elite)
 * Implements global and project-specific export of FAIDD prompts for Codex CLI.
 */
export class CodexProvider implements IProvider {
  readonly metadata: ProviderMetadata = {
    name: 'codex',
    displayName: 'Codex CLI',
    category: 'IDE'
  };

  private discovery = new DiscoveryService();
  private generator = new GeneratorService();

  async detect(projectDir: string): Promise<boolean> {
    const globalCodex = path.join(os.homedir(), '.codex');
    const projectCodex = path.join(projectDir, '.codex');
    return (await fs.pathExists(globalCodex)) || (await fs.pathExists(projectCodex));
  }

  async setup(projectDir: string): Promise<void> {
    const bunkerDir = path.join(projectDir, '_faidd');
    const targetDir = path.join(projectDir, '.codex', 'prompts');

    await fs.ensureDir(targetDir);

    // Codex triggers are always FLAT
    const agents = await this.discovery.discoverAgents(bunkerDir);
    for (const agent of agents) {
      const content = await this.generator.generateAgentLauncher(agent);
      const fileName = `faidd-${agent.module}-${agent.name}.md`;
      await fs.writeFile(path.join(targetDir, fileName), content);
    }

    const tasks = await this.discovery.discoverTasks(bunkerDir);
    for (const task of tasks) {
      const content = this.generator.generateTaskTrigger(task);
      const fileName = `faidd-${task.module}-${task.type}-${task.name}.md`;
      await fs.writeFile(path.join(targetDir, fileName), content);
    }

    console.log(`${chalk.blue('◈')} ${chalk.dim(`Codex: ${agents.length + tasks.length} prompts exported.`)}`);
  }
}
