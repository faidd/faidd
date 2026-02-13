// governance.service.ts — thin wrapper around ConfigService for backward compat
// all governance logic lives in config.service.ts now
import chalk from 'chalk';
import { ConfigService, Governance } from './config.service.js';

export type { Governance as FaiddGovernance } from './config.service.js';

export class GovernanceService {
  private config: ConfigService;

  constructor(projectDir?: string) {
    this.config = new ConfigService(projectDir);
  }

  async exists(): Promise<boolean> {
    return this.config.governanceExists();
  }

  async load(): Promise<Governance> {
    try {
      return await this.config.loadGovernance();
    } catch (error) {
      throw new Error(`Governance Violation: .faiddrc.json is corrupted or invalid. ${error}`);
    }
  }

  async save(gov: Governance): Promise<void> {
    await this.config.saveGovernance(gov);
    console.log(chalk.green('\n⚖️  FAIDD Governance Law signed and sealed.'));
  }
}
