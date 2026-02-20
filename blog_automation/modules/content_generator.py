"""
Content Generator Module
------------------------
Uses Claude (Anthropic) to:
  1. Write a full SEO/AEO-optimised blog post
  2. Generate meta description, title tag, slug, and schema markup
  3. Suggest internal links, hashtags, and social captions
  4. Match the configured website tone and style
"""

import json
import logging
import re
from dataclasses import dataclass, field

import anthropic

logger = logging.getLogger(__name__)


@dataclass
class BlogPost:
    # Core content
    title: str = ""
    slug: str = ""
    body_html: str = ""         # Full HTML body
    body_markdown: str = ""     # Markdown version

    # SEO / AEO
    meta_title: str = ""
    meta_description: str = ""
    focus_keyword: str = ""
    secondary_keywords: list[str] = field(default_factory=list)
    schema_markup: dict = field(default_factory=dict)   # JSON-LD
    faq_schema: dict = field(default_factory=dict)

    # Social media
    twitter_caption: str = ""
    linkedin_caption: str = ""
    instagram_caption: str = ""
    hashtags: list[str] = field(default_factory=list)

    # Image
    image_prompt: str = ""      # Prompt for image generation
    image_alt_text: str = ""
    image_url: str = ""         # Filled in after image generation

    # Publishing
    category: str = ""
    tags: list[str] = field(default_factory=list)
    word_count: int = 0


class ContentGenerator:
    def __init__(self, config: dict):
        self.config = config
        self.content_cfg = config.get("content", {})
        self.seo_cfg = self.content_cfg.get("seo", {})
        self.blog_cfg = self.content_cfg.get("blog", {})
        self.website_name = self.content_cfg.get("website_name", "Our Website")
        self.website_url = self.content_cfg.get("website_url", "")
        self.niche = self.content_cfg.get("niche", "technology")
        self.tone = self.content_cfg.get("tone", "professional and educational")
        self._client = anthropic.Anthropic()

    # ------------------------------------------------------------------ #
    # Public API                                                           #
    # ------------------------------------------------------------------ #

    def generate(self, topic_title: str, related_terms: list[str] | None = None,
                 source_url: str = "") -> BlogPost:
        """
        Full pipeline: topic → complete blog post with SEO, schema, and social captions.
        """
        logger.info("Generating blog post for topic: '%s'", topic_title)
        related_terms = related_terms or []

        # Step 1: Research & outline
        outline = self._generate_outline(topic_title, related_terms)
        logger.info("Outline generated.")

        # Step 2: Write full blog post
        post = self._write_blog(topic_title, related_terms, outline, source_url)
        logger.info("Blog written (%d words).", post.word_count)

        # Step 3: SEO metadata
        self._generate_seo_metadata(post, topic_title, related_terms)
        logger.info("SEO metadata generated.")

        # Step 4: Schema markup (JSON-LD)
        self._generate_schema(post)
        logger.info("Schema markup generated.")

        # Step 5: Social media captions
        self._generate_social_captions(post)
        logger.info("Social media captions generated.")

        # Step 6: Image generation prompt
        post.image_prompt = self._generate_image_prompt(post.title, topic_title)
        post.image_alt_text = f"Illustration representing {post.title}"

        return post

    # ------------------------------------------------------------------ #
    # Step 1: Outline                                                      #
    # ------------------------------------------------------------------ #

    def _generate_outline(self, topic: str, related_terms: list[str]) -> str:
        sections = self.blog_cfg.get("sections", [
            "Introduction", "Why This Matters", "Key Concepts",
            "Real-World Examples", "How to Get Started", "Conclusion", "FAQ",
        ])
        related_str = ", ".join(related_terms) if related_terms else "none"

        prompt = f"""You are an expert content strategist for "{self.website_name}" — a website focused on: {self.niche}.

Topic to cover: "{topic}"
Related search terms: {related_str}

Create a detailed blog post outline with:
1. A compelling, click-worthy H1 title (not the raw topic — make it more specific and value-driven)
2. Sections: {", ".join(sections)}
3. 3-5 bullet points under each section showing what will be covered
4. Focus keyword and 3-5 secondary keywords to weave in naturally
5. 5-7 FAQ questions readers might ask about this topic

Be specific to the niche and audience. Return structured text, not JSON.
"""
        resp = self._client.messages.create(
            model="claude-opus-4-5",
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}],
        )
        return resp.content[0].text

    # ------------------------------------------------------------------ #
    # Step 2: Write the Blog                                               #
    # ------------------------------------------------------------------ #

    def _write_blog(self, topic: str, related_terms: list[str],
                    outline: str, source_url: str) -> BlogPost:
        min_w = self.blog_cfg.get("min_words", 800)
        max_w = self.blog_cfg.get("max_words", 1500)
        include_faq = self.blog_cfg.get("include_faq", True)
        include_tldr = self.blog_cfg.get("include_tldr", True)

        website_url = self.website_url
        internal_links = self.seo_cfg.get("include_internal_links", True)
        num_links = self.seo_cfg.get("num_internal_links", 3)

        related_str = ", ".join(related_terms) if related_terms else "not available"
        source_note = f"\nReference source for context (do NOT copy): {source_url}" if source_url else ""

        prompt = f"""You are a professional content writer for "{self.website_name}".

TONE & STYLE GUIDE:
{self.tone}

WEBSITE NICHE: {self.niche}
WEBSITE URL: {website_url}

OUTLINE TO FOLLOW:
{outline}

WRITING INSTRUCTIONS:
- Write {min_w}-{max_w} words
- Use proper HTML markup (h2, h3, p, ul, ol, strong, em)
- {"Include a TL;DR box at the very top (inside a <div class='tldr'> tag)" if include_tldr else ""}
- {"Include a FAQ section at the end using <h2>Frequently Asked Questions</h2> with <h3> for each question" if include_faq else ""}
- Weave in these related search terms naturally: {related_str}
- {"Include " + str(num_links) + " internal links pointing to relevant pages on " + website_url + " (use placeholder URLs like " + website_url + "/relevant-topic)" if internal_links else ""}
- End with a clear Call to Action
- keyword density around {self.seo_cfg.get("target_keyword_density", 1.5)}%
- Make every section genuinely useful — no fluff or padding
- Use real examples, statistics (cite as approximate if unknown), or step-by-step breakdowns{source_note}

Write the FULL blog post now in HTML format. Start directly with the content (no preamble).
"""
        resp = self._client.messages.create(
            model="claude-opus-4-5",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )
        html_body = resp.content[0].text.strip()

        # Extract title from H1 if present
        title_match = re.search(r"<h1[^>]*>(.*?)</h1>", html_body, re.IGNORECASE | re.DOTALL)
        title = re.sub(r"<[^>]+>", "", title_match.group(1)).strip() if title_match else topic

        # Generate slug
        slug = self._make_slug(title)

        # Word count (strip HTML)
        text_only = re.sub(r"<[^>]+>", " ", html_body)
        word_count = len(text_only.split())

        post = BlogPost(
            title=title,
            slug=slug,
            body_html=html_body,
            body_markdown=self._html_to_markdown(html_body),
            word_count=word_count,
            category=self.config.get("wordpress", {}).get("default_category", "Blog"),
        )
        return post

    # ------------------------------------------------------------------ #
    # Step 3: SEO Metadata                                                 #
    # ------------------------------------------------------------------ #

    def _generate_seo_metadata(self, post: BlogPost, topic: str,
                                related_terms: list[str]) -> None:
        meta_len = self.seo_cfg.get("meta_description_length", 160)

        prompt = f"""You are an SEO expert. Based on this blog post title and topic, generate:

Title: {post.title}
Topic: {topic}
Related terms: {", ".join(related_terms)}
Website: {self.website_name} — {self.niche}

Return ONLY valid JSON with these fields:
{{
  "meta_title": "SEO-optimized title tag (50-60 chars)",
  "meta_description": "Compelling meta description ({meta_len} chars max, includes focus keyword)",
  "focus_keyword": "Primary keyword phrase",
  "secondary_keywords": ["kw1", "kw2", "kw3", "kw4", "kw5"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6", "#tag7"]
}}
"""
        resp = self._client.messages.create(
            model="claude-opus-4-5",
            max_tokens=512,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = resp.content[0].text.strip()
        try:
            json_match = re.search(r"\{.*\}", raw, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                post.meta_title = data.get("meta_title", post.title)
                post.meta_description = data.get("meta_description", "")
                post.focus_keyword = data.get("focus_keyword", "")
                post.secondary_keywords = data.get("secondary_keywords", [])
                post.tags = data.get("tags", [])
                post.hashtags = data.get("hashtags", [])
        except json.JSONDecodeError as e:
            logger.error("Failed to parse SEO metadata JSON: %s", e)

    # ------------------------------------------------------------------ #
    # Step 4: Schema Markup                                                #
    # ------------------------------------------------------------------ #

    def _generate_schema(self, post: BlogPost) -> None:
        """Generate JSON-LD schema for Article + FAQPage (AEO)."""
        import datetime

        # Article schema
        post.schema_markup = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "description": post.meta_description,
            "keywords": ", ".join([post.focus_keyword] + post.secondary_keywords),
            "author": {
                "@type": "Organization",
                "name": self.website_name,
                "url": self.website_url,
            },
            "publisher": {
                "@type": "Organization",
                "name": self.website_name,
                "url": self.website_url,
            },
            "datePublished": datetime.date.today().isoformat(),
            "dateModified": datetime.date.today().isoformat(),
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": f"{self.website_url}/blog/{post.slug}",
            },
        }

        # FAQ schema from the FAQ section in the post
        faq_items = self._extract_faq(post.body_html)
        if faq_items:
            post.faq_schema = {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": q,
                        "acceptedAnswer": {"@type": "Answer", "text": a},
                    }
                    for q, a in faq_items
                ],
            }

    def _extract_faq(self, html: str) -> list[tuple[str, str]]:
        """Extract Q&A pairs from the FAQ section of the HTML."""
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html, "html.parser")
        pairs: list[tuple[str, str]] = []

        faq_section = None
        for h in soup.find_all(["h2", "h3"]):
            if "faq" in h.get_text(strip=True).lower():
                faq_section = h
                break

        if not faq_section:
            return pairs

        current_q = None
        for sibling in faq_section.find_next_siblings():
            tag = sibling.name
            if tag in ["h2", "h3"]:
                text = sibling.get_text(strip=True)
                if text.endswith("?") or len(text) < 120:
                    current_q = text
                else:
                    break   # New non-FAQ section
            elif tag == "p" and current_q:
                pairs.append((current_q, sibling.get_text(strip=True)))
                current_q = None

        return pairs[:10]

    # ------------------------------------------------------------------ #
    # Step 5: Social Media Captions                                        #
    # ------------------------------------------------------------------ #

    def _generate_social_captions(self, post: BlogPost) -> None:
        hashtag_str = " ".join(post.hashtags[:10])
        blog_url = f"{self.website_url}/blog/{post.slug}"

        prompt = f"""Write social media captions for this blog post:

Title: {post.title}
Meta description: {post.meta_description}
Website: {self.website_name}
Blog URL: {blog_url}
Hashtags: {hashtag_str}

Generate captions for THREE platforms. Return ONLY valid JSON:
{{
  "twitter": "Tweet (max 240 chars, punchy, ends with URL and 2-3 hashtags)",
  "linkedin": "LinkedIn post (3-5 sentences, professional, ends with relevant hashtags)",
  "instagram": "Instagram caption (engaging, storytelling tone, ends with up to 20 hashtags)"
}}
"""
        resp = self._client.messages.create(
            model="claude-opus-4-5",
            max_tokens=600,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = resp.content[0].text.strip()
        try:
            json_match = re.search(r"\{.*\}", raw, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                post.twitter_caption = data.get("twitter", "")
                post.linkedin_caption = data.get("linkedin", "")
                post.instagram_caption = data.get("instagram", "")
        except json.JSONDecodeError as e:
            logger.error("Failed to parse social captions JSON: %s", e)

    # ------------------------------------------------------------------ #
    # Step 6: Image Prompt                                                 #
    # ------------------------------------------------------------------ #

    def _generate_image_prompt(self, title: str, topic: str) -> str:
        style = self.config.get("image", {}).get("style",
            "digital art, professional, clean, vibrant colors")

        prompt = f"""Create a concise image generation prompt for a blog post header.

Blog title: "{title}"
Topic: "{topic}"
Style preference: {style}

Write a single image generation prompt (max 100 words) that:
- Visually represents the blog topic
- Is suitable as a professional blog header image
- Does NOT include any text or letters in the image
- Has a clear focal point

Return ONLY the image prompt text, nothing else.
"""
        resp = self._client.messages.create(
            model="claude-opus-4-5",
            max_tokens=150,
            messages=[{"role": "user", "content": prompt}],
        )
        return resp.content[0].text.strip()

    # ------------------------------------------------------------------ #
    # Utilities                                                            #
    # ------------------------------------------------------------------ #

    def _make_slug(self, title: str) -> str:
        slug = title.lower()
        slug = re.sub(r"[^a-z0-9\s-]", "", slug)
        slug = re.sub(r"\s+", "-", slug.strip())
        slug = re.sub(r"-+", "-", slug)
        return slug[:80]

    def _html_to_markdown(self, html: str) -> str:
        """Simple HTML → Markdown converter for storage/preview."""
        text = re.sub(r"<h1[^>]*>(.*?)</h1>", r"# \1\n", html, flags=re.IGNORECASE | re.DOTALL)
        text = re.sub(r"<h2[^>]*>(.*?)</h2>", r"\n## \1\n", text, flags=re.IGNORECASE | re.DOTALL)
        text = re.sub(r"<h3[^>]*>(.*?)</h3>", r"\n### \1\n", text, flags=re.IGNORECASE | re.DOTALL)
        text = re.sub(r"<strong[^>]*>(.*?)</strong>", r"**\1**", text, flags=re.IGNORECASE | re.DOTALL)
        text = re.sub(r"<em[^>]*>(.*?)</em>", r"*\1*", text, flags=re.IGNORECASE | re.DOTALL)
        text = re.sub(r"<li[^>]*>(.*?)</li>", r"- \1", text, flags=re.IGNORECASE | re.DOTALL)
        text = re.sub(r"<a[^>]*href=['\"]([^'\"]*)['\"][^>]*>(.*?)</a>", r"[\2](\1)", text,
                      flags=re.IGNORECASE | re.DOTALL)
        text = re.sub(r"<[^>]+>", "", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()
