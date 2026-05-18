import type { APIRoute } from 'astro';

// Confirmed working Apps Script URL — update APPS_SCRIPT_URL env var to override
const FALLBACK_URL = 'https://script.google.com/macros/s/AKfycbxQyTXS8mPCNfTbv1FRzq2gzHFE0FDetR4H0eZtx3jUWbRBxuWyvTj-9TEfCbzDXhjU8Q/exec';

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown> = {};
  try { body = await request.json(); } catch { /* ignore */ }

  const scriptUrl = process.env.APPS_SCRIPT_URL || FALLBACK_URL;

  const url = new URL(scriptUrl);
  url.searchParams.set('email', String(body.email || ''));
  url.searchParams.set('phone', String(body.phone || ''));
  url.searchParams.set('age',   String(body.age   || ''));
  url.searchParams.set('score', String(body.score ?? ''));
  url.searchParams.set('level', String(body.level || ''));

  console.log('[collect-lead] →', url.search);

  try {
    const res = await fetch(url.toString(), { method: 'GET' });
    const text = await res.text().catch(() => '');
    console.log('[collect-lead] GAS:', res.status, text);
  } catch (err) {
    console.error('[collect-lead] failed:', err);
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
