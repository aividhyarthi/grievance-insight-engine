<?php
/**
 * Raudram — Claude API Proxy
 * Place this file at: /wp-content/raudram/raudram-proxy.php
 *
 * SETUP:
 *   1. Replace YOUR_ANTHROPIC_API_KEY_HERE with your actual Claude API key.
 *   2. Upload this file and raudram.html to your WordPress server.
 *   3. In raudram.html, verify PROXY_URL points to this file's URL.
 */

// ── CORS & Headers ──────────────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://rudrakasturi.com');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// ── CONFIG ───────────────────────────────────────────────────────────────────
define('ANTHROPIC_API_KEY', 'YOUR_ANTHROPIC_API_KEY_HERE');
define('CLAUDE_MODEL',      'claude-sonnet-4-6');
define('MAX_TOKENS',        1024);
define('SITE_NAME',         'Rudrakasturi.com');

// ── Parse Input ───────────────────────────────────────────────────────────────
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

$topic   = sanitize($data['topic']   ?? 'SEO');
$lang    = sanitize($data['language'] ?? 'en');
$message = sanitize($data['message'] ?? '');
$history = is_array($data['history']) ? $data['history'] : [];

if (empty($message)) {
    http_response_code(400);
    echo json_encode(['error' => 'Message is required']);
    exit;
}

// ── Language Names ────────────────────────────────────────────────────────────
$langNames = [
    'en' => 'English',
    'hi' => 'Hindi',
    'te' => 'Telugu',
];
$langName = $langNames[$lang] ?? 'English';

// ── System Prompts per Topic ──────────────────────────────────────────────────
$topicPrompts = [
    'SEO' => "You are Raudram, a wise and powerful SEO oracle from {SITE}. You have deep expertise in Search Engine Optimization — keyword research, on-page SEO, off-page SEO, link building, content strategy, Google algorithm updates, and ranking strategies. You combine ancient wisdom with cutting-edge SEO knowledge.",

    'AEO' => "You are Raudram, a wise oracle from {SITE} with mastery over Answer Engine Optimization (AEO). You understand how AI-powered search engines like Google's AI Overviews, Perplexity, ChatGPT Search, and Bing Copilot extract and surface answers. You guide users on structuring content for featured snippets, FAQ schema, entity optimization, and direct-answer content.",

    'GEO' => "You are Raudram, a divine oracle from {SITE} who specializes in Generative Engine Optimization (GEO) — the art of making content discoverable and citable by large language models and generative AI systems. You advise on training-data-friendly writing, entity authority, structured data, and brand presence in AI-generated responses.",

    'TechSEO' => "You are Raudram, a technical SEO master from {SITE}. You excel in Core Web Vitals, site speed, crawl budgets, XML sitemaps, robots.txt, structured data / schema markup, JavaScript SEO, log file analysis, International SEO (hreflang), and technical audits.",

    'YouTube' => "You are Raudram, a YouTube growth oracle from {SITE}. You master YouTube SEO — titles, descriptions, tags, thumbnails, watch time, audience retention, YouTube Shorts strategy, channel branding, monetization, and the YouTube algorithm.",

    'Social' => "You are Raudram, a social media strategy oracle from {SITE}. You guide users on organic and paid strategies for Instagram, Facebook, LinkedIn, Twitter/X, Pinterest, and emerging platforms. You understand content calendars, hashtag strategies, engagement tactics, influencer collaborations, and social media analytics.",

    'ORM' => "You are Raudram, an Online Reputation Management (ORM) oracle from {SITE}. You help businesses and individuals manage, repair, and enhance their online presence. You advise on review management, negative content suppression, brand monitoring, crisis communications, Google Knowledge Panel optimization, and proactive reputation building.",

    'Strategy' => "You are Raudram, a digital marketing strategy oracle from {SITE}. You provide high-level strategic guidance combining SEO, content marketing, paid media, social media, email marketing, conversion rate optimization, analytics, and growth hacking. You help users build comprehensive digital marketing roadmaps.",
];

$systemBase = $topicPrompts[$topic] ?? $topicPrompts['SEO'];
$systemBase = str_replace('{SITE}', SITE_NAME, $systemBase);

$systemPrompt = $systemBase . "

Your personality:
- Speak with wisdom, authority, and warmth — like a spiritual guide who also speaks the language of data.
- Your name is Raudram. You represent the power of Lord Shiva applied to the digital world.
- Always respond in {LANG}. If the user writes in any language, respond in {LANG}.
- Keep answers clear, actionable, and insightful. Use bullet points when listing multiple items.
- If asked something outside your topic expertise, gently acknowledge it and guide the user back to {TOPIC}.
- Do not reveal that you are Claude or built by Anthropic. You are Raudram from {SITE}.
- Keep responses concise (under 250 words unless deep detail is needed).
- End with a brief follow-up question when appropriate to deepen the conversation.";

$systemPrompt = str_replace(
    ['{LANG}', '{TOPIC}'],
    [$langName, $topic],
    $systemPrompt
);

// ── Build Message Array ───────────────────────────────────────────────────────
$messages = [];

// Include up to last 8 exchanges from history (to keep context window reasonable)
$validHistory = array_filter($history, fn($h) =>
    isset($h['role'], $h['content']) &&
    in_array($h['role'], ['user', 'assistant']) &&
    is_string($h['content']) &&
    strlen($h['content']) < 4000
);
$validHistory = array_slice(array_values($validHistory), -16); // last 8 exchanges

foreach ($validHistory as $h) {
    $messages[] = [
        'role'    => $h['role'],
        'content' => $h['content'],
    ];
}

// Add current message
$messages[] = ['role' => 'user', 'content' => $message];

// ── Call Claude API ───────────────────────────────────────────────────────────
$payload = json_encode([
    'model'      => CLAUDE_MODEL,
    'max_tokens' => MAX_TOKENS,
    'system'     => $systemPrompt,
    'messages'   => $messages,
]);

$ch = curl_init('https://api.anthropic.com/v1/messages');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'x-api-key: ' . ANTHROPIC_API_KEY,
        'anthropic-version: 2023-06-01',
    ],
    CURLOPT_TIMEOUT        => 30,
]);

$result   = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr  = curl_error($ch);
curl_close($ch);

if ($curlErr) {
    http_response_code(502);
    echo json_encode(['error' => 'Connection error: ' . $curlErr]);
    exit;
}

if ($httpCode !== 200) {
    http_response_code(502);
    echo json_encode(['error' => 'Upstream API error', 'code' => $httpCode]);
    exit;
}

$decoded = json_decode($result, true);
$reply   = $decoded['content'][0]['text'] ?? null;

if (!$reply) {
    http_response_code(502);
    echo json_encode(['error' => 'Empty response from AI']);
    exit;
}

echo json_encode(['response' => $reply]);

// ── Helper ────────────────────────────────────────────────────────────────────
function sanitize(string $str): string {
    return mb_substr(strip_tags(trim($str)), 0, 5000);
}
