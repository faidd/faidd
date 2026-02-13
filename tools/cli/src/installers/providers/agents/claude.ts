import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { IProvider, ProviderMetadata } from '../registry.js';

export class ClaudeProvider implements IProvider {
  readonly metadata: ProviderMetadata = {
    name: 'claude',
    displayName: 'Claude (Anthropic)',
    category: 'AGENT'
  };

  async detect(projectDir: string): Promise<boolean> {
    // Detect .claudecode or relevant project markers
    return fs.pathExists(path.join(projectDir, '.claudecode'));
  }

  async setup(projectDir: string): Promise<void> {
    const agentPath = path.join(projectDir, '_faidd/agents/claude.md');
    await fs.ensureDir(path.dirname(agentPath));
    
    const mindset = [
      '# FAIDD SOVEREIGN MINDSET: CLAUDE',
      '',
      'You are a high-level Architect assisting a Sovereign Developer.',
      'Your primary directive is to maintain the integrity of the FAIDD perimeter.',
      '',
      '## Constraints:',
      '- NO modification of `_faidd/` core.',
      '- ALL work must be audited in `faidd/ledger/`.',
      '- USE the specialized tools provided via the FAIDD CLI.'
    ].join('\n');

    await fs.writeFile(agentPath, mindset);
    console.log(`${chalk.blue('◈')} ${chalk.dim('Claude mindset injected.')}`);
  }
}
