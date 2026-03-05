"""
Generates post copy (title, caption, hashtags, features) using Claude.
Falls back to template-based copy when no API key is provided.
"""

from __future__ import annotations

import json
import re
import os


def _parse_json(text: str) -> str:
    """Strip code fences and return the first JSON object found in text."""
    # Remove ``` fences (with or without language tag, with or without newlines)
    text = re.sub(r'```[a-z]*\s*', '', text).replace('```', '').strip()
    # If what remains starts with '{' we're done
    if text.startswith('{'):
        return text
    # Otherwise find the first {...} block (handles surrounding prose)
    m = re.search(r'\{.*\}', text, re.DOTALL)
    return m.group(0) if m else text


_SYSTEM_PROMPT = """\
You are a senior social media copywriter at an award-winning branding agency.
You TRANSFORM raw product information into polished, desire-creating Instagram copy.

CRITICAL RULES:
- ALWAYS fix spelling, grammar, and capitalisation in whatever the user provides — never echo errors back.
- NEVER copy the user's tagline or description verbatim. Rewrite everything in your own creative voice.
- NEVER use the user's tagline as your title. Invent a fresh headline every time.
- If product inputs look rough or test-like, still write real, polished copy for them.
- Do NOT use hollow phrases like "Elevate your game", "Step into a world of", "Unleash your potential", "Game-changer", or "Revolutionary".

Every caption MUST follow this structure (written as natural prose, no labels):
1. Hook — first sentence stops the scroll: a relatable truth, a desire, or a bold observation that makes the reader feel something immediately.
2. Desire — one or two sentences showing what this product DOES for the person: the feeling, the transformation, the small everyday joy.
3. Pull — a closing line that creates longing without being pushy. No generic "shop now" commands. Make them WANT it.

The title must intrigue and earn a second look — like a headline, not a product label.
"""

_INDIVIDUAL_PROMPT = """\
A brand has given you raw product details. Your job is to REWRITE everything as compelling
Instagram copy that creates desire. Fix any typos or grammar issues in the inputs — do NOT
echo them back. The title must be YOUR invention, not the user's tagline rephrased.

Raw inputs (treat as inspiration, not final copy):
  Product : {product_name}
  Brand   : {brand_name}
  Tagline : {tagline}
  Details : {description}
  CTA     : {cta}
  Platform: {platform}

{creative_direction_block}
Return ONLY valid JSON — no markdown fences, no extra text:
{{
  "title"   : "Your fresh headline (4-8 words, Title Case, no full stop). Must intrigue, not just describe. Do NOT reuse the tagline.",
  "caption" : "3 sentences of polished copy. S1: scroll-stopping hook — a desire or relatable truth. S2: what this product does FOR the person (feeling/transformation/joy). S3: longing close that makes them want it — no generic CTA commands.",
  "hashtags": ["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8"]
}}
"""

_CAROUSEL_PROMPT = """\
A brand has given you raw product details for a carousel post. REWRITE everything as polished,
desire-creating copy. Fix any typos or grammar issues — do NOT echo them. Each feature should
feel like a personal benefit the reader wants, not a product spec. Title must be your own fresh
invention, not the user's tagline.

Raw inputs (treat as inspiration, not final copy):
  Product : {product_name}
  Brand   : {brand_name}
  Tagline : {tagline}
  Details : {description}
  CTA     : {cta}
  Platform: {platform}

{creative_direction_block}
Return ONLY valid JSON — no markdown fences, no extra text:
{{
  "title"   : "Your fresh cover headline (4-8 words, Title Case, no full stop). Must earn a swipe — not a rephrased tagline.",
  "caption" : "3 sentences of polished cover copy. S1: scroll-stopping hook. S2: the desire this fulfils. S3: longing close that earns a swipe.",
  "features": [
    "Benefit phrased as personal gain — how it changes daily life (not a spec)",
    "Benefit phrased as personal gain",
    "Benefit phrased as personal gain",
    "Benefit phrased as personal gain",
    "Benefit phrased as personal gain",
    "Benefit phrased as personal gain"
  ],
  "hashtags": ["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8","tag9","tag10"]
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
        creative_direction: str = '',
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
                creative_direction=creative_direction,
                post_type=post_type,
                platform=platform,
            )
        except Exception as exc:
            print(f'[text_gen] Claude call failed: {exc}')
            return self._fallback(product_name, tagline, description, brand_name, post_type)

    def _call_claude(self, **kwargs) -> dict:
        import httpx
        import anthropic

        template = _CAROUSEL_PROMPT if kwargs['post_type'] == 'carousel' else _INDIVIDUAL_PROMPT
        cd = (kwargs.get('creative_direction') or '').strip()
        cd_block = (
            f'IMPORTANT — Creative direction from the user (follow these instructions):\n  {cd}\n'
            if cd else ''
        )
        prompt = template.format(
            product_name=kwargs['product_name'] or 'Unknown',
            brand_name=kwargs['brand_name']    or '',
            tagline=kwargs['tagline']           or '',
            description=kwargs['description']   or '',
            cta=kwargs['cta']                   or 'Shop Now',
            platform=kwargs['platform']         or 'instagram_square',
            creative_direction_block=cd_block,
        )

        with httpx.Client() as http_client:
            client = anthropic.Anthropic(api_key=self.api_key,
                                         http_client=http_client)
            msg = client.messages.create(
                model='claude-sonnet-4-6',
                max_tokens=1200,
                temperature=1,
                system=_SYSTEM_PROMPT,
                messages=[{'role': 'user', 'content': prompt}],
            )

        raw  = msg.content[0].text.strip()
        data = json.loads(_parse_json(raw))

        # Normalise hashtags — strip leading #, re-add later on display
        data['hashtags'] = [
            h.lstrip('#').replace(' ', '_') for h in data.get('hashtags', [])
        ]
        return data

    @staticmethod
    def _fallback(product_name: str, tagline: str, description: str,
                  brand_name: str, post_type: str) -> dict:
        """Fallback when API key is missing or the Claude call fails."""
        pn = product_name.strip().title() if product_name else 'this product'
        bn = brand_name.strip() if brand_name else ''
        title = f'The {pn} You Didn\'t Know You Needed'
        by_line = f' by {bn}' if bn else ''
        caption = (
            f'Some things just make life better — {pn}{by_line} is one of them. '
            f'It\'s the kind of find that quietly upgrades your everyday without asking for credit. '
            f'Once you have it, you\'ll wonder how you managed without it.'
        )
        hashtags = [
            pn.replace(' ', ''),
            bn.replace(' ', '') if bn else 'brand',
            'NewArrival', 'MustHave', 'ProductLaunch',
            'QualityFirst', 'Design', 'Style', 'Lifestyle', 'ShopNow',
        ]

        # Build features from actual product info instead of generic copy
        features: list[str] = []
        desc = (description or '').strip()
        tag  = (tagline or '').strip()

        # Pull real sentences from the description
        sentences = [
            s.strip() for s in re.split(r'[.!?]+', desc)
            if s.strip() and len(s.strip()) > 15
        ]

        if tag:
            features.append(tag)
        features.extend(sentences)

        # If still short, add product-specific lines (not generic)
        specific = [
            f'{pn} — made for people who notice the difference',
            f'Thoughtful {pn.lower()} design that fits your life',
            f'{bn + " delivers" if bn else "Delivering"} on every detail',
            f'The {pn.lower()} upgrade worth talking about',
            f'Feel it, use it, love it — {pn.lower()} done right',
            f'Join the people who already chose {pn.lower()}',
        ]
        for line in specific:
            if len(features) >= 6:
                break
            features.append(line)

        base = {'title': title, 'caption': caption, 'hashtags': hashtags}
        if post_type == 'carousel':
            base['features'] = features[:6]
        return base
