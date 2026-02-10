import { ProviderRegistry } from './registry.js';
import { CursorProvider } from './ide/cursor.js';
import { VSCodeProvider } from './ide/vscode.js';
import { ClaudeProvider } from './agents/claude.js';
import { GeminiProvider } from './agents/gemini.js';

export const createRegistry = (): ProviderRegistry => {
  const registry = new ProviderRegistry();

  // Register IDE Providers
  registry.register(new CursorProvider());
  registry.register(new VSCodeProvider());

  // Register Agent Providers
  registry.register(new ClaudeProvider());
  registry.register(new GeminiProvider());

  return registry;
};
