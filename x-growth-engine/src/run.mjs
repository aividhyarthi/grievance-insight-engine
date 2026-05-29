import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatePosts, fetchVoiceReference } from './generate.mjs';
import { fetchNews } from './news.mjs';
import { credsFromEnv, publishPost } from './xClient.mjs';

/**
 * Orchestrator: generate posts → (review or publish).
 *
 * Modes (env DRY_RUN):
 *   DRY_RUN=true  (default) — generate only, write to output/, publish nothing.
 *   DRY_RUN=false           — actually publish to X. Requires X_* credentials.
 *
 * Env:
 *   ANTHROPIC_API_KEY  (required to generate)
 *   POSTS_PER_RUN      (optional, overrides config)
 *   FRESHNESS          (optional free text: today's news/topics to anchor to)
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function log(...args) {
  console.log('[x-growth]', ...args);
}

async function main() {
  const dryRun = String(process.env.DRY_RUN ?? 'true').toLowerCase() !== 'false';
  // Strip any stray whitespace/newlines — a secret pasted with line breaks
  // produces an invalid HTTP header and fails the whole run.
  const apiKey = (process.env.ANTHROPIC_API_KEY || '').replace(/\s/g, '');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set — cannot generate posts.');

  const config = JSON.parse(fs.readFileSync(path.join(root, 'config.json'), 'utf8'));
  const count = process.env.POSTS_PER_RUN ? Number(process.env.POSTS_PER_RUN) : undefined;

  // Gather inputs first so we can log and save them for review/diagnostics.
  log('Fetching blog voice + live AI news…');
  const [voiceRef, news] = await Promise.all([fetchVoiceReference(config), fetchNews(config)]);
  const newsHeadlines = news ? news.split('\n').filter(Boolean) : [];
  log(`Voice reference: ${voiceRef ? voiceRef.length + ' chars' : 'none'}. News headlines: ${newsHeadlines.length}.`);
  if (newsHeadlines.length) newsHeadlines.forEach((h) => console.log(`    ${h}`));

  log(`Generating posts… (mode: ${dryRun ? 'DRY RUN / review' : 'LIVE publish'})`);
  const posts = await generatePosts(config, {
    count,
    apiKey,
    voiceRef,
    news,
    freshness: process.env.FRESHNESS || '',
  });
  log(`Generated ${posts.length} post(s).`);

  // Always write a reviewable artifact (includes the news the model was given).
  fs.mkdirSync(path.join(root, 'output'), { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outFile = path.join(root, 'output', `posts-${stamp}.json`);
  fs.writeFileSync(
    outFile,
    JSON.stringify({ generatedAt: stamp, newsHeadlines, voiceReferenceChars: voiceRef.length, posts }, null, 2)
  );

  // Human-readable preview.
  for (const [i, p] of posts.entries()) {
    console.log(`\n── #${i + 1} [${p.lane}] (${p.kind}) ───────────────────────────`);
    p.tweets.forEach((t, j) => console.log(p.tweets.length > 1 ? `  ${j + 1}/${p.tweets.length} ${t}` : `  ${t}`));
    if (p.rationale) console.log(`  ↳ ${p.rationale}`);
  }
  log(`\nSaved review file: ${path.relative(root, outFile)}`);

  // Render the posts as a formatted summary on the GitHub Actions run page,
  // so they're readable without downloading the artifact.
  if (process.env.GITHUB_STEP_SUMMARY) {
    const md = [];
    md.push(`## 📝 ${posts.length} posts ${dryRun ? '(review only — nothing published)' : '(PUBLISHED to X)'}`);
    md.push(`Generated ${stamp} · ${newsHeadlines.length} live news headlines used\n`);
    for (const [i, p] of posts.entries()) {
      md.push(`### ${i + 1}. ${p.lane.toUpperCase()} — ${p.kind}`);
      if (p.tweets.length > 1) {
        p.tweets.forEach((t, j) => md.push(`> **${j + 1}/${p.tweets.length}** ${t}\n>`));
      } else {
        md.push(`> ${p.tweets[0]}`);
      }
      if (p.rationale) md.push(`\n_why: ${p.rationale}_\n`);
    }
    if (newsHeadlines.length) {
      md.push(`\n<details><summary>News headlines fed in</summary>\n`);
      newsHeadlines.forEach((h) => md.push(h));
      md.push(`</details>`);
    }
    try {
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md.join('\n') + '\n');
    } catch {
      /* non-fatal */
    }
  }

  if (dryRun) {
    log('DRY RUN — nothing published. Review the file above, then run with DRY_RUN=false to publish.');
    return;
  }

  const { creds, missing } = credsFromEnv();
  if (missing.length) {
    throw new Error(
      `LIVE publish requested but missing X credentials: ${missing.join(', ')}. ` +
        'Add them as secrets, or run in DRY_RUN mode.'
    );
  }

  log('Publishing to X…');
  for (const [i, p] of posts.entries()) {
    try {
      const ids = await publishPost(p, creds);
      log(`Published #${i + 1} [${p.lane}] → ${ids.map((id) => `https://x.com/i/web/status/${id}`).join(' ')}`);
    } catch (e) {
      log(`FAILED #${i + 1} [${p.lane}]: ${e.message}`);
    }
    // Space posts out a little so they don't all land in the same second.
    if (i < posts.length - 1) await new Promise((r) => setTimeout(r, 5000));
  }
  log('Done.');
}

main().catch((e) => {
  console.error('[x-growth] FATAL:', e.message);
  process.exit(1);
});
