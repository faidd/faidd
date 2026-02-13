// config.service.ts — YAML/JSON config loading, validation, and placeholder processing
import fs from 'fs-extra';
import path from 'path';
import YAML from 'yaml';
import { z } from 'zod';

// governance config stored in .faiddrc.json
export const GovernanceSchema = z.object({
  projectName: z.string(),
  architect: z.string(),
  environment: z.object({
    ide: z.string(),
    aiAssistant: z.string(),
  }),
  security: z.object({
    level: z.enum(['SOVEREIGN', 'AUDIT', 'RELAXED']),
    readOnlyBunker: z.boolean().default(true),
  }),
  metadata: z.object({
    establishedAt: z.string(),
    version: z.string(),
  }),
});

export type Governance = z.infer<typeof GovernanceSchema>;

export class ConfigService {
  private configPath: string;

  constructor(projectDir: string = process.cwd()) {
    this.configPath = path.join(projectDir, '.faiddrc.json');
  }

  // -- governance (.faiddrc.json) --

  async governanceExists(): Promise<boolean> {
    return fs.pathExists(this.configPath);
  }

  async loadGovernance(): Promise<Governance> {
    const raw = await fs.readJSON(this.configPath);
    return GovernanceSchema.parse(raw);
  }

  async saveGovernance(gov: Governance): Promise<void> {
    await fs.writeJSON(this.configPath, gov, { spaces: 2 });
  }

  // -- YAML --

  async loadYaml<T = Record<string, unknown>>(filePath: string): Promise<T> {
    if (!(await fs.pathExists(filePath))) {
      throw new Error(`Config not found: ${filePath}`);
    }
    const content = await fs.readFile(filePath, 'utf8');
    return YAML.parse(content) as T;
  }

  async saveYaml(filePath: string, data: unknown): Promise<void> {
    await fs.ensureDir(path.dirname(filePath));
    const content = YAML.stringify(data, { indent: 2 });
    await fs.writeFile(filePath, content.endsWith('\n') ? content : content + '\n');
  }

  // -- placeholder processing --

  // replace all {key} placeholders in a file's content
  async processFile(filePath: string, replacements: Record<string, string>): Promise<void> {
    let content = await fs.readFile(filePath, 'utf8');
    content = this.replacePlaceholders(content, replacements);
    await fs.writeFile(filePath, content);
  }

  replacePlaceholders(content: string, replacements: Record<string, string>): string {
    let result = content;
    for (const [key, value] of Object.entries(replacements)) {
      // escape regex special chars in the key
      const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = result.replace(new RegExp(escaped, 'g'), value);
    }
    return result;
  }

  // -- deep merge --

  deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
    const output = { ...target };
    for (const key of Object.keys(source) as (keyof T)[]) {
      const srcVal = source[key];
      const tgtVal = target[key];
      if (this.isObject(srcVal) && this.isObject(tgtVal)) {
        (output as Record<string, unknown>)[key as string] = this.deepMerge(
          tgtVal as Record<string, unknown>,
          srcVal as Record<string, unknown>
        );
      } else if (srcVal !== undefined) {
        (output as Record<string, unknown>)[key as string] = srcVal;
      }
    }
    return output;
  }

  private isObject(item: unknown): item is Record<string, unknown> {
    return item !== null && typeof item === 'object' && !Array.isArray(item);
  }
}
