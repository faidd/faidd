// discovery.service.ts — scans the FAIDD bunker for agents, workflows, tasks, and tools
import fs from 'fs-extra';
import path from 'path';
import YAML from 'yaml';
import { parse as csvParse } from 'csv-parse/sync';

// what an agent looks like after discovery
export interface AgentArtifact {
  name: string;
  module: string;
  path: string;
  relativePath: string;
  displayName?: string;
  description?: string;
}

// what a workflow looks like after discovery
export interface WorkflowArtifact {
  name: string;
  module: string;
  description: string;
  path: string;
  type: 'yaml' | 'md';
}

// what a task or tool looks like after discovery
export interface TaskToolArtifact {
  name: string;
  module: string;
  type: 'task' | 'tool';
  description: string;
  path: string;
  standalone: boolean;
}

export class DiscoveryService {
  // collect all agents from every module in the bunker
  async collectAgents(bunkerDir: string): Promise<AgentArtifact[]> {
    const agents: AgentArtifact[] = [];
    const modules = await this.listModules(bunkerDir);

    for (const mod of modules) {
      const agentsDir = path.join(bunkerDir, mod, 'agents');
      if (!(await fs.pathExists(agentsDir))) continue;

      const files = await fs.readdir(agentsDir);
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (!['.md', '.xml'].includes(ext)) continue;
        if (file.toLowerCase().startsWith('readme')) continue;

        const filePath = path.join(agentsDir, file);
        const meta = await this.extractFrontmatter(filePath);

        agents.push({
          name: path.basename(file, ext),
          module: mod,
          path: filePath,
          relativePath: path.relative(bunkerDir, filePath),
          displayName: meta?.name || meta?.displayName,
          description: meta?.description,
        });
      }
    }

    return agents;
  }

  // collect workflows — from CSV manifest first, fallback to directory scan
  async collectWorkflows(bunkerDir: string): Promise<WorkflowArtifact[]> {
    // try CSV manifest first
    const csvPath = path.join(bunkerDir, '_config', 'workflow-manifest.csv');
    if (await fs.pathExists(csvPath)) {
      return this.parseWorkflowCsv(csvPath);
    }

    // fallback: scan directories
    const workflows: WorkflowArtifact[] = [];
    const modules = await this.listModules(bunkerDir);

    for (const mod of modules) {
      const wfDir = path.join(bunkerDir, mod, 'workflows');
      if (!(await fs.pathExists(wfDir))) continue;

      const found = await this.findWorkflowFiles(wfDir);
      for (const wf of found) {
        workflows.push({
          name: wf.name,
          module: mod,
          description: wf.description,
          path: path.relative(bunkerDir, wf.path),
          type: wf.path.endsWith('.yaml') || wf.path.endsWith('.yml') ? 'yaml' : 'md',
        });
      }
    }

    return workflows;
  }

  // collect tasks and tools — from CSV manifests first, fallback to directory scan
  async collectTasksAndTools(bunkerDir: string): Promise<TaskToolArtifact[]> {
    const artifacts: TaskToolArtifact[] = [];

    // try tasks
    artifacts.push(...await this.parseTaskToolCsv(
      path.join(bunkerDir, '_config', 'task-manifest.csv'),
      'task'
    ));

    // try tools
    artifacts.push(...await this.parseTaskToolCsv(
      path.join(bunkerDir, '_config', 'tool-manifest.csv'),
      'tool'
    ));

    // fallback if no CSV found: scan directories
    if (artifacts.length === 0) {
      const modules = await this.listModules(bunkerDir);
      for (const mod of modules) {
        artifacts.push(...await this.scanTaskToolDir(bunkerDir, mod, 'tasks', 'task'));
        artifacts.push(...await this.scanTaskToolDir(bunkerDir, mod, 'tools', 'tool'));
      }
    }

    return artifacts;
  }

  // list all module directories in the bunker (skips _ prefixed and hidden)
  async listModules(bunkerDir: string): Promise<string[]> {
    if (!(await fs.pathExists(bunkerDir))) return [];
    const entries = await fs.readdir(bunkerDir, { withFileTypes: true });
    return entries
      .filter(e => e.isDirectory() && !e.name.startsWith('_') && !e.name.startsWith('.'))
      .map(e => e.name);
  }

  // -- private helpers --

  // extract YAML frontmatter from a markdown file (the --- block at the top)
  private async extractFrontmatter(filePath: string): Promise<Record<string, string> | null> {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const match = content.match(/^---\n([\s\S]*?)\n---/);
      if (!match) return null;
      return YAML.parse(match[1]) as Record<string, string>;
    } catch {
      return null;
    }
  }

  private async parseWorkflowCsv(csvPath: string): Promise<WorkflowArtifact[]> {
    const content = await fs.readFile(csvPath, 'utf8');
    const records = csvParse(content, { columns: true, skip_empty_lines: true }) as Record<string, string>[];
    return records.map(r => ({
      name: r.name,
      module: r.module,
      description: r.description ?? '',
      path: r.path,
      type: (r.path?.endsWith('.yaml') || r.path?.endsWith('.yml') ? 'yaml' : 'md') as 'yaml' | 'md',
    }));
  }

  private async parseTaskToolCsv(
    csvPath: string,
    type: 'task' | 'tool'
  ): Promise<TaskToolArtifact[]> {
    if (!(await fs.pathExists(csvPath))) return [];

    const content = await fs.readFile(csvPath, 'utf8');
    const records = csvParse(content, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

    return records.map(r => ({
      name: r.name,
      module: r.module,
      type,
      description: r.description ?? '',
      path: r.path,
      standalone: r.standalone === 'true',
    }));
  }

  // scan a tasks/ or tools/ directory when no CSV manifest is available
  private async scanTaskToolDir(
    bunkerDir: string,
    mod: string,
    dirName: string,
    type: 'task' | 'tool'
  ): Promise<TaskToolArtifact[]> {
    const dir = path.join(bunkerDir, mod, dirName);
    if (!(await fs.pathExists(dir))) return [];

    const files = await fs.readdir(dir);
    const artifacts: TaskToolArtifact[] = [];

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!['.md', '.xml'].includes(ext)) continue;

      const filePath = path.join(dir, file);
      const meta = await this.extractFrontmatter(filePath);
      const standalone = await this.checkStandalone(filePath);

      artifacts.push({
        name: path.basename(file, ext),
        module: mod,
        type,
        description: meta?.description ?? '',
        path: path.relative(bunkerDir, filePath),
        standalone,
      });
    }

    return artifacts;
  }

  // check if a file is marked as standalone (in frontmatter or XML attribute)
  private async checkStandalone(filePath: string): Promise<boolean> {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      // check YAML frontmatter
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (fmMatch) {
        const fm = YAML.parse(fmMatch[1]) as Record<string, unknown>;
        if (fm.standalone === true || fm.standalone === 'true') return true;
      }
      // check XML attribute
      if (content.includes('standalone="true"')) return true;
      return false;
    } catch {
      return false;
    }
  }

  // recursively find workflow.yaml and workflow.md files
  private async findWorkflowFiles(
    dir: string
  ): Promise<{ name: string; description: string; path: string }[]> {
    const results: { name: string; description: string; path: string }[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...await this.findWorkflowFiles(fullPath));
      } else if (entry.name === 'workflow.yaml' || entry.name === 'workflow.yml' || entry.name === 'workflow.md') {
        // use the parent directory name as the workflow name
        const name = path.basename(dir);
        let description = '';
        try {
          const content = await fs.readFile(fullPath, 'utf8');
          const parsed = YAML.parse(content) as Record<string, unknown>;
          description = (parsed.description as string) ?? '';
        } catch { /* not yaml, that's ok */ }
        results.push({ name, description, path: fullPath });
      }
    }

    return results;
  }
}
