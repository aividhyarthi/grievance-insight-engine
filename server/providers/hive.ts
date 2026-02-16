import { DetectionProvider, type DetectionInput } from './base.js';
import type { ContentType, ProviderResult, DetectionVerdict } from '../../shared/types.js';
import { DETECTION_THRESHOLDS } from '../../shared/constants.js';
import fs from 'fs';

const HIVE_API_BASE = 'https://api.thehive.ai/api/v2/task/sync';

export class HiveProvider extends DetectionProvider {
  readonly name = 'hive' as const;
  readonly supportedTypes: ContentType[] = ['image', 'video', 'audio', 'text'];

  private apiKey: string;

  constructor() {
    super();
    this.apiKey = process.env.HIVE_API_KEY || '';
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  async detect(input: DetectionInput): Promise<ProviderResult> {
    const start = Date.now();

    if (!this.isConfigured()) {
      return this.makeErrorResult('Hive AI API key not configured', Date.now() - start);
    }

    try {
      if (input.contentType === 'text') {
        return await this.detectText(input, start);
      }
      return await this.detectMedia(input, start);
    } catch (err: any) {
      return this.makeErrorResult(`Hive AI error: ${err.message}`, Date.now() - start);
    }
  }

  private async detectText(input: DetectionInput, start: number): Promise<ProviderResult> {
    const response = await fetch(HIVE_API_BASE, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text_data: input.textContent,
      }),
    });

    if (!response.ok) {
      return this.makeErrorResult(`Hive API returned ${response.status}`, Date.now() - start);
    }

    const data = await response.json() as any;
    return this.parseHiveResponse(data, start);
  }

  private async detectMedia(input: DetectionInput, start: number): Promise<ProviderResult> {
    if (!input.filePath || !fs.existsSync(input.filePath)) {
      return this.makeErrorResult('No file provided for media detection', Date.now() - start);
    }

    const formData = new FormData();
    const fileBuffer = fs.readFileSync(input.filePath);
    const blob = new Blob([fileBuffer], { type: input.mimeType || 'application/octet-stream' });
    formData.append('media', blob, input.fileName || 'upload');

    const response = await fetch(HIVE_API_BASE, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      return this.makeErrorResult(`Hive API returned ${response.status}`, Date.now() - start);
    }

    const data = await response.json() as any;
    return this.parseHiveResponse(data, start);
  }

  private parseHiveResponse(data: any, start: number): ProviderResult {
    try {
      const output = data?.status?.[0]?.response?.output;
      if (!output) {
        return this.makeErrorResult('Unexpected Hive response format', Date.now() - start);
      }

      // Hive returns classes like "ai_generated" with scores
      const classes = output[0]?.classes || [];
      const aiClass = classes.find((c: any) => c.class === 'ai_generated');
      const notAiClass = classes.find((c: any) => c.class === 'not_ai_generated');

      const aiScore = aiClass?.score ?? 0;
      const confidence = Math.round(aiScore * 100);

      // Try to extract the generative model
      const modelClasses = output[1]?.classes || [];
      const topModel = modelClasses.sort((a: any, b: any) => b.score - a.score)[0];

      const verdict: DetectionVerdict = confidence >= DETECTION_THRESHOLDS.AI_GENERATED
        ? 'ai_generated'
        : confidence >= DETECTION_THRESHOLDS.AI_MODIFIED
          ? 'ai_modified'
          : confidence >= DETECTION_THRESHOLDS.UNCERTAIN
            ? 'uncertain'
            : 'likely_human';

      return {
        provider: 'hive',
        verdict,
        confidence,
        details: `Hive AI detection score: ${confidence}%. ${topModel ? `Most likely model: ${topModel.class}` : ''}`,
        generativeModel: topModel?.class,
        processingTimeMs: Date.now() - start,
      };
    } catch (err: any) {
      return this.makeErrorResult(`Failed to parse Hive response: ${err.message}`, Date.now() - start);
    }
  }
}
