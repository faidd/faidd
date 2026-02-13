import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { IProvider, ProviderMetadata } from '../registry.js';

export class GeminiProvider implements IProvider {
  readonly metadata: ProviderMetadata = {
    name: 'gemini',
    displayName: 'Gemini (Google)',
    category: 'AGENT'
  };

  async detect(projectDir: string): Promise<boolean> {
    // Detect .google or relevant markers
    return fs.pathExists(path.join(projectDir, '.google'));
  }

  async setup(projectDir: string): Promise<void> {
    const agentPath = path.join(projectDir, '_faidd/agents/gemini.md');
    await fs.ensureDir(path.dirname(agentPath));
    
    const mindset = [
      '# FAIDD SOVEREIGN MINDSET: GEMINI',
      '',
      'You are a multimodal specialist assisting a Sovereign Developer.',
      'Your role is to analyze patterns and build with precision while respecting the FAIDD perimeter.',
      '',
      '## Constraints:',
      '- RESPECT the system bunker (`_faidd/`).',
      '- ALL structural changes must be verified against `.faiddrc.json`.',
      '- LOG progress in the operational brain (`faidd/`).'
    ].join('\n');

    await fs.writeFile(agentPath, mindset);
    console.log(`${chalk.blue('◈')} ${chalk.dim('Gemini mindset injected.')}`);
  }
}
