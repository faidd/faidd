import fs from 'fs-extra';
import path from 'path';
import { z } from 'zod';

// Sovereign Configuration Schema

export const FaiddConfigSchema = z.object({
  projectName: z.string(),
  developerName: z.string(),
  environment: z.object({
    ide: z.string(),
    aiAssistant: z.string(),
  }),
  governance: z.object({
    mode: z.enum(['sovereign', 'audit', 'relaxed']),
    enforceReadOnly: z.boolean().default(true),
  }),
  metadata: z.object({
    createdAt: z.string(),
    version: z.string(),
  }),
});

export type FaiddConfig = z.infer<typeof FaiddConfigSchema>;

export class ConfigService {
  private configPath = path.join(process.cwd(), '.faiddrc.json');

  async exists(): Promise<boolean> {
    return fs.pathExists(this.configPath);
  }

  async load(): Promise<FaiddConfig> {
    const raw = await fs.readJSON(this.configPath);
    return FaiddConfigSchema.parse(raw);
  }

  async save(config: FaiddConfig): Promise<void> {
    await fs.writeJSON(this.configPath, config, { spaces: 2 });
  }

  // Scaffolds the Sovereign Hierarchy (M0)

  async scaffoldHierarchy(): Promise<void> {
    const root = process.cwd();
    
    // A. The System Core (Read-Only Target)
    const coreFolders = [
      '_faidd/rules',
      '_faidd/sessions',
      '_faidd/rights',
      '_faidd/agents',
      '_faidd/bin'
    ];

    // B. The Operational Brain
    const operationalFolders = [
      'faidd/ledger',
      'faidd/analysis',
      'faidd/audit',
      'faidd/planning'
    ];

    for (const folder of [...coreFolders, ...operationalFolders]) {
      await fs.ensureDir(path.join(root, folder));
    }
  }
}
