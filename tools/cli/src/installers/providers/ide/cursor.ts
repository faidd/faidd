import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { IProvider, ProviderMetadata } from '../registry.js';
import { DiscoveryService } from '../../../services/discovery.service.js';
import { GeneratorService } from '../../../services/generator.service.js';

export class CursorProvider implements IProvider {
  readonly metadata: ProviderMetadata = {
    name: 'cursor',
    displayName: 'Cursor IDE',
    category: 'IDE'
  };

  private readonly configDir = '.cursor';
  private readonly rulesDir = 'rules';
  private readonly commandsDir = 'commands';
  
  private discovery = new DiscoveryService();
  private generator = new GeneratorService();

  async detect(projectDir: string): Promise<boolean> {
    return fs.pathExists(path.join(projectDir, this.configDir));
  }

  async setup(projectDir: string): Promise<void> {
    const bunkerDir = path.join(projectDir, '_faidd');
    const cursorPath = path.join(projectDir, this.configDir);
    const rulesPath = path.join(cursorPath, this.rulesDir);
    const faiddCommandsPath = path.join(cursorPath, this.commandsDir, 'faidd');

    await fs.ensureDir(rulesPath);
    await fs.ensureDir(faiddCommandsPath);
    
    // 1. Constitution Injection
    const constitution = [
      '# FAIDD CONSTITUTION',
      '',
      '- **Bunker (`_faidd/`)**: NUCLEUS. READ-ONLY FOR ALL AGENTS.',
      '- **Brain (`faidd/`)**: OPERATIONAL DATA. PERSISTENT CONTEXT.',
      '- **Ledger**: Record all critical decisions in `faidd/ledger/`.',
      '',
      '---',
      '*Absolute Sovereignty via Precision.*'
    ].join('\n');
    await fs.writeFile(path.join(rulesPath, 'faidd-constitution.md'), constitution);

    // 2. Discover & Generate Agents
    const agents = await this.discovery.discoverAgents(bunkerDir);
    for (const agent of agents) {
      const moduleDir = path.join(faiddCommandsPath, agent.module, 'agents');
      await fs.ensureDir(moduleDir);
      
      const content = await this.generator.generateAgentLauncher(agent);
      await fs.writeFile(path.join(moduleDir, `${agent.name}.md`), content);
    }

    // 3. Discover & Generate Tasks/Tools
    const tasks = await this.discovery.discoverTasks(bunkerDir);
    for (const task of tasks) {
      const moduleDir = path.join(faiddCommandsPath, task.module, `${task.type}s`);
      await fs.ensureDir(moduleDir);
      
      const content = this.generator.generateTaskTrigger(task);
      await fs.writeFile(path.join(moduleDir, `${task.name}.md`), content);
    }

    console.log(`${chalk.blue('◈')} ${chalk.dim(`Cursor: ${agents.length} agents and ${tasks.length} tasks/tools deployed.`)}`);
  }
}
