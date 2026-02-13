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

  replace(content: string, variables: Record<string, unknown>): string {
    let result = content;

    // 1. Process Conditionals
    result = this.processConditionals(result, variables);

    // 2. Process Variables
    result = this.processVariables(result, variables);

    // 3. Cleanup
    result = this.cleanupEmptyLines(result);

    return result;
  }

  private processConditionals(content: string, variables: Record<string, unknown>): string {
    let result = content;

    // {{#if var == "value"}}
    const ifEqualsPattern = /\{\{#if\s+(\w+)\s*==\s*\\?"([^"\\]+)\\?"\s*\}\}([\s\S]*?)\{\{\/if\}\}/g;
    result = result.replaceAll(ifEqualsPattern, (match, varName, value, block) => {
      return String(variables[varName]) === value ? block : '';
    });

    // {{#if var}} (truthy)
    const ifBoolPattern = /\{\{#if\s+(\w+)\s*\}\}([\s\S]*?)\{\{\/if\}\}/g;
    result = result.replaceAll(ifBoolPattern, (match, varName, block) => {
      const val = variables[varName];
      const isTruthy = val === true || (typeof val === 'string' && val.length > 0) || (typeof val === 'number' && val !== 0);
      return isTruthy ? block : '';
    });

    // {{#unless var}}
    const unlessPattern = /\{\{#unless\s+(\w+)\s*\}\}([\s\S]*?)\{\{\/unless\}\}/g;
    result = result.replaceAll(unlessPattern, (match, varName, block) => {
      const val = variables[varName];
      const isFalsy = val === false || val === '' || val === null || val === undefined || val === 0;
      return isFalsy ? block : '';
    });

    return result;
  }

  private processVariables(content: string, variables: Record<string, unknown>): string {
    return content.replaceAll(/\{\{(\w+)\}\}/g, (match, varName) => {
      if (Object.prototype.hasOwnProperty.call(variables, varName)) {
        return String(variables[varName]);
      }
      return match; // Leave unknown variables (might be runtime)
    });
  }

  private cleanupEmptyLines(content: string): string {
    return content.replace(/\n{3,}/g, '\n\n');
  }
}
