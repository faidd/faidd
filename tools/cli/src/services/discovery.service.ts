import fs from 'fs-extra';
import path from 'path';

export interface AgentArtifact {
  name: string;
  module: string;
  path: string; // Absolute path to the source in the Bunker
  relativePath: string; // Relative path from Bunker root
  displayName?: string;
  description?: string;
}

export interface TaskArtifact {
  name: string;
  module: string;
  path: string;
  type: 'task' | 'tool';
  description?: string;
}

/**
 * Discovery Service
 * Scans the FAIDD Bunker (_faidd/) for agents, tasks, and manifests.
 * Pure TypeScript implementation of the B-Mad discovery engine.
 */
export class DiscoveryService {
  async discoverAgents(bunkerDir: string): Promise<AgentArtifact[]> {
    const agents: AgentArtifact[] = [];
    
    // We expect a structure like _faidd/{module}/agents/{name}.md
    const modules = await this.getModules(bunkerDir);
    
    for (const module of modules) {
      const agentsDir = path.join(bunkerDir, module, 'agents');
      if (await fs.pathExists(agentsDir)) {
        const files = await fs.readdir(agentsDir);
        for (const file of files) {
          if (file.endsWith('.md') && !file.toLowerCase().startsWith('readme')) {
            agents.push({
              name: path.basename(file, '.md'),
              module,
              path: path.join(agentsDir, file),
              relativePath: path.relative(bunkerDir, path.join(agentsDir, file))
            });
          }
        }
      }
    }
    
    return agents;
  }

  async discoverTasks(bunkerDir: string): Promise<TaskArtifact[]> {
    const tasks: TaskArtifact[] = [];
    const modules = await this.getModules(bunkerDir);
    
    for (const module of modules) {
      // Check for tasks
      const tasksDir = path.join(bunkerDir, module, 'tasks');
      if (await fs.pathExists(tasksDir)) {
        const files = await fs.readdir(tasksDir);
        for (const file of files) {
          if (file.endsWith('.md')) {
            tasks.push({
              name: path.basename(file, '.md'),
              module,
              type: 'task',
              path: path.join(tasksDir, file)
            });
          }
        }
      }
      
      // Check for tools
      const toolsDir = path.join(bunkerDir, module, 'tools');
      if (await fs.pathExists(toolsDir)) {
        const files = await fs.readdir(toolsDir);
        for (const file of files) {
          if (file.endsWith('.md')) {
            tasks.push({
              name: path.basename(file, '.md'),
              module,
              type: 'tool',
              path: path.join(toolsDir, file)
            });
          }
        }
      }
    }
    
    return tasks;
  }

  private async getModules(bunkerDir: string): Promise<string[]> {
    if (!(await fs.pathExists(bunkerDir))) return [];
    
    const entries = await fs.readdir(bunkerDir, { withFileTypes: true });
    return entries
      .filter(e => e.isDirectory() && !e.name.startsWith('_') && !e.name.startsWith('.'))
      .map(e => e.name);
  }
}
