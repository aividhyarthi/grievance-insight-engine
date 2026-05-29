import Anthropic from '@anthropic-ai/sdk';

const stripHtml = (html) =>
  String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Pull the author's recent blog posts from the WordPress REST API so the model
 * can mirror their real writing voice. Returns a compact reference string, or
 * '' if disabled or the fetch fails (e.g. firewalled local runs).
 */
export async function fetchVoiceReference(config) {
  const src = config.voice_source;
  if (!src?.wp_api) return '';
  const n = src.sample_count ?? 6;
  const url = `${src.wp_api}?per_page=${n}&_fields=title,excerpt,content`;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'x-growth-engine/0.1 (+voice-reference)' },
    });
    clearTimeout(t);
    if (!res.ok) return '';
    const posts = await res.json();
    return posts
      .map((p) => {
        const title = stripHtml(p.title?.rendered || '');
        const body = stripHtml(p.content?.rendered || p.excerpt?.rendered || '').slice(0, 900);
        return `• ${title}\n  ${body}`;
      })
      .join('\n\n')
      .slice(0, 9000);
  } catch {
    return '';
  }
}

/**
 * Generate a batch of X posts across the configured lanes (AI + Politics),
 * in the author's voice, optimized for AEO/SEO. Returns an array of post
 * objects: { lane, kind: 'single'|'thread', tweets: string[], rationale }.
 *
 * The model writes ONLY within the stances/pillars defined in config.json.
 * It is explicitly instructed never to invent political positions.
 */
export async function generatePosts(config, { count, apiKey, freshness = '' } = {}) {
  const client = new Anthropic({ apiKey });
  const n = count ?? config.cadence?.posts_per_run ?? 3;

  const banned = (config.banned_phrases || []).map((p) => `"${p}"`).join(', ');
  const maxChars = config.cadence?.max_chars ?? 280;

  const voiceRef = await fetchVoiceReference(config);

  const prompt = `You are a ghostwriter for ${config.author} (${config.handle}) on X (Twitter).
Write posts that sound exactly like this person — never like an AI or a brand account.

══ WHO THEY ARE ══
${config.bio}

══ VOICE ══
${config.voice.summary}
DO: ${config.voice.do.join(' | ')}
DON'T: ${config.voice.dont.join(' | ')}
NEVER use these phrases: ${banned}
${voiceRef ? `\n══ THE AUTHOR'S ACTUAL WRITING (mirror this voice — rhythm, word choice, how they make a point) ══\n${voiceRef}\n` : ''}

══ LANES (write a mix across these) ══
AI (${Math.round((config.lanes.ai.weight || 0.5) * 100)}% of posts): ${config.lanes.ai.description}
  Pillars: ${config.lanes.ai.pillars.join('; ')}

POLITICS (${Math.round((config.lanes.politics.weight || 0.5) * 100)}% of posts): ${config.lanes.politics.description}
  Pillars: ${config.lanes.politics.pillars.join('; ')}
  THE ONLY positions you may express (do not add, soften, or invent others):
    ${config.lanes.politics.stances.map((s) => '- ' + s).join('\n    ')}
  OFF LIMITS — never write any of these: ${config.lanes.politics.off_limits.join('; ')}

CRITICAL: If a Politics pillar or stance still says "FILL ME", DO NOT write any
political posts at all. Generate only AI-lane posts and note this in the rationale.
Never fabricate a political opinion the author has not stated.

══ AEO / SEO (Answer Engine Optimization) ══
${config.aeo.summary}
${config.aeo.rules.map((r) => '- ' + r).join('\n')}

══ FORMAT RULES ══
- Each single post <= ${maxChars} characters.
- Threads allowed${config.cadence?.allow_threads ? '' : ' = NO'}: max ${config.cadence?.max_thread_tweets ?? 5} tweets, each <= ${maxChars} chars. Only use a thread when one tweet genuinely cannot hold the idea.
- 0-2 hashtags total, only if they are real active communities.
- At most one emoji, only if it earns its place.
${freshness ? `\n══ TODAY'S CONTEXT (optional anchors — use only if genuinely relevant) ══\n${freshness}\n` : ''}
══ TASK ══
Write ${n} distinct, ready-to-publish posts. No two should cover the same idea.

Return ONLY a valid JSON array, no prose, no markdown fences:
[
  {
    "lane": "ai" | "politics",
    "kind": "single" | "thread",
    "tweets": ["full text of tweet 1", "tweet 2 if thread", ...],
    "rationale": "one line: why this lands + which AEO hook it uses"
  }
]`;

  const msg = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = msg.content[0]?.type === 'text' ? msg.content[0].text : '';
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('Model did not return a JSON array. Raw:\n' + raw.slice(0, 500));

  let posts;
  try {
    posts = JSON.parse(match[0]);
  } catch (e) {
    throw new Error('Failed to parse model output as JSON: ' + e.message);
  }

  // Enforce char limits defensively.
  for (const p of posts) {
    p.tweets = (p.tweets || []).map((t) => String(t).trim()).filter(Boolean);
    const over = p.tweets.find((t) => t.length > maxChars);
    if (over) {
      throw new Error(`A tweet exceeds ${maxChars} chars (${over.length}): ${over.slice(0, 80)}…`);
    }
  }
  return posts;
}
