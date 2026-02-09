import fs from 'fs-extra';
import path from 'path';
import { z } from 'zod';
import chalk from 'chalk';

export const FaiddGovernanceSchema = z.object({
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

export type FaiddGovernance = z.infer<typeof FaiddGovernanceSchema>;

export class GovernanceService {
  private configPath = path.join(process.cwd(), '.faiddrc.json');

  async exists(): Promise<boolean> {
    return fs.pathExists(this.configPath);
  }

  async load(): Promise<FaiddGovernance> {
    try {
      const raw = await fs.readJSON(this.configPath);
      return FaiddGovernanceSchema.parse(raw);
    } catch (error) {
      throw new Error(`Governance Violation: .faiddrc.json is corrupted or invalid. ${error}`);
    }
  }

  async save(gov: FaiddGovernance): Promise<void> {
    await fs.writeJSON(this.configPath, gov, { spaces: 2 });
    console.log(chalk.green('\n⚖️  FAIDD Governance Law signed and sealed.'));
  }
}
