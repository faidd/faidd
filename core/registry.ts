/**
 * Plugin Registry Pattern
 * Inspired by B-Mad's dynamic handler discovery, but in strict TypeScript.
 */
export interface Provider {
  name: string;
  displayName: string;
  setup(projectDir: string): Promise<void>;
  detect(projectDir: string): Promise<boolean>;
}

export class ProviderRegistry<T extends Provider> {
  private providers = new Map<string, T>();

  register(provider: T) {
    this.providers.set(provider.name.toLowerCase(), provider);
  }

  get(name: string): T | undefined {
    return this.providers.get(name.toLowerCase());
  }

  getAll(): T[] {
    return Array.from(this.providers.values());
  }

  async detectAll(projectDir: string): Promise<T[]> {
    const detected: T[] = [];
    for (const provider of this.providers.values()) {
      if (await provider.detect(projectDir)) {
        detected.push(provider);
      }
    }
    return detected;
  }
}
