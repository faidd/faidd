import fs from 'fs-extra';
import path from 'path';
import yaml from 'yaml';

export interface InjectionConfig {
  file: string;
  point: string;
  content: string;
  requires?: string;
}

/**
 * Module Injection Service
 * Handles the logic for injecting module-specific instructions into system contexts.
 * Pure TypeScript implementation.
 */
export class ModuleInjectionService {
  async loadInjections(modulePath: string, providerName: string): Promise<InjectionConfig[]> {
    const injectionsPath = path.join(modulePath, 'sub-modules', providerName, 'injections.yaml');
    
    if (!(await fs.pathExists(injectionsPath))) {
      return [];
    }

    try {
      const content = await fs.readFile(injectionsPath, 'utf8');
      const config = yaml.parse(content);
      return config.injections || [];
    } catch (error) {
      console.warn(`  Non-critical: Failed to parse injections for ${modulePath}:`, error);
      return [];
    }
  }

  async applyInjection(projectDir: string, injection: InjectionConfig): Promise<void> {
    const targetFile = path.join(projectDir, injection.file);
    if (!(await fs.pathExists(targetFile))) {
      return;
    }

    let content = await fs.readFile(targetFile, 'utf8');
    const marker = `<!-- IDE-INJECT-POINT: ${injection.point} -->`;

    if (content.includes(marker)) {
      // Avoid double injection
      if (!content.includes(injection.content)) {
        content = content.replace(marker, `${marker}\n${injection.content}`);
        await fs.writeFile(targetFile, content);
      }
    }
  }
}
