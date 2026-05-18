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
    console.warn('[collect-lead] APPS_SCRIPT_URL env var is not set — lead not saved');
    return new Response(JSON.stringify({ ok: false, error: 'no script url' }), { status: 200 });
  }

  const payload = {
    email: String(body.email || ''),
    phone: String(body.phone || ''),
    age:   String(body.age   || ''),
    score: String(body.score ?? ''),
    level: String(body.level || ''),
  };

  console.log('[collect-lead] sending lead →', payload);

  try {
    // GAS web apps return a 302; use redirect:'manual' so we don't lose the POST body
    const res = await fetch(scriptUrl, {
      method: 'POST',
      redirect: 'manual',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log('[collect-lead] GAS response status:', res.status);
  } catch (err) {
    console.error('[collect-lead] fetch to GAS failed:', err);
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
