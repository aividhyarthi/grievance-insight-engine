import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const { url } = body;
  if (!url?.trim()) {
    return new Response(JSON.stringify({ error: 'URL is required.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 9000);
    const res = await fetch(url.trim(), {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ContentBot/1.0)' },
    });
    clearTimeout(t);

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Page returned ${res.status}. Cannot fetch this URL.` }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const html = await res.text();

    // Extract page title
    const titleMatch = html.match(/<title[^>]*>([^<]{1,120})<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Extract meta description
    const metaMatch =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{1,300})["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']{1,300})["'][^>]+name=["']description["']/i);
    const metaDesc = metaMatch ? metaMatch[1].trim() : '';

    // Extract readable body text
    const bodyText = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
      .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
      .replace(/<header[\s\S]*?<\/header>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .slice(0, 500);

    return new Response(
      JSON.stringify({ success: true, title, metaDesc, preview: bodyText }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    const friendly = msg.includes('abort')
      ? 'Request timed out — the page took too long to respond.'
      : 'Could not fetch this URL. The site may be blocking bots.';
    return new Response(JSON.stringify({ error: friendly }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  }
};
