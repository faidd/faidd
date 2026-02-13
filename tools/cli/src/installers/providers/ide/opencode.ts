// opencode.ts — OpenCode provider
// flat delivery model similar to codex, into .opencode/
import path from 'path';
import chalk from 'chalk';
import { IProvider, ProviderMetadata } from '../registry.js';
import { BaseProvider } from '../base.provider.js';
import { DiscoveryService } from '../../../services/discovery.service.js';
import { GeneratorService } from '../../../services/generator.service.js';

export class OpenCodeProvider extends BaseProvider implements IProvider {
  readonly metadata: ProviderMetadata = {
    name: 'opencode',
    displayName: 'OpenCode',
    category: 'IDE',
  };

  private discovery = new DiscoveryService();
  private generator = new GeneratorService();

  constructor() {
    super('opencode', 'OpenCode');
  }

  async detect(projectDir: string): Promise<boolean> {
    return this.exists(path.join(projectDir, '.opencode'));
  }

  async setup(projectDir: string): Promise<void> {
    console.log(chalk.cyan(`Setting up ${this.displayName}...`));

    await this.cleanup(projectDir);

    const bunkerDir = path.join(projectDir, this.bunkerName);
    const faidDir = path.join(projectDir, '.opencode', 'faidd');
    await this.ensureDir(faidDir);

    // agents as flat trigger files
    const agents = await this.discovery.collectAgents(bunkerDir);
    for (const agent of agents) {
      const content = this.generator.generateAgentCommand(agent, this.bunkerName);
      await this.writeFile(path.join(faidDir, `agent-${agent.name}.md`), content);
    }

    // standalone tasks & tools as flat triggers
    const taskTools = await this.discovery.collectTasksAndTools(bunkerDir);
    for (const tt of taskTools.filter(t => t.standalone)) {
      const content = this.generator.generateTaskToolCommand(tt, this.bunkerName);
      await this.writeFile(path.join(faidDir, `${tt.type}-${tt.name}.md`), content);
    }

    this.logSuccess('Setup complete.');
    this.logInfo(`${agents.length} agents, ${taskTools.filter(t => t.standalone).length} tasks/tools deployed.`);
  }

  async cleanup(projectDir: string): Promise<void> {
    const faidDir = path.join(projectDir, '.opencode', 'faidd');
    if (await this.exists(faidDir)) {
      await this.remove(faidDir);
      this.logInfo('Cleared old config.');
    }
  }
}
