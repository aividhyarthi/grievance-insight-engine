import { DetectionProvider, type DetectionInput } from './base.js';
import type { ContentType, ProviderResult, DetectionVerdict, DetectionSegment } from '../../shared/types.js';
import { AI_TYPICAL_PHRASES, DETECTION_THRESHOLDS } from '../../shared/constants.js';
import fs from 'fs';

export class HeuristicProvider extends DetectionProvider {
  readonly name = 'heuristic' as const;
  readonly supportedTypes: ContentType[] = ['text', 'image'];

  isConfigured(): boolean {
    return true; // Always available — no API key needed
  }

  async detect(input: DetectionInput): Promise<ProviderResult> {
    const start = Date.now();

    if (input.contentType === 'text') {
      return this.detectText(input, start);
    }
    if (input.contentType === 'image') {
      return this.detectImage(input, start);
    }

    return this.makeErrorResult(`Heuristic detection not supported for ${input.contentType}`, Date.now() - start);
  }

  private detectText(input: DetectionInput, start: number): ProviderResult {
    const text = input.textContent || '';
    if (text.length < 50) {
      return {
        provider: 'heuristic',
        verdict: 'uncertain',
        confidence: 0,
        details: 'Text too short for meaningful analysis (minimum 50 characters).',
        processingTimeMs: Date.now() - start,
      };
    }

    const signals: { name: string; score: number; detail: string }[] = [];

    // 1. AI-typical phrases
    const lowerText = text.toLowerCase();
    const foundPhrases = AI_TYPICAL_PHRASES.filter((p) => lowerText.includes(p));
    const phraseScore = Math.min(foundPhrases.length * 8, 40);
    signals.push({
      name: 'AI-typical phrases',
      score: phraseScore,
      detail: foundPhrases.length > 0
        ? `Found ${foundPhrases.length} AI-typical phrase(s): "${foundPhrases.slice(0, 3).join('", "')}"`
        : 'No AI-typical phrases detected.',
    });

    // 2. Sentence length uniformity
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 5);
    if (sentences.length >= 3) {
      const lengths = sentences.map((s) => s.trim().split(/\s+/).length);
      const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
      const stdDev = Math.sqrt(lengths.reduce((sum, l) => sum + (l - mean) ** 2, 0) / lengths.length);
      const cv = mean > 0 ? (stdDev / mean) * 100 : 0;
      const uniformScore = cv < 20 ? 25 : cv < 30 ? 15 : cv < 40 ? 5 : 0;
      signals.push({
        name: 'Sentence uniformity',
        score: uniformScore,
        detail: `Coefficient of variation: ${cv.toFixed(1)}% (AI text tends to be < 25%).`,
      });
    }

    // 3. Paragraph structure uniformity
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 20);
    if (paragraphs.length >= 3) {
      const pLengths = paragraphs.map((p) => p.trim().length);
      const pMean = pLengths.reduce((a, b) => a + b, 0) / pLengths.length;
      const pStdDev = Math.sqrt(pLengths.reduce((sum, l) => sum + (l - pMean) ** 2, 0) / pLengths.length);
      const pCv = pMean > 0 ? (pStdDev / pMean) * 100 : 0;
      const pScore = pCv < 25 ? 15 : pCv < 40 ? 8 : 0;
      signals.push({
        name: 'Paragraph uniformity',
        score: pScore,
        detail: `Paragraph length CV: ${pCv.toFixed(1)}%.`,
      });
    }

    // 4. Transition word density at sentence start
    const transitionWords = ['furthermore', 'moreover', 'additionally', 'however', 'consequently', 'therefore', 'nevertheless', 'in addition', 'as a result', 'on the other hand'];
    const sentenceStarts = sentences.map((s) => s.trim().toLowerCase());
    const transitionCount = sentenceStarts.filter((s) => transitionWords.some((tw) => s.startsWith(tw))).length;
    const transitionRatio = sentences.length > 0 ? transitionCount / sentences.length : 0;
    const transitionScore = transitionRatio > 0.3 ? 15 : transitionRatio > 0.15 ? 8 : 0;
    signals.push({
      name: 'Transition word density',
      score: transitionScore,
      detail: `${(transitionRatio * 100).toFixed(0)}% of sentences start with transition words.`,
    });

    // 5. Lack of personal voice
    const personalPronouns = ['i ', 'i\'m', 'i\'ve', 'i\'d', 'my ', 'mine ', 'we ', 'we\'re', 'we\'ve', 'our ', 'ours '];
    const hasPersonal = personalPronouns.some((p) => lowerText.includes(p));
    const personalScore = hasPersonal ? 0 : 15;
    signals.push({
      name: 'Personal voice absence',
      score: personalScore,
      detail: hasPersonal ? 'Personal pronouns detected (human signal).' : 'No personal pronouns found (AI signal).',
    });

    // 6. Excessive hedging / filler
    const hedgePhrases = ['it is important to', 'it should be noted', 'it is worth', 'one might argue', 'it can be said'];
    const hedgeCount = hedgePhrases.filter((h) => lowerText.includes(h)).length;
    const hedgeScore = hedgeCount >= 3 ? 10 : hedgeCount >= 1 ? 5 : 0;
    signals.push({
      name: 'Hedging language',
      score: hedgeScore,
      detail: `Found ${hedgeCount} hedging/filler pattern(s).`,
    });

    // Aggregate
    const totalScore = Math.min(signals.reduce((sum, s) => sum + s.score, 0), 100);
    const verdict = this.scoreToVerdict(totalScore);

    const segments: DetectionSegment[] = [];
    // Mark AI-typical phrases as segments
    for (const phrase of foundPhrases.slice(0, 10)) {
      const idx = lowerText.indexOf(phrase);
      if (idx >= 0) {
        segments.push({
          startChar: idx,
          endChar: idx + phrase.length,
          verdict: 'ai_generated',
          confidence: 80,
          label: `AI-typical phrase: "${phrase}"`,
        });
      }
    }

    return {
      provider: 'heuristic',
      verdict,
      confidence: totalScore,
      details: signals.map((s) => `[${s.name}: ${s.score}pts] ${s.detail}`).join('\n'),
      segments,
      processingTimeMs: Date.now() - start,
    };
  }

  private detectImage(input: DetectionInput, start: number): ProviderResult {
    // Basic image heuristics: file metadata analysis
    const signals: string[] = [];
    let score = 0;

    if (input.filePath && fs.existsSync(input.filePath)) {
      const stats = fs.statSync(input.filePath);
      const buffer = fs.readFileSync(input.filePath);

      // Check for common AI image signatures in EXIF/metadata
      const fileStr = buffer.toString('latin1');

      // Check for AI tool mentions in metadata
      const aiToolMentions = ['stable diffusion', 'midjourney', 'dall-e', 'dalle', 'comfyui',
        'automatic1111', 'invoke ai', 'leonardo', 'firefly', 'ideogram', 'flux'];
      for (const tool of aiToolMentions) {
        if (fileStr.toLowerCase().includes(tool)) {
          score += 40;
          signals.push(`AI tool metadata found: "${tool}"`);
        }
      }

      // Check for C2PA / Content Credentials marker
      if (fileStr.includes('c2pa') || fileStr.includes('C2PA') || fileStr.includes('contentauth')) {
        score += 20;
        signals.push('C2PA content credentials marker detected');
      }

      // Check for suspiciously round dimensions (AI images often 512x512, 1024x1024, etc.)
      // PNG dimensions in header
      if (input.mimeType === 'image/png' && buffer.length > 24) {
        const width = buffer.readUInt32BE(16);
        const height = buffer.readUInt32BE(20);
        if (width === height && [256, 512, 768, 1024, 2048].includes(width)) {
          score += 10;
          signals.push(`Suspicious square dimensions: ${width}x${height} (common AI output size)`);
        }
      }

      // No EXIF data is suspicious for photos (AI images often lack camera EXIF)
      const hasExif = fileStr.includes('Exif') || fileStr.includes('exif');
      if (!hasExif && input.mimeType === 'image/jpeg') {
        score += 10;
        signals.push('No EXIF camera data found (common for AI-generated images)');
      }
    }

    score = Math.min(score, 100);

    return {
      provider: 'heuristic',
      verdict: this.scoreToVerdict(score),
      confidence: score,
      details: signals.length > 0
        ? signals.join('\n')
        : 'No strong AI generation signals detected through heuristic analysis. For more accurate image detection, enable Hive AI or Sensity providers.',
      processingTimeMs: Date.now() - start,
    };
  }

  private scoreToVerdict(score: number): DetectionVerdict {
    if (score >= DETECTION_THRESHOLDS.AI_GENERATED) return 'ai_generated';
    if (score >= DETECTION_THRESHOLDS.AI_MODIFIED) return 'ai_modified';
    if (score >= DETECTION_THRESHOLDS.UNCERTAIN) return 'uncertain';
    return 'likely_human';
  }
}
