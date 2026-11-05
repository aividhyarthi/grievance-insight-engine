import assert from 'node:assert/strict';
import { parseSitemap, parseFeed } from './discover.mjs';
import { validate, xLength } from './generate.mjs';

const sm = parseSitemap(
  `<urlset><url><loc>https://a.com/blog/one</loc><lastmod>2026-10-01</lastmod></url><url><loc>https://a.com/</loc></url></urlset>`
);
assert.equal(sm.entries.length, 2);
assert.equal(sm.entries[0].lastmod, '2026-10-01');

const idx = parseSitemap(`<sitemapindex><sitemap><loc>https://a.com/s1.xml</loc></sitemap></sitemapindex>`);
assert.deepEqual(idx.children, ['https://a.com/s1.xml']);

const rss = parseFeed(`<rss><channel><item><title>x</title><link>https://a.com/p1</link><pubDate>Mon, 05 Oct 2026 10:00:00 GMT</pubDate></item></channel></rss>`);
assert.equal(rss[0].url, 'https://a.com/p1');

assert.equal(xLength('hi https://example.com/a/very/long/path/that/goes/on'), 3 + 23);

const rules = { banned_phrases: ['leverage'], x_max_chars: 280, x_max_hashtags: 2, linkedin_words: [110, 230] };
assert.equal(validate({ x: ['ok post'] }, new Set(['x']), rules).length, 0);
assert.ok(validate({ x: ['x'.repeat(300)] }, new Set(['x']), rules).length > 0);
assert.ok(validate({ x: ['we leverage it'] }, new Set(['x']), rules).length > 0);
assert.ok(validate({ linkedin: 'too short' }, new Set(['linkedin']), rules).length > 0);

console.log('selftest: all checks passed');
