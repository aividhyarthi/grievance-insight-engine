import { DetectionProvider, type DetectionInput } from './base.js';
import type { ContentType, ProviderResult, DetectionVerdict } from '../../shared/types.js';
import { DETECTION_THRESHOLDS } from '../../shared/constants.js';
import fs from 'fs';

// HuggingFace Inference API — free visual AI image detection
// Uses the umm-maybe/AI-image-detector model (ViT-based classifier)
// No API key required for basic usage, optional HF_TOKEN for higher rate limits

const HF_MODELS = [
  'Ateeqq/ai-vs-human-image-detector',   // Primary: SigLIP2-based, 99%+ accuracy
  'Smogy/SMOGY-Ai-images-detector',       // Fallback: fine-tuned sdxl-detector
];

const HF_API_BASE = 'https://api-inference.huggingface.co/models';
const HF_TIMEOUT_MS = 30000; // 30s — model may need cold start

export class HuggingFaceProvider extends DetectionProvider {
  readonly name = 'huggingface' as const;
  readonly supportedTypes: ContentType[] = ['image'];

  private apiToken: string;

  constructor() {
    super();
    this.apiToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN || '';
  }

  isConfigured(): boolean {
    // Works best with a token, but we still attempt without one
    // (HF may return 401 for some models without a token)
    return true;
  }

  async detect(input: DetectionInput): Promise<ProviderResult> {
    const start = Date.now();

    if (input.contentType !== 'image') {
      return this.makeErrorResult('HuggingFace provider only supports image detection', Date.now() - start);
    }

    if (!input.filePath || !fs.existsSync(input.filePath)) {
      return this.makeErrorResult('No file provided for visual AI detection', Date.now() - start);
    }

    const imageBuffer = fs.readFileSync(input.filePath);

    // Try primary model first, fall back to secondary
    const errors: string[] = [];
    const mime = input.mimeType || 'image/jpeg';

    for (const model of HF_MODELS) {
      try {
        const result = await this.callModel(model, imageBuffer, mime, start);
        if (!result.error) return result;
        errors.push(`${model.split('/')[1]}: ${result.error}`);
        // If model is loading (503), wait and retry once
        if (result.error.includes('loading')) {
          await this.sleep(5000);
          const retry = await this.callModel(model, imageBuffer, mime, start);
          if (!retry.error) return retry;
          errors.push(`${model.split('/')[1]} (retry): ${retry.error}`);
        }
      } catch (err: any) {
        errors.push(`${model.split('/')[1]}: exception: ${err.message}`);
        continue;
      }
    }

    return this.makeErrorResult(
      `HuggingFace visual detection failed. ${errors.join(' | ')}`,
      Date.now() - start,
    );
  }

  private async callModel(
    model: string,
    imageBuffer: Buffer,
    mimeType: string,
    start: number,
  ): Promise<ProviderResult> {
    const url = `${HF_API_BASE}/${model}`;

    const headers: Record<string, string> = {
      'Content-Type': mimeType,
      'x-wait-for-model': 'true', // Wait for cold-start instead of 503
    };
    if (this.apiToken) {
      headers['Authorization'] = `Bearer ${this.apiToken}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HF_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: new Uint8Array(imageBuffer),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.status === 503) {
        const body = await response.json().catch(() => ({})) as any;
        const estimatedTime = body?.estimated_time;
        return this.makeErrorResult(
          `Model "${model}" is loading${estimatedTime ? ` (~${Math.ceil(estimatedTime)}s)` : ''}. Retrying...`,
          Date.now() - start,
        );
      }

      if (response.status === 429) {
        return this.makeErrorResult(
          'HuggingFace rate limit reached. Set HF_TOKEN env variable for higher limits.',
          Date.now() - start,
        );
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        return this.makeErrorResult(
          `HuggingFace API error ${response.status}: ${errorText.slice(0, 200)}`,
          Date.now() - start,
        );
      }

      const data = await response.json() as HFClassificationResult[];
      return this.parseResult(data, model, start);
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        return this.makeErrorResult(`HuggingFace request timed out after ${HF_TIMEOUT_MS / 1000}s`, Date.now() - start);
      }
      return this.makeErrorResult(`HuggingFace error: ${err.message}`, Date.now() - start);
    }
  }

  private parseResult(
    data: HFClassificationResult[],
    model: string,
    start: number,
  ): ProviderResult {
    if (!Array.isArray(data) || data.length === 0) {
      return this.makeErrorResult('Unexpected HuggingFace response format', Date.now() - start);
    }

    // Models return labels like "artificial" / "human" or "ai" / "real"
    // Normalize to find the AI score
    let aiScore = 0;
    let humanScore = 0;
    const aiLabels = ['artificial', 'ai', 'ai_generated', 'fake', 'ai-generated'];
    const humanLabels = ['human', 'real', 'not_ai_generated', 'genuine'];

    for (const item of data) {
      const label = item.label.toLowerCase().trim();
      if (aiLabels.includes(label)) {
        aiScore = item.score;
      } else if (humanLabels.includes(label)) {
        humanScore = item.score;
      }
    }

    // If we didn't match known labels, use the raw scores
    if (aiScore === 0 && humanScore === 0 && data.length >= 2) {
      // Assume first label is the top prediction
      const topLabel = data[0].label.toLowerCase();
      if (aiLabels.some((l) => topLabel.includes(l))) {
        aiScore = data[0].score;
        humanScore = data[1]?.score || (1 - aiScore);
      } else {
        humanScore = data[0].score;
        aiScore = data[1]?.score || (1 - humanScore);
      }
    }

    const confidence = Math.round(aiScore * 100);

    const verdict: DetectionVerdict =
      confidence >= DETECTION_THRESHOLDS.AI_GENERATED ? 'ai_generated' :
      confidence >= DETECTION_THRESHOLDS.AI_MODIFIED ? 'ai_modified' :
      confidence >= DETECTION_THRESHOLDS.UNCERTAIN ? 'uncertain' :
      'likely_human';

    const labelSummary = data.map((d) => `${d.label}: ${(d.score * 100).toFixed(1)}%`).join(', ');

    return {
      provider: 'huggingface',
      verdict,
      confidence,
      details: `Visual AI detection (${model.split('/')[1]}): ${labelSummary}. ` +
        `AI probability: ${confidence}%.` +
        (confidence >= 70 ? ' Strong visual indicators of AI generation detected.' :
         confidence >= 40 ? ' Some visual patterns suggest possible AI involvement.' :
         ' Visual analysis suggests likely human-created content.'),
      processingTimeMs: Date.now() - start,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

interface HFClassificationResult {
  label: string;
  score: number;
}
