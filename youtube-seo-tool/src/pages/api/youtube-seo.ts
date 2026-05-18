import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';

// Escape unescaped control characters inside JSON string values only
function repairJson(raw: string): string {
  let result = '';
  let inString = false;
  let escaped = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (escaped) { result += ch; escaped = false; continue; }
    if (ch === '\\' && inString) { result += ch; escaped = true; continue; }
    if (ch === '"') { inString = !inString; result += ch; continue; }
    if (inString) {
      if (ch === '\n') { result += '\\n'; continue; }
      if (ch === '\r') { result += '\\r'; continue; }
      if (ch === '\t') { result += '\\t'; continue; }
      if (ch.charCodeAt(0) < 0x20) continue;
    }
    result += ch;
  }
  return result;
}

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

  const prompt = `You are an expert YouTube strategist who writes like a real human creator — not an AI assistant.

Do two things:
1. Score the EXISTING SEO content.
2. Generate new SEO content that sounds authentic, specific, and natural.

OUTPUT LANGUAGE: Write ALL generated content in ${language}. If not English, use native ${language} script.

${videoContext || 'No video metadata available.'}
Video URL: ${url.trim()}
${auditContext ? `\n--- EXISTING SEO TO AUDIT ---\n${auditContext}\n---` : '\n(No existing description/tags provided — score description and tags/hashtags as null)'}

━━━ WRITING RULES — READ CAREFULLY ━━━

NEVER use these phrases (they sound like AI-generated content):
- "Unlock the secrets", "Dive deep into", "In this comprehensive guide"
- "Master the art of", "Game-changing", "Revolutionary", "Supercharge"
- "Don't forget to like and subscribe", "Smash that like button"
- "In this video, I will...", "Welcome to my channel"
- "Whether you're a beginner or expert", "Look no further"
- Any phrase that sounds like a marketing brochure

FOR TITLES — write like how real people actually search on YouTube:
- Specific and direct, e.g. "How I paid off $30k debt in 18 months" not "Unlock the secrets to debt freedom"
- Use numbers when natural: "5 mistakes", "in 10 minutes", "under $50"
- Conversational, not corporate — how would a friend describe this video?
- Under 60 characters, front-load the most important keyword

FOR DESCRIPTION — write like a real creator, not a press release:
- Open with the most useful/interesting line from the video — not "In this video"
- Short punchy paragraphs (2-3 sentences max each)
- Include what the viewer will actually get/learn/feel
- Timestamps section with [TIME] placeholders
- Links section with [YOUR LINK] placeholders
- End with a natural CTA that doesn't sound desperate
- 300-400 words total

FOR HASHTAGS — specific and real:
- Mix: 5 very niche (specific to this exact video), 10 mid-level (topic area), 5 broad (general category)
- No generic tags like #youtube #video #content

FOR TAGS — actual YouTube search phrases:
- Think: what would someone type into YouTube search to find this?
- Mix of short (1-2 words) and long-tail (4-6 words)
- No repetition of the same keyword in different orders

FOR PINNED COMMENT — write as if the creator typed it themselves:
- Personal, direct, gives extra value (a tip, a link, a question to the audience)
- No "I hope you enjoyed this video!"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY valid JSON in this exact format, no markdown, no explanation:
{
  "audit": {
    "overall": <0-100 integer>,
    "summary": "One direct sentence on what's most wrong with the current SEO",
    "title": { "score": <0-100>, "feedback": "Specific issue — e.g. 'Title is 22 chars, too short to rank. No primary keyword in first 3 words.'" },
    "description": { "score": <0-100 or null if not provided>, "feedback": "Specific issue or 'Not provided'" },
    "tags": { "score": <0-100 or null if not provided>, "feedback": "Specific issue or 'Not provided'" },
    "hashtags": { "score": <0-100 or null if not provided>, "feedback": "Specific issue or 'Not provided'" },
    "topFixes": ["Fix 1 — specific and actionable", "Fix 2", "Fix 3"]
  },
  "titles": [
    "Title option 1 — direct, specific, keyword-rich, under 60 chars",
    "Title option 2 — different angle, curiosity or number-based",
    "Title option 3 — question or personal story format"
  ],
  "description": "Full description following the writing rules above (300-400 words, natural paragraphs)",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "tags": ["tag1", "tag2"],
  "chapters": "0:00 Introduction\n1:30 Section name\n...",
  "keywords": ["primary keyword 1", "primary keyword 2"],
  "cardText": "Natural end-screen text — specific to this video, not generic",
  "pinnedComment": "Pinned comment written as the creator — personal, adds value, includes a question or tip",
  "thumbnails": [
    {
      "concept": "Concept name",
      "headline": "MAX 5 WORDS ALL CAPS",
      "subtext": "Supporting line max 8 words",
      "colors": {
        "background": "Color name + hex e.g. Deep red #c0392b",
        "text": "Color name + hex",
        "accent": "Color name + hex"
      },
      "composition": "Specific layout — where face, text, objects go. 2 sentences.",
      "expression": "Specific facial expression and body language for maximum click-through",
      "canvaTip": "One specific Canva action to recreate this"
    },
    {
      "concept": "Second concept — visually different style",
      "headline": "...", "subtext": "...",
      "colors": { "background": "...", "text": "...", "accent": "..." },
      "composition": "...", "expression": "...", "canvaTip": "..."
    },
    {
      "concept": "Third concept — another distinct approach",
      "headline": "...", "subtext": "...",
      "colors": { "background": "...", "text": "...", "accent": "..." },
      "composition": "...", "expression": "...", "canvaTip": "..."
    }
  ]
}

Rules:
- hashtags: 20 total, specific mix as described above
- tags: 30-40 actual YouTube search phrases
- chapters: 6-10 with realistic timestamps
- thumbnails: 3 visually distinct concepts`;

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

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      parsed = JSON.parse(repairJson(jsonMatch[0]));
    }
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
