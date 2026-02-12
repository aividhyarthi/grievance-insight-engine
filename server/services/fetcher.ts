export interface FetchResult {
  html: string;
  statusCode: number;
  headers: Record<string, string>;
  responseTime: number;
  finalUrl: string;
  contentLength: number;
}

const FETCH_TIMEOUT = 15000;
const MAX_BODY_SIZE = 5 * 1024 * 1024; // 5MB
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export async function fetchPage(url: string): Promise<FetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  const start = Date.now();

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
      signal: controller.signal,
    });

    const responseTime = Date.now() - start;
    const text = await response.text();

    if (text.length > MAX_BODY_SIZE) {
      throw new Error(
        `Page too large (${(text.length / 1024 / 1024).toFixed(1)}MB). Max: 5MB.`
      );
    }

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return {
      html: text,
      statusCode: response.status,
      headers,
      responseTime,
      finalUrl: response.url,
      contentLength: text.length,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchRobotsTxt(
  url: string
): Promise<string | null> {
  try {
    const origin = new URL(url).origin;
    const robotsUrl = `${origin}/robots.txt`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(robotsUrl, {
        headers: { 'User-Agent': USER_AGENT },
        signal: controller.signal,
      });

      if (!response.ok) return null;

      const text = await response.text();
      return text.length > 0 ? text : null;
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return null;
  }
}
