import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(({ request }, next) => {
  // Only redirect the specific non-www domain to www.
  // Everything else (Railway healthchecks, internal requests, www traffic) passes through.
  const host =
    (request.headers.get('x-forwarded-host') || request.headers.get('host') || '')
      .split(':')[0]
      .trim();

  if (host === 'thesecondspring.org') {
    const url = new URL(request.url);
    const canonical = `https://www.thesecondspring.org${url.pathname}${url.search}`;
    return new Response(null, {
      status: 301,
      headers: {
        Location: canonical,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  }

  return next();
});
