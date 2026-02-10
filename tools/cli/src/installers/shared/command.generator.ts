import path from 'path';
import { TemplateService } from './template.service.js';

/**
 * Command Generator
 * Generates specialized triggers for IDEs and autonomous Agents.
 */
export class CommandGenerator {
  constructor(
    private templateService: TemplateService,
    private templatePath: string
  ) {}

  async generateAgentLauncher(agent: {
    name: string;
    module: string;
    path: string;
    description?: string;
  }): Promise<string> {
    const template = await this.templateService.load(this.templatePath);
    
    return this.templateService.replace(template, {
      name: agent.name,
      description: agent.description || `${agent.name} agent`,
      module: agent.module,
      path: agent.path
    });
  }
}
