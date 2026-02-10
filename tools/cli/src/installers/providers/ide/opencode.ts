import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { IProvider, ProviderMetadata } from '../registry.js';
import { DiscoveryService } from '../../../services/discovery.service.js';
import { GeneratorService } from '../../../services/generator.service.js';

/**
 * OpenCode Provider (Elite)
 * Implements the FLAT delivery model for command triggers.
 * Ensures compatibility with IDEs that do not support nested folder triggers.
 */
export class OpenCodeProvider implements IProvider {
  readonly metadata: ProviderMetadata = {
    name: 'opencode',
    displayName: 'OpenCode IDE',
    category: 'IDE'
  };

  private readonly configDir = '.opencode';
  private readonly agentsDir = 'agent';
  
  private discovery = new DiscoveryService();
  private generator = new GeneratorService();

  async detect(projectDir: string): Promise<boolean> {
    return fs.pathExists(path.join(projectDir, this.configDir));
  }

  async setup(projectDir: string): Promise<void> {
    const bunkerDir = path.join(projectDir, '_faidd');
    const baseDir = path.join(projectDir, this.configDir);
    const agentsDir = path.join(baseDir, this.agentsDir);

    await fs.ensureDir(agentsDir);

    // Discover & Flatten Agents
    const agents = await this.discovery.discoverAgents(bunkerDir);
    for (const agent of agents) {
      const content = await this.generator.generateAgentLauncher(agent);
      // Flat naming: faidd-agent-{module}-{name}.md
      const fileName = `faidd-agent-${agent.module}-${agent.name}.md`;
      await fs.writeFile(path.join(agentsDir, fileName), content);
    }

    // Discover & Flatten Tasks
    const tasks = await this.discovery.discoverTasks(bunkerDir);
    for (const task of tasks) {
        const content = this.generator.generateTaskTrigger(task);
        const fileName = `faidd-${task.type}-${task.module}-${task.name}.md`;
        await fs.writeFile(path.join(agentsDir, fileName), content);
    }

    console.log(`${chalk.blue('◈')} ${chalk.dim(`OpenCode: ${agents.length + tasks.length} flat triggers deployed.`)}`);
  }
}
