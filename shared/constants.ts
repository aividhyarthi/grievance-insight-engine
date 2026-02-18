// ─── Detection Thresholds ────────────────────────────────────────────────────

export const DETECTION_THRESHOLDS = {
  AI_GENERATED: 75,       // ≥75% confidence = AI-generated
  AI_MODIFIED: 50,        // 50–74% = likely AI-modified
  UNCERTAIN: 30,          // 30–49% = uncertain
  LIKELY_HUMAN: 0,        // <30% = likely human
} as const;

export const COMPLIANCE_SCORE = {
  COMPLIANT: 80,
  NEEDS_REVIEW: 50,
  NON_COMPLIANT: 0,
} as const;

// ─── Grade Thresholds ────────────────────────────────────────────────────────

export const GRADE_THRESHOLDS: { min: number; grade: string }[] = [
  { min: 90, grade: 'A+' },
  { min: 80, grade: 'A' },
  { min: 70, grade: 'B' },
  { min: 60, grade: 'C' },
  { min: 50, grade: 'D' },
  { min: 0, grade: 'F' },
];

export function getGrade(score: number): string {
  for (const { min, grade } of GRADE_THRESHOLDS) {
    if (score >= min) return grade;
  }
  return 'F';
}

// ─── Supported Content Types ─────────────────────────────────────────────────

export const SUPPORTED_MIME_TYPES: Record<string, string> = {
  // Images
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  'image/bmp': 'image',
  // Video
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/quicktime': 'video',
  'video/x-msvideo': 'video',
  'video/x-matroska': 'video',
  // Audio
  'audio/mpeg': 'audio',
  'audio/wav': 'audio',
  'audio/ogg': 'audio',
  'audio/flac': 'audio',
  'audio/aac': 'audio',
  'audio/mp4': 'audio',
  // Text
  'text/plain': 'text',
  'text/html': 'text',
  'text/markdown': 'text',
  'application/pdf': 'text',
};

export const MAX_FILE_SIZE_MB = 50;
export const MAX_TEXT_LENGTH = 50_000;

// ─── AI-Typical Phrases (for heuristic text detection) ──────────────────────

export const AI_TYPICAL_PHRASES = [
  // Classic AI giveaways
  'in today\'s digital landscape',
  'in today\'s fast-paced world',
  'in today\'s rapidly evolving',
  'in today\'s competitive',
  'in the digital age',
  'in an era of',
  'it\'s important to note that',
  'it\'s worth noting that',
  'it is important to note',
  'it is worth mentioning',
  'delve into',
  'let\'s delve',
  'dive into',
  'let\'s explore',
  'in conclusion',
  'plays a crucial role',
  'play a crucial role',
  'plays a vital role',
  'plays a pivotal role',
  'it\'s essential to',
  'navigate the complexities',
  'navigating the complexities',
  'landscape of',
  'the realm of',
  'paradigm shift',
  'leverage the power',
  'leveraging the power',
  'harness the potential',
  'harnessing the potential',
  'at the forefront',
  'a testament to',
  'in the ever-evolving',
  'multifaceted approach',
  'holistic approach',
  'comprehensive overview',
  'serves as a',
  'it\'s crucial to',
  'furthermore',
  'moreover',
  'in this article',
  'in summary',
  'revolutionize',
  'game-changer',
  'cutting-edge',
  'state-of-the-art',
  'groundbreaking',
  'seamlessly',
  'robust and scalable',
  'unlock the full potential',
  // Additional common AI patterns
  'it is crucial to understand',
  'stands as a beacon',
  'fostering a culture',
  'empowering individuals',
  'underscores the importance',
  'paves the way',
  'a myriad of',
  'a plethora of',
  'embark on a journey',
  'embarking on',
  'the landscape is shifting',
  'rapidly evolving landscape',
  'ever-changing landscape',
  'reshaping the way',
  'transforming the way',
  'by and large',
  'in a nutshell',
  'as we navigate',
  'as we move forward',
  'moving forward',
  'going forward',
  'key takeaway',
  'key takeaways',
  'a comprehensive guide',
  'comprehensive guide to',
  'a deep dive',
  'the intricacies of',
  'shed light on',
  'sheds light on',
  'shedding light on',
  'let\'s take a closer look',
  'a closer look at',
  'it goes without saying',
  'without further ado',
  'having said that',
  'that being said',
  'needless to say',
  'wrapping up',
  'to sum up',
  'all in all',
  'at the end of the day',
  'the bottom line is',
  'the takeaway here',
  'this ensures that',
  'this allows for',
  'this enables',
  'this facilitates',
  'can be a game changer',
  'tapestry of',
  'vibrant tapestry',
  'rich tapestry',
  'cornerstone of',
  'spearheading',
  'orchestrating',
  'synergy between',
  'synergies',
  'streamline',
  'streamlining',
  'optimize',
  'optimizing',
  'bolster',
  'bolstering',
  'fortify',
  'fortifying',
  'meticulous',
  'meticulously',
  'nuanced',
  'nuances of',
  'indispensable',
  'paramount importance',
  'quintessential',
  'unparalleled',
  'unprecedented',
  'commendable',
  'noteworthy',
  'ever-evolving',
  'ever-growing',
  'ever-changing',
  'ever-increasing',
];

// ─── Detection Provider Display Info ─────────────────────────────────────────

export const PROVIDER_INFO: Record<string, { name: string; description: string; website: string }> = {
  heuristic: {
    name: 'Built-in Heuristic',
    description: 'Pattern-based AI content detection using linguistic and statistical analysis. Works offline, no API key required.',
    website: '',
  },
  hive: {
    name: 'Hive AI',
    description: 'Multi-modal AI detection covering images, video, audio, and text. Identifies the generative model used.',
    website: 'https://thehive.ai',
  },
  sensity: {
    name: 'Sensity AI',
    description: 'Enterprise deepfake detection with forensic-level analysis. 98% accuracy.',
    website: 'https://sensity.ai',
  },
  arya: {
    name: 'Arya.ai',
    description: 'Indian AI detection platform. Data residency in India. Ideal for KYC and compliance.',
    website: 'https://arya.ai',
  },
  resemble: {
    name: 'Resemble AI',
    description: 'Specialized audio deepfake detection. 30+ languages including Hindi, Tamil, Bengali.',
    website: 'https://resemble.ai',
  },
  huggingface: {
    name: 'HuggingFace Visual AI',
    description: 'Free visual AI image detection using Vision Transformer (ViT) models. Analyzes pixel-level patterns to detect AI-generated images. No API key required.',
    website: 'https://huggingface.co/umm-maybe/AI-image-detector',
  },
  openai: {
    name: 'OpenAI Vision',
    description: 'GPT-4o vision analysis for AI-generated content detection. Examines visual artifacts, patterns, and anomalies.',
    website: 'https://platform.openai.com',
  },
  c2pa: {
    name: 'C2PA Metadata',
    description: 'Content Credentials standard (Adobe/Microsoft). Checks embedded provenance metadata.',
    website: 'https://c2pa.org',
  },
};

// ─── Compliance Report Labels ────────────────────────────────────────────────

export const STATUS_LABELS: Record<string, { label: string; color: string; bgColor: string }> = {
  compliant: { label: 'Compliant', color: 'text-green-700', bgColor: 'bg-green-100' },
  non_compliant: { label: 'Non-Compliant', color: 'text-red-700', bgColor: 'bg-red-100' },
  needs_review: { label: 'Needs Review', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  exempt: { label: 'Exempt', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  not_applicable: { label: 'N/A', color: 'text-gray-500', bgColor: 'bg-gray-100' },
};

export const SEVERITY_LABELS: Record<string, { label: string; color: string }> = {
  critical: { label: 'Critical', color: 'text-red-600' },
  major: { label: 'Major', color: 'text-orange-600' },
  minor: { label: 'Minor', color: 'text-yellow-600' },
  info: { label: 'Info', color: 'text-blue-600' },
};
