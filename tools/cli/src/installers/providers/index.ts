import { ProviderRegistry } from './registry.js';
import { CursorProvider } from './ide/cursor.js';
import { ClaudeCodeProvider } from './ide/claude-code.js';
import { CodexProvider } from './ide/codex.js';
import { OpenCodeProvider } from './ide/opencode.js';
import { VSCodeProvider } from './ide/vscode.js';
import { ClaudeProvider } from './agents/claude.js';
import { GeminiProvider } from './agents/gemini.js';

export const createRegistry = (): ProviderRegistry => {
  const registry = new ProviderRegistry();

  // Register IDE Providers (Master Suite)
  registry.register(new CursorProvider());
  registry.register(new ClaudeCodeProvider());
  registry.register(new CodexProvider());
  registry.register(new OpenCodeProvider());
  registry.register(new VSCodeProvider());

  // Register Agent Providers (Mindset Injection)
  registry.register(new ClaudeProvider());
  registry.register(new GeminiProvider());

  return registry;
};
