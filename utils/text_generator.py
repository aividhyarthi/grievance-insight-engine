"""
Generates post copy (title, caption, hashtags, features) using Claude.
Falls back to template-based copy when no API key is provided.
"""

from __future__ import annotations

import json
import re
import os


_SYSTEM_PROMPT = """\
You are a senior social media copywriter at a boutique branding agency.
You write crisp, human-sounding copy for Instagram and Facebook — not robotic AI text.
Your style is warm, confident, and creative. You never use hollow filler phrases like
"Elevate your game", "Step into a world of", or "Unleash your potential".

Every caption you write MUST have this structure — written as natural prose, not labelled sections:
1. Hook — the very first sentence stops the scroll. Use a relatable truth, a desire, or a bold
   observation. Make the reader feel something immediately.
2. Desire — one or two sentences showing what this product DOES for the person: the feeling,
   the transformation, the small joy it brings to daily life.
3. Pull — a closing sentence that creates urgency or longing without sounding pushy. No
   generic "shop now" commands. Make them WANT it.

The title must intrigue, not just describe. It should feel like a headline that earns a second look.
"""

_INDIVIDUAL_PROMPT = """\
Write social media post copy for the product below. Create desire, not just awareness.
The reader should finish the caption and feel they need this in their life.

Product name : {product_name}
Brand name   : {brand_name}
Tagline      : {tagline}
Description  : {description}
CTA          : {cta}
Platform     : {platform}

Return ONLY valid JSON — no markdown fences, no extra text:
{{
  "title"    : "Intriguing headline (4-8 words, Title Case, no full stop) — make it earn a second look",
  "caption"  : "3 sentences. Sentence 1: scroll-stopping hook (desire or relatable truth). Sentence 2: what this product gives the person (feeling/transformation). Sentence 3: longing close that makes them want to act.",
  "hashtags" : ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8"]
}}
"""

_CAROUSEL_PROMPT = """\
Write social media carousel copy for the product below. Create desire, not just awareness.
The cover caption should make someone stop and swipe. Each feature should feel like a benefit
the reader personally wants, not a spec sheet item.

Product name : {product_name}
Brand name   : {brand_name}
Tagline      : {tagline}
Description  : {description}
CTA          : {cta}
Platform     : {platform}

Return ONLY valid JSON — no markdown fences, no extra text:
{{
  "title"    : "Intriguing cover headline (4-8 words, Title Case, no full stop) — earns a swipe",
  "caption"  : "3 sentences for the carousel cover. Sentence 1: scroll-stopping hook. Sentence 2: the desire this product fulfils. Sentence 3: longing close.",
  "features" : [
    "Benefit 1 — how it improves the person's life (not just a spec)",
    "Benefit 2 — how it improves the person's life",
    "Benefit 3 — how it improves the person's life",
    "Benefit 4 — how it improves the person's life",
    "Benefit 5 — how it improves the person's life",
    "Benefit 6 — how it improves the person's life"
  ],
  "hashtags" : ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"]
}}
"""


class CaptionGenerator:

    def __init__(self, api_key: str = '') -> None:
        self.api_key = api_key or os.environ.get('ANTHROPIC_API_KEY', '')

    def generate(
        self, *,
        product_name: str,
        tagline: str,
        description: str,
        brand_name: str,
        cta: str,
        post_type: str,
        platform: str,
    ) -> dict:
        if not self.api_key:
            return self._fallback(product_name, tagline, description, brand_name, post_type)

        try:
            return self._call_claude(
                product_name=product_name,
                tagline=tagline,
                description=description,
                brand_name=brand_name,
                cta=cta,
                post_type=post_type,
                platform=platform,
            )
        except Exception as exc:
            print(f'[text_gen] Claude call failed: {exc}')
            return self._fallback(product_name, tagline, description, brand_name, post_type)

    def _call_claude(self, **kwargs) -> dict:
        import anthropic

        template = _CAROUSEL_PROMPT if kwargs['post_type'] == 'carousel' else _INDIVIDUAL_PROMPT
        prompt = template.format(
            product_name=kwargs['product_name'] or 'Unknown',
            brand_name=kwargs['brand_name']    or '',
            tagline=kwargs['tagline']           or '',
            description=kwargs['description']   or '',
            cta=kwargs['cta']                   or 'Shop Now',
            platform=kwargs['platform']         or 'instagram_square',
        )

        client = anthropic.Anthropic(api_key=self.api_key)
        msg = client.messages.create(
            model='claude-sonnet-4-6',
            max_tokens=800,
            system=_SYSTEM_PROMPT,
            messages=[{'role': 'user', 'content': prompt}],
        )

        raw = msg.content[0].text.strip()
        # Strip any accidental code fences
        raw = re.sub(r'^```[a-z]*\n?', '', raw)
        raw = re.sub(r'\n?```$', '', raw)
        data = json.loads(raw)

        # Normalise hashtags — strip leading #, re-add later on display
        data['hashtags'] = [
            h.lstrip('#').replace(' ', '_') for h in data.get('hashtags', [])
        ]
        return data

    @staticmethod
    def _fallback(product_name: str, tagline: str, description: str,
                  brand_name: str, post_type: str) -> dict:
        """Template-based fallback when no API key is available."""
        title = tagline or f'Discover {product_name}'
        caption = (
            description[:180] + '…'
            if description and len(description) > 50
            else f'Meet {product_name} — crafted for those who care about quality. '
                 f'{"By " + brand_name + "." if brand_name else ""}'
        )
        hashtags = [
            product_name.replace(' ', ''),
            brand_name.replace(' ', '') if brand_name else 'brand',
            'NewArrival', 'MustHave', 'ShopNow', 'ProductLaunch',
            'QualityFirst', 'Design', 'Style', 'Lifestyle',
        ]
        features = [
            f'Premium quality {product_name}',
            'Built to last, designed to impress',
            'Perfect for everyday use',
            'Thoughtfully crafted details',
            'Loved by customers worldwide',
            'Available now — limited stock',
        ]
        base = {'title': title, 'caption': caption, 'hashtags': hashtags}
        if post_type == 'carousel':
            base['features'] = features
        return base
