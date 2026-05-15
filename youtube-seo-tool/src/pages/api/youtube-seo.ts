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

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { url?: string; context?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { url, context } = body;
  if (!url || !url.trim()) {
    return new Response(JSON.stringify({ error: 'YouTube URL is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const videoId = extractVideoId(url.trim());
  if (!videoId) {
    return new Response(JSON.stringify({ error: 'Could not extract a valid YouTube video ID from the URL.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const videoInfo = await fetchVideoInfo(url.trim());

  const videoContext = [
    videoInfo?.title ? `Current video title: "${videoInfo.title}"` : '',
    videoInfo?.author ? `Channel: ${videoInfo.author}` : '',
    context ? `Additional context about the video: ${context}` : '',
  ].filter(Boolean).join('\n');

  const prompt = `You are a YouTube SEO expert. Your task is to generate optimized SEO content for a YouTube video.

${videoContext || 'No video metadata available — use the URL context.'}
Video URL: ${url.trim()}

Generate comprehensive YouTube SEO content in the following JSON format exactly:
{
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
  "pinnedComment": "Suggested pinned comment text to boost engagement (2-3 sentences with emojis)"
}

Rules:
- hashtags: 20-25 hashtags, mix of broad and niche
- tags: 30-40 YouTube tags (single words and short phrases), no #
- chapters: 6-10 chapters with realistic timestamps
- All content must be SEO-optimized for YouTube search
- Return ONLY valid JSON, no markdown, no explanation`;

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: 'AI returned unexpected format.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const seo = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({
        videoInfo: videoInfo
          ? { ...videoInfo, id: videoId }
          : { id: videoId, title: '', thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, author: '' },
        seo,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: `AI generation failed: ${message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
