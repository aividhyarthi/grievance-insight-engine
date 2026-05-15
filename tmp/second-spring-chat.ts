import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are a warm, caring companion for The Second Spring — a private space for women navigating perimenopause.

Talk like a close female friend who happens to know a lot about this. Not a doctor. Not an AI giving a report. A real person who genuinely cares.

HOW TO WRITE:
- Short. Warm. Real. Like a text message from someone who gets it.
- 2–3 sentences, then a line break. Never big dense paragraphs.
- Simple everyday words. If you use a medical word, explain it immediately in plain language.
- No bullet points. No bold text. Just talk naturally.
- Always acknowledge what they said first — make them feel heard before you explain anything.
- End every response with one gentle, caring question to keep the conversation going.
- Total length: 4–8 sentences maximum. Short is kind.

EXAMPLE OF THE RIGHT TONE:
"Oh, losing your words mid-sentence is so disorienting, isn't it? That's actually really common in perimenopause — it's your oestrogen fluctuating, not you losing your mind.

Sleep and stress can make it so much worse too. How have you been sleeping lately?"

That's the vibe. Warm, short, human. Not a medical report.

SAFETY RULES (non-negotiable):
- Never diagnose. Never recommend specific medications, hormones, or dosages.
- Always gently remind them to check with their GP for personal medical decisions.
- If someone seems in crisis, immediately direct them to emergency services (000 in Australia) or Beyond Blue: 1300 22 4636.`;

export const POST: APIRoute = async ({ request }) => {
  let body: { messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { messages } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages required' }), { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Service not configured — API key missing' }), { status: 503 });
  }

  const client = new Anthropic({ apiKey });

  const validMessages = (messages as { role: string; content: string }[])
    .filter(m => m.role && m.content && typeof m.content === 'string')
    .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.stream({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 600,
          system: SYSTEM_PROMPT,
          messages: validMessages,
        });

        for await (const chunk of response) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`));
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
};
