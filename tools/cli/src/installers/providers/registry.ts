/**
 * Provider Registry
 * Orchestrates the discovery and execution of specialized installers.
 */

export interface ProviderMetadata {
  name: string;
  displayName: string;
  category: 'IDE' | 'AGENT' | 'SYSTEM';
}

export interface IProvider {
  readonly metadata: ProviderMetadata;
  detect(projectDir: string): Promise<boolean>;
  setup(projectDir: string, options?: any): Promise<void>;
}

export class ProviderRegistry {
  private providers = new Map<string, IProvider>();

  register(provider: IProvider) {
    this.providers.set(provider.metadata.name.toLowerCase(), provider);
  }

  get(name: string): IProvider | undefined {
    return this.providers.get(name.toLowerCase());
  }

  getAll(): IProvider[] {
    return Array.from(this.providers.values());
  }

  getByCategory(category: ProviderMetadata['category']): IProvider[] {
    return this.getAll().filter(p => p.metadata.category === category);
  }

  async detectAll(projectDir: string): Promise<IProvider[]> {
    const detected: IProvider[] = [];
    for (const provider of this.providers.values()) {
      if (await provider.detect(projectDir)) {
        detected.push(provider);
      }
    }
    return detected;
  }
}
