// installer.ts — high-level orchestrator for FAIDD installations
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { ScaffoldService } from './scaffold.service.js';
import { ModuleService } from './module.js';
import { ManifestService } from './manifest.js';
import { ConfigCollector } from './config-collector.js';
import { ProviderRegistry, IProvider } from '../installers/providers/registry.js';
import { ConfigService } from './config.service.js';
import { DependencyResolver } from './dependency-resolver.js';
import { GeneratorService } from './generator.service.js';
import { DiscoveryService } from './discovery.service.js';
import { fileURLToPath } from 'url';

export interface InstallOptions {
  force?: boolean;
  quickUpdate?: boolean;
  modules?: string[];
  ides?: string[];
}

export class InstallerService {
  private scaffold = new ScaffoldService();
  private modules = new ModuleService(process.cwd()); // TODO: set correct source root
  private manifest = new ManifestService();
  private collector = new ConfigCollector();
  private config = new ConfigService();
  private resolver = new DependencyResolver();
  private genericGenerator = new GeneratorService(); // renamed to avoid conflict
  private discovery = new DiscoveryService();

  constructor(
    private registry: ProviderRegistry,
    private projectRoot: string = process.cwd()
  ) {
    // Determine the CLI's own directory (source or dist)
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    // In production, we are in dist/services/. Source root is dist/ (one level up)
    const cliRoot = path.join(__dirname, '..');
    
    this.modules = new ModuleService(cliRoot);
  }

  // Main entry point for "install" or "update"
  async run(options: InstallOptions = {}): Promise<void> {
    const spinner = ora('Initializing FAIDD installer...').start();
    const bunkerName = '_faidd';

    try {
      // 1. Ensure structure
      spinner.text = 'Scaffolding bunker...';
      await this.scaffold.scaffold(this.projectRoot, bunkerName);

      // 2. Load or collect core config
      // In a real CLI flow, we might prompt here. For now, assume config exists or is defaults.
      // const coreConfig = await this.config.loadGovernance(); // logic to come

      // 3. Resolve modules
      const requestedModules = ['core', ...(options.modules || [])];
      spinner.text = 'Resolving dependencies...';
      const resolution = await this.resolver.resolve(requestedModules, async (id) => {
        // Resolve path to the module within the CLI's own source/dist
        const moduleSourcePath = await this.modules.findSource(id);
        if (!moduleSourcePath) return [];

        const meta = await this.modules.readModuleMeta(moduleSourcePath, id);
        return meta?.dependencies || [];
      });

      if (resolution.missing.length > 0) {
        spinner.fail(`Missing dependencies: ${resolution.missing.join(', ')}`);
        return;
      }

      // 4. Install modules
      spinner.text = 'Installing modules...';
      for (const modId of resolution.installOrder) {
        spinner.text = `Installing module: ${modId}...`;
        await this.modules.install(modId, path.join(this.projectRoot, bunkerName));
      }

      // 5. Generate Manifests
      spinner.text = 'Generating manifests...';
      const bunkerDir = path.join(this.projectRoot, bunkerName);

      // Collect everything from the installed bunker
      const agents = await this.discovery.collectAgents(bunkerDir);
      const workflows = await this.discovery.collectWorkflows(bunkerDir);
      const tools = await this.discovery.collectTasksAndTools(bunkerDir);
      const allFiles = await this.manifest.scanModuleFiles(bunkerDir, '.', ['.md', '.yaml', '.yml', '.json', '.xml']); // basic scan

      // Map artifacts to ManifestEntry
      const agentEntries = agents.map(a => ({
        name: a.name,
        module: a.module,
        description: a.description || '',
        path: a.relativePath,
        group: 'Agents'
      }));

      const workflowEntries = workflows.map(w => ({
        name: w.name,
        module: w.module,
        description: w.description || '',
        path: w.path,
        group: 'Workflows'
      }));

      const toolEntries = tools.map(t => ({
        name: t.name,
        module: t.module,
        description: t.description || '',
        path: t.path,
        standalone: t.standalone,
        group: t.type === 'task' ? 'Tasks' : 'Tools'
      }));

      // Write manifests
      await this.manifest.generateAgentsManifest(bunkerDir, agentEntries);
      await this.manifest.generateWorkflowsManifest(bunkerDir, workflowEntries);
      await this.manifest.generateToolsManifest(bunkerDir, toolEntries);
      await this.manifest.generateFilesManifest(bunkerDir, allFiles);
      
      // Generate Party Mode XML Manifest (Web Dashboard)
      await this.manifest.generateAgentPartyXml(bunkerDir, agentEntries);

      // 6. Setup IDEs
      if (options.ides && options.ides.length > 0) {
         for (const ideName of options.ides) {
            const provider = this.registry.get(ideName);
            if (provider) {
                spinner.text = `Configuring IDE: ${provider.metadata.displayName}...`;
                await provider.setup(this.projectRoot);
            }
         }
      } else {
          // Auto-detect if no specific IDEs requested
          spinner.text = 'Detecting & Configuring IDEs...';
          const detected = await this.registry.detectAll(this.projectRoot);
          for (const provider of detected) {
              spinner.text = `Configuring detected IDE: ${provider.metadata.displayName}...`;
              await provider.setup(this.projectRoot);
          }
      }

      spinner.succeed('Installation complete.');
      
      // Summary
      console.log(chalk.dim(`\nInstalled ${resolution.installOrder.length} modules.`));
      console.log(chalk.dim(`Active Agents: ${agents.length}`));
      console.log(chalk.dim(`Active Workflows: ${workflows.length}`));

    } catch (error) {
      spinner.fail('Installation failed.');
      throw error;
    }
  }
}
