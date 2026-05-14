import type { APIRoute } from 'astro';
import ytdl from '@distube/ytdl-core';

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

    // Extract hashtags from title + description
    const rawText = `${details.title} ${details.description ?? ''}`;
    const hashtagSet = new Set<string>();
    const hashtagRegex = /#[\w-￿]+/g;
    for (const match of rawText.matchAll(hashtagRegex)) {
      hashtagSet.add(match[0]);
    }

    // Also treat keywords as potential hashtags (for the copy-paste convenience)
    const suggestedHashtags = keywords.slice(0, 15).map((kw) => `#${kw.replace(/\s+/g, '')}`);

    const metadata = {
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
      suggestedHashtags,
      videoId: details.videoId,
    };

    return new Response(JSON.stringify(metadata), {
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
