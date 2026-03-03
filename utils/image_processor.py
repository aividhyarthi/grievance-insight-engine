"""
Core image generation engine.

Three individual-post styles:
  • minimal   – warm-white background, product thumbnail, clean text below
  • bold      – full-bleed product photo, dark overlay, bold white text
  • magazine  – split panel (product left | text right), editorial feel

Carousel (5 slides):
  01_cover → 02_intro → 03_features → 04_details → 05_cta
"""

from __future__ import annotations

import os
import math
from typing import Any

from PIL import Image, ImageDraw, ImageFilter

from utils.font_manager import ensure_fonts, get_font

# ── platform sizes ────────────────────────────────────────────────────────────
PLATFORM_SIZES: dict[str, tuple[int, int]] = {
    'instagram_square':  (1080, 1080),
    'instagram_portrait': (1080, 1350),
    'instagram_story':   (1080, 1920),
    'facebook':          (1200, 630),
    'youtube':           (1280, 720),
    'twitter':           (1600, 900),
}

# ── colour helpers ────────────────────────────────────────────────────────────

def _clamp(v: int) -> int:
    return max(0, min(255, v))


def _lighten(c: tuple, f: float) -> tuple:
    return tuple(_clamp(int(v + (255 - v) * f)) for v in c[:3])


def _darken(c: tuple, f: float) -> tuple:
    return tuple(_clamp(int(v * (1 - f))) for v in c[:3])


def _to_rgba(c: tuple, a: int = 255) -> tuple:
    return (*c[:3], a)


def _extract_colors(image_path: str) -> dict[str, Any]:
    """Return a palette extracted from the product image."""
    try:
        from colorthief import ColorThief
        ct = ColorThief(image_path)
        dominant = ct.get_color(quality=1)
        palette  = ct.get_palette(color_count=5, quality=1)
        accent   = palette[1] if len(palette) > 1 else dominant
        return {
            'dominant': dominant,
            'accent':   accent,
            'light':    _lighten(dominant, 0.72),
            'dark':     _darken(dominant,  0.55),
            'palette':  palette,
        }
    except Exception:
        pass

    # sensible fallback
    dom = (52, 73, 94)
    return {
        'dominant': dom,
        'accent':   (41, 128, 185),
        'light':    _lighten(dom, 0.72),
        'dark':     _darken(dom, 0.55),
        'palette':  [dom, (41, 128, 185), (189, 195, 199)],
    }

# ── drawing helpers ───────────────────────────────────────────────────────────

def _gradient_overlay(
    size: tuple[int, int],
    color_top: tuple,
    color_bot: tuple,
) -> Image.Image:
    """Vertical gradient RGBA image."""
    w, h = size
    img = Image.new('RGBA', (w, h))
    draw = ImageDraw.Draw(img)
    for y in range(h):
        t = y / h
        r = _clamp(int(color_top[0] * (1 - t) + color_bot[0] * t))
        g = _clamp(int(color_top[1] * (1 - t) + color_bot[1] * t))
        b = _clamp(int(color_top[2] * (1 - t) + color_bot[2] * t))
        a = _clamp(int(color_top[3] * (1 - t) + color_bot[3] * t))
        draw.line([(0, y), (w, y)], fill=(r, g, b, a))
    return img


def _crop_to_fit(img: Image.Image, target: tuple[int, int]) -> Image.Image:
    """Smart-crop + resize to exactly fill target, maintaining aspect ratio."""
    tw, th = target
    iw, ih = img.size
    if iw == 0 or ih == 0:
        return img.resize(target, Image.LANCZOS)
    t_ratio = tw / th
    i_ratio = iw / ih
    if i_ratio > t_ratio:
        new_w = int(ih * t_ratio)
        left  = (iw - new_w) // 2
        img   = img.crop((left, 0, left + new_w, ih))
    else:
        new_h = int(iw / t_ratio)
        top   = (ih - new_h) // 4   # favour upper portion
        img   = img.crop((0, top, iw, top + new_h))
    return img.resize(target, Image.LANCZOS)


def _paste_alpha(canvas: Image.Image, layer: Image.Image, pos: tuple[int, int]) -> None:
    """Paste an RGBA layer onto canvas using its own alpha channel."""
    if layer.mode != 'RGBA':
        layer = layer.convert('RGBA')
    canvas.paste(layer, pos, layer.split()[3])


def _wrap(text: str, font, max_w: int, draw: ImageDraw.ImageDraw) -> list[str]:
    words  = text.split()
    lines: list[str] = []
    current: list[str] = []
    for word in words:
        test = ' '.join(current + [word])
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] <= max_w:
            current.append(word)
        else:
            if current:
                lines.append(' '.join(current))
            current = [word]
    if current:
        lines.append(' '.join(current))
    return lines or ['']


def _text_h(draw: ImageDraw.ImageDraw, text: str, font) -> int:
    bb = draw.textbbox((0, 0), text, font=font)
    return bb[3] - bb[1]


def _text_w(draw: ImageDraw.ImageDraw, text: str, font) -> int:
    bb = draw.textbbox((0, 0), text, font=font)
    return bb[2] - bb[0]


def _draw_rounded_rect(draw: ImageDraw.ImageDraw, xy, radius: int, fill) -> None:
    x0, y0, x1, y1 = xy
    draw.rectangle([x0 + radius, y0, x1 - radius, y1], fill=fill)
    draw.rectangle([x0, y0 + radius, x1, y1 - radius], fill=fill)
    draw.ellipse([x0, y0, x0 + radius * 2, y0 + radius * 2], fill=fill)
    draw.ellipse([x1 - radius * 2, y0, x1, y0 + radius * 2], fill=fill)
    draw.ellipse([x0, y1 - radius * 2, x0 + radius * 2, y1], fill=fill)
    draw.ellipse([x1 - radius * 2, y1 - radius * 2, x1, y1], fill=fill)


# ── slide navigation dot ─────────────────────────────────────────────────────

def _draw_nav_dots(draw: ImageDraw.ImageDraw, w: int, y: int,
                   total: int, active: int, color) -> None:
    dot_r  = 6
    gap    = 22
    total_w = total * (dot_r * 2) + (total - 1) * (gap - dot_r * 2)
    sx = (w - total_w) // 2
    for i in range(total):
        cx = sx + i * gap
        fill = color if i == active else (*color[:3], 80)
        draw.ellipse([cx, y, cx + dot_r * 2, y + dot_r * 2], fill=fill)


# ── main generator class ──────────────────────────────────────────────────────

class SocialMediaPostGenerator:

    def __init__(self) -> None:
        ensure_fonts()

    # ── public API ────────────────────────────────────────────────────────────

    def create_individual_post(
        self, *, image_path: str, product_name: str, tagline: str,
        brand_name: str, cta: str, style: str, platform: str, output_dir: str,
    ) -> list[str]:
        size   = PLATFORM_SIZES.get(platform, (1080, 1080))
        colors = _extract_colors(image_path)

        with Image.open(image_path) as raw:
            prod = raw.convert('RGBA')
            dispatch = {
                'minimal':  self._minimal,
                'bold':     self._bold,
                'magazine': self._magazine,
            }
            fn = dispatch.get(style, self._minimal)
            canvas = fn(prod, product_name, tagline, brand_name, cta, size, colors)

        out = os.path.join(output_dir, 'post_main.jpg')
        canvas.convert('RGB').save(out, 'JPEG', quality=95)
        return [out]

    def create_carousel_posts(
        self, *, image_path: str, product_name: str, tagline: str,
        description: str, features: list[str], brand_name: str, cta: str,
        style: str, platform: str, output_dir: str,
    ) -> list[str]:
        size   = (1080, 1080)   # carousels always square
        colors = _extract_colors(image_path)

        with Image.open(image_path) as raw:
            prod = raw.convert('RGBA')
            slides = [
                self._c_cover(prod, product_name, tagline, brand_name, size, colors),
                self._c_intro(prod, product_name, tagline, description, size, colors),
                self._c_features(features[:3], product_name, size, colors, slide=2),
                self._c_details(prod, description, features[3:6], product_name, size, colors),
                self._c_cta(prod, product_name, cta, brand_name, size, colors),
            ]

        paths: list[str] = []
        labels = ['01_cover', '02_intro', '03_features', '04_details', '05_cta']
        for label, slide in zip(labels, slides):
            p = os.path.join(output_dir, f'slide_{label}.jpg')
            slide.convert('RGB').save(p, 'JPEG', quality=95)
            paths.append(p)
        return paths

    # ── individual-post styles ────────────────────────────────────────────────

    def _minimal(self, prod, name, tagline, brand, cta, size, colors):
        """Warm white bg · subtle tinted accent circle · product centred · clean editorial text."""
        w, h = size
        bg    = (252, 252, 250, 255)
        canvas = Image.new('RGBA', size, bg)

        # ── image area ──────────────────────────────────────────────────
        area_w = int(w * 0.82)
        area_h = int(h * 0.58)
        area_x = (w - area_w) // 2
        area_y = int(h * 0.04)

        # Large subtle accent circle behind product — adds canvas depth
        circle_layer = Image.new('RGBA', size, (0, 0, 0, 0))
        cd  = ImageDraw.Draw(circle_layer)
        cr  = int(min(area_w, area_h) * 0.62)
        ccx = w // 2
        ccy = area_y + area_h // 2
        tint = _lighten(colors['dominant'], 0.84)
        cd.ellipse([ccx - cr, ccy - cr, ccx + cr, ccy + cr],
                   fill=(*tint, 38))
        canvas = Image.alpha_composite(canvas, circle_layer)

        product = prod.copy()
        product.thumbnail((area_w, area_h), Image.LANCZOS)
        px = area_x + (area_w - product.width)  // 2
        py = area_y + (area_h - product.height) // 2

        # subtle shadow under product
        shad = Image.new('RGBA', size, (0, 0, 0, 0))
        sd   = ImageDraw.Draw(shad)
        sr   = [px + 20, py + product.height - 10,
                px + product.width - 20, py + product.height + 30]
        sd.ellipse(sr, fill=(0, 0, 0, 55))
        canvas = Image.alpha_composite(canvas, shad.filter(ImageFilter.GaussianBlur(20)))

        _paste_alpha(canvas, product, (px, py))

        # ── text area ───────────────────────────────────────────────────
        draw   = ImageDraw.Draw(canvas)
        ty     = area_y + area_h + int(h * 0.032)
        margin = int(w * 0.074)

        # wider accent bar + thin decorative second bar
        acc = _to_rgba(colors['dominant'])
        draw.rectangle([(margin, ty), (margin + 56, ty + 5)], fill=acc)
        draw.rectangle([(margin + 62, ty + 1), (margin + 74, ty + 4)],
                       fill=(*colors['dominant'], 100))
        ty += 26

        # product name — slightly larger for presence
        tf    = get_font('bold', self._scale(w, 72))
        lines = _wrap(name.upper(), tf, w - margin * 2, draw)
        for line in lines[:2]:
            draw.text((margin, ty), line, font=tf, fill=(18, 18, 18, 255))
            ty += _text_h(draw, line, tf) + 8
        ty += 8

        # tagline — refined light weight
        if tagline:
            sf = get_font('light', self._scale(w, 33))
            for line in _wrap(tagline, sf, w - margin * 2, draw)[:2]:
                draw.text((margin, ty), line, font=sf, fill=(110, 110, 110, 255))
                ty += _text_h(draw, line, sf) + 7

        # CTA pill — subtle, bottom aligned
        if cta:
            cf   = get_font('semibold', self._scale(w, 24))
            cw   = _text_w(draw, cta, cf)
            pad  = 22
            pill_y = h - int(h * 0.092)
            _draw_rounded_rect(draw, (margin, pill_y, margin + cw + pad * 2, pill_y + 46),
                               23, _to_rgba(colors['dominant']))
            draw.text((margin + pad, pill_y + 11), cta, font=cf,
                      fill=(255, 255, 255, 255))

        # brand bottom-right
        if brand:
            bf   = get_font('light', self._scale(w, 24))
            bw   = _text_w(draw, brand, bf)
            draw.text((w - bw - margin, h - int(h * 0.076)), brand,
                      font=bf, fill=(165, 165, 165, 255))

        return canvas

    def _bold(self, prod, name, tagline, brand, cta, size, colors):
        """Full-bleed product photo · light vignette top · strong gradient bottom text area."""
        w, h = size

        # background: product image cropped to full frame
        bg = _crop_to_fit(prod.convert('RGB'), size).convert('RGBA')
        # very light uniform tint — just enough contrast without hiding the product
        dark_layer = Image.new('RGBA', size, (0, 0, 0, 55))
        canvas = Image.alpha_composite(bg, dark_layer)

        # gradient darkens only the bottom ~55% where text lives
        grad = _gradient_overlay(size, (0, 0, 0, 0), (0, 0, 0, 215))
        canvas = Image.alpha_composite(canvas, grad)

        draw   = ImageDraw.Draw(canvas)
        margin = int(w * 0.083)

        # brand name top-right
        if brand:
            bf = get_font('semibold', self._scale(w, 28))
            bw = _text_w(draw, brand.upper(), bf)
            draw.text((w - bw - margin, margin),
                      brand.upper(), font=bf, fill=(255, 255, 255, 180))

        # left accent bar
        acc  = _to_rgba(colors['dominant'])
        barx = margin - 18
        draw.rectangle([(barx, h - int(h * 0.36)),
                        (barx + 6, h - int(h * 0.09))], fill=acc)

        # product name
        y = h - int(h * 0.32)
        tf = get_font('bold', self._scale(w, 82))
        for line in _wrap(name.upper(), tf, w - margin * 2, draw)[:2]:
            draw.text((margin, y), line, font=tf,
                      fill=(255, 255, 255, 255))
            y += _text_h(draw, line, tf) + 10
        y += 10

        # tagline
        if tagline:
            sf = get_font('regular', self._scale(w, 36))
            for line in _wrap(tagline, sf, w - margin * 2, draw)[:2]:
                draw.text((margin, y), line, font=sf,
                          fill=(255, 255, 255, 190))
                y += _text_h(draw, line, sf) + 8
        y += 14

        # CTA pill
        if cta:
            cf   = get_font('semibold', self._scale(w, 28))
            cw   = _text_w(draw, cta, cf)
            pad  = 28
            pill = (margin, y, margin + cw + pad * 2, y + 52)
            _draw_rounded_rect(draw, pill, 26, _to_rgba(colors['accent']))
            draw.text((margin + pad, y + 12), cta, font=cf, fill=(255, 255, 255, 255))

        return canvas

    def _magazine(self, prod, name, tagline, brand, cta, size, colors):
        """Full-bleed product hero · white editorial bottom panel · clean magazine feel."""
        w, h = size

        # Full-bleed product image as canvas base
        bg     = _crop_to_fit(prod.convert('RGB'), size).convert('RGBA')
        canvas = bg.copy()

        # White editorial panel — bottom 42%
        panel_h = int(h * 0.42)
        panel_y = h - panel_h
        draw = ImageDraw.Draw(canvas)
        draw.rectangle([(0, panel_y), (w, h)], fill=(255, 255, 255, 255))

        # Feathered transition: gradient from transparent → white just above panel
        fade_h  = int(h * 0.06)
        fade    = _gradient_overlay((w, fade_h), (255, 255, 255, 0), (255, 255, 255, 255))
        _paste_alpha(canvas, fade, (0, panel_y - fade_h))

        # Re-acquire draw after compositing
        draw = ImageDraw.Draw(canvas)
        margin = int(w * 0.083)

        # ── brand watermark top-left on image area ──────────────────────────
        if brand:
            top_bar_h = int(h * 0.10)
            top_veil  = Image.new('RGBA', (w, top_bar_h), (0, 0, 0, 90))
            _paste_alpha(canvas, top_veil, (0, 0))
            draw = ImageDraw.Draw(canvas)
            bf   = get_font('semibold', self._scale(w, 24))
            draw.text((margin, int(top_bar_h * 0.28)), brand.upper(),
                      font=bf, fill=(255, 255, 255, 200))

        # ── white panel text block ────────────────────────────────────────
        acc = _to_rgba(colors['dominant'])

        # Wide accent bar
        bar_y = panel_y + int(panel_h * 0.10)
        draw.rectangle([(margin, bar_y), (margin + int(w * 0.28), bar_y + 5)], fill=acc)
        ty = bar_y + 26

        # Product name — large, commanding
        tf = get_font('bold', self._scale(w, 72))
        for line in _wrap(name.upper(), tf, w - margin * 2, draw)[:2]:
            draw.text((margin, ty), line, font=tf, fill=(15, 15, 15, 255))
            ty += _text_h(draw, line, tf) + 6
        ty += 8

        # Tagline — light weight, refined
        if tagline:
            sf = get_font('light', self._scale(w, 30))
            for line in _wrap(tagline, sf, int(w * 0.68), draw)[:2]:
                draw.text((margin, ty), line, font=sf, fill=(105, 105, 105, 255))
                ty += _text_h(draw, line, sf) + 6

        # ── bottom row: brand label left · CTA pill right ─────────────────
        bottom_y = h - int(h * 0.062)

        if brand:
            lf = get_font('regular', self._scale(w, 20))
            draw.text((margin, bottom_y), brand.upper(),
                      font=lf, fill=(*_darken(colors['dominant'], 0.25), 180))

        if cta:
            cf     = get_font('semibold', self._scale(w, 26))
            cw     = _text_w(draw, cta, cf)
            pad    = 26
            pill_h = 50
            px1    = w - margin
            px0    = px1 - cw - pad * 2
            py0    = bottom_y - 8
            _draw_rounded_rect(draw, (px0, py0, px1, py0 + pill_h),
                               25, _to_rgba(colors['dominant']))
            draw.text((px0 + pad, py0 + 12), cta, font=cf,
                      fill=(255, 255, 255, 255))

        return canvas

    # ── carousel slides ───────────────────────────────────────────────────────

    def _c_header(self, draw, brand, w, margin, colors, white=False):
        """Shared brand name header across all carousel slides."""
        if not brand:
            return
        bf    = get_font('semibold', 28)
        color = (255, 255, 255, 200) if white else (*_darken(colors['dominant'], 0.4), 255)
        draw.text((margin, margin - 4), brand.upper(), font=bf, fill=color)

    def _c_cover(self, prod, name, tagline, brand, size, colors):
        """Slide 1 — full-bleed hero, product name bottom, swipe hint."""
        w, h = size
        bg    = _crop_to_fit(prod.convert('RGB'), size).convert('RGBA')
        dark  = Image.new('RGBA', size, (0, 0, 0, 110))
        canvas = Image.alpha_composite(bg, dark)

        top_grad = _gradient_overlay(size, (0, 0, 0, 180), (0, 0, 0, 0))
        bot_grad = _gradient_overlay(size, (0, 0, 0, 0), (0, 0, 0, 230))
        canvas   = Image.alpha_composite(canvas, top_grad)
        canvas   = Image.alpha_composite(canvas, bot_grad)

        draw   = ImageDraw.Draw(canvas)
        margin = 72

        self._c_header(draw, brand, w, margin, colors, white=True)

        # "Swipe →" hint
        hf = get_font('light', 24)
        hint = 'Swipe for more →'
        hw   = _text_w(draw, hint, hf)
        draw.text((w - hw - margin, margin), hint,
                  font=hf, fill=(255, 255, 255, 160))

        # product name bottom
        y  = h - int(h * 0.30)
        tf = get_font('bold', 88)
        for line in _wrap(name.upper(), tf, w - margin * 2, draw)[:2]:
            draw.text((margin, y), line, font=tf, fill=(255, 255, 255, 255))
            y += _text_h(draw, line, tf) + 10
        y += 10

        if tagline:
            sf = get_font('regular', 36)
            for line in _wrap(tagline, sf, w - margin * 2, draw)[:2]:
                draw.text((margin, y), line, font=sf,
                          fill=(255, 255, 255, 190))
                y += _text_h(draw, line, sf) + 6

        # slide dots
        _draw_nav_dots(draw, w, h - 46, 5, 0, (255, 255, 255, 255))
        return canvas

    def _c_intro(self, prod, name, tagline, description, size, colors):
        """Slide 2 — right-side product thumbnail, intro text left."""
        w, h = size
        bg_col = _lighten(colors['dominant'], 0.90)
        canvas = Image.new('RGBA', size, (*bg_col, 255))

        # right thumb
        thumb_sz = int(w * 0.42)
        thumb    = prod.copy()
        thumb.thumbnail((thumb_sz, thumb_sz), Image.LANCZOS)
        tx = w - thumb.width - 40
        ty = (h - thumb.height) // 2
        _paste_alpha(canvas, thumb, (tx, ty))

        # subtle colour strip on the right edge
        draw = ImageDraw.Draw(canvas)
        acc  = _to_rgba(colors['dominant'])
        draw.rectangle([(w - 8, 0), (w, h)], fill=acc)

        margin = 72
        self._c_header(draw, name, w, margin, colors, white=False)

        y = int(h * 0.22)
        # "Introducing…" label
        lf = get_font('semibold', 28)
        draw.text((margin, y), 'Introducing', font=lf,
                  fill=(*colors['dominant'], 255))
        y += 42

        # big name
        tf = get_font('bold', 80)
        for line in _wrap(name.upper(), tf, int(w * 0.52), draw)[:2]:
            draw.text((margin, y), line, font=tf, fill=(22, 22, 22, 255))
            y += _text_h(draw, line, tf) + 10
        y += 14

        # divider
        draw.rectangle([(margin, y), (margin + 60, y + 5)], fill=acc)
        y += 28

        # description
        if description:
            df   = get_font('regular', 32)
            text = description[:200]   # keep it readable
            for line in _wrap(text, df, int(w * 0.50), draw)[:5]:
                draw.text((margin, y), line, font=df, fill=(70, 70, 70, 255))
                y += _text_h(draw, line, df) + 8

        _draw_nav_dots(draw, w, h - 46, 5, 1, (*_darken(colors['dominant'], 0.4), 255))
        return canvas

    def _c_features(self, features: list[str], name: str, size, colors, slide: int = 2):
        """Slide 3 (or 4) — bullet list of key features."""
        w, h = size
        bg_col = (25, 25, 35, 255) if slide % 2 == 0 else _to_rgba(_darken(colors['dominant'], 0.55))
        canvas = Image.new('RGBA', size, bg_col)
        draw   = ImageDraw.Draw(canvas)
        margin = 80

        # top accent
        acc = _to_rgba(colors['accent'])
        draw.rectangle([(0, 0), (w, 8)], fill=acc)

        # section label
        lf = get_font('semibold', 28)
        draw.text((margin, margin + 10), 'KEY FEATURES',
                  font=lf, fill=(*colors['accent'], 255))

        y  = int(h * 0.22)
        tf = get_font('bold', 62)
        draw.text((margin, y), name.upper()[:28], font=tf,
                  fill=(255, 255, 255, 255))
        y += _text_h(draw, name[:28], tf) + 40

        # feature bullets
        bf = get_font('semibold', 36)
        rf = get_font('regular', 32)
        if not features:
            features = ['Quality crafted for everyday use',
                        'Designed with you in mind',
                        'Trusted by professionals']
        for i, feat in enumerate(features[:4]):
            # number badge
            num = str(i + 1)
            nr  = 28
            nx  = margin
            ny  = y + 4
            draw.ellipse([nx, ny, nx + nr * 2, ny + nr * 2], fill=acc)
            nf  = get_font('bold', 24)
            nw  = _text_w(draw, num, nf)
            draw.text((nx + nr - nw // 2, ny + 6), num, font=nf,
                      fill=(255, 255, 255, 255))

            # feature text
            fx = margin + nr * 2 + 18
            draw.text((fx, y), feat[:55], font=bf, fill=(255, 255, 255, 255))
            y += _text_h(draw, feat, bf) + 8
            y += 30

        dot_color = (255, 255, 255, 255)
        _draw_nav_dots(draw, w, h - 46, 5, slide, dot_color)
        return canvas

    def _c_details(self, prod, description, extra_features, name, size, colors):
        """Slide 4 — product image + more detail / extra features."""
        w, h = size

        if extra_features:
            return self._c_features(extra_features, name, size, colors, slide=3)

        # otherwise show a photo + description layout
        bg_col = _lighten(colors['dominant'], 0.88)
        canvas = Image.new('RGBA', size, (*bg_col, 255))

        # top half image
        top_h  = int(h * 0.50)
        bg_img = _crop_to_fit(prod.convert('RGB'), (w, top_h)).convert('RGBA')
        _paste_alpha(canvas, bg_img, (0, 0))

        # gradient fade from top image into panel
        fade = _gradient_overlay((w, int(h * 0.15)), (0, 0, 0, 0), (*bg_col, 255))
        _paste_alpha(canvas, fade, (0, top_h - int(h * 0.08)))

        draw   = ImageDraw.Draw(canvas)
        margin = 72
        y      = top_h + 30

        acc = _to_rgba(colors['dominant'])
        draw.rectangle([(margin, y), (margin + 60, y + 5)], fill=acc)
        y += 30

        # title
        tf = get_font('bold', 62)
        draw.text((margin, y), name.upper()[:28], font=tf, fill=(22, 22, 22, 255))
        y += _text_h(draw, name[:28], tf) + 18

        # description
        if description:
            df = get_font('regular', 31)
            for line in _wrap(description[:180], df, w - margin * 2, draw)[:5]:
                draw.text((margin, y), line, font=df, fill=(60, 60, 60, 255))
                y += _text_h(draw, line, df) + 8

        _draw_nav_dots(draw, w, h - 46, 5, 3, (*_darken(colors['dominant'], 0.4), 255))
        return canvas

    def _c_cta(self, prod, name, cta, brand, size, colors):
        """Slide 5 — strong CTA finish."""
        w, h = size

        # blurred bg derived from product image
        bg  = _crop_to_fit(prod.convert('RGB'), size).convert('RGBA')
        blr = bg.filter(ImageFilter.GaussianBlur(18))
        dk  = Image.new('RGBA', size, (0, 0, 0, 170))
        canvas = Image.alpha_composite(blr, dk)

        draw   = ImageDraw.Draw(canvas)
        margin = 80
        acc    = _to_rgba(colors['accent'])

        # top accent bar
        draw.rectangle([(0, 0), (w, 8)], fill=acc)

        # brand
        self._c_header(draw, brand, w, margin, colors, white=True)

        # centre block
        cy = int(h * 0.30)
        tf = get_font('bold', 92)
        draw.text((margin, cy), name.upper()[:20], font=tf,
                  fill=(255, 255, 255, 255))
        cy += _text_h(draw, name[:20], tf) + 18

        sf = get_font('light', 38)
        tag = 'Get yours today.'
        draw.text((margin, cy), tag, font=sf, fill=(255, 255, 255, 190))
        cy += _text_h(draw, tag, sf) + 50

        # big CTA button
        cf  = get_font('bold', 40)
        cw  = _text_w(draw, cta, cf)
        pad = 50
        btn_h   = 80
        btn_x0  = margin
        btn_x1  = margin + cw + pad * 2
        _draw_rounded_rect(draw, (btn_x0, cy, btn_x1, cy + btn_h), 40, acc)
        draw.text((btn_x0 + pad, cy + 20), cta, font=cf,
                  fill=(255, 255, 255, 255))

        _draw_nav_dots(draw, w, h - 46, 5, 4, (255, 255, 255, 255))
        return canvas

    # ── utility ───────────────────────────────────────────────────────────────

    @staticmethod
    def _scale(base_w: int, size: int) -> int:
        """Scale font size proportionally for non-square canvases."""
        return max(18, int(size * base_w / 1080))
