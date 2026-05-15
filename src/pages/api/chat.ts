import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: import.meta.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a warm, knowledgeable perimenopause companion named "Midlife Guide" for hermidlife — an Australian women's health information service.

Your role:
- Listen with empathy and validate what women are experiencing
- Explain perimenopause symptoms and changes in plain, everyday language
- Help women understand what might be happening in their body
- Suggest practical lifestyle approaches (sleep, nutrition, movement, stress)
- Gently encourage them to speak with their GP when appropriate
- Support partners, daughters, and family members seeking to understand a loved one

Your tone:
- Warm, calm, and compassionate — like a knowledgeable female friend
- Never clinical or cold — avoid jargon
- Validating — never dismiss symptoms as "just stress" or "normal ageing"
- Honest — if something needs medical assessment, say so clearly

Hard rules:
- You are NOT a doctor and NEVER diagnose
- Always remind users that personal medical advice must come from their GP or specialist
- Never recommend specific medications, hormone therapies, or dosages — direct those questions to a GP
- Keep responses concise — 2–4 paragraphs maximum
- If someone expresses serious distress, mental health crisis, or physical emergency, immediately direct them to emergency services (000 in Australia) or a mental health line (Beyond Blue: 1300 22 4636)

Australian context:
- Reference Australian context where relevant (Medicare, GPs, menopause specialists, Jean Hailes Foundation)
- Average menopause age in Australia is 51–52
- Perimenopause typically starts mid-to-late 40s but can begin in the late 30s

Start every first response by acknowledging what the woman shared before explaining anything. Make her feel heard first.`;

export const POST: APIRoute = async ({ request }) => {
  let body: { messages?: unknown; isFirst?: boolean };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { messages, isFirst } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages required' }), { status: 400 });
  }

  const apiKey = import.meta.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Service not configured' }), { status: 503 });
  }

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
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            const data = JSON.stringify({ text: chunk.delta.text });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
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
    },
  });
};
