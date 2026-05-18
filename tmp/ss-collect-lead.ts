import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const scriptUrl = process.env.APPS_SCRIPT_URL;

    if (scriptUrl) {
      await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: body.email || '',
          phone: body.phone || '',
          age:   body.age   || '',
          score: body.score ?? '',
          level: body.level || '',
        }),
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 200 });
  }
};
