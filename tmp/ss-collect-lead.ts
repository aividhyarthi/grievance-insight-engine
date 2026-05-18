import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'bad json' }), { status: 400 });
  }

  const scriptUrl = process.env.APPS_SCRIPT_URL;

  if (!scriptUrl) {
    console.warn('[collect-lead] APPS_SCRIPT_URL is not set');
    return new Response(JSON.stringify({ ok: false, error: 'no script url' }), { status: 200 });
  }

  // Send as GET query params — reliable with GAS (POST body gets dropped on redirect)
  const url = new URL(scriptUrl);
  url.searchParams.set('email', String(body.email || ''));
  url.searchParams.set('phone', String(body.phone || ''));
  url.searchParams.set('age',   String(body.age   || ''));
  url.searchParams.set('score', String(body.score ?? ''));
  url.searchParams.set('level', String(body.level || ''));

  console.log('[collect-lead] sending →', url.search);

  try {
    const res = await fetch(url.toString(), { method: 'GET' });
    console.log('[collect-lead] GAS status:', res.status);
    const text = await res.text().catch(() => '');
    console.log('[collect-lead] GAS response:', text);
  } catch (err) {
    console.error('[collect-lead] fetch failed:', err);
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
