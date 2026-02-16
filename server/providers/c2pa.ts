import { DetectionProvider, type DetectionInput } from './base.js';
import type { ContentType, ProviderResult } from '../../shared/types.js';
import fs from 'fs';

// C2PA (Coalition for Content Provenance and Authenticity) metadata checker
// Looks for Content Credentials / provenance data embedded in files
// This is the free, metadata-based check — no API key needed

const C2PA_MARKERS = [
  'c2pa',
  'C2PA',
  'contentauth',
  'content_credentials',
  'jumbf',          // JUMBF box (JPEG Universal Metadata Box Format)
  'cai_',           // Content Authenticity Initiative prefix
  'manifest.c2pa',
];

const AI_PROVENANCE_MARKERS = [
  'ai_generated',
  'ai_modified',
  'compositeWithTrainedAlgorithmicMedia',
  'trainedAlgorithmicMedia',
  'generative-ai',
  'synthetic',
];

const KNOWN_AI_TOOLS = [
  { marker: 'openai', tool: 'OpenAI (DALL-E / ChatGPT)' },
  { marker: 'dall-e', tool: 'DALL-E' },
  { marker: 'midjourney', tool: 'Midjourney' },
  { marker: 'stable diffusion', tool: 'Stable Diffusion' },
  { marker: 'stability.ai', tool: 'Stability AI' },
  { marker: 'adobe firefly', tool: 'Adobe Firefly' },
  { marker: 'firefly', tool: 'Adobe Firefly' },
  { marker: 'google gemini', tool: 'Google Gemini' },
  { marker: 'imagen', tool: 'Google Imagen' },
  { marker: 'meta ai', tool: 'Meta AI' },
  { marker: 'leonardo', tool: 'Leonardo AI' },
  { marker: 'ideogram', tool: 'Ideogram' },
  { marker: 'flux', tool: 'Flux' },
  { marker: 'runway', tool: 'Runway' },
  { marker: 'pika', tool: 'Pika Labs' },
  { marker: 'elevenlabs', tool: 'ElevenLabs' },
  { marker: 'suno', tool: 'Suno AI' },
  { marker: 'udio', tool: 'Udio' },
];

export class C2paProvider extends DetectionProvider {
  readonly name = 'c2pa' as const;
  readonly supportedTypes: ContentType[] = ['image', 'video', 'audio'];

  isConfigured(): boolean {
    return true; // No API key needed — reads file metadata directly
  }

  async detect(input: DetectionInput): Promise<ProviderResult> {
    const start = Date.now();

    if (!input.filePath || !fs.existsSync(input.filePath)) {
      return this.makeErrorResult('No file provided for C2PA analysis', Date.now() - start);
    }

    try {
      const buffer = fs.readFileSync(input.filePath);
      const fileStr = buffer.toString('latin1');
      const lowerStr = fileStr.toLowerCase();

      const findings: string[] = [];
      let score = 0;
      let detectedTool: string | undefined;

      // Check for C2PA manifest presence
      const hasC2PA = C2PA_MARKERS.some((m) => fileStr.includes(m));
      if (hasC2PA) {
        findings.push('C2PA Content Credentials manifest detected in file.');
        score += 10; // C2PA presence alone doesn't mean AI — it means provenance exists
      }

      // Check for AI provenance markers
      for (const marker of AI_PROVENANCE_MARKERS) {
        if (lowerStr.includes(marker)) {
          findings.push(`AI provenance marker found: "${marker}"`);
          score += 30;
        }
      }

      // Check for known AI tool signatures
      for (const { marker, tool } of KNOWN_AI_TOOLS) {
        if (lowerStr.includes(marker)) {
          findings.push(`AI tool signature found: ${tool}`);
          detectedTool = tool;
          score += 35;
          break; // One tool match is enough
        }
      }

      // Check for IPTC metadata indicating AI
      if (lowerStr.includes('digitalsourcetype') && lowerStr.includes('trainedalgorithmic')) {
        findings.push('IPTC DigitalSourceType indicates trained algorithmic (AI) origin.');
        score += 30;
      }

      // Check for XMP metadata with AI indicators
      if (lowerStr.includes('xmp') && (lowerStr.includes('ai_generated') || lowerStr.includes('synthetic'))) {
        findings.push('XMP metadata contains AI generation indicators.');
        score += 25;
      }

      score = Math.min(score, 100);

      const verdict = score >= 75 ? 'ai_generated' as const
        : score >= 50 ? 'ai_modified' as const
          : score >= 30 ? 'uncertain' as const
            : 'likely_human' as const;

      return {
        provider: 'c2pa',
        verdict,
        confidence: score,
        details: findings.length > 0
          ? findings.join('\n')
          : 'No C2PA Content Credentials or AI provenance metadata found. This does not confirm the content is human-made — it may simply lack metadata.',
        generativeModel: detectedTool,
        processingTimeMs: Date.now() - start,
        metadata: { hasC2PA, findingsCount: findings.length },
      };
    } catch (err: any) {
      return this.makeErrorResult(`C2PA analysis error: ${err.message}`, Date.now() - start);
    }
  }
}
