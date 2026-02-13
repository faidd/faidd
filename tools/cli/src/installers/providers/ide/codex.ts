// codex.ts — OpenAI Codex / ChatGPT CLI provider
// uses a flat file structure with a single codex.md instruction file
import path from 'path';
import chalk from 'chalk';
import { IProvider, ProviderMetadata } from '../registry.js';
import { BaseProvider } from '../base.provider.js';
import { DiscoveryService } from '../../../services/discovery.service.js';
import { GeneratorService } from '../../../services/generator.service.js';

export class CodexProvider extends BaseProvider implements IProvider {
  readonly metadata: ProviderMetadata = {
    name: 'codex',
    displayName: 'Codex CLI',
    category: 'IDE',
  };

  private discovery = new DiscoveryService();
  private generator = new GeneratorService();

  constructor() {
    super('codex', 'Codex');
  }

  async detect(projectDir: string): Promise<boolean> {
    return this.exists(path.join(projectDir, 'codex.md'));
  }

  async setup(projectDir: string): Promise<void> {
    console.log(chalk.cyan(`Setting up ${this.displayName}...`));

    const bunkerDir = path.join(projectDir, this.bunkerName);

    // codex uses a flat structure — one global instruction file + triggers
    const triggersDir = path.join(projectDir, '.codex', 'faidd');
    await this.ensureDir(triggersDir);

    // 1. deploy codex.md at project root (global instructions)
    await this.deployGlobalInstructions(projectDir);

    // 2. flat triggers for agents
    const agents = await this.discovery.collectAgents(bunkerDir);
    for (const agent of agents) {
      const trigger = this.generator.generateFlatTrigger(
        agent.name, agent.relativePath, this.bunkerName
      );
      await this.writeFile(path.join(triggersDir, `agent-${agent.name}.md`), trigger);
    }

    // 3. flat triggers for standalone tasks & tools
    const taskTools = await this.discovery.collectTasksAndTools(bunkerDir);
    for (const tt of taskTools.filter(t => t.standalone)) {
      const trigger = this.generator.generateFlatTrigger(
        tt.name, tt.path, this.bunkerName
      );
      await this.writeFile(path.join(triggersDir, `${tt.type}-${tt.name}.md`), trigger);
    }

    this.logSuccess('Setup complete.');
    this.logInfo(`${agents.length} agents, ${taskTools.filter(t => t.standalone).length} tasks/tools deployed.`);
  }

  private async deployGlobalInstructions(projectDir: string) {
    const content = [
      '# FAIDD System Instructions',
      '',
      `System core is at \`${this.bunkerName}/\`. Do not modify it directly.`,
      'Operational workspace is at `faidd/`. Log decisions there.',
      '',
      'Check `.codex/faidd/` for available agent and task triggers.',
    ].join('\n');

    await this.writeFile(path.join(projectDir, 'codex.md'), content);
  }
}
