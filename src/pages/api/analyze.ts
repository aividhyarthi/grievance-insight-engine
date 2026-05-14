import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: import.meta.env.ANTHROPIC_API_KEY });

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return json({ error: 'A YouTube URL is required.' }, 400);
    }

    const parsed = parseYouTubeURL(url.trim());
    if (!parsed) {
      return json({ error: 'Could not parse a YouTube video ID from that URL. Supported formats: youtube.com/watch?v=, youtu.be/, youtube.com/shorts/, youtube.com/live/' }, 400);
    }

    const { videoId, contentType: urlContentType } = parsed;

    // Fetch from YouTube Data API v3
    const ytApiKey = import.meta.env.YOUTUBE_API_KEY;
    if (!ytApiKey) {
      return json({ error: 'YouTube API key is not configured on the server.' }, 500);
    }

    const ytUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${ytApiKey}`;
    const ytRes = await fetch(ytUrl);
    if (!ytRes.ok) {
      return json({ error: `YouTube API error: ${ytRes.status} ${ytRes.statusText}` }, 502);
    }

    const ytData = await ytRes.json();
    if (!ytData.items || ytData.items.length === 0) {
      return json({ error: 'Video not found. Make sure the video is public and the URL is correct.' }, 404);
    }

    const snippet = ytData.items[0].snippet;
    const stats   = ytData.items[0].statistics || {};

    const title       = snippet.title || '';
    const description = snippet.description || '';
    const tags        = snippet.tags || [];
    const channelTitle = snippet.channelTitle || '';
    const publishedAt  = snippet.publishedAt || '';
    const liveBroadcast = snippet.liveBroadcastContent; // 'live' | 'upcoming' | 'none'

    const contentType = deriveContentType(urlContentType, liveBroadcast, snippet);
    const hashtags    = extractHashtags(description);

    // Thumbnail (maxres > high > medium > default)
    const thumbs = snippet.thumbnails || {};
    const thumbnail = (thumbs.maxres || thumbs.high || thumbs.medium || thumbs.default)?.url || '';

    // Build Claude prompt
    const prompt = buildPrompt({ title, description, tags, hashtags, channelTitle, contentType, stats });

    const aiMsg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: [
        'You are an expert YouTube SEO strategist.',
        'Given the current metadata for a YouTube video, generate improved metadata to maximize click-through rate, watch time, and search ranking.',
        'Always respond with a valid JSON object matching the schema exactly. No markdown fences, no extra text.',
      ].join(' '),
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = (aiMsg.content[0] as { type: string; text: string }).text.trim();
    const recommended = parseAIResponse(raw);

    return json({
      videoId,
      contentType,
      thumbnail,
      channelTitle,
      publishedAt,
      original: { title, description, tags, hashtags },
      recommended,
    });
  } catch (err: any) {
    console.error('[analyze]', err);
    return json({ error: err?.message || 'Internal server error' }, 500);
  }
};

// ---- Helpers ----

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function parseYouTubeURL(url: string): { videoId: string; contentType: string } | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('?')[0];
      return id ? { videoId: id, contentType: 'video' } : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      // Shorts
      const shortsMatch = u.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (shortsMatch) return { videoId: shortsMatch[1], contentType: 'shorts' };

      // Live
      const liveMatch = u.pathname.match(/^\/live\/([a-zA-Z0-9_-]{11})/);
      if (liveMatch) return { videoId: liveMatch[1], contentType: 'live' };

      // Regular watch
      const v = u.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return { videoId: v, contentType: 'video' };
    }
  } catch {
    // fall through
  }
  return null;
}

function deriveContentType(urlType: string, liveBroadcast: string, snippet: any): string {
  if (urlType === 'shorts') return 'shorts';
  if (liveBroadcast === 'live' || liveBroadcast === 'upcoming') return 'live';
  if (urlType === 'live') return 'live';
  return 'video';
}

function extractHashtags(text: string): string[] {
  const found = text.match(/#[\w]+/g) || [];
  return [...new Set(found)];
}

function buildPrompt(data: {
  title: string;
  description: string;
  tags: string[];
  hashtags: string[];
  channelTitle: string;
  contentType: string;
  stats: any;
}): string {
  const { title, description, tags, hashtags, channelTitle, contentType, stats } = data;
  const viewCount  = stats.viewCount  ? `${parseInt(stats.viewCount).toLocaleString()} views` : 'unknown';
  const likeCount  = stats.likeCount  ? `${parseInt(stats.likeCount).toLocaleString()} likes` : 'unknown';

  const typeInstructions: Record<string, string> = {
    shorts:  'This is a YouTube Short (vertical, <60s). Title must be short and punchy (under 50 chars). Description can be brief. Focus on trending micro-content hashtags.',
    live:    'This is a YouTube Live stream or replay. Title should convey urgency/value. Description should explain what was covered with timestamps if possible.',
    video:   'This is a standard YouTube video. Title should be 50–70 chars, compelling, with a primary keyword near the start. Description should be 150–300 words with natural keyword placement, hook in first 2 sentences, and a CTA at the end.',
  };

  const typeHint = typeInstructions[contentType] || typeInstructions.video;

  return `
Channel: "${channelTitle}"
Content type: ${contentType}
Stats: ${viewCount}, ${likeCount}

CURRENT TITLE:
${title}

CURRENT DESCRIPTION:
${description.slice(0, 1200)}

CURRENT TAGS:
${tags.slice(0, 30).join(', ') || 'None'}

CURRENT HASHTAGS:
${hashtags.join(' ') || 'None'}

${typeHint}

Return ONLY this JSON object (no markdown):
{
  "title": "<optimized title string>",
  "description": "<optimized description string>",
  "hashtags": ["#tag1", "#tag2", ...],
  "keywords": ["keyword1", "keyword2", ...],
  "tips": ["short tip 1", "short tip 2", "short tip 3"]
}

Rules:
- "hashtags": 10–15 relevant hashtags starting with #
- "keywords": 10–15 SEO keywords/phrases (no #)
- "tips": 3 specific, actionable improvement tips based on this video's actual weaknesses
- Preserve the original language/locale of the title and description
`.trim();
}

function parseAIResponse(raw: string): {
  title: string;
  description: string;
  hashtags: string[];
  keywords: string[];
  tips: string[];
} {
  try {
    // Strip any accidental markdown fences
    const cleaned = raw.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/,'').trim();
    const parsed = JSON.parse(cleaned);
    return {
      title:       parsed.title       || '',
      description: parsed.description || '',
      hashtags:    Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
      keywords:    Array.isArray(parsed.keywords)  ? parsed.keywords  : [],
      tips:        Array.isArray(parsed.tips)       ? parsed.tips       : [],
    };
  } catch {
    return {
      title:       raw.slice(0, 100),
      description: raw,
      hashtags:    [],
      keywords:    [],
      tips:        ['Could not parse AI response — please try again.'],
    };
  }
}
