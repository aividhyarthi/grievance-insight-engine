"""
Core image generation engine.

Three individual-post styles:
  • minimal  (Vivid)  – branded gradient bg + giant ghost letter + product hero
  • bold     (Stripe) – left color sidebar + crystal-clear product + bold bottom panel
  • magazine (Frame)  – product bleeds right edge, bold editorial type left, circle accent

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
    'website_featured':  (1200, 900),
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


def _h_gradient_overlay(
    size: tuple[int, int],
    color_left: tuple,
    color_right: tuple,
) -> Image.Image:
    """Horizontal gradient RGBA image (left → right)."""
    w, h = size
    img  = Image.new('RGBA', (w, h))
    draw = ImageDraw.Draw(img)
    for x in range(w):
        t = x / w
        r = _clamp(int(color_left[0] * (1 - t) + color_right[0] * t))
        g = _clamp(int(color_left[1] * (1 - t) + color_right[1] * t))
        b = _clamp(int(color_left[2] * (1 - t) + color_right[2] * t))
        a = _clamp(int(color_left[3] * (1 - t) + color_right[3] * t))
        draw.line([(x, 0), (x, h)], fill=(r, g, b, a))
    return img


def _rotated_text(text: str, font, fill: tuple) -> Image.Image:
    """Render text then rotate 90° CCW so it reads bottom→top when placed vertically."""
    tmp = Image.new('RGBA', (1, 1))
    bb  = ImageDraw.Draw(tmp).textbbox((0, 0), text, font=font)
    tw  = bb[2] - bb[0] + 6
    th  = bb[3] - bb[1] + 6
    img = Image.new('RGBA', (tw, th), (0, 0, 0, 0))
    ImageDraw.Draw(img).text((3, 3), text, font=font, fill=fill)
    return img.rotate(90, expand=True)


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


def _draw_star(draw: ImageDraw.ImageDraw, center: tuple, r: int, fill) -> None:
    """Draw a 4-point sparkle star. r = outer radius."""
    cx, cy = center
    pts = []
    for i in range(8):
        angle  = math.pi * i / 4 - math.pi / 2
        radius = r if i % 2 == 0 else max(2, int(r * 0.38))
        pts.append((cx + radius * math.cos(angle),
                    cy + radius * math.sin(angle)))
    draw.polygon(pts, fill=fill)


def _badge_label(name: str) -> str:
    """Derive a short category badge from the product name."""
    nl = name.lower()
    if any(k in nl for k in ('kids', 'children', 'toddler', 'baby')):
        return 'KIDS COLLECTION'
    if any(k in nl for k in ('bed', 'sheet', 'pillow', 'quilt', 'duvet', 'linen')):
        return 'HOME COLLECTION'
    if any(k in nl for k in ('shirt', 'dress', 'pant', 'jacket', 'wear', 'cloth')):
        return 'FASHION'
    if any(k in nl for k in ('phone', 'laptop', 'tech', 'device', 'electronic')):
        return 'TECH'
    return 'FEATURED'


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


def _draw_brand_band(
    canvas: Image.Image, w: int, h: int,
    brand: str, colors: dict,
    slide_idx: int, slide_total: int = 5,
) -> int:
    """Draw accent footer band (brand name + white nav dots). Returns band_y."""
    band_h = 90
    band_y = h - band_h
    # Respect style-specific band colour if set
    acc    = _to_rgba(colors.get('band_acc', colors['accent']))
    draw   = ImageDraw.Draw(canvas)
    draw.rectangle([(0, band_y), (w, h)], fill=acc)

    brand_up = (brand or '').upper()
    if brand_up:
        bf = get_font('light', 20)
        bw = _text_w(draw, brand_up, bf)
        draw.text(((w - bw) // 2, band_y + 10), brand_up,
                  font=bf, fill=(255, 255, 255, 175))

    _draw_nav_dots(draw, w, band_y + 54, slide_total, slide_idx,
                   (255, 255, 255, 230))
    return band_y


def _carousel_bg(colors: dict, delta: float = 0.0) -> tuple:
    """Background colour for a carousel slide, respecting style theme overrides."""
    fixed = colors.get('bg_fixed')
    if fixed:
        return fixed
    tint = min(0.97, colors.get('bg_tint', 0.91) + delta)
    return _lighten(colors['dominant'], tint)


def _draw_instagram_icon(
    draw: ImageDraw.ImageDraw, cx: int, cy: int, r: int = 18, fill=None
) -> None:
    """Draw a simplified Instagram camera icon centred at (cx, cy)."""
    if fill is None:
        fill = (193, 53, 132, 210)   # Instagram gradient purple-pink fallback
    _draw_rounded_rect(draw, (cx - r, cy - r, cx + r, cy + r), r // 3, fill)
    ir = int(r * 0.52)
    draw.ellipse([cx - ir, cy - ir, cx + ir, cy + ir],
                 outline=(255, 255, 255, 220), width=max(2, r // 8))
    dr = max(2, r // 7)
    dx = cx + int(r * 0.48)
    dy = cy - int(r * 0.48)
    draw.ellipse([dx - dr, dy - dr, dx + dr, dy + dr],
                 fill=(255, 255, 255, 220))


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
        out    = os.path.join(output_dir, 'post_main.jpg')

        # Try SVG renderer first (browser-free, Canva-quality output)
        try:
            from utils.html_renderer import render_studio, render_stripe, render_frame
            _svg_dispatch = {
                'minimal':  render_studio,
                'bold':     render_stripe,
                'magazine': render_frame,
            }
            fn = _svg_dispatch.get(style, render_studio)
            fn(
                image_path=image_path, name=product_name, tagline=tagline,
                brand=brand_name, cta=cta, colors=colors, size=size,
                output_path=out,
            )
            return [out]
        except Exception as exc:
            print(f'[svg_renderer] failed ({exc}), falling back to PIL')

        # PIL fallback
        with Image.open(image_path) as raw:
            prod = raw.convert('RGBA')
            dispatch = {
                'minimal':  self._minimal,
                'bold':     self._bold,
                'magazine': self._magazine,
            }
            canvas = dispatch.get(style, self._minimal)(
                prod, product_name, tagline, brand_name, cta, size, colors)

        canvas.convert('RGB').save(out, 'JPEG', quality=95)
        return [out]

    def create_carousel_posts(
        self, *, image_path: str, product_name: str, tagline: str,
        description: str, features: list[str], brand_name: str, cta: str,
        style: str, platform: str, output_dir: str,
    ) -> list[str]:
        size = PLATFORM_SIZES.get(platform, (1080, 1080))
        if size[1] > 1350:
            size = (1080, 1350)   # cap carousel to portrait max
        colors = _extract_colors(image_path)
        # Apply style-specific theme overrides so each style looks distinct
        if style == 'bold':
            colors = {**colors, 'bg_tint': 0.55,
                      'card_bg': (*_lighten(colors['dominant'], 0.82), 235),
                      'band_acc': colors['dominant']}
        elif style == 'magazine':
            colors = {**colors, 'bg_fixed': (248, 244, 238),
                      'card_bg': (255, 255, 255, 250),
                      'band_acc': colors['accent']}

        with Image.open(image_path) as raw:
            prod = raw.convert('RGBA')
            slides = [
                self._c_cover(prod, product_name, tagline, brand_name, size, colors),
                self._c_intro(prod, product_name, tagline, description, brand_name, size, colors),
                self._c_features(features[:3], product_name, brand_name, size, colors, slide=2),
                self._c_details(prod, description, features[3:6], product_name, brand_name, size, colors),
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
        """VIVID: Branded gradient bg · giant ghost letter · product floating · bold type."""
        w, h   = size
        margin = int(w * 0.074)

        # ── Step 1: Gradient background (brand tint → white) ────────────
        bg_tint = _lighten(colors['dominant'], 0.88)
        canvas  = Image.new('RGBA', size, (*bg_tint, 255))
        # Soft gradient: keep tint top, fade to near-white bottom
        grad = _gradient_overlay(size, (255, 255, 255, 0), (255, 255, 255, 170))
        canvas = Image.alpha_composite(canvas, grad)

        # ── Step 2: Giant ghost letter — background texture ──────────────
        first   = (name[0] if name else 'P').upper()
        ghost_f = get_font('bold', self._scale(w, 460))
        ghost_layer = Image.new('RGBA', size, (0, 0, 0, 0))
        gd = ImageDraw.Draw(ghost_layer)
        gb = gd.textbbox((0, 0), first, font=ghost_f)
        # Anchor the letter to the right half, clipped at canvas edge
        gx = int(w * 0.46)
        gy = -int((gb[3] - gb[1]) * 0.08)
        gd.text((gx, gy), first, font=ghost_f,
                fill=(*colors['dominant'], 14))
        canvas = Image.alpha_composite(canvas, ghost_layer)

        # ── Step 3: Brand label — top-left, refined ─────────────────────
        draw = ImageDraw.Draw(canvas)
        if brand:
            bf = get_font('semibold', self._scale(w, 22))
            draw.text((margin, int(h * 0.038)), brand.upper(),
                      font=bf, fill=(*_darken(colors['dominant'], 0.15), 210))

        # ── Step 4: Product image — clear, prominent, centred upper area ─
        # Keep image at 46% height so there is room for text below
        area_w = int(w * 0.80)
        area_h = int(h * 0.46)
        area_y = int(h * 0.085)
        area_x = (w - area_w) // 2

        product = prod.copy()
        product.thumbnail((area_w, area_h), Image.LANCZOS)
        px = area_x + (area_w - product.width)  // 2
        py = area_y + (area_h - product.height) // 2

        # Elliptical drop shadow
        shad = Image.new('RGBA', size, (0, 0, 0, 0))
        sd   = ImageDraw.Draw(shad)
        sd.ellipse([px + 28, py + product.height - 6,
                    px + product.width - 28, py + product.height + 40],
                   fill=(0, 0, 0, 42))
        canvas = Image.alpha_composite(
            canvas, shad.filter(ImageFilter.GaussianBlur(24)))

        _paste_alpha(canvas, product, (px, py))

        # ── Step 5: Text block ────────────────────────────────────────────
        draw = ImageDraw.Draw(canvas)
        ty   = area_y + area_h + int(h * 0.022)
        acc  = _to_rgba(colors['dominant'])

        # Kids / category badge pill above product name
        badge = _badge_label(name)
        if badge != 'FEATURED':
            badge_f = get_font('semibold', self._scale(w, 18))
            badge_w = _text_w(draw, badge, badge_f)
            bpad, bht = 14, 28
            _draw_rounded_rect(draw,
                               (margin, ty, margin + badge_w + bpad * 2, ty + bht),
                               14, acc)
            draw.text((margin + bpad, ty + 5), badge,
                      font=badge_f, fill=(255, 255, 255, 255))
            ty += bht + 10

        # Bold accent bar
        draw.rectangle([(margin, ty), (margin + 72, ty + 7)], fill=acc)
        draw.rectangle([(margin + 78, ty + 1), (margin + 92, ty + 5)],
                       fill=(*colors['dominant'], 90))
        ty += 30

        # Product name — bold, dominant, sentence case
        nf = get_font('bold', self._scale(w, 68))
        for font_size in range(68, 27, -6):
            nf        = get_font('bold', self._scale(w, font_size))
            all_lines = _wrap(name, nf, w - margin * 2, draw)
            nlines    = all_lines[:2]
            if len(all_lines) <= 2:
                break
        for line in nlines:
            draw.text((margin, ty), line, font=nf, fill=(12, 12, 12, 255))
            ty += _text_h(draw, line, nf) + 6
        ty += 6

        # Tagline — light, colored
        if tagline:
            sf = get_font('light', self._scale(w, 30))
            for line in _wrap(tagline, sf, w - margin * 2, draw)[:2]:
                draw.text((margin, ty), line, font=sf,
                          fill=(*_darken(colors['dominant'], 0.08), 210))
                ty += _text_h(draw, line, sf) + 6

        # CTA pill — positioned dynamically after text content
        ty += 20
        bottom_safe = h - int(h * 0.10)   # leave 10% margin at bottom
        if cta and ty + 54 < bottom_safe:
            cf  = get_font('semibold', self._scale(w, 25))
            cw  = _text_w(draw, cta, cf)
            pad = 24
            _draw_rounded_rect(draw,
                               (margin, ty, margin + cw + pad * 2, ty + 50),
                               25, acc)
            draw.text((margin + pad, ty + 13), cta,
                      font=cf, fill=(255, 255, 255, 255))
            ty += 60

        # Instagram icon + brand watermark — bottom row
        wm_y = h - int(h * 0.052)
        if brand:
            bf2 = get_font('light', self._scale(w, 20))
            bw  = _text_w(draw, brand, bf2)
            draw.text((w - bw - margin, wm_y), brand,
                      font=bf2, fill=(155, 155, 155, 255))
        _draw_instagram_icon(draw, margin + 18, wm_y + 10,
                             r=self._scale(w, 16),
                             fill=(193, 53, 132, 190))

        return canvas

    def _bold(self, prod, name, tagline, brand, cta, size, colors):
        """STRIPE: Crystal-clear product · left color sidebar · bold bottom color panel."""
        w, h      = size
        strip_w   = int(w * 0.155)
        panel_h   = int(h * 0.32)
        panel_y   = h - panel_h
        margin_l  = strip_w + int(w * 0.055)   # text starts right of strip
        margin_r  = int(w * 0.048)

        # ── Step 1: Full product image — BRIGHT, no overlay ─────────────
        bg     = _crop_to_fit(prod.convert('RGB'), size).convert('RGBA')
        canvas = bg.copy()

        # ── Step 2: Left color sidebar (full height) ─────────────────────
        strip = Image.new('RGBA', (strip_w, h), (*colors['dominant'], 240))
        _paste_alpha(canvas, strip, (0, 0))

        # Small diamond accent on strip (visual detail)
        draw = ImageDraw.Draw(canvas)
        dm   = int(strip_w * 0.20)
        dcx  = strip_w // 2
        dcy  = int(h * 0.08)
        draw.polygon([(dcx, dcy - dm), (dcx + dm, dcy),
                      (dcx, dcy + dm), (dcx - dm, dcy)],
                     fill=(255, 255, 255, 110))

        # Vertical brand name — reads bottom to top
        if brand:
            bf_v  = get_font('semibold', self._scale(w, 23))
            v_img = _rotated_text(brand.upper(), bf_v, (255, 255, 255, 200))
            bx    = (strip_w - v_img.width) // 2
            by    = (h - v_img.height) // 2
            _paste_alpha(canvas, v_img, (bx, by))

        # ── Step 3: Bottom color panel ────────────────────────────────────
        panel = Image.new('RGBA', (w, panel_h), (*colors['dominant'], 250))
        _paste_alpha(canvas, panel, (0, panel_y))

        # Bright thin accent line at top of panel
        draw = ImageDraw.Draw(canvas)
        line_col = _lighten(colors['dominant'], 0.35)
        draw.line([(strip_w, panel_y), (w, panel_y)],
                  fill=(*line_col, 200), width=3)

        # ── Step 4: Text on bottom panel ─────────────────────────────────
        ty = panel_y + int(panel_h * 0.12)

        # Product name — white, bold, HUGE
        tf = get_font('bold', self._scale(w, 80))
        max_tw = w - margin_l - margin_r
        for line in _wrap(name.upper(), tf, max_tw, draw)[:2]:
            draw.text((margin_l, ty), line, font=tf, fill=(255, 255, 255, 255))
            ty += _text_h(draw, line, tf) + 5
        ty += 5

        # Tagline — white, light weight, one line
        if tagline:
            sf = get_font('light', self._scale(w, 30))
            for line in _wrap(tagline, sf, max_tw, draw)[:1]:
                draw.text((margin_l, ty), line, font=sf,
                          fill=(255, 255, 255, 185))
                ty += _text_h(draw, line, sf) + 5

        # ── Step 5: CTA — inverted pill, positioned after text ───────────
        ty += 16
        panel_bottom = h - int(h * 0.04)
        if cta and ty + 54 < panel_bottom:
            cf     = get_font('semibold', self._scale(w, 26))
            cw_val = _text_w(draw, cta, cf)
            pad    = 26
            pill_h = 50
            px1    = w - margin_r
            px0    = px1 - cw_val - pad * 2
            _draw_rounded_rect(draw, (px0, ty, px1, ty + pill_h),
                               25, (255, 255, 255, 255))
            draw.text((px0 + pad, ty + 12), cta, font=cf,
                      fill=(*colors['dominant'], 255))

        # Instagram icon — top-right corner on sidebar
        _draw_instagram_icon(draw, strip_w // 2, int(h * 0.965),
                             r=self._scale(w, 14),
                             fill=(255, 255, 255, 160))

        return canvas

    def _magazine(self, prod, name, tagline, brand, cta, size, colors):
        """FRAME: Product bleeds right edge · bold editorial type left · large circle accent."""
        w, h   = size
        margin = int(w * 0.083)
        img_w  = int(w * 0.60)    # product takes right 60%

        # ── Step 1: Pure white canvas ────────────────────────────────────
        canvas = Image.new('RGBA', size, (255, 255, 255, 255))

        # ── Step 2: Product image — right side, full height ──────────────
        product_crop = _crop_to_fit(
            prod.convert('RGB'), (img_w, h)).convert('RGBA')
        # Fade the LEFT edge of the product into white (soft blend)
        fade_w = int(img_w * 0.30)
        fade   = _h_gradient_overlay(
            (fade_w, h), (255, 255, 255, 255), (255, 255, 255, 0))
        _paste_alpha(product_crop, fade, (0, 0))
        _paste_alpha(canvas, product_crop, (w - img_w, 0))

        # ── Step 3: Large decorative circle outline ───────────────────────
        # Centred on left text column, overlapping slightly into product
        draw = ImageDraw.Draw(canvas)
        cr   = int(h * 0.36)
        ccx  = int(w * 0.36)
        ccy  = int(h * 0.48)
        draw.ellipse([ccx - cr, ccy - cr, ccx + cr, ccy + cr],
                     outline=(*colors['dominant'], 28), width=4)

        # Second smaller concentric ring (design depth)
        cr2 = int(cr * 0.72)
        draw.ellipse([ccx - cr2, ccy - cr2, ccx + cr2, ccy + cr2],
                     outline=(*colors['dominant'], 14), width=2)

        # ── Step 4: Text column — left side ──────────────────────────────
        acc = _to_rgba(colors['dominant'])
        ty  = int(h * 0.072)

        # Brand — small, top of column
        if brand:
            bf = get_font('semibold', self._scale(w, 22))
            draw.text((margin, ty), brand.upper(),
                      font=bf, fill=(*_darken(colors['dominant'], 0.22), 220))
            ty += _text_h(draw, brand, bf) + 14

        # Short bold accent bar
        draw.rectangle([(margin, ty), (margin + int(w * 0.10), ty + 6)], fill=acc)
        ty += 28

        # Product name — very large, bold, left-aligned
        max_tw = int(w * 0.44)
        tf = get_font('bold', self._scale(w, 78))
        for line in _wrap(name.upper(), tf, max_tw, draw)[:3]:
            draw.text((margin, ty), line, font=tf, fill=(10, 10, 10, 255))
            ty += _text_h(draw, line, tf) + 6
        ty += 14

        # Tagline — regular weight, subdued
        if tagline:
            sf = get_font('regular', self._scale(w, 28))
            for line in _wrap(tagline, sf, max_tw, draw)[:3]:
                draw.text((margin, ty), line, font=sf,
                          fill=(118, 118, 118, 255))
                ty += _text_h(draw, line, sf) + 7
        ty += 20

        # CTA pill — flush left, dominant color
        if cta:
            cf     = get_font('semibold', self._scale(w, 26))
            cw_val = _text_w(draw, cta, cf)
            pad    = 26
            pill_h = 52
            _draw_rounded_rect(draw,
                               (margin, ty,
                                margin + cw_val + pad * 2, ty + pill_h),
                               26, acc)
            draw.text((margin + pad, ty + 14), cta,
                      font=cf, fill=(255, 255, 255, 255))
            ty += pill_h + 14

        # Instagram icon — below CTA or near bottom-left
        ig_y = max(ty + 8, h - int(h * 0.065))
        _draw_instagram_icon(draw, margin + 18, ig_y,
                             r=self._scale(w, 15),
                             fill=(193, 53, 132, 200))

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
        """Slide 1 — full-bleed hero image top 55%, gradient into branded panel, creative type."""
        w, h   = size
        margin = 60
        acc    = _to_rgba(colors['accent'])
        bg_col = _carousel_bg(colors, delta=0.02)

        # ── Base canvas: light brand tint ────────────────────────────────
        canvas = Image.new('RGBA', size, (*bg_col, 255))

        # ── Hero image: full-width, fills top 55% ────────────────────────
        img_h = int(h * 0.55)
        # Composite RGBA product onto white before crop (handles cutout PNGs)
        hero_bg = Image.new('RGB', prod.size, (255, 255, 255))
        if prod.mode == 'RGBA':
            hero_bg.paste(prod, mask=prod.split()[3])
        else:
            hero_bg.paste(prod)
        hero = _crop_to_fit(hero_bg, (w, img_h)).convert('RGBA')
        _paste_alpha(canvas, hero, (0, 0))

        # Gradient seam: blends the image bottom smoothly into bg panel
        fade = _gradient_overlay((w, 150), (0, 0, 0, 0), (*bg_col, 255))
        _paste_alpha(canvas, fade, (0, img_h - 70))

        # Dark top scrim so header text is always readable over any image
        scrim = _gradient_overlay((w, 120), (0, 0, 0, 170), (0, 0, 0, 0))
        _paste_alpha(canvas, scrim, (0, 0))

        draw = ImageDraw.Draw(canvas)

        # ── Brand name — white on dark scrim (top left) ──────────────────
        bf  = get_font('bold', 24)
        bup = (brand or '').upper()
        draw.text((margin, 36), bup, font=bf, fill=(255, 255, 255, 230))
        # Thin accent underline beneath brand name
        bw = _text_w(draw, bup, bf)
        draw.rectangle([(margin, 65), (margin + min(bw, 72), 69)],
                       fill=(*acc[:3], 200))

        # ── "Swipe for more →" — dark pill (always visible) ──────────────
        sf  = get_font('regular', 20)
        hint = 'Swipe for more  →'
        hw   = _text_w(draw, hint, sf)
        hx   = w - hw - margin - 20
        hy   = 33
        _draw_rounded_rect(draw, (hx - 14, hy - 6, hx + hw + 14, hy + 30),
                           17, (0, 0, 0, 130))
        draw.text((hx, hy), hint, font=sf, fill=(255, 255, 255, 235))

        # ── Decorative sparkle stars (placed in lower image area) ─────────
        _draw_star(draw, (w - 66,  int(img_h * 0.60)), 14, (*acc[:3], 200))
        _draw_star(draw, (44,      int(img_h * 0.72)), 10, (*acc[:3], 160))
        _draw_star(draw, (w - 108, int(img_h * 0.40)),  7, (*acc[:3], 130))

        # ── Text panel ───────────────────────────────────────────────────
        y       = img_h + 44
        nav_top = h - 65
        y_cap   = nav_top - 10

        # Category badge pill
        badge_f = get_font('semibold', 20)
        badge   = _badge_label(name)
        badge_w = _text_w(draw, badge, badge_f)
        bpad, bht = 18, 34
        _draw_rounded_rect(draw,
                           (margin, y, margin + badge_w + bpad * 2, y + bht),
                           17, acc)
        draw.text((margin + bpad, y + 7), badge, font=badge_f,
                  fill=(255, 255, 255, 255))
        y += bht + 20

        # Product name — auto-sized, sentence case (not ALL CAPS), bold
        nf, nlines = get_font('bold', 28), [name]
        for font_size in range(62, 27, -8):
            nf        = get_font('bold', font_size)
            all_lines = _wrap(name, nf, w - margin * 2, draw)
            nlines    = all_lines[:2]
            if len(all_lines) <= 2:
                break
        for line in nlines:
            if y + _text_h(draw, line, nf) > y_cap:
                break
            draw.text((margin, y), line, font=nf, fill=(18, 18, 18, 255))
            y += _text_h(draw, line, nf) + 6
        y += 12

        # Tagline — light weight (creates contrast with bold name)
        band_y = h - 90
        if tagline and y + 34 < band_y:
            tf   = get_font('light', 26)
            tmax = w - margin * 2
            tl   = (_wrap(tagline, tf, tmax, draw) or [''])[0]
            while tl and _text_w(draw, tl, tf) > tmax:
                tl = tl[:-4] + '…'
            if tl and y + _text_h(draw, tl, tf) <= band_y:
                draw.text((margin, y), tl, font=tf,
                          fill=(*_darken(colors['dominant'], 0.55), 195))
                y += _text_h(draw, tl, tf) + 10

        # Sparkle fill row — fills any remaining gap above the brand band
        if band_y - y > 50:
            mid_y = y + (band_y - y) // 2
            step  = 64
            for sx in range(margin + 16, w - margin - 16, step):
                _draw_star(draw, (sx, mid_y), 4, (*colors['accent'], 55))

        _draw_brand_band(canvas, w, h, brand, colors, 0)
        return canvas

    def _c_intro(self, prod, name, tagline, description, brand, size, colors):
        """Slide 2 — tagline as hook, thumbnail right, no overlap, hard y-cap."""
        w, h    = size
        band_y  = h - 90
        bg_col  = _carousel_bg(colors)
        canvas  = Image.new('RGBA', size, (*bg_col, 255))

        # ── Thumbnail: centred in active area (above brand band) ─────────
        thumb_sz = int(w * 0.38)
        thumb    = prod.copy()
        thumb.thumbnail((thumb_sz, thumb_sz), Image.LANCZOS)
        tx = w - thumb.width - 44
        ty = (band_y - thumb.height) // 2
        _paste_alpha(canvas, thumb, (tx, ty))

        draw = ImageDraw.Draw(canvas)
        acc  = _to_rgba(colors['dominant'])
        # Right accent bar — stops at brand band
        draw.rectangle([(w - 8, 0), (w, band_y)], fill=acc)

        margin   = 72
        # text_max = left col width: never touch the thumbnail
        text_max = tx - margin - 24
        y_cap    = band_y - 16   # hard bottom boundary

        y = int(h * 0.14)

        # Slide label
        lf = get_font('semibold', 22)
        draw.text((margin, y), '— THE PRODUCT', font=lf,
                  fill=(*_darken(colors['dominant'], 0.3), 180))
        y += 38

        # ── Tagline as HERO — auto-sized to fit in ≤2 lines ────────────
        if tagline:
            # Must check len of FULL wrap, not the [:2] slice
            hf, hlines = get_font('bold', 28), []
            for hero_size in range(56, 27, -6):
                hf        = get_font('bold', hero_size)
                all_lines = _wrap(tagline, hf, text_max, draw)
                hlines    = all_lines[:2]
                if len(all_lines) <= 2:
                    break
            for line in hlines:
                if y + _text_h(draw, line, hf) > y_cap:
                    break
                draw.text((margin, y), line, font=hf, fill=(18, 18, 18, 255))
                y += _text_h(draw, line, hf) + 8
            y += 10

        # Accent divider
        if y + 28 < y_cap:
            draw.rectangle([(margin, y), (margin + 52, y + 4)], fill=acc)
            y += 24

        # Product name — one line max, smaller
        if y + 32 < y_cap:
            nf     = get_font('semibold', 24)
            nlines = _wrap(name.upper(), nf, text_max, draw)[:1]
            for line in nlines:
                if y + _text_h(draw, line, nf) > y_cap:
                    break
                draw.text((margin, y), line, font=nf,
                          fill=(*_darken(colors['dominant'], 0.35), 200))
                y += _text_h(draw, line, nf) + 4
            y += 14

        # Description — stop at y_cap
        if description and y + 38 < y_cap:
            df = get_font('regular', 28)
            for line in _wrap(description[:240], df, text_max, draw):
                if y + _text_h(draw, line, df) > y_cap:
                    break
                draw.text((margin, y), line, font=df, fill=(62, 62, 62, 255))
                y += _text_h(draw, line, df) + 7

        _draw_brand_band(canvas, w, h, brand, colors, 1)
        return canvas

    def _c_features(self, features: list[str], name: str, brand: str, size, colors, slide: int = 2):
        """Slide 3 or 4 — feature cards fill the full height, no whitespace."""
        w, h   = size
        margin = 60
        band_y = h - 90
        acc    = _to_rgba(colors['accent'])
        bg_col = _carousel_bg(colors)

        canvas = Image.new('RGBA', size, (*bg_col, 255))

        # Ghost oversized sparkle star — fills lower-right corner visually
        gd = ImageDraw.Draw(canvas)
        _draw_star(gd, (w - 50, band_y - 40), 210, (*colors['accent'], 11))
        _draw_star(gd, (w - 50, band_y - 40), 130, (*colors['accent'],  8))

        draw = ImageDraw.Draw(canvas)

        # Top accent strip
        draw.rectangle([(0, 0), (w, 8)], fill=acc)

        # Slide label
        lf    = get_font('semibold', 22)
        label = '— WHAT YOU GET' if slide == 2 else '— AND THERE\'S MORE'
        draw.text((margin, 28), label, font=lf,
                  fill=(*_darken(colors['dominant'], 0.3), 180))

        # Accent divider below label
        y = 68
        draw.rectangle([(margin, y), (margin + 56, y + 5)], fill=acc)
        y += 20

        # ── Feature cards — evenly fill available height ──────────────────
        items = (features or [name])[:3]
        n     = len(items)
        gap   = 14
        card_h = (band_y - y - gap * (n - 1)) // n
        card_h = max(card_h, 110)

        bf = get_font('semibold', 40)

        for i, feat in enumerate(items):
            card_y0 = y + i * (card_h + gap)
            card_y1 = card_y0 + card_h

            # White card with subtle shadow line at bottom
            card_fill = colors.get('card_bg', (255, 255, 255, 235))
            _draw_rounded_rect(draw,
                               (margin, card_y0, w - margin, card_y1),
                               20, card_fill)
            # Thin accent left border on each card
            draw.rectangle([(margin, card_y0 + 20),
                             (margin + 5, card_y1 - 20)], fill=acc)

            # Number badge — accent circle, vertically centred
            nr  = 28
            nbx = margin + 22
            nby = card_y0 + card_h // 2
            draw.ellipse([nbx, nby - nr, nbx + nr * 2, nby + nr], fill=acc)
            nf  = get_font('bold', 24)
            num = str(i + 1 + (0 if slide == 2 else 3))
            nw  = _text_w(draw, num, nf)
            draw.text((nbx + nr - nw // 2, nby - 12), num, font=nf,
                      fill=(255, 255, 255, 255))

            # Feature text — vertically centred in card
            fx     = nbx + nr * 2 + 20
            fmax_w = w - margin - fx - 24
            flines = _wrap(feat, bf, fmax_w, draw)[:2]
            th     = sum(_text_h(draw, l, bf) for l in flines) + (len(flines) - 1) * 6
            fy     = card_y0 + (card_h - th) // 2
            for fl in flines:
                draw.text((fx, fy), fl, font=bf, fill=(22, 22, 22, 255))
                fy += _text_h(draw, fl, bf) + 6

        _draw_brand_band(canvas, w, h, brand, colors, slide)
        return canvas

    def _c_details(self, prod, description, extra_features, name, brand, size, colors):
        """Slide 4 — product image + more detail / extra features."""
        w, h = size

        if extra_features:
            return self._c_features(extra_features, name, brand, size, colors, slide=3)

        # otherwise show a photo + description layout
        bg_col = _carousel_bg(colors, delta=-0.03)
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
        y_cap  = h - 90

        acc = _to_rgba(colors['dominant'])
        draw.rectangle([(margin, y), (margin + 60, y + 5)], fill=acc)
        y += 30

        # title — auto-sized + y-guarded
        tf, tlines = get_font('bold', 28), []
        for font_size in range(56, 27, -8):
            tf        = get_font('bold', font_size)
            all_lines = _wrap(name.upper(), tf, w - margin * 2, draw)
            tlines    = all_lines[:2]
            if len(all_lines) <= 2:
                break
        for line in tlines:
            if y + _text_h(draw, line, tf) > y_cap:
                break
            draw.text((margin, y), line, font=tf, fill=(22, 22, 22, 255))
            y += _text_h(draw, line, tf) + 6
        y += 12

        # description — y-guarded
        if description:
            df = get_font('regular', 31)
            for line in _wrap(description[:180], df, w - margin * 2, draw)[:5]:
                if y + _text_h(draw, line, df) > y_cap:
                    break
                draw.text((margin, y), line, font=df, fill=(60, 60, 60, 255))
                y += _text_h(draw, line, df) + 8

        _draw_brand_band(canvas, w, h, brand, colors, 3)
        return canvas

    def _c_cta(self, prod, name, cta, brand, size, colors):
        """Slide 5 — clean CTA with visible product image."""
        w, h = size

        # Light brand-tinted background — product stays visible
        bg_col = _carousel_bg(colors, delta=-0.03)
        canvas = Image.new('RGBA', size, (*bg_col, 255))

        draw   = ImageDraw.Draw(canvas)
        margin = 80
        acc    = _to_rgba(colors['accent'])

        # Top accent strip
        draw.rectangle([(0, 0), (w, 6)], fill=acc)

        # Brand header
        self._c_header(draw, brand, w, margin, colors, white=False)

        # Product image — clear, upper portion
        area_w = int(w * 0.60)
        area_h = int(h * 0.42)
        area_y = int(h * 0.12)
        area_x = (w - area_w) // 2

        product = prod.copy()
        product.thumbnail((area_w, area_h), Image.LANCZOS)
        px = area_x + (area_w - product.width)  // 2
        py = area_y + (area_h - product.height) // 2

        # Soft shadow
        shad = Image.new('RGBA', size, (0, 0, 0, 0))
        sd   = ImageDraw.Draw(shad)
        sd.ellipse([px + 20, py + product.height - 4,
                    px + product.width - 20, py + product.height + 30],
                   fill=(0, 0, 0, 35))
        canvas = Image.alpha_composite(
            canvas, shad.filter(ImageFilter.GaussianBlur(18)))
        _paste_alpha(canvas, product, (px, py))

        # Text below product
        draw  = ImageDraw.Draw(canvas)
        cy    = area_y + area_h + int(h * 0.04)
        y_cap = h - 90

        # Product name — centred, auto-sized, y-guarded
        tf, nlines = get_font('bold', 28), []
        for font_size in range(56, 27, -8):
            tf        = get_font('bold', font_size)
            all_lines = _wrap(name.upper(), tf, w - margin * 2, draw)
            nlines    = all_lines[:2]
            if len(all_lines) <= 2:
                break
        for line in nlines:
            if cy + _text_h(draw, line, tf) > y_cap:
                break
            lw = _text_w(draw, line, tf)
            draw.text(((w - lw) // 2, cy), line, font=tf,
                      fill=(18, 18, 18, 255))
            cy += _text_h(draw, line, tf) + 6
        cy += 24

        # CTA button — centred, only if it fits
        band_y = h - 90
        y_cap  = band_y - 12
        if cy + 80 < y_cap:
            cf    = get_font('bold', 40)
            cw    = _text_w(draw, cta, cf)
            pad   = 50
            btn_h = 80
            btn_x0 = (w - cw - pad * 2) // 2
            btn_x1 = btn_x0 + cw + pad * 2
            _draw_rounded_rect(draw, (btn_x0, cy, btn_x1, cy + btn_h), 40, acc)
            draw.text((btn_x0 + pad, cy + 20), cta, font=cf,
                      fill=(255, 255, 255, 255))
            cy += btn_h + 16

        # Perks strip — fills remaining gap above brand band
        if cy + 30 < y_cap:
            pf   = get_font('light', 22)
            perks = 'Free shipping   ·   Easy returns'
            pw   = _text_w(draw, perks, pf)
            py   = cy + (y_cap - cy) // 2
            draw.text(((w - pw) // 2, py), perks, font=pf,
                      fill=(*_darken(colors['dominant'], 0.4), 150))
            # Small stars flanking the perks text
            _draw_star(draw, ((w - pw) // 2 - 22, py + 10), 5,
                       (*colors['accent'], 140))
            _draw_star(draw, ((w + pw) // 2 + 22, py + 10), 5,
                       (*colors['accent'], 140))

        _draw_brand_band(canvas, w, h, brand, colors, 4)
        return canvas

    # ── utility ───────────────────────────────────────────────────────────────

    @staticmethod
    def _scale(base_w: int, size: int) -> int:
        """Scale font size proportionally for non-square canvases."""
        return max(18, int(size * base_w / 1080))
