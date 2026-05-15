import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { topic?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { topic } = body;
  if (!topic || !topic.trim()) {
    return new Response(JSON.stringify({ error: 'Topic is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const prompt = `You are an expert NEET chemistry teacher. A student is preparing for NEET and wants to truly UNDERSTAND "${topic.trim()}" — not memorise it, but understand it so deeply that they can answer any exam question by thinking, not recalling.

Return a JSON object with exactly these keys:

{
  "concept": "In 2-3 plain sentences: what is this concept? Use simple words a 17-year-old can grasp instantly.",
  "why_it_works": "2-3 sentences explaining the deep 'why' behind it. What's the underlying principle that makes it true? This is the insight that makes everything click.",
  "analogy": "One vivid, relatable analogy from everyday life (food, cricket, traffic, household items — things an Indian student sees daily). Make it stick.",
  "exam_thinking": "How should the student THINK when they see a NEET question on this topic? Give a 3-4 step mental process: 'Step 1: Ask yourself... Step 2: Notice... Step 3: Therefore...'. This replaces memorisation with reasoning.",
  "neet_example": {
    "question": "One realistic NEET-style MCQ on this topic (with 4 options labeled A, B, C, D)",
    "answer": "The correct option letter",
    "explanation": "2-3 sentences explaining WHY that answer is correct, using the concept — not just stating the fact"
  },
  "misconceptions": ["Common mistake students make #1", "Common mistake #2"],
  "memory_hook": "One short, clever hook (a pattern, a mnemonic trick, or a one-liner) that captures the ESSENCE of the concept — the kind of thing a student would never forget once they see it."
}

Rules:
- Write like you're talking to a smart but nervous student, not a textbook
- Every sentence should build understanding, not add things to remember
- The analogy must be from Indian daily life
- Return ONLY valid JSON, no markdown, no explanation outside the JSON`;

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: 'Unexpected response from AI. Please try again.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const guide = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ guide }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: `Could not generate guide: ${msg}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
