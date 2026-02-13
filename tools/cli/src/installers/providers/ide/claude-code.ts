// claude-code.ts — Claude Code (Anthropic) provider
// deploys commands into .claude/commands/ and a top-level CLAUDE.md
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { IProvider, ProviderMetadata } from '../registry.js';
import { BaseProvider } from '../base.provider.js';
import { DiscoveryService } from '../../../services/discovery.service.js';
import { GeneratorService } from '../../../services/generator.service.js';

export class ClaudeCodeProvider extends BaseProvider implements IProvider {
  readonly metadata: ProviderMetadata = {
    name: 'claude-code',
    displayName: 'Claude Code',
    category: 'IDE',
  };

  private discovery = new DiscoveryService();
  private generator = new GeneratorService();

  constructor() {
    super('claude-code', 'Claude Code');
  }

  async detect(projectDir: string): Promise<boolean> {
    // claude code uses .claude/ dir or CLAUDE.md at root
    return (
      await this.exists(path.join(projectDir, '.claude')) ||
      await this.exists(path.join(projectDir, 'CLAUDE.md'))
    );
  }

  async setup(projectDir: string): Promise<void> {
    console.log(chalk.cyan(`Setting up ${this.displayName}...`));

    await this.cleanup(projectDir);

    const bunkerDir = path.join(projectDir, this.bunkerName);
    const commandsDir = path.join(projectDir, '.claude', 'commands', 'faidd');
    await this.ensureDir(commandsDir);

    // 1. create CLAUDE.md — the system-level instruction file
    await this.deployCLAUDEmd(projectDir);

    // 2. deploy agent commands by module
    const agents = await this.discovery.collectAgents(bunkerDir);
    for (const agent of agents) {
      const moduleDir = path.join(commandsDir, agent.module, 'agents');
      await this.ensureDir(moduleDir);
      const content = this.generator.generateAgentCommand(agent, this.bunkerName);
      await this.writeFile(path.join(moduleDir, `${agent.name}.md`), content);
    }

    // 3. deploy workflow commands by module
    const workflows = await this.discovery.collectWorkflows(bunkerDir);
    const byModule = new Map<string, typeof workflows>();
    for (const wf of workflows) {
      const list = byModule.get(wf.module) || [];
      list.push(wf);
      byModule.set(wf.module, list);
    }
    for (const [mod, wfs] of byModule) {
      const moduleDir = path.join(commandsDir, mod, 'workflows');
      await this.ensureDir(moduleDir);
      for (const wf of wfs) {
        const content = this.generator.generateWorkflowCommand(wf, this.bunkerName);
        await this.writeFile(path.join(moduleDir, `${wf.name}.md`), content);
      }
      const launcher = this.generator.generateModuleWorkflowLauncher(mod, wfs, this.bunkerName);
      await this.writeFile(path.join(moduleDir, 'README.md'), launcher);
    }

    // 4. deploy standalone tasks & tools
    const taskTools = await this.discovery.collectTasksAndTools(bunkerDir);
    for (const tt of taskTools.filter(t => t.standalone)) {
      const moduleDir = path.join(commandsDir, tt.module, `${tt.type}s`);
      await this.ensureDir(moduleDir);
      const content = this.generator.generateTaskToolCommand(tt, this.bunkerName);
      await this.writeFile(path.join(moduleDir, `${tt.name}.md`), content);
    }

    this.logSuccess('Setup complete.');
    this.logInfo(`${agents.length} agents, ${workflows.length} workflows deployed.`);
  }

  async cleanup(projectDir: string): Promise<void> {
    const faidDir = path.join(projectDir, '.claude', 'commands', 'faidd');
    if (await this.exists(faidDir)) {
      await this.remove(faidDir);
      this.logInfo('Cleared old commands.');
    }
  }

  // CLAUDE.md is the top-level instruction file Claude Code reads automatically
  private async deployCLAUDEmd(projectDir: string) {
    const claudeMdPath = path.join(projectDir, 'CLAUDE.md');
    const existingContent = await this.exists(claudeMdPath)
      ? await this.readFile(claudeMdPath)
      : '';

    // don't overwrite if FAIDD section already exists
    if (existingContent.includes('<!-- FAIDD-START -->')) return;

    const section = [
      '',
      '<!-- FAIDD-START -->',
      '## FAIDD System',
      '',
      `- System bunker: \`${this.bunkerName}/\` — READ ONLY, never modify`,
      '- Operational brain: `faidd/` — log decisions and analysis here',
      '- Use `/faidd/` commands to activate agents and workflows',
      '- Always follow agent activation protocol exactly',
      '<!-- FAIDD-END -->',
    ].join('\n');

    await this.writeFile(claudeMdPath, existingContent + section);
    this.logInfo('CLAUDE.md updated with FAIDD section.');
  }
}
