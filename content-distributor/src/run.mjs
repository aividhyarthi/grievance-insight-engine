import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listArticles, fetchArticle } from './discover.mjs';
import { generateForArticle } from './generate.mjs';
import { publish } from './publishers.mjs';

/**
 * MODE (environment variable):
 *   config  (default) each site uses its own "mode" from config.json
 *   review  find new articles, write drafts, publish nothing
 *   auto    find new articles, write drafts AND publish them right away
 *   publish publish drafts that are already saved (after you reviewed/edited them)
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const root = path.resolve(__dirname, '..');
const draftsDir = path.join(root, 'drafts');
const statePath = path.join(root, 'state.json');

const log = (...a) => console.log('[distributor]', ...a);
const summary = [];
const note = (line) => {
  summary.push(line);
  console.log(line);
};

const slugOf = (url) => {
  const p = new URL(url).pathname.replace(/\/+$/, '').split('/').filter(Boolean).join('-');
  return (p || 'page').replace(/[^a-z0-9-]/gi, '-').toLowerCase().slice(0, 80);
};

function loadJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}
const saveJson = (file, data) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
};

function platformsFor(site, config) {
  const set = new Set();
  for (const id of site.post_to) {
    const acct = config.accounts[id];
    if (!acct) throw new Error(`Site "${site.id}" posts to unknown account "${id}"`);
    set.add(acct.platform);
  }
  return set;
}

/** Turn model output into one draft entry per account. */
function buildEntries(site, article, out, config) {
  const posts = {};
  const problems = out.problems || [];
  for (const id of site.post_to) {
    const acct = config.accounts[id];
    const base = { platform: acct.platform, status: problems.length ? 'needs_edit' : 'draft', problems };
    if (acct.platform === 'x') posts[id] = { ...base, tweets: out.x || [] };
    if (acct.platform === 'linkedin') {
      posts[id] = {
        ...base,
        text: out.linkedin || '',
        comment: (acct.link_placement ?? 'comment') === 'comment' ? `Full article: ${article.url}` : '',
      };
    }
  }
  return posts;
}

async function publishDraft(file, draft, config, onlyIds = null) {
  let changed = false;
  for (const [accId, entry] of Object.entries(draft.posts)) {
    if (onlyIds && !onlyIds.includes(accId)) continue;
    if (entry.status !== 'draft') continue;
    const acct = config.accounts[accId];
    if (!acct) {
      entry.status = 'failed';
      entry.error = `unknown account "${accId}"`;
      changed = true;
      continue;
    }
    try {
      const res = await publish(acct, entry);
      entry.status = 'published';
      entry.publishedAt = new Date().toISOString();
      entry.liveUrl = res.url;
      if (res.warning) entry.warning = res.warning;
      note(`  ✅ ${accId}: published → ${res.url}${res.warning ? ` (${res.warning})` : ''}`);
    } catch (e) {
      entry.status = 'failed';
      entry.error = e.message;
      note(`  ❌ ${accId}: ${e.message}`);
      process.exitCode = 1;
    }
    changed = true;
  }
  if (changed) saveJson(file, draft);
}

async function main() {
  const config = loadJson(path.join(root, 'config.json'), null);
  if (!config) throw new Error('config.json missing or invalid');
  const MODE = (process.env.MODE || 'config').toLowerCase();
  if (!['config', 'review', 'auto', 'publish'].includes(MODE)) {
    throw new Error(`Unknown MODE "${MODE}" (use config, review, auto or publish)`);
  }
  const apiKey = (process.env.ANTHROPIC_API_KEY || '').replace(/\s/g, '');
  const state = loadJson(statePath, { sites: {} });
  log(`Mode: ${MODE}`);

  for (const site of config.sites) {
    if (site.enabled === false) continue;
    note(`\n## ${site.name} (${site.id})`);
    const siteMode = MODE === 'config' ? site.mode : MODE;
    const siteDir = path.join(draftsDir, site.id);

    // ---- publish-only mode: send already-saved drafts
    if (siteMode === 'publish') {
      const files = fs.existsSync(siteDir) ? fs.readdirSync(siteDir).filter((f) => f.endsWith('.json')) : [];
      let any = false;
      for (const f of files) {
        const file = path.join(siteDir, f);
        const draft = loadJson(file, null);
        if (!draft || !Object.values(draft.posts).some((p) => p.status === 'draft')) continue;
        any = true;
        note(`- ${draft.title}`);
        await publishDraft(file, draft, config);
      }
      if (!any) note('Nothing waiting to be published.');
      continue;
    }

    // ---- find new articles
    if (!apiKey && process.env.MOCK_LLM !== '1') throw new Error('ANTHROPIC_API_KEY is not set');
    let articles;
    try {
      articles = await listArticles(site);
    } catch (e) {
      note(`⚠️ Could not read the site's article list: ${e.message}`);
      process.exitCode = 1;
      continue;
    }
    const siteState = (state.sites[site.id] ??= { seen: [] });
    const firstRun = siteState.seen.length === 0;
    const cutoff = Date.now() - (site.max_age_days ?? 30) * 86400000;
    const fresh = articles.filter((a) => {
      const t = a.lastmod ? Date.parse(a.lastmod) : NaN;
      return Number.isNaN(t) || t >= cutoff;
    });
    const unseen = fresh.filter((a) => !siteState.seen.includes(a.url));
    const max = site.max_per_run ?? 2;
    const todo = unseen.slice(0, max);

    if (firstRun) {
      // Don't flood on the very first run: everything older than the newest
      // few is marked as already seen.
      for (const a of articles) if (!todo.includes(a)) siteState.seen.push(a.url);
      note(`First run for this site: using the latest ${todo.length} article(s); ${articles.length - todo.length} older ones are skipped.`);
    }
    if (todo.length === 0) {
      note('No new articles.');
      continue;
    }

    const platforms = platformsFor(site, config);
    for (const item of todo) {
      note(`- New: ${item.url}`);
      try {
        const article = await fetchArticle(item.url);
        if (article.text.length < 300) throw new Error('page has too little readable text');
        const out = await generateForArticle(site, article, platforms, config, apiKey);
        const draft = {
          site: site.id,
          url: article.url,
          title: article.title,
          createdAt: new Date().toISOString(),
          angle: out.angle,
          posts: buildEntries(site, article, out, config),
        };
        const file = path.join(siteDir, `${slugOf(article.url)}.json`);
        saveJson(file, draft);
        siteState.seen.push(item.url);
        note(`  📝 draft saved: drafts/${site.id}/${path.basename(file)}`);
        for (const [id, e] of Object.entries(draft.posts)) {
          if (e.status === 'needs_edit') note(`  ⚠️ ${id} needs editing before it can be posted: ${e.problems.join('; ')}`);
        }
        if (siteMode === 'auto') await publishDraft(file, draft, config);
      } catch (e) {
        note(`  ❌ skipped (will retry next run): ${e.message}`);
        process.exitCode = 1;
      }
    }
    saveJson(statePath, state);
  }

  saveJson(statePath, state);
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `# Content distributor (mode: ${MODE})\n${summary.join('\n')}\n`);
  }
}

main().catch((e) => {
  console.error('[distributor] FAILED:', e.message);
  process.exit(1);
});
