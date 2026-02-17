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

    const signals: { name: string; score: number; weight: number; detail: string }[] = [];
    const lowerText = text.toLowerCase();
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 5);
    const words = text.split(/\s+/).filter((w) => w.length > 0);
    const wordCount = words.length;

    // ── Signal 1: AI-typical phrases (strong signal) ──────────────────────
    const foundPhrases = AI_TYPICAL_PHRASES.filter((p) => lowerText.includes(p));
    // Scale: 1 phrase = mild signal, 3+ = strong, 6+ = very strong
    const phraseScore = foundPhrases.length === 0 ? 0
      : foundPhrases.length <= 2 ? 30 + foundPhrases.length * 10
      : foundPhrases.length <= 5 ? 55 + (foundPhrases.length - 2) * 8
      : Math.min(80 + (foundPhrases.length - 5) * 3, 95);
    signals.push({
      name: 'AI-typical phrases',
      score: phraseScore,
      weight: 3.0,
      detail: foundPhrases.length > 0
        ? `Found ${foundPhrases.length} AI-typical phrase(s): "${foundPhrases.slice(0, 5).join('", "')}"`
        : 'No AI-typical phrases detected.',
    });

    // ── Signal 2: Sentence length uniformity ─────────────────────────────
    if (sentences.length >= 3) {
      const lengths = sentences.map((s) => s.trim().split(/\s+/).length);
      const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
      const stdDev = Math.sqrt(lengths.reduce((sum, l) => sum + (l - mean) ** 2, 0) / lengths.length);
      const cv = mean > 0 ? (stdDev / mean) * 100 : 0;
      // AI text: CV typically < 30%. Human text: CV typically > 40%
      const uniformScore = cv < 15 ? 80 : cv < 20 ? 65 : cv < 25 ? 50 : cv < 30 ? 35 : cv < 40 ? 15 : 0;
      signals.push({
        name: 'Sentence uniformity',
        score: uniformScore,
        weight: 2.0,
        detail: `Coefficient of variation: ${cv.toFixed(1)}% (AI text tends to be < 25%, human > 40%).`,
      });
    }

    // ── Signal 3: Paragraph structure uniformity ─────────────────────────
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 20);
    if (paragraphs.length >= 3) {
      const pLengths = paragraphs.map((p) => p.trim().length);
      const pMean = pLengths.reduce((a, b) => a + b, 0) / pLengths.length;
      const pStdDev = Math.sqrt(pLengths.reduce((sum, l) => sum + (l - pMean) ** 2, 0) / pLengths.length);
      const pCv = pMean > 0 ? (pStdDev / pMean) * 100 : 0;
      const pScore = pCv < 20 ? 70 : pCv < 30 ? 50 : pCv < 40 ? 25 : 0;
      signals.push({
        name: 'Paragraph uniformity',
        score: pScore,
        weight: 1.5,
        detail: `Paragraph length CV: ${pCv.toFixed(1)}% (AI text tends to be < 25%).`,
      });
    }

    // ── Signal 4: Transition word density ────────────────────────────────
    const transitionWords = ['furthermore', 'moreover', 'additionally', 'however', 'consequently',
      'therefore', 'nevertheless', 'in addition', 'as a result', 'on the other hand',
      'similarly', 'likewise', 'in contrast', 'conversely', 'subsequently',
      'accordingly', 'hence', 'thus', 'meanwhile', 'notably'];
    const sentenceStarts = sentences.map((s) => s.trim().toLowerCase());
    const transitionCount = sentenceStarts.filter((s) => transitionWords.some((tw) => s.startsWith(tw))).length;
    const transitionRatio = sentences.length > 0 ? transitionCount / sentences.length : 0;
    const transitionScore = transitionRatio > 0.35 ? 80 : transitionRatio > 0.25 ? 60 : transitionRatio > 0.15 ? 40 : transitionRatio > 0.08 ? 20 : 0;
    signals.push({
      name: 'Transition word density',
      score: transitionScore,
      weight: 1.5,
      detail: `${(transitionRatio * 100).toFixed(0)}% of sentences start with transition words (AI tends to be > 15%).`,
    });

    // ── Signal 5: Lack of personal voice ─────────────────────────────────
    const personalPronouns = ['i ', 'i\'m', 'i\'ve', 'i\'d', 'i\'ll', 'my ', 'mine ', 'myself ',
      'we ', 'we\'re', 'we\'ve', 'we\'d', 'our ', 'ours ', 'ourselves '];
    const personalCount = personalPronouns.reduce((count, p) => {
      const matches = lowerText.split(p).length - 1;
      return count + matches;
    }, 0);
    const personalRatio = wordCount > 0 ? personalCount / wordCount : 0;
    // AI rarely uses personal pronouns; human text typically has > 1%
    const personalScore = personalRatio < 0.002 ? 70 : personalRatio < 0.005 ? 45 : personalRatio < 0.01 ? 20 : 0;
    signals.push({
      name: 'Personal voice absence',
      score: personalScore,
      weight: 1.5,
      detail: personalRatio < 0.005
        ? `Very low personal pronoun usage (${(personalRatio * 100).toFixed(2)}%) — typical of AI content.`
        : `Personal pronoun usage: ${(personalRatio * 100).toFixed(2)}% — suggests human authorship.`,
    });

    // ── Signal 6: Hedging / filler language ──────────────────────────────
    const hedgePhrases = ['it is important to', 'it should be noted', 'it is worth', 'one might argue',
      'it can be said', 'it is essential', 'it is crucial', 'it is vital',
      'it is necessary', 'it is imperative', 'it is advisable',
      'it is recommended', 'it goes without saying'];
    const hedgeCount = hedgePhrases.filter((h) => lowerText.includes(h)).length;
    const hedgeScore = hedgeCount >= 4 ? 75 : hedgeCount >= 3 ? 55 : hedgeCount >= 2 ? 40 : hedgeCount >= 1 ? 20 : 0;
    signals.push({
      name: 'Hedging language',
      score: hedgeScore,
      weight: 1.0,
      detail: `Found ${hedgeCount} hedging/filler pattern(s). AI frequently uses impersonal hedging.`,
    });

    // ── Signal 7: Lack of contractions (new) ─────────────────────────────
    const contractions = ["don't", "doesn't", "didn't", "won't", "wouldn't", "couldn't", "shouldn't",
      "isn't", "aren't", "wasn't", "weren't", "haven't", "hasn't", "hadn't",
      "can't", "it's", "that's", "there's", "here's", "what's", "who's",
      "let's", "i'm", "i've", "i'd", "i'll", "we're", "they're", "you're",
      "we've", "they've", "you've"];
    const contractionCount = contractions.reduce((count, c) => {
      return count + (lowerText.split(c).length - 1);
    }, 0);
    const contractionRatio = wordCount > 0 ? contractionCount / wordCount : 0;
    // AI content often avoids contractions, humans use them naturally
    const contractionScore = contractionRatio < 0.002 ? 60 : contractionRatio < 0.005 ? 35 : contractionRatio < 0.01 ? 15 : 0;
    signals.push({
      name: 'Contraction avoidance',
      score: contractionScore,
      weight: 1.5,
      detail: contractionRatio < 0.005
        ? `Very few contractions (${(contractionRatio * 100).toFixed(2)}%). AI tends to use formal full forms.`
        : `Contraction usage: ${(contractionRatio * 100).toFixed(2)}% — natural for human writing.`,
    });

    // ── Signal 8: Vocabulary diversity / richness (new) ──────────────────
    if (wordCount >= 20) {
      const lowerWords = words.map((w) => w.toLowerCase().replace(/[^a-z']/g, ''));
      const uniqueWords = new Set(lowerWords.filter((w) => w.length > 0));
      const ttr = uniqueWords.size / lowerWords.filter((w) => w.length > 0).length;
      // AI text often has surprisingly high vocabulary diversity (uses many different words)
      // Human text, especially informal, tends to repeat more
      // For longer texts, TTR decreases naturally — normalize
      const normalizedTTR = ttr * Math.sqrt(wordCount / 100); // rough normalization
      const vocabScore = normalizedTTR > 4.5 ? 50 : normalizedTTR > 3.5 ? 35 : normalizedTTR > 2.5 ? 15 : 0;
      signals.push({
        name: 'Vocabulary diversity',
        score: vocabScore,
        weight: 1.0,
        detail: `Type-token ratio: ${(ttr * 100).toFixed(1)}% (normalized: ${normalizedTTR.toFixed(2)}). AI text often shows high lexical diversity.`,
      });
    }

    // ── Signal 9: Formulaic paragraph openings (new) ─────────────────────
    if (paragraphs.length >= 3) {
      const formulaicStarts = [
        'this ', 'the ', 'in ', 'one of ', 'when it comes to',
        'as ', 'with ', 'by ', 'for ', 'from ',
        'another ', 'additionally', 'moreover', 'furthermore',
        'it is ', 'it\'s ', 'there are ', 'there is ',
      ];
      const paraStarts = paragraphs.map((p) => p.trim().toLowerCase());
      const formulaicCount = paraStarts.filter((s) =>
        formulaicStarts.some((f) => s.startsWith(f))
      ).length;
      const formulaicRatio = formulaicCount / paragraphs.length;
      const formulaicScore = formulaicRatio > 0.8 ? 55 : formulaicRatio > 0.6 ? 40 : formulaicRatio > 0.4 ? 20 : 0;
      signals.push({
        name: 'Formulaic paragraph openings',
        score: formulaicScore,
        weight: 1.0,
        detail: `${(formulaicRatio * 100).toFixed(0)}% of paragraphs start with formulaic openings.`,
      });
    }

    // ── Signal 10: Average sentence length (new) ─────────────────────────
    if (sentences.length >= 3) {
      const avgWords = wordCount / sentences.length;
      // AI tends to write medium-long sentences (15-25 words). Very short or very long = more human
      const avgLenScore = (avgWords >= 15 && avgWords <= 25) ? 40
        : (avgWords >= 12 && avgWords <= 30) ? 20 : 0;
      signals.push({
        name: 'Average sentence length',
        score: avgLenScore,
        weight: 0.8,
        detail: `Average ${avgWords.toFixed(1)} words/sentence (AI typical range: 15-25).`,
      });
    }

    // ── Signal 11: Passive voice density (new) ───────────────────────────
    const passivePatterns = /\b(is|are|was|were|been|being|be)\s+(being\s+)?(considered|known|used|made|seen|found|given|taken|called|shown|designed|intended|expected|required|needed|recommended|suggested|provided|offered|described|defined|regarded|viewed|perceived|utilized|employed|implemented|established|created|developed|built|formed|constructed|recognized|acknowledged|noted|observed|reported|stated|mentioned|highlighted|emphasized|discussed|addressed|examined|explored|analyzed|evaluated|assessed|reviewed|identified|determined|classified|categorized|understood|explained|illustrated|demonstrated|presented|introduced|proposed|considered|deemed|believed|thought|assumed|estimated|predicted|anticipated|projected)\b/gi;
    const passiveMatches = text.match(passivePatterns) || [];
    const passiveRatio = sentences.length > 0 ? passiveMatches.length / sentences.length : 0;
    const passiveScore = passiveRatio > 0.5 ? 50 : passiveRatio > 0.3 ? 35 : passiveRatio > 0.15 ? 15 : 0;
    signals.push({
      name: 'Passive voice density',
      score: passiveScore,
      weight: 1.0,
      detail: `${(passiveRatio * 100).toFixed(0)}% passive voice ratio. AI content often overuses passive constructions.`,
    });

    // ── Signal 12: List / enumeration patterns (new) ─────────────────────
    const listPatterns = text.match(/(\n\s*[-•*]\s|\n\s*\d+[.)]\s|\bfirstly\b|\bsecondly\b|\bthirdly\b|\bfinally\b|\blast but not least\b|\bin the first place\b)/gi) || [];
    const listScore = listPatterns.length >= 6 ? 40 : listPatterns.length >= 3 ? 25 : listPatterns.length >= 1 ? 10 : 0;
    signals.push({
      name: 'Enumeration patterns',
      score: listScore,
      weight: 0.8,
      detail: `Found ${listPatterns.length} list/enumeration markers. AI frequently uses structured lists.`,
    });

    // ── Weighted aggregation ─────────────────────────────────────────────
    let weightedSum = 0;
    let totalWeight = 0;
    for (const signal of signals) {
      weightedSum += signal.score * signal.weight;
      totalWeight += signal.weight;
    }
    const totalScore = Math.min(Math.round(weightedSum / totalWeight), 100);
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
      details: signals.map((s) => `[${s.name}: ${s.score}pts x${s.weight}] ${s.detail}`).join('\n'),
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
