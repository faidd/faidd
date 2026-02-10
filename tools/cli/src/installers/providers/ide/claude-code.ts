import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import os from 'os';
import { IProvider, ProviderMetadata } from '../registry.js';
import { DiscoveryService } from '../../../services/discovery.service.js';
import { GeneratorService } from '../../../services/generator.service.js';
import { ModuleInjectionService } from '../../../services/injection.service.js';

export class ClaudeCodeProvider implements IProvider {
  readonly metadata: ProviderMetadata = {
    name: 'claude-code',
    displayName: 'Claude Code',
    category: 'IDE'
  };

  private readonly configDir = '.claude';
  private readonly agentsDir = 'agents';
  
  private discovery = new DiscoveryService();
  private generator = new GeneratorService();
  private injector = new ModuleInjectionService();

  async detect(projectDir: string): Promise<boolean> {
    return fs.pathExists(path.join(projectDir, this.configDir));
  }

  async setup(projectDir: string): Promise<void> {
    const bunkerDir = path.join(projectDir, '_faidd');
    const claudePath = path.join(projectDir, this.configDir);
    const agentsPath = path.join(claudePath, this.agentsDir);

    await fs.ensureDir(agentsPath);

    // 1. Discover & Generate Agents Launchers
    const agents = await this.discovery.discoverAgents(bunkerDir);
    for (const agent of agents) {
      const moduleDir = path.join(agentsPath, agent.module);
      await fs.ensureDir(moduleDir);
      
      const content = await this.generator.generateAgentLauncher(agent);
      await fs.writeFile(path.join(moduleDir, `${agent.name}.md`), content);
      
      // 2. Performance Module Injections if available
      const modulePath = path.join(bunkerDir, agent.module);
      const injections = await this.injector.loadInjections(modulePath, 'claude-code');
      for (const injection of injections) {
          await this.injector.applyInjection(projectDir, injection);
      }
    }

    // 3. Constitution & Global Mindset
    const constitution = [
        '# CLAUDE CORE MINDSET: FAIDD SOVEREIGNTY',
        '',
        '<!-- IDE-INJECT-POINT: system-instructions -->',
        '',
        'You are an elite agent operationalized via FAIDD.',
        'Your actions are governed by the Bunker (`_faidd/`).',
        'Your history is preserved in the Brain (`faidd/`).',
        '',
        '## Operational Sovereignty',
        '1. ALWAYS parse `_faidd/` for task definitions.',
        '2. NEVER commit to `_faidd/`.',
        '3. USE the FAIDD CLI for all orchestration.'
    ].join('\n');
    
    await fs.writeFile(path.join(agentsPath, 'faidd-mindset.md'), constitution);

    console.log(`${chalk.blue('◈')} ${chalk.dim(`Claude Code: ${agents.length} subagents and modular injections processed.`)}`);
  }
}
