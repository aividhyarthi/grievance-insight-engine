import type { APIRoute } from 'astro';
import ytdl from '@distube/ytdl-core';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' });

export const POST: APIRoute = async ({ request }) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured.' }), {
      status: 503, headers: { 'Content-Type': 'application/json' },
    });
  }
  let url: string;
  try {
    const body = await request.json();
    url = body.url?.trim();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!url || !ytdl.validateURL(url)) {
    return new Response(JSON.stringify({ error: 'Invalid or missing YouTube URL' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }
  try {
    const info = await ytdl.getBasicInfo(url);
    const d = info.videoDetails;
    const keywords: string[] = d.keywords ?? [];
    const hashtagSet = new Set<string>();
    for (const m of `${d.title} ${d.description ?? ''}`.matchAll(/#[\wÀ-￿]+/g)) hashtagSet.add(m[0]);
    const current = {
      title: d.title,
      description: d.description ?? '',
      channel: d.author?.name ?? '',
      channelUrl: d.author?.channel_url ?? '',
      publishDate: d.publishDate ?? '',
      viewCount: d.viewCount ?? '0',
      duration: d.lengthSeconds,
      thumbnail: d.thumbnails?.at(-1)?.url ?? '',
      keywords,
      hashtags: [...hashtagSet],
      videoId: d.videoId,
    };
    const prompt = `You are a YouTube SEO expert. Analyze this video metadata and return ONLY valid JSON.

Title: ${current.title}
Channel: ${current.channel}
Views: ${parseInt(current.viewCount, 10).toLocaleString()}
Description: ${current.description || '(none)'}
Keywords: ${keywords.join(', ') || '(none)'}
Hashtags: ${[...hashtagSet].join(' ') || '(none)'}

Return this exact JSON (no markdown, no extra text):
{"title":"optimized title max 70 chars","titleRationale":"explanation","description":"full optimized description 800-2000 chars","descriptionRationale":"explanation","keywords":["keyword1","keyword2"],"keywordsRationale":"explanation","hashtags":["#tag1","#tag2"],"hashtagsRationale":"explanation","overallAnalysis":"2-3 sentence summary"}`;
    const stream = anthropic.messages.stream({
      model: 'claude-opus-4-7',
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      system: 'You are a YouTube SEO expert. Respond with valid JSON only, no markdown.',
      messages: [{ role: 'user', content: prompt }],
    });
    const response = await stream.finalMessage();
    const textBlock = response.content.find(b => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') throw new Error('No text response from AI');
    const json = textBlock.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const recommendations = JSON.parse(json);
    return new Response(JSON.stringify({ current, recommendations }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Failed to fetch video info' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
