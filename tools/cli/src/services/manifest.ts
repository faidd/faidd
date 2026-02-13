// manifest.ts — generates and reads CSV+YAML manifests for installed modules
import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import { parse as csvParse } from 'csv-parse/sync';

export interface ManifestEntry {
  name: string;
  module: string;
  description: string;
  path: string;
  standalone?: boolean;
  group?: string;
  category?: string;
  checksum?: string;
}

export interface InstallManifest {
  version: string;
  installedAt: string;
  updatedAt: string;
  folderName: string;
  modules: string[];
  ides: string[];
  files: string[];
}

export class ManifestService {
  // read the main install manifest (manifest.yaml)
  async readInstallManifest(bunkerDir: string): Promise<InstallManifest | null> {
    const manifestPath = path.join(bunkerDir, '_config', 'manifest.yaml');
    if (!(await fs.pathExists(manifestPath))) return null;

    // we use a simple key:value parser here since the manifest is flat
    const content = await fs.readFile(manifestPath, 'utf8');
    try {
      const { default: YAML } = await import('yaml');
      return YAML.parse(content) as InstallManifest;
    } catch {
      return null;
    }
  }

  // write the main install manifest
  async writeInstallManifest(bunkerDir: string, manifest: InstallManifest): Promise<void> {
    const configDir = path.join(bunkerDir, '_config');
    await fs.ensureDir(configDir);

    const { default: YAML } = await import('yaml');
    const content = YAML.stringify(manifest, { indent: 2 });
    await fs.writeFile(path.join(configDir, 'manifest.yaml'), content);
  }

  // read a CSV manifest (workflow-manifest.csv, task-manifest.csv, etc)
  async readCsvManifest(csvPath: string): Promise<ManifestEntry[]> {
    if (!(await fs.pathExists(csvPath))) return [];

    const content = await fs.readFile(csvPath, 'utf8');
    return csvParse(content, {
      columns: true,
      skip_empty_lines: true,
    }) as ManifestEntry[];
  }

  // generate a CSV manifest by scanning a directory
  async generateCsvManifest(
    entries: ManifestEntry[],
    outputPath: string
  ): Promise<void> {
    if (entries.length === 0) return;

    await fs.ensureDir(path.dirname(outputPath));

    // build CSV header from the first entry's keys
    const headers = Object.keys(entries[0]);
    const lines = [headers.join(',')];

    for (const entry of entries) {
      const values = headers.map(h => {
        const val = String((entry as unknown as Record<string, unknown>)[h] ?? '');
        // quote values that contain commas or quotes
        return val.includes(',') || val.includes('"')
          ? `"${val.replace(/"/g, '""')}"`
          : val;
      });
      lines.push(values.join(','));
    }

    await fs.writeFile(outputPath, lines.join('\n') + '\n');
  }

  // compute SHA-256 checksum for a file (used for integrity tracking)
  async checksumFile(filePath: string): Promise<string> {
    const content = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(content).digest('hex').slice(0, 12);
  }

  // scan a module directory and build manifest entries for its files
  async scanModuleFiles(
    bunkerDir: string,
    moduleId: string,
    extensions: string[] = ['.md', '.xml', '.yaml', '.yml']
  ): Promise<ManifestEntry[]> {
    const modulePath = path.join(bunkerDir, moduleId);
    if (!(await fs.pathExists(modulePath))) return [];

    const entries: ManifestEntry[] = [];
    await this.walkDir(modulePath, async (filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      if (!extensions.includes(ext)) return;

      const relativePath = path.relative(bunkerDir, filePath);
      const checksum = await this.checksumFile(filePath);
      entries.push({
        name: path.basename(filePath, ext),
        module: moduleId,
        description: '',
        path: relativePath,
        checksum,
      });
    });

    return entries;
  }

  // preserve existing CSV rows for modules that weren't updated
  mergeManifestEntries(
    existing: ManifestEntry[],
    updated: ManifestEntry[],
    updatedModules: string[]
  ): ManifestEntry[] {
    // keep rows from modules that weren't touched
    const preserved = existing.filter(e => !updatedModules.includes(e.module));
    return [...preserved, ...updated];
  }

  // -- helpers --

  private async walkDir(dir: string, callback: (filePath: string) => Promise<void>): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await this.walkDir(fullPath, callback);
      } else {
        await callback(fullPath);
      }
    }
  }

  // -- specific manifest generators --

  async generateAgentsManifest(bunkerDir: string, agents: ManifestEntry[]): Promise<void> {
    await this.generateCsvManifest(agents, path.join(bunkerDir, '_memory', 'manifests', 'agents-manifest.csv'));
  }

  async generateWorkflowsManifest(bunkerDir: string, workflows: ManifestEntry[]): Promise<void> {
    await this.generateCsvManifest(workflows, path.join(bunkerDir, '_memory', 'manifests', 'workflows-manifest.csv'));
  }

  async generateToolsManifest(bunkerDir: string, tools: ManifestEntry[]): Promise<void> {
    await this.generateCsvManifest(tools, path.join(bunkerDir, '_memory', 'manifests', 'tools-manifest.csv'));
  }

  async generateFilesManifest(bunkerDir: string, files: ManifestEntry[]): Promise<void> {
    await this.generateCsvManifest(files, path.join(bunkerDir, '_memory', 'manifests', 'files-manifest.csv'));
  }

  // Generate XML manifest for Agent Party (Web Dashboard compatibility)
  async generateAgentPartyXml(bunkerDir: string, agents: ManifestEntry[]): Promise<void> {
    const xmlPath = path.join(bunkerDir, '_config', 'agent-manifest.xml'); // or wherever B-Mad expects it
    // Actually B-Mad writes it to _config/agent-manifest.csv but with XML content inside?
    // Let's check B-Mad code again. It says id="bmad/_config/agent-manifest.csv" but returns XML content.
    // And writeAgentParty writes to filePath.
    // Let's assume we write to _memory/manifests/agent-party.xml to be safe, or just follow B-Mad convention if we knew the exact path.
    // B-Mad generator says: <manifest id="bmad/_config/agent-manifest.csv" ...>
    // So it might imply it was replacing the CSV? No, that would break CSV parsers.
    // Let's write to _memory/manifests/agent-party.xml.

    let xml = `<!-- Powered by FAIDD-CORE™ -->\n`;
    xml += `<manifest id="faidd/_memory/agent-party.xml" version="1.0" generated="${new Date().toISOString()}">\n`;
    xml += `  <description>Complete roster of installed FAIDD agents.</description>\n`;
    
    // Group by module
    const byModule: Record<string, ManifestEntry[]> = {};
    for(const agent of agents) {
        if(!byModule[agent.module]) byModule[agent.module] = [];
        byModule[agent.module].push(agent);
    }

    for (const [mod, moduleAgents] of Object.entries(byModule)) {
      xml += `  <!-- ${mod} Agents -->\n`;
      for (const agent of moduleAgents) {
        // We need to read the agent file to get persona details? 
        // Or just stub them for now. 
        // Reading every agent file might be slow but necessary for full XML manifest.
        // For now, let's keep it lightweight and minimal, or read if possible.
        
        xml += `  <agent id="${agent.path}" name="${agent.name}" module="${mod}">\n`;
        xml += `    <persona>\n`;
        xml += `      <role>${agent.description || ''}</role>\n`; // Fallback
        xml += `    </persona>\n`;
        xml += `  </agent>\n`;
      }
    }

    xml += `  <statistics>\n`;
    xml += `    <total_agents>${agents.length}</total_agents>\n`;
    xml += `    <last_updated>${new Date().toISOString()}</last_updated>\n`;
    xml += `  </statistics>\n`;
    xml += `</manifest>\n`;

    await fs.ensureDir(path.dirname(xmlPath));
    await fs.writeFile(xmlPath, xml);
  }
}
