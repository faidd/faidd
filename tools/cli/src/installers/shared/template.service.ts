import fs from 'fs-extra';

/**
 * Template Service
 * Handles Markdown and JSON template substitution with a strictly typed mindset.
 */
export class TemplateService {
  async load(templatePath: string): Promise<string> {
    if (!(await fs.pathExists(templatePath))) {
      throw new Error(`Template not found at: ${templatePath}`);
    }
    return await fs.readFile(templatePath, 'utf8');
  }

  replace(content: string, variables: Record<string, string>): string {
    let result = content;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replaceAll(`{{${key}}}`, value);
    }
    return result;
  }
}
