import fs from 'fs-extra';
import path from 'path';
import { AgentArtifact, TaskArtifact } from './discovery.service.js';

/**
 * Generator Service
 * Responsible for creating the specialized files that IDEs use to trigger FAIDD.
 */
export class GeneratorService {
  /**
   * Generates the Markdown launcher for an agent.
   * Format: YAML Frontmatter + Agent Activation Block.
   */
  async generateAgentLauncher(agent: AgentArtifact, bunkerFolderName: string = '_faidd'): Promise<string> {
    const launcher = [
      '---',
      `name: '${agent.name}'`,
      `description: '${agent.description || `${agent.name} sovereign agent`}'`,
      '---',
      '',
      `# Agent Activation: ${agent.name}`,
      '',
      'You must fully embody this agent\'s persona and follow all instructions exactly.',
      '',
      '<agent-activation CRITICAL="TRUE">',
      `1. LOAD the FULL agent file from @${bunkerFolderName}/${agent.relativePath}`,
      '2. READ its entire contents - persona, menu, and specific instructions.',
      '3. FOLLOW every step in the <activation> section precisely.',
      '4. DISPLAY the welcome/greeting.',
      '5. PRESENT the numbered menu and WAIT for user input.',
      '</agent-activation>',
      '',
      '---',
      '*FAIDD Sovereign Registry*'
    ].join('\n');

    return launcher;
  }

  /**
   * Generates a simple task trigger.
   */
  generateTaskTrigger(task: TaskArtifact, bunkerFolderName: string = '_faidd'): string {
    const relPath = path.relative(path.join(process.cwd(), bunkerFolderName), task.path);
    
    return [
      '---',
      `description: '${task.description || `Execute ${task.name}`}'`,
      '---',
      '',
      `# Task: ${task.name}`,
      '',
      `LOAD and execute the ${task.type} at: {project-root}/${bunkerFolderName}/${task.module}/${task.type}s/${task.name}.md`,
      '',
      'Follow all instructions in the file exactly as written.'
    ].join('\n');
  }
}
