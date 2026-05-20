import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';

const TONES = [
  'conversational and direct — write like a knowledgeable friend who genuinely understands this topic and explains it clearly without talking down to the reader',
  'confident and authoritative — write like a seasoned industry professional who cuts straight to what matters, no filler, no hedging',
  'warm and helpful — write like a trusted advisor who wants the reader to leave this page genuinely better informed and able to act',
  'practical and analytical — write like someone whose job is to give the reader exactly what they need and nothing they do not',
];

const OPENINGS = [
  'Begin by naming a specific frustration, mistake, or problem your reader is likely dealing with right now — make them feel understood immediately.',
  'Begin with one concrete, specific fact, real number, or grounded observation that earns the reader\'s attention and sets the context for everything that follows.',
  'Begin by telling the reader in plain terms exactly what this page covers and what they will be able to do or decide after reading it.',
  'Begin with the single most important thing a reader must understand about this topic — the insight that reframes how they will think about everything else.',
];

const STRUCTURES = [
  'Write in short, punchy paragraphs — 2 to 3 sentences each. Mix bullet lists and prose freely. Make every section easy to scan at a glance.',
  'Write in fuller paragraphs of 3 to 5 sentences. Build ideas properly. Use tables for anything comparative. Reserve bullet lists for genuine list content only.',
  'Follow a logical, step-by-step flow through the topic. Numbered lists for sequential steps. Bullet lists for features and benefits. Vary paragraph length naturally.',
  'Write information-dense paragraphs where every sentence earns its place. Use formatting only when it genuinely helps comprehension — not to pad the page.',
];

const H2_STARTER_SETS = [
  ['What', 'How', 'Why', 'When', 'Which'],
  ['The', 'Your', 'Key', 'Core', 'Real'],
  ['Understanding', 'Choosing', 'Getting', 'Finding', 'Making'],
  ['Everything About', 'What You Need to Know', 'Getting the Most From', 'Breaking Down', 'Making Sense of'],
];

const BANNED_PHRASES = [
  "In today's fast-paced world",
  "Look no further",
  "game-changer",
  "dive into",
  "delve into",
  "It's important to note",
  "leverage",
  "seamlessly",
  "cutting-edge",
  "state-of-the-art",
  "In conclusion",
  "To summarize",
  "In summary",
  "With that said",
  "Having said that",
  "It goes without saying",
  "plays a crucial role",
  "a wide range of",
  "a variety of options",
  "at the end of the day",
  "when it comes to",
  "the fact of the matter",
  "needless to say",
];

async function tryFetchUrl(url: string): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ContentBot/1.0)' },
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const html = await res.text();
    const clean = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
      .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
      .replace(/<header[\s\S]*?<\/header>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .slice(0, 2800);
    return clean.length > 100 ? clean : null;
  } catch {
    return null;
  }
}

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured on this server.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: {
    url?: string;
    keywords?: string;
    semrushData?: string;
    contentBrief?: string;
    wordCount?: string;
  };

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { url, keywords, semrushData, contentBrief, wordCount = '900-1200' } = body;

  if (!keywords?.trim() && !contentBrief?.trim()) {
    return new Response(JSON.stringify({ error: 'Add at least keywords or a content brief to generate content.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let urlRef: string | null = null;
  if (url?.trim()) {
    urlRef = await tryFetchUrl(url.trim());
  }

  const seed = Date.now();
  const pick = <T>(arr: T[], div: number): T => arr[Math.floor(seed / div) % arr.length];

  const tone       = pick(TONES, 1);
  const opening    = pick(OPENINGS, 7);
  const structure  = pick(STRUCTURES, 19);
  const h2starters = H2_STARTER_SETS[Math.floor(seed / 37) % H2_STARTER_SETS.length];
  const styleId    = `Style-${seed % 4 + 1}${Math.floor(seed / 7) % 4 + 1}${Math.floor(seed / 19) % 4 + 1}`;
  const bannedStr  = BANNED_PHRASES.map(p => `"${p}"`).join(', ');

  const prompt = `You are an experienced human content editor. Your job is to write a web page that reads like a real person wrote it — not an AI assistant.

══ THIS PAGE'S WRITING PROFILE ══
Tone: ${tone}
Opening approach: ${opening}
Structure: ${structure}
H2 section starters to use (choose different ones, never repeat): ${h2starters.join(', ')}
Target word count: ${wordCount} words

BANNED — never use any of these phrases: ${bannedStr}

Additional writing rules:
- Never start two consecutive paragraphs with the same word
- Never use "Additionally" or "Furthermore" more than once in the entire piece
- Vary sentence length throughout — mix short, medium, and longer sentences naturally
- Write specifically about this topic, not generically — use the input data to be precise
- Avoid repetition of any keyword more than naturally necessary
- If no FAQ questions are provided, create 5 to 7 relevant ones based on the topic

══ INPUT DATA ══
${keywords?.trim() ? `KEYWORDS (weave these in naturally — do not keyword-stuff):\n${keywords.trim()}\n\n` : ''}${semrushData?.trim() ? `SEMRUSH / LLM PROMPTS DATA — FAQs, People Also Ask, ChatGPT prompts (use ALL of these as FAQ questions at the bottom of the page):\n${semrushData.trim()}\n\n` : ''}${contentBrief?.trim() ? `CONTENT BRIEF — Product or Category Details, Key Info, USPs, Target Audience:\n${contentBrief.trim()}\n\n` : ''}${urlRef ? `REFERENCE URL CONTENT (use only as context — understand what exists, do not copy):\n${urlRef.trim()}\n\n` : ''}
══ OUTPUT FORMAT ══
Return ONLY a valid JSON object. No text before it. No text after it. No markdown fences.

{
  "title": "The H1 title (keyword-rich, under 65 characters, specific not generic)",
  "metaDescription": "SEO meta description between 148 and 158 characters exactly",
  "html": "COMPLETE page content as HTML — use ONLY these tags: h1 h2 h3 p ul ol li table thead tbody tr th td strong em — end with an FAQ section — do NOT use div, span, class, id, or any attributes",
  "wordCount": 1050,
  "headingsCount": 8,
  "faqCount": 6
}

HTML content requirements:
1. Exactly one H1 (the title)
2. Four to seven H2 sections covering the topic from different angles
3. H3 sub-sections only where they genuinely add structure
4. At least one table where comparison, specifications, or structured data makes sense
5. Bullet or numbered lists where listing three or more parallel items
6. Final section: H2 "Frequently Asked Questions" followed by H3 for each question and P for the answer (two to four sentences per answer minimum)
7. Content must read like a human editor wrote it for a real audience`;

  const client = new Anthropic({ apiKey });

  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw   = msg.content[0].type === 'text' ? msg.content[0].text : '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return new Response(JSON.stringify({ error: 'Unexpected AI response format. Please try again.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let result: {
      title?: string;
      metaDescription?: string;
      html?: string;
      wordCount?: number;
      headingsCount?: number;
      faqCount?: number;
    };

    try {
      result = JSON.parse(match[0]);
    } catch {
      return new Response(JSON.stringify({ error: 'Failed to parse AI output. Please try again.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ success: true, content: result, styleId, urlFetched: !!urlRef }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: `Generation failed: ${errMsg}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
