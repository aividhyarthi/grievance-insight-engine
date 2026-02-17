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

  // ═══════════════════════════════════════════════════════════════════════════
  //  TEXT DETECTION
  // ═══════════════════════════════════════════════════════════════════════════

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

    // ── Signal 7: Lack of contractions ───────────────────────────────────
    const contractions = ["don't", "doesn't", "didn't", "won't", "wouldn't", "couldn't", "shouldn't",
      "isn't", "aren't", "wasn't", "weren't", "haven't", "hasn't", "hadn't",
      "can't", "it's", "that's", "there's", "here's", "what's", "who's",
      "let's", "i'm", "i've", "i'd", "i'll", "we're", "they're", "you're",
      "we've", "they've", "you've"];
    const contractionCount = contractions.reduce((count, c) => {
      return count + (lowerText.split(c).length - 1);
    }, 0);
    const contractionRatio = wordCount > 0 ? contractionCount / wordCount : 0;
    const contractionScore = contractionRatio < 0.002 ? 60 : contractionRatio < 0.005 ? 35 : contractionRatio < 0.01 ? 15 : 0;
    signals.push({
      name: 'Contraction avoidance',
      score: contractionScore,
      weight: 1.5,
      detail: contractionRatio < 0.005
        ? `Very few contractions (${(contractionRatio * 100).toFixed(2)}%). AI tends to use formal full forms.`
        : `Contraction usage: ${(contractionRatio * 100).toFixed(2)}% — natural for human writing.`,
    });

    // ── Signal 8: Vocabulary diversity / richness ────────────────────────
    if (wordCount >= 20) {
      const lowerWords = words.map((w) => w.toLowerCase().replace(/[^a-z']/g, ''));
      const uniqueWords = new Set(lowerWords.filter((w) => w.length > 0));
      const ttr = uniqueWords.size / lowerWords.filter((w) => w.length > 0).length;
      const normalizedTTR = ttr * Math.sqrt(wordCount / 100);
      const vocabScore = normalizedTTR > 4.5 ? 50 : normalizedTTR > 3.5 ? 35 : normalizedTTR > 2.5 ? 15 : 0;
      signals.push({
        name: 'Vocabulary diversity',
        score: vocabScore,
        weight: 1.0,
        detail: `Type-token ratio: ${(ttr * 100).toFixed(1)}% (normalized: ${normalizedTTR.toFixed(2)}). AI text often shows high lexical diversity.`,
      });
    }

    // ── Signal 9: Formulaic paragraph openings ──────────────────────────
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

    // ── Signal 10: Average sentence length ──────────────────────────────
    if (sentences.length >= 3) {
      const avgWords = wordCount / sentences.length;
      const avgLenScore = (avgWords >= 15 && avgWords <= 25) ? 40
        : (avgWords >= 12 && avgWords <= 30) ? 20 : 0;
      signals.push({
        name: 'Average sentence length',
        score: avgLenScore,
        weight: 0.8,
        detail: `Average ${avgWords.toFixed(1)} words/sentence (AI typical range: 15-25).`,
      });
    }

    // ── Signal 11: Passive voice density ─────────────────────────────────
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

    // ── Signal 12: List / enumeration patterns ──────────────────────────
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

  // ═══════════════════════════════════════════════════════════════════════════
  //  IMAGE DETECTION — Deep heuristic analysis
  // ═══════════════════════════════════════════════════════════════════════════

  private detectImage(input: DetectionInput, start: number): ProviderResult {
    const signals: { name: string; score: number; weight: number; detail: string }[] = [];

    if (!input.filePath || !fs.existsSync(input.filePath)) {
      return {
        provider: 'heuristic',
        verdict: 'uncertain',
        confidence: 0,
        details: 'No file provided for heuristic image analysis.',
        processingTimeMs: Date.now() - start,
      };
    }

    const buffer = fs.readFileSync(input.filePath);
    const fileStr = buffer.toString('latin1');
    const lowerStr = fileStr.toLowerCase();

    // ── Signal 1: AI tool mentions in metadata ───────────────────────────
    const aiToolMentions = [
      { marker: 'stable diffusion', tool: 'Stable Diffusion' },
      { marker: 'midjourney', tool: 'Midjourney' },
      { marker: 'dall-e', tool: 'DALL-E' },
      { marker: 'dalle', tool: 'DALL-E' },
      { marker: 'comfyui', tool: 'ComfyUI' },
      { marker: 'automatic1111', tool: 'Automatic1111' },
      { marker: 'invoke ai', tool: 'InvokeAI' },
      { marker: 'leonardo', tool: 'Leonardo AI' },
      { marker: 'firefly', tool: 'Adobe Firefly' },
      { marker: 'ideogram', tool: 'Ideogram' },
      { marker: 'flux', tool: 'Flux' },
      { marker: 'openai', tool: 'OpenAI' },
      { marker: 'clipdrop', tool: 'ClipDrop' },
      { marker: 'nightcafe', tool: 'NightCafe' },
      { marker: 'artbreeder', tool: 'ArtBreeder' },
      { marker: 'dream by wombo', tool: 'Dream by WOMBO' },
      { marker: 'canva ai', tool: 'Canva AI' },
      { marker: 'bing image creator', tool: 'Bing Image Creator' },
      { marker: 'craiyon', tool: 'Craiyon' },
    ];
    let detectedTool: string | undefined;
    for (const { marker, tool } of aiToolMentions) {
      if (lowerStr.includes(marker)) {
        signals.push({ name: 'AI tool in metadata', score: 95, weight: 4.0, detail: `AI tool metadata found: "${tool}". Strong indicator of AI generation.` });
        detectedTool = tool;
        break;
      }
    }

    // ── Signal 2: PNG tEXt/iTXt chunk analysis (SD/ComfyUI params) ──────
    if (input.mimeType === 'image/png') {
      const pngParamSignals = this.analyzePngChunks(buffer);
      for (const sig of pngParamSignals) {
        signals.push(sig);
        if (sig.detail.includes('tool:')) {
          detectedTool = detectedTool || sig.detail.split('tool:')[1]?.trim();
        }
      }
    }

    // ── Signal 3: EXIF camera data absence ───────────────────────────────
    const exifAnalysis = this.analyzeExifPresence(fileStr, input.mimeType || '');
    signals.push(exifAnalysis);

    // ── Signal 4: Image dimensions analysis ──────────────────────────────
    const dimAnalysis = this.analyzeDimensions(buffer, input.mimeType || '');
    if (dimAnalysis) signals.push(dimAnalysis);

    // ── Signal 5: Software/Creator tag analysis ──────────────────────────
    const softwareAnalysis = this.analyzeSoftwareTags(lowerStr);
    if (softwareAnalysis) signals.push(softwareAnalysis);

    // ── Signal 6: JPEG quantization table analysis ───────────────────────
    if (input.mimeType === 'image/jpeg') {
      const jpegAnalysis = this.analyzeJpegStructure(buffer);
      if (jpegAnalysis) signals.push(jpegAnalysis);
    }

    // ── Signal 7: File size vs dimensions ratio ──────────────────────────
    const compressionAnalysis = this.analyzeCompression(buffer, input.mimeType || '');
    if (compressionAnalysis) signals.push(compressionAnalysis);

    // ── Signal 8: ICC profile analysis ───────────────────────────────────
    const iccAnalysis = this.analyzeICCProfile(fileStr);
    signals.push(iccAnalysis);

    // ── Signal 9: Pixel-level statistical analysis ───────────────────────
    const pixelAnalysis = this.analyzePixelStatistics(buffer, input.mimeType || '');
    for (const sig of pixelAnalysis) {
      signals.push(sig);
    }

    // ── Weighted aggregation ─────────────────────────────────────────────
    let weightedSum = 0;
    let totalWeight = 0;
    for (const signal of signals) {
      weightedSum += signal.score * signal.weight;
      totalWeight += signal.weight;
    }
    const totalScore = totalWeight > 0 ? Math.min(Math.round(weightedSum / totalWeight), 100) : 0;

    // If we have a definitive signal (AI tool in metadata), trust it fully
    const hasStrongSignal = signals.some((s) => s.score >= 70 && s.weight >= 2.0);
    const adjustedScore = hasStrongSignal ? totalScore : Math.min(totalScore, 65);

    const verdict = this.imageScoreToVerdict(adjustedScore, signals);

    const details = signals
      .filter((s) => s.score > 0 || s.weight >= 2.0)
      .map((s) => `[${s.name}: ${s.score}pts x${s.weight}] ${s.detail}`)
      .join('\n');

    const noSignalNote = signals.every((s) => s.score === 0)
      ? '\n\nNote: No strong AI signals detected through heuristic analysis. For reliable image AI detection, enable the Hive AI provider (HIVE_API_KEY). Heuristic analysis alone cannot detect visual AI artifacts like distorted text, unnatural hands, or inconsistent lighting.'
      : '';

    return {
      provider: 'heuristic',
      verdict,
      confidence: adjustedScore,
      details: (details || 'No AI generation signals detected in file metadata or structure.') + noSignalNote,
      generativeModel: detectedTool,
      processingTimeMs: Date.now() - start,
    };
  }

  // ─── PNG Chunk Analysis ──────────────────────────────────────────────────

  private analyzePngChunks(buffer: Buffer): { name: string; score: number; weight: number; detail: string }[] {
    const results: { name: string; score: number; weight: number; detail: string }[] = [];
    const str = buffer.toString('latin1');

    // Stable Diffusion stores generation parameters in tEXt chunks
    const sdParamPatterns = [
      { pattern: 'parameters\x00', label: 'Stable Diffusion parameters chunk' },
      { pattern: 'prompt\x00', label: 'Generation prompt chunk' },
      { pattern: 'negative_prompt', label: 'Negative prompt (SD/ComfyUI)' },
      { pattern: 'Steps:', label: 'SD generation steps' },
      { pattern: 'Sampler:', label: 'SD sampler config' },
      { pattern: 'CFG scale:', label: 'SD CFG scale' },
      { pattern: 'Seed:', label: 'SD seed value' },
      { pattern: 'Model:', label: 'SD model reference' },
      { pattern: 'comfyui', label: 'ComfyUI workflow data' },
    ];

    for (const { pattern, label } of sdParamPatterns) {
      if (str.toLowerCase().includes(pattern.toLowerCase())) {
        results.push({
          name: 'PNG AI generation params',
          score: 95,
          weight: 4.0,
          detail: `${label} found in PNG metadata. Definitive evidence of AI generation. tool: Stable Diffusion`,
        });
        return results;
      }
    }

    // Check for unusually large tEXt chunks
    const textChunkPattern = /tEXt|iTXt|zTXt/g;
    let textChunkCount = 0;
    let match;
    while ((match = textChunkPattern.exec(str)) !== null) {
      textChunkCount++;
    }
    if (textChunkCount > 5) {
      results.push({
        name: 'Excessive PNG text chunks',
        score: 40,
        weight: 1.5,
        detail: `Found ${textChunkCount} text metadata chunks. AI tools often embed extra generation parameters.`,
      });
    }

    return results;
  }

  // ─── EXIF Presence Analysis ──────────────────────────────────────────────

  private analyzeExifPresence(fileStr: string, mimeType: string): { name: string; score: number; weight: number; detail: string } {
    const lower = fileStr.toLowerCase();
    const hasExif = lower.includes('exif');

    const cameraFields = [
      { field: 'make', label: 'Camera make' },
      { field: 'model', label: 'Camera model' },
      { field: 'exposuretime', label: 'Exposure time' },
      { field: 'fnumber', label: 'F-number' },
      { field: 'isospeed', label: 'ISO speed' },
      { field: 'focallength', label: 'Focal length' },
      { field: 'lensmodel', label: 'Lens model' },
      { field: 'gps', label: 'GPS data' },
      { field: 'datetime', label: 'Date/time' },
      { field: 'shutterspeed', label: 'Shutter speed' },
      { field: 'whitebalance', label: 'White balance' },
      { field: 'flash', label: 'Flash info' },
    ];

    const foundFields = cameraFields.filter((f) => lower.includes(f.field));

    if (mimeType === 'image/jpeg' || mimeType === 'image/webp') {
      if (!hasExif) {
        return {
          name: 'EXIF data absence',
          score: 55,
          weight: 2.5,
          detail: `No EXIF data found in ${mimeType === 'image/webp' ? 'WebP' : 'JPEG'}. Real camera photos almost always contain EXIF. AI-generated images typically lack camera metadata entirely.`,
        };
      }
      if (foundFields.length <= 2) {
        return {
          name: 'Minimal EXIF data',
          score: 40,
          weight: 2.0,
          detail: `EXIF header present but only ${foundFields.length} camera fields found (${foundFields.map((f) => f.label).join(', ') || 'none'}). Real photos typically have 6+ fields. May be AI-generated with basic metadata added.`,
        };
      }
      return {
        name: 'Camera EXIF present',
        score: 0,
        weight: 2.0,
        detail: `Rich camera EXIF data found: ${foundFields.map((f) => f.label).join(', ')}. Consistent with a real camera photo.`,
      };
    }

    if (mimeType === 'image/png') {
      if (hasExif && foundFields.length >= 3) {
        return {
          name: 'Camera EXIF in PNG',
          score: 0,
          weight: 1.0,
          detail: 'Camera EXIF data found in PNG. Suggests a converted camera photo.',
        };
      }
      return {
        name: 'No camera EXIF (PNG)',
        score: 25,
        weight: 1.5,
        detail: 'No camera EXIF data in PNG. PNG is a common output format for AI image generators.',
      };
    }

    // Other image formats (GIF, BMP, SVG, etc.)
    if (!hasExif) {
      return {
        name: 'No camera EXIF',
        score: 30,
        weight: 1.5,
        detail: `No camera EXIF data found (${mimeType}). Absence of camera metadata is common in AI-generated images.`,
      };
    }
    return {
      name: 'EXIF analysis',
      score: 0,
      weight: 0.5,
      detail: 'EXIF data present in file.',
    };
  }

  // ─── Dimensions Analysis ─────────────────────────────────────────────────

  private analyzeDimensions(buffer: Buffer, mimeType: string): { name: string; score: number; weight: number; detail: string } | null {
    let width = 0;
    let height = 0;

    if (mimeType === 'image/png' && buffer.length > 24) {
      width = buffer.readUInt32BE(16);
      height = buffer.readUInt32BE(20);
    } else if (mimeType === 'image/jpeg') {
      for (let i = 0; i < buffer.length - 10; i++) {
        if (buffer[i] === 0xFF && (buffer[i + 1] === 0xC0 || buffer[i + 1] === 0xC2)) {
          height = buffer.readUInt16BE(i + 5);
          width = buffer.readUInt16BE(i + 7);
          break;
        }
      }
    } else if (mimeType === 'image/webp' && buffer.length > 30) {
      // WebP: RIFF header (12 bytes) then VP8 chunk
      // Check for "RIFF" header and "WEBP" format
      const riff = buffer.toString('ascii', 0, 4);
      const webp = buffer.toString('ascii', 8, 12);
      if (riff === 'RIFF' && webp === 'WEBP') {
        const chunkType = buffer.toString('ascii', 12, 16);
        if (chunkType === 'VP8 ' && buffer.length > 26) {
          // Lossy VP8: dimensions at offset 26-29 (little-endian 16-bit)
          width = buffer.readUInt16LE(26) & 0x3FFF;
          height = buffer.readUInt16LE(28) & 0x3FFF;
        } else if (chunkType === 'VP8L' && buffer.length > 25) {
          // Lossless VP8L: dimensions packed in a 32-bit value at offset 21
          const bits = buffer.readUInt32LE(21);
          width = (bits & 0x3FFF) + 1;
          height = ((bits >> 14) & 0x3FFF) + 1;
        } else if (chunkType === 'VP8X' && buffer.length > 30) {
          // Extended VP8X: canvas size at offset 24-29
          width = (buffer[24] | (buffer[25] << 8) | (buffer[26] << 16)) + 1;
          height = (buffer[27] | (buffer[28] << 8) | (buffer[29] << 16)) + 1;
        }
      }
    }

    if (width === 0 || height === 0) return null;

    const aiDimensions = [256, 384, 512, 576, 640, 768, 832, 896, 960, 1024, 1152, 1280, 1344, 1536, 1792, 2048, 4096];
    const isAIDimW = aiDimensions.includes(width);
    const isAIDimH = aiDimensions.includes(height);
    const isSquare = width === height;
    const isMultipleOf64 = (width % 64 === 0) && (height % 64 === 0);

    let score = 0;
    const details: string[] = [`Dimensions: ${width}x${height}`];

    if (isSquare && isAIDimW) {
      score = 45;
      details.push(`Square ${width}x${height} is a very common AI output size`);
    } else if (isAIDimW && isAIDimH) {
      score = 40;
      details.push('Both dimensions match common AI generation sizes');
    } else if (isMultipleOf64) {
      score = 25;
      details.push('Both dimensions are multiples of 64 (AI models generate in 64px blocks)');
    } else if ((width % 8 === 0) && (height % 8 === 0) && !isSquare) {
      score = 5;
      details.push('Dimensions are multiples of 8 (common but not specific to AI)');
    }

    // Known camera resolutions reduce score
    const cameraResolutions = [
      [4032, 3024], [3024, 4032],
      [4000, 3000], [3000, 4000],
      [6000, 4000], [4000, 6000],
      [5472, 3648], [3648, 5472],
      [6016, 4016], [4016, 6016],
      [4608, 3456], [3456, 4608],
    ];
    if (cameraResolutions.some(([w, h]) => w === width && h === height)) {
      score = 0;
      details.push('Dimensions match a known camera sensor resolution');
    }

    return {
      name: 'Image dimensions',
      score,
      weight: 1.5,
      detail: details.join('. ') + '.',
    };
  }

  // ─── Software Tag Analysis ───────────────────────────────────────────────

  private analyzeSoftwareTags(lowerStr: string): { name: string; score: number; weight: number; detail: string } | null {
    const aiTools = ['stable diffusion', 'midjourney', 'dall-e', 'dalle', 'comfyui',
      'automatic1111', 'novelai', 'invoke', 'leonardo', 'firefly',
      'ideogram', 'flux', 'bing image creator', 'craiyon', 'canva ai'];
    const photoEditors = ['photoshop', 'lightroom', 'gimp', 'capture one', 'darktable',
      'rawtherapee', 'affinity photo', 'pixelmator', 'snapseed'];
    const cameraFirmware = ['nikon', 'canon', 'sony', 'fujifilm', 'panasonic', 'olympus',
      'samsung', 'apple', 'google', 'huawei', 'xiaomi', 'oppo'];

    for (const tool of aiTools) {
      if (lowerStr.includes(tool)) {
        return { name: 'Software tag (AI)', score: 90, weight: 3.5, detail: `Software/creator tag contains AI tool reference: "${tool}".` };
      }
    }
    for (const editor of photoEditors) {
      if (lowerStr.includes(editor)) {
        return { name: 'Software tag (Editor)', score: 5, weight: 1.0, detail: `Photo editor detected: "${editor}". Edited photo, not necessarily AI.` };
      }
    }
    for (const cam of cameraFirmware) {
      if (lowerStr.includes(cam)) {
        return { name: 'Software tag (Camera)', score: 0, weight: 1.5, detail: `Camera/phone brand found: "${cam}". Consistent with a real photo.` };
      }
    }
    return null;
  }

  // ─── JPEG Structure Analysis ─────────────────────────────────────────────

  private analyzeJpegStructure(buffer: Buffer): { name: string; score: number; weight: number; detail: string } | null {
    const hasExifApp1 = buffer.length > 10 && buffer[0] === 0xFF && buffer[1] === 0xD8 &&
      buffer[2] === 0xFF && buffer[3] === 0xE1;
    const hasThumbnail = buffer.toString('latin1').includes('thumbnail') ||
      buffer.toString('latin1').toLowerCase().includes('iptc');

    let dqtCount = 0;
    for (let i = 0; i < buffer.length - 1; i++) {
      if (buffer[i] === 0xFF && buffer[i + 1] === 0xDB) dqtCount++;
    }

    if (!hasExifApp1 && !hasThumbnail && dqtCount <= 2) {
      return {
        name: 'JPEG structure',
        score: 35,
        weight: 1.5,
        detail: `Minimal JPEG structure: no Exif APP1 header, no thumbnail, ${dqtCount} quantization table(s). AI-generated JPEGs typically have simpler structure.`,
      };
    }

    if (hasExifApp1 && hasThumbnail) {
      return {
        name: 'JPEG structure',
        score: 0,
        weight: 1.5,
        detail: 'Full JPEG structure with Exif header and thumbnail. Consistent with a real camera photo.',
      };
    }

    return null;
  }

  // ─── Compression Analysis ────────────────────────────────────────────────

  private analyzeCompression(buffer: Buffer, mimeType: string): { name: string; score: number; weight: number; detail: string } | null {
    // Use parseDimensions helper to get width/height for any format
    const dims = this.parseDimensions(buffer, mimeType);
    if (!dims) return null;

    const { width, height } = dims;
    const pixels = width * height;
    const bytesPerPixel = buffer.length / pixels;

    if ((mimeType === 'image/jpeg' || mimeType === 'image/webp') && bytesPerPixel > 0.3 && bytesPerPixel < 0.6 && pixels > 500000) {
      return {
        name: 'Compression ratio',
        score: 20,
        weight: 1.0,
        detail: `Bytes/pixel: ${bytesPerPixel.toFixed(3)}. Compression ratio is in the typical range for AI-generated content (0.3-0.6 bytes/pixel).`,
      };
    }

    if (mimeType === 'image/png' && bytesPerPixel > 2.0 && pixels > 500000) {
      return {
        name: 'PNG file size',
        score: 15,
        weight: 0.8,
        detail: `Large PNG file (${bytesPerPixel.toFixed(2)} bytes/pixel). AI-generated PNGs often have high detail density.`,
      };
    }

    return null;
  }

  // ─── Shared dimension parser (reusable) ────────────────────────────────

  private parseDimensions(buffer: Buffer, mimeType: string): { width: number; height: number } | null {
    let width = 0;
    let height = 0;

    if (mimeType === 'image/png' && buffer.length > 24) {
      width = buffer.readUInt32BE(16);
      height = buffer.readUInt32BE(20);
    } else if (mimeType === 'image/jpeg') {
      for (let i = 0; i < buffer.length - 10; i++) {
        if (buffer[i] === 0xFF && (buffer[i + 1] === 0xC0 || buffer[i + 1] === 0xC2)) {
          height = buffer.readUInt16BE(i + 5);
          width = buffer.readUInt16BE(i + 7);
          break;
        }
      }
    } else if (mimeType === 'image/webp' && buffer.length > 30) {
      const riff = buffer.toString('ascii', 0, 4);
      const webp = buffer.toString('ascii', 8, 12);
      if (riff === 'RIFF' && webp === 'WEBP') {
        const chunkType = buffer.toString('ascii', 12, 16);
        if (chunkType === 'VP8 ' && buffer.length > 26) {
          width = buffer.readUInt16LE(26) & 0x3FFF;
          height = buffer.readUInt16LE(28) & 0x3FFF;
        } else if (chunkType === 'VP8L' && buffer.length > 25) {
          const bits = buffer.readUInt32LE(21);
          width = (bits & 0x3FFF) + 1;
          height = ((bits >> 14) & 0x3FFF) + 1;
        } else if (chunkType === 'VP8X' && buffer.length > 30) {
          width = (buffer[24] | (buffer[25] << 8) | (buffer[26] << 16)) + 1;
          height = (buffer[27] | (buffer[28] << 8) | (buffer[29] << 16)) + 1;
        }
      }
    }

    if (width > 0 && height > 0) return { width, height };
    return null;
  }

  // ─── ICC Profile Analysis ────────────────────────────────────────────────

  private analyzeICCProfile(fileStr: string): { name: string; score: number; weight: number; detail: string } {
    const lower = fileStr.toLowerCase();
    const hasSRGB = lower.includes('srgb');
    const hasAdobeRGB = lower.includes('adobergb') || lower.includes('adobe rgb');
    const hasDisplayP3 = lower.includes('display p3') || lower.includes('displayp3');
    const hasProPhoto = lower.includes('prophoto');
    const hasICCProfile = lower.includes('icc_profile') || lower.includes('icc profile');

    if (hasAdobeRGB || hasDisplayP3 || hasProPhoto) {
      return {
        name: 'Color profile',
        score: 0,
        weight: 1.0,
        detail: `Professional color profile detected (${hasAdobeRGB ? 'Adobe RGB' : hasDisplayP3 ? 'Display P3' : 'ProPhoto RGB'}). Consistent with camera/professional workflow.`,
      };
    }
    if (!hasICCProfile && !hasSRGB) {
      return {
        name: 'Color profile absence',
        score: 25,
        weight: 1.0,
        detail: 'No ICC color profile or sRGB tag found. AI-generated images often lack proper color management.',
      };
    }
    return {
      name: 'Color profile',
      score: 10,
      weight: 0.5,
      detail: 'Basic sRGB profile. Common in both AI and web-exported images — not conclusive.',
    };
  }

  // ─── Pixel-level Statistical Analysis ────────────────────────────────────

  private analyzePixelStatistics(buffer: Buffer, mimeType: string): { name: string; score: number; weight: number; detail: string }[] {
    const results: { name: string; score: number; weight: number; detail: string }[] = [];

    if (mimeType === 'image/jpeg' && buffer.length > 1000) {
      let sosOffset = -1;
      for (let i = 0; i < buffer.length - 1; i++) {
        if (buffer[i] === 0xFF && buffer[i + 1] === 0xDA) {
          sosOffset = i;
          break;
        }
      }

      if (sosOffset > 0 && sosOffset < buffer.length - 500) {
        const dataStart = sosOffset + 12;
        const sampleSize = Math.min(10000, buffer.length - dataStart);
        if (sampleSize > 100) {
          const sample = buffer.subarray(dataStart, dataStart + sampleSize);

          // Byte entropy analysis
          const freq = new Array(256).fill(0);
          for (let i = 0; i < sample.length; i++) {
            freq[sample[i]]++;
          }
          let entropy = 0;
          for (let i = 0; i < 256; i++) {
            if (freq[i] > 0) {
              const p = freq[i] / sample.length;
              entropy -= p * Math.log2(p);
            }
          }

          if (entropy < 6.8) {
            results.push({
              name: 'Data entropy (low)',
              score: 30,
              weight: 1.0,
              detail: `Image data entropy: ${entropy.toFixed(2)} bits/byte. Below typical for real photos (7.0+). AI images can show lower entropy due to pattern regularity.`,
            });
          } else if (entropy > 7.8) {
            results.push({
              name: 'Data entropy (high)',
              score: 0,
              weight: 1.0,
              detail: `Image data entropy: ${entropy.toFixed(2)} bits/byte. High entropy consistent with complex real-world scene.`,
            });
          }

          // Byte-pair diversity analysis
          const pairFreq = new Map<number, number>();
          for (let i = 0; i < sample.length - 1; i++) {
            const pair = (sample[i] << 8) | sample[i + 1];
            pairFreq.set(pair, (pairFreq.get(pair) || 0) + 1);
          }
          const uniquePairs = pairFreq.size;
          const maxPossiblePairs = Math.min(65536, sample.length - 1);
          const pairDiversity = uniquePairs / maxPossiblePairs;

          if (pairDiversity < 0.3) {
            results.push({
              name: 'Byte-pair regularity',
              score: 25,
              weight: 1.0,
              detail: `Byte-pair diversity: ${(pairDiversity * 100).toFixed(1)}%. Low diversity suggests regular patterns typical of AI imagery.`,
            });
          }
        }
      }
    }

    // WebP: analyze data bytes similarly to JPEG
    if (mimeType === 'image/webp' && buffer.length > 1000) {
      // Skip the RIFF/WEBP header (first ~30 bytes) and sample the data
      const dataStart = 30;
      const sampleSize = Math.min(10000, buffer.length - dataStart);
      if (sampleSize > 100) {
        const sample = buffer.subarray(dataStart, dataStart + sampleSize);
        const freq = new Array(256).fill(0);
        for (let i = 0; i < sample.length; i++) {
          freq[sample[i]]++;
        }
        let entropy = 0;
        for (let i = 0; i < 256; i++) {
          if (freq[i] > 0) {
            const p = freq[i] / sample.length;
            entropy -= p * Math.log2(p);
          }
        }
        if (entropy < 6.8) {
          results.push({
            name: 'Data entropy (low)',
            score: 30,
            weight: 1.0,
            detail: `WebP data entropy: ${entropy.toFixed(2)} bits/byte. Below typical for real photos (7.0+). AI images can show lower entropy.`,
          });
        }
      }
    }

    if (mimeType === 'image/png' && buffer.length > 1000) {
      let ffCount = 0;
      let zeroCount = 0;
      const sampleStart = Math.min(100, buffer.length);
      const sampleEnd = Math.min(sampleStart + 5000, buffer.length);
      for (let i = sampleStart; i < sampleEnd; i++) {
        if (buffer[i] === 0xFF) ffCount++;
        if (buffer[i] === 0x00) zeroCount++;
      }
      const sampleLen = sampleEnd - sampleStart;
      const ffRatio = ffCount / sampleLen;
      const zeroRatio = zeroCount / sampleLen;

      if (ffRatio > 0.1 || zeroRatio > 0.15) {
        results.push({
          name: 'PNG byte distribution',
          score: 15,
          weight: 0.8,
          detail: `Unusual byte distribution in PNG data (0xFF: ${(ffRatio * 100).toFixed(1)}%, 0x00: ${(zeroRatio * 100).toFixed(1)}%).`,
        });
      }
    }

    return results;
  }

  // ─── Verdict Helpers ─────────────────────────────────────────────────────

  private imageScoreToVerdict(
    score: number,
    signals: { name: string; score: number; weight: number }[],
  ): DetectionVerdict {
    const hasDefinitiveSignal = signals.some((s) => s.score >= 90 && s.weight >= 3.0);
    if (hasDefinitiveSignal) return 'ai_generated';

    if (score >= DETECTION_THRESHOLDS.AI_GENERATED) return 'ai_generated';
    if (score >= DETECTION_THRESHOLDS.AI_MODIFIED) return 'ai_modified';
    if (score >= DETECTION_THRESHOLDS.UNCERTAIN) return 'uncertain';

    // IMPORTANT: If no strong signals found at all, say "uncertain" not "likely_human"
    // We cannot do visual analysis without an AI API — being honest is better
    const hasAnyMeaningfulSignal = signals.some((s) => s.score > 0);
    if (!hasAnyMeaningfulSignal) return 'uncertain';

    return 'likely_human';
  }

  private scoreToVerdict(score: number): DetectionVerdict {
    if (score >= DETECTION_THRESHOLDS.AI_GENERATED) return 'ai_generated';
    if (score >= DETECTION_THRESHOLDS.AI_MODIFIED) return 'ai_modified';
    if (score >= DETECTION_THRESHOLDS.UNCERTAIN) return 'uncertain';
    return 'likely_human';
  }
}
