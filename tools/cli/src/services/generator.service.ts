// generator.service.ts — produces IDE command files, launchers, and triggers
import fs from 'fs-extra';
import path from 'path';
import { AgentArtifact, WorkflowArtifact, TaskToolArtifact } from './discovery.service.js';
import { buildActivationBlock } from './xml.js';

export class GeneratorService {
  // generate a command file for an agent (what IDEs like Cursor use as /commands)
  generateAgentCommand(agent: AgentArtifact, bunkerName: string = '_faidd'): string {
    return [
      '---',
      `description: '${agent.description || `Activate ${agent.name} agent`}'`,
      '---',
      '',
      `# Agent: ${agent.displayName || agent.name}`,
      '',
      'You must fully embody this agent and follow all instructions exactly.',
      '',
      buildActivationBlock(agent.relativePath, bunkerName),
      '',
      '---',
      `*${bunkerName} registry — ${agent.module}*`,
    ].join('\n');
  }

  // generate a command file for a workflow
  generateWorkflowCommand(
    workflow: WorkflowArtifact,
    bunkerName: string = '_faidd'
  ): string {
    const resolvedPath = this.resolvePath(workflow.path, bunkerName);

    if (workflow.type === 'md') {
      // markdown workflows are loaded directly
      return [
        '---',
        `description: '${workflow.description}'`,
        '---',
        '',
        `# Workflow: ${workflow.name}`,
        '',
        `LOAD and follow the workflow at: \`{project-root}/${resolvedPath}\``,
        '',
        'Execute each step in order. Save outputs after each section.',
      ].join('\n');
    }

    // YAML workflows go through the workflow executor
    return [
      '---',
      `description: '${workflow.description}'`,
      '---',
      '',
      `# Workflow: ${workflow.name}`,
      '',
      `To execute this workflow:`,
      `1. LOAD {project-root}/${bunkerName}/core/tasks/workflow.xml`,
      `2. Pass workflow path: \`{project-root}/${resolvedPath}\``,
      '3. Follow workflow.xml instructions EXACTLY',
      '4. Save outputs after EACH section',
      '',
      '## Modes',
      '- **Normal**: Full interaction with user',
      '- **#yolo**: Skip optional steps, minimal prompting',
    ].join('\n');
  }

  // generate a command file for a task or tool
  generateTaskToolCommand(tt: TaskToolArtifact, bunkerName: string = '_faidd'): string {
    const resolvedPath = this.resolvePath(tt.path, bunkerName);
    const label = tt.type === 'task' ? 'Task' : 'Tool';

    return [
      '---',
      `description: '${tt.description || `Execute ${tt.name} ${tt.type}`}'`,
      '---',
      '',
      `# ${label}: ${tt.name}`,
      '',
      `LOAD and execute: \`{project-root}/${resolvedPath}\``,
      '',
      'Follow all instructions precisely. Report results when complete.',
    ].join('\n');
  }

  // generate a module-level readme listing all workflows in that module
  generateModuleWorkflowLauncher(
    moduleName: string,
    workflows: WorkflowArtifact[],
    bunkerName: string = '_faidd'
  ): string {
    const lines = [
      `# ${moduleName.toUpperCase()} Workflows`,
      '',
      `## Available Workflows`,
      '',
    ];

    for (const wf of workflows) {
      const resolved = this.resolvePath(wf.path, bunkerName);
      lines.push(`**${wf.name}**`);
      lines.push(`- Path: \`{project-root}/${resolved}\``);
      lines.push(`- ${wf.description}`);
      lines.push('');
    }

    lines.push('## Execution');
    lines.push('');
    lines.push(`1. LOAD {project-root}/${bunkerName}/core/tasks/workflow.xml`);
    lines.push('2. Pass the workflow path as parameter');
    lines.push('3. Follow instructions EXACTLY');
    lines.push('4. Save outputs after EACH section');

    return lines.join('\n');
  }

  // flat trigger — a simpler one-liner used by IDEs like Codex and OpenCode
  generateFlatTrigger(
    name: string,
    artifactPath: string,
    bunkerName: string = '_faidd'
  ): string {
    const resolvedPath = this.resolvePath(artifactPath, bunkerName);
    return `LOAD {project-root}/${resolvedPath} — follow all instructions exactly.`;
  }

  // convert paths from source format to installed format
  // src/modules/bmm/agents/foo.md -> bmm/agents/foo.md
  // bmad/core/tasks/bar.xml -> core/tasks/bar.xml
  resolvePath(sourcePath: string, bunkerName: string): string {
    let resolved = sourcePath;

    // strip source directory prefix
    const moduleMatch = resolved.match(/\/src\/modules\/(.+)/);
    if (moduleMatch) {
      return `${bunkerName}/${moduleMatch[1]}`;
    }

    const coreMatch = resolved.match(/\/src\/core\/(.+)/);
    if (coreMatch) {
      return `${bunkerName}/core/${coreMatch[1]}`;
    }

    // strip old bmad/ prefix
    if (resolved.startsWith('bmad/')) {
      resolved = resolved.replace('bmad/', `${bunkerName}/`);
    }

    // if it already looks like a relative path, just prepend bunker name
    if (!resolved.startsWith(bunkerName) && !resolved.startsWith('{')) {
      resolved = `${bunkerName}/${resolved}`;
    }

    return resolved;
  }
}
