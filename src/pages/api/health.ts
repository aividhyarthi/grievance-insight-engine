import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const hasKey = !!(process.env.ANTHROPIC_API_KEY);
  return new Response(JSON.stringify({
    status: 'ok',
    version: 'v2-claude-api',
    hasAnthropicKey: hasKey,
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
