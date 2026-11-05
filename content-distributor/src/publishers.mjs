import crypto from 'node:crypto';

/**
 * Credentials come from environment variables / GitHub secrets, named with the
 * account's "secret_prefix" from config.json, e.g. X_PERSONAL_API_KEY.
 * In GitHub Actions all secrets arrive in ALL_SECRETS (JSON), so adding a new
 * account never requires editing the workflow.
 */
function secret(name) {
  let v = process.env[name];
  if (!v && process.env.ALL_SECRETS) {
    try {
      v = JSON.parse(process.env.ALL_SECRETS)[name];
    } catch {
      /* ignore */
    }
  }
  return (v || '').trim();
}

const REQUIRED = {
  x: ['API_KEY', 'API_SECRET', 'ACCESS_TOKEN', 'ACCESS_SECRET'],
  linkedin: ['ACCESS_TOKEN'],
};

export function getCreds(account) {
  const names = REQUIRED[account.platform] || [];
  const creds = {};
  const missing = [];
  for (const n of names) {
    const v = secret(`${account.secret_prefix}_${n}`);
    creds[n] = v;
    if (!v) missing.push(`${account.secret_prefix}_${n}`);
  }
  if (account.platform === 'linkedin') creds.PERSON_ID = secret(`${account.secret_prefix}_PERSON_ID`);
  return { creds, missing };
}

// ---------------------------------------------------------------- X (Twitter)

const X_ENDPOINT = 'https://api.twitter.com/2/tweets';
const enc = (s) => encodeURIComponent(s).replace(/[!*'()]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());

function oauthHeader(method, url, c) {
  const oauth = {
    oauth_consumer_key: c.API_KEY,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: c.ACCESS_TOKEN,
    oauth_version: '1.0',
  };
  const params = Object.keys(oauth)
    .sort()
    .map((k) => `${enc(k)}=${enc(oauth[k])}`)
    .join('&');
  const base = [method.toUpperCase(), enc(url), enc(params)].join('&');
  const key = `${enc(c.API_SECRET)}&${enc(c.ACCESS_SECRET)}`;
  oauth.oauth_signature = crypto.createHmac('sha1', key).update(base).digest('base64');
  return (
    'OAuth ' +
    Object.keys(oauth)
      .sort()
      .map((k) => `${enc(k)}="${enc(oauth[k])}"`)
      .join(', ')
  );
}

async function postTweet(text, c, replyTo) {
  const payload = { text };
  if (replyTo) payload.reply = { in_reply_to_tweet_id: replyTo };
  const res = await fetch(X_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: oauthHeader('POST', X_ENDPOINT, c), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`X API ${res.status}: ${JSON.stringify(data)}`);
  return data.data.id;
}

async function publishX(entry, c) {
  let prev = null;
  let first = null;
  for (const text of entry.tweets) {
    prev = await postTweet(text, c, prev);
    first ??= prev;
    if (entry.tweets.length > 1) await new Promise((r) => setTimeout(r, 1500));
  }
  return { url: `https://x.com/i/status/${first}` };
}

// ------------------------------------------------------------------- LinkedIn

const LI = 'https://api.linkedin.com';

async function li(path, c, init = {}) {
  const res = await fetch(`${LI}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${c.ACCESS_TOKEN}`,
      'X-Restli-Protocol-Version': '2.0.0',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`LinkedIn API ${res.status}: ${JSON.stringify(body)}`);
  return { body, headers: res.headers };
}

async function publishLinkedIn(entry, c) {
  let personId = c.PERSON_ID;
  if (!personId) {
    // Works when the token was created with the "openid profile" scopes.
    personId = (await li('/v2/userinfo', c)).body.sub;
  }
  const author = `urn:li:person:${personId}`;
  const { body, headers } = await li('/v2/ugcPosts', c, {
    method: 'POST',
    body: JSON.stringify({
      author,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: entry.text },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    }),
  });
  const postUrn = body.id || headers.get('x-restli-id');
  if (entry.comment) {
    try {
      await li(`/v2/socialActions/${encodeURIComponent(postUrn)}/comments`, c, {
        method: 'POST',
        body: JSON.stringify({ actor: author, message: { text: entry.comment } }),
      });
    } catch (e) {
      // The post itself is live; only the link comment failed.
      return { url: `https://www.linkedin.com/feed/update/${postUrn}`, warning: `link comment failed: ${e.message}` };
    }
  }
  return { url: `https://www.linkedin.com/feed/update/${postUrn}` };
}

// ------------------------------------------------------------------ dispatcher

/** Publish one draft entry using the account's credentials. */
export async function publish(account, entry) {
  const { creds, missing } = getCreds(account);
  if (missing.length) throw new Error(`missing secrets: ${missing.join(', ')}`);
  if (account.platform === 'x') return publishX(entry, creds);
  if (account.platform === 'linkedin') return publishLinkedIn(entry, creds);
  throw new Error(`unsupported platform "${account.platform}"`);
}
