import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatePosts } from './generate.mjs';
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

  log(`Generating posts… (mode: ${dryRun ? 'DRY RUN / review' : 'LIVE publish'})`);
  const posts = await generatePosts(config, {
    count,
    apiKey,
    freshness: process.env.FRESHNESS || '',
  });
  log(`Generated ${posts.length} post(s).`);

  // Always write a reviewable artifact.
  fs.mkdirSync(path.join(root, 'output'), { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outFile = path.join(root, 'output', `posts-${stamp}.json`);
  fs.writeFileSync(outFile, JSON.stringify({ generatedAt: stamp, posts }, null, 2));

  // Human-readable preview.
  for (const [i, p] of posts.entries()) {
    console.log(`\n── #${i + 1} [${p.lane}] (${p.kind}) ───────────────────────────`);
    p.tweets.forEach((t, j) => console.log(p.tweets.length > 1 ? `  ${j + 1}/${p.tweets.length} ${t}` : `  ${t}`));
    if (p.rationale) console.log(`  ↳ ${p.rationale}`);
  }
  log(`\nSaved review file: ${path.relative(root, outFile)}`);

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
