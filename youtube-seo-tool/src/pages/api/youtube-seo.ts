import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function fetchVideoInfo(url: string): Promise<{ title: string; thumbnail: string; author: string } | null> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembedUrl);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title || '',
      thumbnail: data.thumbnail_url || '',
      author: data.author_name || '',
    };
  } catch {
    return null;
  }
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST: APIRoute = async ({ request }) => {
  const apiKey = process.env.ANTHROPIC_API_KEY || import.meta.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json({ error: 'ANTHROPIC_API_KEY is not configured on the server.' }, 500);
  }

  let body: { url?: string; context?: string; language?: string; currentDescription?: string; currentTags?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const { url, context, language = 'English', currentDescription = '', currentTags = '' } = body;
  if (!url || !url.trim()) {
    return json({ error: 'YouTube URL is required.' }, 400);
  }

  const videoId = extractVideoId(url.trim());
  if (!videoId) {
    return json({ error: 'Could not find a valid YouTube video ID in that URL. Please paste the full YouTube link.' }, 400);
  }

  const videoInfo = await fetchVideoInfo(url.trim());

  const videoContext = [
    videoInfo?.title ? `Current video title: "${videoInfo.title}"` : '',
    videoInfo?.author ? `Channel: ${videoInfo.author}` : '',
    context ? `Additional context about the video: ${context}` : '',
  ].filter(Boolean).join('\n');

  const auditContext = [
    currentDescription ? `Current description:\n${currentDescription}` : '',
    currentTags ? `Current tags: ${currentTags}` : '',
  ].filter(Boolean).join('\n\n');

  const prompt = `You are a YouTube SEO and content expert. Do two things:
1. Score the EXISTING SEO content provided.
2. Generate fully optimized NEW SEO content and thumbnail recommendations.

IMPORTANT: Generate ALL new text content in ${language}. If not English, write natively in ${language} script.

${videoContext || 'No video metadata available.'}
Video URL: ${url.trim()}
${auditContext ? `\n--- EXISTING SEO TO AUDIT ---\n${auditContext}\n---` : '\n(No existing description/tags provided — score description and tags/hashtags as null)'}

Return ONLY valid JSON in this exact format, no markdown, no explanation:
{
  "audit": {
    "overall": <0-100 integer>,
    "summary": "One sentence verdict on the current SEO quality",
    "title": { "score": <0-100>, "feedback": "Specific issue with current title in plain English" },
    "description": { "score": <0-100 or null if not provided>, "feedback": "Specific issue or 'Not provided'" },
    "tags": { "score": <0-100 or null if not provided>, "feedback": "Specific issue or 'Not provided'" },
    "hashtags": { "score": <0-100 or null if not provided>, "feedback": "Specific issue or 'Not provided'" },
    "topFixes": ["Fix 1 — specific actionable instruction", "Fix 2", "Fix 3"]
  },
  "titles": [
    "Title option 1 (highly clickable, keyword-rich, under 60 chars)",
    "Title option 2 (different angle, emotional hook)",
    "Title option 3 (question-based or list-based format)"
  ],
  "description": "Full SEO-optimized description (300-500 words). Start with the most important keywords in the first 2-3 lines. Include a clear intro, what viewers will learn/get, timestamps placeholder section, relevant links section placeholder, and a strong call to action. Use natural paragraph breaks.",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "tags": ["tag1", "tag2", "tag3"],
  "chapters": "0:00 Introduction\n1:30 [Section 2]\n...",
  "keywords": ["primary keyword 1", "primary keyword 2"],
  "cardText": "Suggested end screen / card call-to-action text (2-3 sentences)",
  "pinnedComment": "Suggested pinned comment text to boost engagement (2-3 sentences with emojis)",
  "thumbnails": [
    {
      "concept": "Concept name (e.g. Bold Reaction, Before & After, Question Hook)",
      "headline": "Big bold text to overlay on thumbnail (max 5 words, all caps)",
      "subtext": "Supporting line below headline (max 8 words)",
      "colors": {
        "background": "Color description (e.g. Deep red #c0392b)",
        "text": "Color description (e.g. White #ffffff)",
        "accent": "Color description (e.g. Yellow #f1c40f)"
      },
      "composition": "Layout description — where to place face, text, objects (2 sentences)",
      "expression": "If person appears: facial expression and body language tip (1 sentence)",
      "canvaTip": "Specific Canva tip for recreating this (1 sentence)"
    },
    {
      "concept": "Second concept (different style from first)",
      "headline": "...",
      "subtext": "...",
      "colors": { "background": "...", "text": "...", "accent": "..." },
      "composition": "...",
      "expression": "...",
      "canvaTip": "..."
    },
    {
      "concept": "Third concept (another distinct approach)",
      "headline": "...",
      "subtext": "...",
      "colors": { "background": "...", "text": "...", "accent": "..." },
      "composition": "...",
      "expression": "...",
      "canvaTip": "..."
    }
  ]
}

Rules:
- hashtags: 20-25 hashtags, mix of broad and niche
- tags: 30-40 YouTube tags (single words and short phrases), no #
- chapters: 6-10 chapters with realistic timestamps
- thumbnails: 3 distinct concepts with different visual styles
- All content must be SEO-optimized for YouTube search`;

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return json({ error: 'AI returned an unexpected format. Please try again.' }, 500);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const { audit, ...seo } = parsed;

    return json({
      videoInfo: videoInfo
        ? { ...videoInfo, id: videoId }
        : { id: videoId, title: '', thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, author: '' },
      audit: audit || null,
      seo,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return json({ error: `AI generation failed: ${msg}` }, 500);
  }
};
