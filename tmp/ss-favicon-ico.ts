export const prerender = false;

export async function GET() {
  return new Response(null, {
    status: 301,
    headers: {
      Location: '/favicon.svg',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}
