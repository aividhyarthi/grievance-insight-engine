import { defineMiddleware } from 'astro:middleware';

const CANONICAL_HOST = 'www.thesecondspring.org';

export const onRequest = defineMiddleware(({ request }, next) => {
  const url = new URL(request.url);

  // In local development, skip redirect
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return next();
  }

  // Railway terminates TLS at the edge — use x-forwarded headers
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const forwardedHost =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    url.hostname;

  // Strip port if present (e.g. "thesecondspring.org:443")
  const host = forwardedHost.split(':')[0];
  const proto = forwardedProto.split(',')[0].trim(); // may be comma-separated

  const needsWww  = host !== CANONICAL_HOST;
  const needsHttps = proto !== 'https';

  if (needsWww || needsHttps) {
    const canonical = `https://${CANONICAL_HOST}${url.pathname}${url.search}`;
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
