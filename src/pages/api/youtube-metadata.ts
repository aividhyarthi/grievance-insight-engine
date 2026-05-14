import type { APIRoute } from 'astro';
import ytdl from '@distube/ytdl-core';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface SEORecommendations {
  title: string;
  titleRationale: string;
  description: string;
  descriptionRationale: string;
  keywords: string[];
  keywordsRationale: string;
  hashtags: string[];
  hashtagsRationale: string;
  overallAnalysis: string;
}

async function getSEORecommendations(metadata: {
  title: string;
  description: string;
  keywords: string[];
  hashtags: string[];
  channel: string;
  viewCount: string;
}): Promise<SEORecommendations> {
  const prompt = `You are a YouTube SEO expert. Analyze the following YouTube video metadata and provide optimized recommendations that the SEO team can review and implement.

## Current Video Metadata

**Title:** ${metadata.title}

**Channel:** ${metadata.channel}
**Views:** ${parseInt(metadata.viewCount, 10).toLocaleString()}

**Description:**
${metadata.description || '(no description)'}

**Keywords (${metadata.keywords.length}):**
${metadata.keywords.join(', ') || '(none)'}

**Hashtags found:**
${metadata.hashtags.join(' ') || '(none)'}

---

Provide your recommendations as a JSON object with exactly these fields:
{
  "title": "Your optimized title (max 70 chars, front-load the main keyword, include a hook or benefit)",
  "titleRationale": "Short explanation of what you changed and why",
  "description": "Full optimized description (first 2-3 lines are critical — they show in search results without expanding). Include the main keyword in the first sentence, timestamps if relevant, CTAs, links placeholders, and relevant context. 800-2000 chars.",
  "descriptionRationale": "Short explanation of structural/content changes made",
  "keywords": ["array", "of", "25-35", "optimized", "keywords", "ordered", "by", "search", "volume", "and", "relevance"],
  "keywordsRationale": "Short explanation of keyword strategy used",
  "hashtags": ["#Hashtag1", "#Hashtag2", "...up to 15 highly relevant hashtags"],
  "hashtagsRationale": "Short explanation of hashtag selection",
  "overallAnalysis": "2-3 sentence summary of the main SEO gaps found and overall strategy applied"
}

Return ONLY the JSON object, no markdown, no extra text.`;

  const stream = anthropic.messages.stream({
    model: 'claude-opus-4-7',
    max_tokens: 4096,
    thinking: { type: 'adaptive' },
    system: 'You are a YouTube SEO expert. Always respond with valid JSON only — no markdown fences, no extra text.',
    messages: [{ role: 'user', content: prompt }],
  });

  const response = await stream.finalMessage();

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from AI');
  }

  const raw = textBlock.text.trim();
  // Strip any accidental markdown fences
  const json = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(json) as SEORecommendations;
}

export const POST: APIRoute = async ({ request }) => {
  let url: string;
  try {
    const body = await request.json();
    url = body.url?.trim();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!url || !ytdl.validateURL(url)) {
    return new Response(JSON.stringify({ error: 'Invalid or missing YouTube URL' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const info = await ytdl.getBasicInfo(url);
    const details = info.videoDetails;

    const keywords: string[] = details.keywords ?? [];

    const rawText = `${details.title} ${details.description ?? ''}`;
    const hashtagSet = new Set<string>();
    const hashtagRegex = /#[\w-￿]+/g;
    for (const match of rawText.matchAll(hashtagRegex)) {
      hashtagSet.add(match[0]);
    }

    const currentMetadata = {
      title: details.title,
      description: details.description ?? '',
      channel: details.author?.name ?? '',
      channelUrl: details.author?.channel_url ?? '',
      publishDate: details.publishDate ?? '',
      viewCount: details.viewCount ?? '0',
      duration: details.lengthSeconds,
      thumbnail: details.thumbnails?.at(-1)?.url ?? '',
      keywords,
      hashtags: [...hashtagSet],
      videoId: details.videoId,
    };

    // Run SEO analysis in parallel with nothing else (metadata already fetched)
    const recommendations = await getSEORecommendations({
      title: currentMetadata.title,
      description: currentMetadata.description,
      keywords: currentMetadata.keywords,
      hashtags: currentMetadata.hashtags,
      channel: currentMetadata.channel,
      viewCount: currentMetadata.viewCount,
    });

    return new Response(JSON.stringify({ current: currentMetadata, recommendations }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch video info';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
