import { DetectionProvider, type DetectionInput } from './base.js';
import type { ContentType, ProviderResult, DetectionVerdict } from '../../shared/types.js';
import { DETECTION_THRESHOLDS } from '../../shared/constants.js';
import fs from 'fs';

// OpenAI GPT-4o Vision — AI image detection via visual analysis
// Requires OPENAI_API_KEY environment variable

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_TIMEOUT_MS = 30000;
const MODEL = 'gpt-4o-mini'; // Cost-effective, strong vision capabilities

const DETECTION_PROMPT = `You are an expert AI-generated image forensic analyst. Analyze this image and determine if it was created by an AI image generator (such as DALL-E, Midjourney, Stable Diffusion, Flux, etc.) or is a real photograph/human-created artwork.

Examine these specific indicators:
1. **Skin/texture anomalies**: Unnatural smoothness, waxy skin, pore inconsistencies
2. **Hand/finger errors**: Wrong finger count, merged digits, distorted joints
3. **Eye inconsistencies**: Mismatched reflections, iris irregularities, asymmetric pupils
4. **Text/writing errors**: Garbled text, inconsistent fonts, nonsensical characters
5. **Background artifacts**: Blurred-out impossible geometry, melting objects, repeating patterns
6. **Lighting inconsistencies**: Mismatched shadows, impossible reflections, inconsistent light sources
7. **Edge artifacts**: Unnatural blending at object boundaries, halo effects
8. **Anatomical errors**: Extra limbs, impossible body proportions, merged body parts
9. **Overall "uncanny" quality**: The image looks too perfect, too smooth, or compositionally unusual

Respond with ONLY a valid JSON object (no markdown, no code fences):
{
  "verdict": "ai_generated" | "likely_human" | "uncertain",
  "confidence": <number 0-100>,
  "indicators_found": ["<list of specific indicators found>"],
  "analysis": "<2-3 sentence explanation>"
}`;

export class OpenAIProvider extends DetectionProvider {
  readonly name = 'openai' as const;
  readonly supportedTypes: ContentType[] = ['image'];

  private apiKey: string;

  constructor() {
    super();
    this.apiKey = process.env.OPENAI_API_KEY || '';
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async detect(input: DetectionInput): Promise<ProviderResult> {
    const start = Date.now();

    if (input.contentType !== 'image') {
      return this.makeErrorResult('OpenAI provider only supports image detection', Date.now() - start);
    }

    if (!this.apiKey) {
      return this.makeErrorResult('OPENAI_API_KEY not configured. Set it in environment variables.', Date.now() - start);
    }

    if (!input.filePath || !fs.existsSync(input.filePath)) {
      return this.makeErrorResult('No file provided for visual AI detection', Date.now() - start);
    }

    try {
      const imageBuffer = fs.readFileSync(input.filePath);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = input.mimeType || 'image/jpeg';
      const dataUrl = `data:${mimeType};base64,${base64Image}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: DETECTION_PROMPT },
                {
                  type: 'image_url',
                  image_url: { url: dataUrl, detail: 'high' },
                },
              ],
            },
          ],
          max_tokens: 500,
          temperature: 0.1, // Low temperature for consistent analysis
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        return this.makeErrorResult(
          `OpenAI API error ${response.status}: ${errorBody.slice(0, 200)}`,
          Date.now() - start,
        );
      }

      const data = await response.json() as OpenAIResponse;
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        return this.makeErrorResult('Empty response from OpenAI', Date.now() - start);
      }

      return this.parseResult(content, start);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return this.makeErrorResult(`OpenAI request timed out after ${OPENAI_TIMEOUT_MS / 1000}s`, Date.now() - start);
      }
      return this.makeErrorResult(`OpenAI error: ${err.message}`, Date.now() - start);
    }
  }

  private parseResult(content: string, start: number): ProviderResult {
    try {
      // Strip markdown code fences if present
      const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(cleaned) as OpenAIDetectionResponse;

      const confidence = Math.min(100, Math.max(0, parsed.confidence || 0));

      const verdict: DetectionVerdict =
        parsed.verdict === 'ai_generated' && confidence >= DETECTION_THRESHOLDS.AI_GENERATED ? 'ai_generated' :
        parsed.verdict === 'ai_generated' && confidence >= DETECTION_THRESHOLDS.AI_MODIFIED ? 'ai_modified' :
        parsed.verdict === 'uncertain' || confidence >= DETECTION_THRESHOLDS.UNCERTAIN ? 'uncertain' :
        'likely_human';

      const indicators = parsed.indicators_found?.length
        ? `Indicators: ${parsed.indicators_found.join(', ')}.`
        : '';

      return {
        provider: 'openai',
        verdict,
        confidence,
        details: `GPT-4o visual analysis: ${parsed.analysis || 'No details provided.'} ${indicators}`.trim(),
        processingTimeMs: Date.now() - start,
      };
    } catch {
      // If JSON parsing fails, try to extract useful info from raw text
      return {
        provider: 'openai',
        verdict: 'uncertain',
        confidence: 50,
        details: `GPT-4o analysis (raw): ${content.slice(0, 300)}`,
        processingTimeMs: Date.now() - start,
      };
    }
  }
}

interface OpenAIResponse {
  choices: { message: { content: string } }[];
}

interface OpenAIDetectionResponse {
  verdict: string;
  confidence: number;
  indicators_found?: string[];
  analysis?: string;
}
