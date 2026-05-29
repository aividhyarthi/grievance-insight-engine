import crypto from 'node:crypto';

/**
 * Minimal X (Twitter) API v2 client for posting tweets and threads using
 * OAuth 1.0a user-context auth (consumer key/secret + access token/secret).
 * These long-lived tokens are the simplest fit for unattended automation.
 *
 * Required env vars:
 *   X_API_KEY            (consumer key)
 *   X_API_SECRET         (consumer secret)
 *   X_ACCESS_TOKEN       (user access token)
 *   X_ACCESS_SECRET      (user access token secret)
 */

const ENDPOINT = 'https://api.twitter.com/2/tweets';

function rfc3986(str) {
  return encodeURIComponent(str).replace(
    /[!*'()]/g,
    (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase()
  );
}

function oauthHeader(method, url, creds) {
  const oauth = {
    oauth_consumer_key: creds.apiKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: creds.accessToken,
    oauth_version: '1.0',
  };

  // For JSON-body endpoints the body is NOT part of the signature base.
  const paramString = Object.keys(oauth)
    .sort()
    .map((k) => `${rfc3986(k)}=${rfc3986(oauth[k])}`)
    .join('&');

  const baseString = [method.toUpperCase(), rfc3986(url), rfc3986(paramString)].join('&');
  const signingKey = `${rfc3986(creds.apiSecret)}&${rfc3986(creds.accessSecret)}`;
  const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');

  const headerParams = { ...oauth, oauth_signature: signature };
  return (
    'OAuth ' +
    Object.keys(headerParams)
      .sort()
      .map((k) => `${rfc3986(k)}="${rfc3986(headerParams[k])}"`)
      .join(', ')
  );
}

export function credsFromEnv(env = process.env) {
  // Trim stray whitespace/newlines from pasted secrets.
  const clean = (v) => (v || '').trim();
  const creds = {
    apiKey: clean(env.X_API_KEY),
    apiSecret: clean(env.X_API_SECRET),
    accessToken: clean(env.X_ACCESS_TOKEN),
    accessSecret: clean(env.X_ACCESS_SECRET),
  };
  const missing = Object.entries(creds)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  return { creds, missing };
}

/** Post a single tweet. `replyTo` chains it under a previous tweet (for threads). */
export async function postTweet(text, creds, replyTo = null) {
  const payload = { text };
  if (replyTo) payload.reply = { in_reply_to_tweet_id: replyTo };

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: oauthHeader('POST', ENDPOINT, creds),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`X API ${res.status}: ${JSON.stringify(data)}`);
  }
  return data.data; // { id, text }
}

/** Publish a post that may be a single tweet or a thread (array of tweets). */
export async function publishPost(post, creds) {
  const ids = [];
  let prev = null;
  for (const text of post.tweets) {
    const result = await postTweet(text, creds, prev);
    prev = result.id;
    ids.push(result.id);
    // Small gap between thread tweets to keep ordering reliable.
    if (post.tweets.length > 1) await new Promise((r) => setTimeout(r, 1500));
  }
  return ids;
}
