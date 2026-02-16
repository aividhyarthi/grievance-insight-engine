import type { ContentType, DetectionProviderName } from '../../shared/types.js';
import { DetectionProvider, type DetectionInput } from './base.js';
import { HeuristicProvider } from './heuristic.js';
import { HiveProvider } from './hive.js';
import { C2paProvider } from './c2pa.js';

class ProviderRegistry {
  private providers: Map<DetectionProviderName, DetectionProvider> = new Map();

  constructor() {
    this.register(new HeuristicProvider());
    this.register(new HiveProvider());
    this.register(new C2paProvider());
  }

  private register(provider: DetectionProvider): void {
    this.providers.set(provider.name, provider);
  }

  getProvider(name: DetectionProviderName): DetectionProvider | undefined {
    return this.providers.get(name);
  }

  getConfiguredProviders(contentType: ContentType): DetectionProvider[] {
    return Array.from(this.providers.values()).filter(
      (p) => p.isConfigured() && p.supports(contentType)
    );
  }

  getAllProviders(): DetectionProvider[] {
    return Array.from(this.providers.values());
  }

  getStatus(): Record<string, { configured: boolean; supportedTypes: ContentType[] }> {
    const status: Record<string, { configured: boolean; supportedTypes: ContentType[] }> = {};
    for (const [name, provider] of this.providers) {
      status[name] = {
        configured: provider.isConfigured(),
        supportedTypes: provider.supportedTypes,
      };
    }
    return status;
  }
}

export const providerRegistry = new ProviderRegistry();
