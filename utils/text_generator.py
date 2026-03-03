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
"""

_INDIVIDUAL_PROMPT = """\
Write social media post copy for the product below.

Product name : {product_name}
Brand name   : {brand_name}
Tagline      : {tagline}
Description  : {description}
CTA          : {cta}
Platform     : {platform}

Return ONLY valid JSON — no markdown fences, no extra text:
{{
  "title"    : "Short punchy headline (4-8 words, Title Case, no full stop)",
  "caption"  : "2-3 sentence caption. Conversational. Storytelling. Human.",
  "hashtags" : ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8"]
}}
"""

_CAROUSEL_PROMPT = """\
Write social media carousel copy for the product below.

Product name : {product_name}
Brand name   : {brand_name}
Tagline      : {tagline}
Description  : {description}
CTA          : {cta}
Platform     : {platform}

Return ONLY valid JSON — no markdown fences, no extra text:
{{
  "title"    : "Short punchy headline (4-8 words, Title Case, no full stop)",
  "caption"  : "2-3 sentence caption for the carousel cover. Conversational. Human.",
  "features" : [
    "Feature 1 — one short sentence",
    "Feature 2 — one short sentence",
    "Feature 3 — one short sentence",
    "Feature 4 — one short sentence",
    "Feature 5 — one short sentence",
    "Feature 6 — one short sentence"
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
