import Anthropic from '@anthropic-ai/sdk';

/**
 * X counts every URL as 23 characters no matter how long it is.
 */
export function xLength(text) {
  return text.replace(/https?:\/\/\S+/g, 'x'.repeat(23)).length;
}

/** Check generated text against the rules. Returns a list of problems. */
export function validate(out, platforms, rules) {
  const problems = [];
  const banned = (rules.banned_phrases || []).map((p) => p.toLowerCase());
  const hit = (text) => banned.find((b) => text.toLowerCase().includes(b));

  if (platforms.has('x')) {
    if (!Array.isArray(out.x) || out.x.length < 1 || out.x.length > 8) {
      problems.push('x must be an array of 1-8 posts');
    } else {
      out.x.forEach((t, i) => {
        if (typeof t !== 'string') return problems.push(`x[${i}] is not text`);
        if (xLength(t) > (rules.x_max_chars ?? 280))
          problems.push(`x post ${i + 1} is ${xLength(t)} characters (max ${rules.x_max_chars ?? 280})`);
        if ((t.match(/#\w+/g) || []).length > (rules.x_max_hashtags ?? 2))
          problems.push(`x post ${i + 1} has too many hashtags`);
        const b = hit(t);
        if (b) problems.push(`x post ${i + 1} uses banned phrase "${b}"`);
      });
    }
  }
  if (platforms.has('linkedin')) {
    if (typeof out.linkedin !== 'string' || !out.linkedin.trim()) {
      problems.push('linkedin must be text');
    } else {
      const words = out.linkedin.trim().split(/\s+/).length;
      const [lo, hi] = rules.linkedin_words ?? [110, 230];
      if (words < lo * 0.8 || words > hi * 1.2) problems.push(`linkedin is ${words} words (target ${lo}-${hi})`);
      if (out.linkedin.length > 2900) problems.push('linkedin is longer than 2900 characters');
      const b = hit(out.linkedin);
      if (b) problems.push(`linkedin uses banned phrase "${b}"`);
    }
  }
  return problems;
}

function extractJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < 0) throw new Error('Model did not return JSON');
  return JSON.parse(text.slice(start, end + 1));
}

function buildPrompt(site, article, platforms, rules, linkPlacement) {
  const parts = [];
  if (platforms.has('x')) {
    parts.push(
      `"x": array of 3-6 short posts forming a thread. Rules: the first post must stand alone as a strong hook (a claim, a number or a surprising fact, no wind-up). Each post under ${rules.x_max_chars} characters. The LAST post ends with the article link on its own line: ${article.url}. At most ${rules.x_max_hashtags} hashtags in total, usually none. No "1/" numbering, no "thread" wording.`
    );
  }
  if (platforms.has('linkedin')) {
    const [lo, hi] = rules.linkedin_words;
    parts.push(
      `"linkedin": one post of ${lo}-${hi} words. A hook line first, then short 1-2 line paragraphs, 3-5 concrete takeaways, and one closing line or question. ${
        linkPlacement === 'body'
          ? `Include the link ${article.url} near the end.`
          : 'Do NOT put any link in the post (it will be added as the first comment).'
      } No hashtag stuffing (0-3 at the very end at most).`
    );
  }
  return `You turn website articles into social posts that sound like the author wrote them.

AUTHOR VOICE: ${site.voice}

STYLE RULES: Lead with a claim or specific detail, not a wind-up. Use real specifics from the article only; never invent facts, numbers or quotes. Plain words. No emoji spam (one at most). Never use these phrases: ${rules.banned_phrases.join(', ')}.

ARTICLE
Title: ${article.title}
Summary: ${article.description}
Text: ${article.text}

Return ONLY a JSON object with these keys:
${parts.join('\n')}
"angle": one sentence saying what angle you took (for the reviewer).`;
}

/**
 * Produce platform posts for one article. Retries once if validation fails.
 * Returns { x?, linkedin?, angle, problems: string[] }.
 */
export async function generateForArticle(site, article, platforms, config, apiKey) {
  const rules = config.rules;
  const linkPlacement =
    Object.values(config.accounts).find((a) => a.platform === 'linkedin')?.link_placement ?? 'comment';

  if (process.env.MOCK_LLM === '1') {
    const out = {
      x: [`Mock hook about: ${article.title}`.slice(0, 200), `Read more: ${article.url}`],
      linkedin: Array.from({ length: 130 }, (_, i) => `word${i}`).join(' '),
      angle: 'mock output for testing',
    };
    return { ...out, problems: validate(out, platforms, rules) };
  }

  const client = new Anthropic({ apiKey });
  let prompt = buildPrompt(site, article, platforms, rules, linkPlacement);
  let out;
  let problems = [];
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await client.messages.create({
      model: config.model,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = res.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
    try {
      out = extractJson(text);
      problems = validate(out, platforms, rules);
    } catch (e) {
      problems = [e.message];
    }
    if (problems.length === 0) break;
    prompt += `\n\nYour previous answer had these problems, fix them and return the full JSON again:\n- ${problems.join('\n- ')}`;
  }
  return { ...(out || {}), angle: out?.angle || '', problems };
}
