import type { ContentType, ProviderResult, DetectionProviderName } from '../../shared/types.js';

export interface DetectionInput {
  contentType: ContentType;
  filePath?: string;
  textContent?: string;
  mimeType?: string;
  fileName?: string;
  buffer?: Buffer;
}

export abstract class DetectionProvider {
  abstract readonly name: DetectionProviderName;
  abstract readonly supportedTypes: ContentType[];

  abstract isConfigured(): boolean;
  abstract detect(input: DetectionInput): Promise<ProviderResult>;

  supports(contentType: ContentType): boolean {
    return this.supportedTypes.includes(contentType);
  }

  protected makeErrorResult(error: string, timeMs: number): ProviderResult {
    return {
      provider: this.name,
      verdict: 'uncertain',
      confidence: 0,
      details: '',
      processingTimeMs: timeMs,
      error,
    };
  }
}
