// cursor.ts — Cursor IDE provider
// deploys commands, rules, and agent launchers into .cursor/
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { IProvider, ProviderMetadata } from '../registry.js';
import { BaseProvider } from '../base.provider.js';
import { DiscoveryService } from '../../../services/discovery.service.js';
import { GeneratorService } from '../../../services/generator.service.js';

export class CursorProvider extends BaseProvider implements IProvider {
  readonly metadata: ProviderMetadata = {
    name: 'cursor',
    displayName: 'Cursor IDE',
    category: 'IDE',
  };

  private discovery = new DiscoveryService();
  private generator = new GeneratorService();

  constructor() {
    super('cursor', 'Cursor');
  }

  async detect(projectDir: string): Promise<boolean> {
    return this.exists(path.join(projectDir, '.cursor'));
  }

  async setup(projectDir: string): Promise<void> {
    console.log(chalk.cyan(`Setting up ${this.displayName}...`));

    await this.cleanup(projectDir);

    const bunkerDir = path.join(projectDir, this.bunkerName);
    const commandsDir = path.join(projectDir, '.cursor', 'commands', 'faidd');
    const rulesDir = path.join(projectDir, '.cursor', 'rules', 'faidd');

    await this.ensureDir(commandsDir);
    await this.ensureDir(rulesDir);

    // 1. deploy constitution rule
    const constitution = [
      '# FAIDD Constitution',
      '',
      `- **Bunker (\`${this.bunkerName}/\`)**: System core. READ-ONLY.`,
      '- **Brain (`faidd/`)**: Operational workspace. Record decisions here.',
      '- Always follow the activation protocol for agents.',
      '- Never modify bunker files directly.',
    ].join('\n');
    await this.writeFile(path.join(rulesDir, 'constitution.md'), constitution);

    // 2. deploy agent commands (organized by module)
    const agents = await this.discovery.collectAgents(bunkerDir);
    for (const agent of agents) {
      const moduleDir = path.join(commandsDir, agent.module, 'agents');
      await this.ensureDir(moduleDir);
      const content = this.generator.generateAgentCommand(agent, this.bunkerName);
      await this.writeFile(path.join(moduleDir, `${agent.name}.md`), content);
    }

    // 3. deploy workflow commands (organized by module)
    const workflows = await this.discovery.collectWorkflows(bunkerDir);
    const workflowsByModule = new Map<string, typeof workflows>();
    for (const wf of workflows) {
      const list = workflowsByModule.get(wf.module) || [];
      list.push(wf);
      workflowsByModule.set(wf.module, list);
    }

    for (const [mod, modWorkflows] of workflowsByModule) {
      const moduleDir = path.join(commandsDir, mod, 'workflows');
      await this.ensureDir(moduleDir);

      // individual workflow commands
      for (const wf of modWorkflows) {
        const content = this.generator.generateWorkflowCommand(wf, this.bunkerName);
        await this.writeFile(path.join(moduleDir, `${wf.name}.md`), content);
      }

      // module-level launcher readme
      const launcher = this.generator.generateModuleWorkflowLauncher(mod, modWorkflows, this.bunkerName);
      await this.writeFile(path.join(moduleDir, 'README.md'), launcher);
    }

    // 4. deploy task & tool commands (standalone only)
    const taskTools = await this.discovery.collectTasksAndTools(bunkerDir);
    const standalones = taskTools.filter(tt => tt.standalone);
    for (const tt of standalones) {
      const moduleDir = path.join(commandsDir, tt.module, `${tt.type}s`);
      await this.ensureDir(moduleDir);
      const content = this.generator.generateTaskToolCommand(tt, this.bunkerName);
      await this.writeFile(path.join(moduleDir, `${tt.name}.md`), content);
    }

    this.logSuccess('Setup complete.');
    this.logInfo(`${agents.length} agents, ${workflows.length} workflows, ${standalones.length} tasks/tools deployed.`);
  }

  async cleanup(projectDir: string): Promise<void> {
    const rulesPath = path.join(projectDir, '.cursor', 'rules', 'faidd');
    const commandsPath = path.join(projectDir, '.cursor', 'commands', 'faidd');

    if (await this.exists(rulesPath)) {
      await this.remove(rulesPath);
      this.logInfo('Cleared old rules.');
    }
    if (await this.exists(commandsPath)) {
      await this.remove(commandsPath);
      this.logInfo('Cleared old commands.');
    }
  }

  // install a custom agent launcher (for user-defined agents)
  async installCustomAgentLauncher(
    projectDir: string,
    agentName: string,
    agentPath: string,
    metadata?: { description?: string }
  ) {
    const customDir = path.join(projectDir, '.cursor', 'commands', 'faidd', 'custom');
    await this.ensureDir(customDir);

    const content = this.generator.generateAgentCommand({
      name: agentName,
      module: 'custom',
      path: agentPath,
      relativePath: agentPath,
      description: metadata?.description || `Custom agent: ${agentName}`,
    }, this.bunkerName);

    const filePath = path.join(customDir, `${agentName}.md`);
    await this.writeFile(filePath, content);

    return { path: filePath, command: `/faidd/custom/${agentName}` };
  }
}
