import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { OnboardingService } from '../onboarding/onboarding.service.js';
import { InstallerService } from '../services/installer.js';
import { displayBanner } from '../ui/banner.js';
import { extractSection } from '../utils/cli.js';

// Helper to load messages (duplicated logic, should be shared but keeping simple for now)
const loadMessages = async () => {
    // Assuming we are running from dist/commands/init.js, we go up to installers/install-messages.md
    // Actually, let's use a cleaner way or pass it in.
    // For now, let's re-implement the path logic robustly.
    const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..'); // dist/
    const msgPath = path.join(root, 'installers/install-messages.md');
    if (await fs.pathExists(msgPath)) {
        return await fs.readFile(msgPath, 'utf8');
    }
    return '';
};

export function registerInitCommand(program: Command, onboarding: OnboardingService, installer: InstallerService) {
  program
    .command('init')
    .description('Force re-initialization of the Sovereign Hierarchy')
    .action(async () => {
      displayBanner();
      console.log(chalk.yellow('Forcing re-initialization...'));
      
      await onboarding.runJourney();
      await installer.run({ force: true });
      
      const messages = await loadMessages();
      console.log('\n' + extractSection(messages, 'END_MESSAGE'));
    });
}
