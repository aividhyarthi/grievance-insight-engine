"""
Instagram post renderer using SVG + CairoSVG.

No browser required — works on any server with libcairo (Ubuntu ships it).
Three templates:
  render_studio  — minimal / clean editorial
  render_stripe  — bold left-stripe sidebar
  render_frame   — magazine right-bleed product
"""

from __future__ import annotations

import base64
import html
import io
import textwrap
from pathlib import Path

from PIL import Image


# ── colour helpers ────────────────────────────────────────────────────────────

def _clamp(v: float) -> int:
    return max(0, min(255, int(v)))


def _parse(c) -> tuple[int, int, int]:
    """Accept (r,g,b) tuple or '#rrggbb' hex string."""
    if isinstance(c, (list, tuple)):
        return int(c[0]), int(c[1]), int(c[2])
    s = str(c).strip().lstrip('#')
    if len(s) == 3:
        s = s[0]*2 + s[1]*2 + s[2]*2
    return int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16)


def _hex(c) -> str:
    r, g, b = _parse(c)
    return f'#{r:02x}{g:02x}{b:02x}'


def _lighten(c, pct: float) -> str:
    r, g, b = _parse(c)
    f = pct / 100
    return f'#{_clamp(r + (255-r)*f):02x}{_clamp(g + (255-g)*f):02x}{_clamp(b + (255-b)*f):02x}'


def _darken(c, pct: float) -> str:
    r, g, b = _parse(c)
    f = pct / 100
    return f'#{_clamp(r*(1-f)):02x}{_clamp(g*(1-f)):02x}{_clamp(b*(1-f)):02x}'


def _luminance(c) -> float:
    r, g, b = _parse(c)
    return 0.299*r + 0.587*g + 0.114*b


def _on(c) -> str:
    """White or dark text depending on background luminance."""
    return '#ffffff' if _luminance(c) < 145 else '#111111'


def _e(text) -> str:
    return html.escape(str(text))


# ── image helper ──────────────────────────────────────────────────────────────

def _img_uri(image_path: str) -> tuple[str, int, int]:
    """Return (data-URI, natural_w, natural_h)."""
    with Image.open(image_path) as img:
        nw, nh = img.size
        img = img.convert('RGBA')
        buf = io.BytesIO()
        img.save(buf, 'PNG')
        b64 = base64.b64encode(buf.getvalue()).decode()
    return f'data:image/png;base64,{b64}', nw, nh


# ── text helper ───────────────────────────────────────────────────────────────

def _wrap(text: str, max_chars: int, max_lines: int) -> list[str]:
    lines: list[str] = []
    for line in textwrap.wrap(str(text), width=max_chars):
        lines.append(line)
        if len(lines) >= max_lines:
            break
    return lines or [str(text)[:max_chars]]


def _tspan_block(lines: list[str], x: float, y: float, dy: float,
                 anchor: str = 'start') -> str:
    """Return <tspan> elements for a multi-line text block."""
    parts: list[str] = []
    for i, line in enumerate(lines):
        shift = 0 if i == 0 else dy
        parts.append(f'<tspan x="{x:.1f}" dy="{shift:.1f}">{_e(line)}</tspan>')
    return '\n'.join(parts)


# ── cover-fit calculation ─────────────────────────────────────────────────────

def _cover(iw: int, ih: int, bw: float, bh: float, ox: float = 0, oy: float = 0):
    """Return (draw_x, draw_y, draw_w, draw_h) so image covers the box."""
    scale = max(bw / iw, bh / ih)
    dw = iw * scale
    dh = ih * scale
    dx = ox + (bw - dw) / 2
    dy = oy + (bh - dh) / 2
    return dx, dy, dw, dh


# ── cairosvg render ───────────────────────────────────────────────────────────

def _render(svg: str, output_path: str, w: int, h: int) -> None:
    import cairosvg
    cairosvg.svg2png(
        bytestring=svg.encode('utf-8'),
        write_to=str(output_path),
        output_width=w,
        output_height=h,
    )


# ─────────────────────────────────────────────────────────────────────────────
#  TEMPLATE 1 — Studio (clean, minimal, editorial)
# ─────────────────────────────────────────────────────────────────────────────

def render_studio(image_path: str, name: str, tagline: str, brand: str,
                  cta: str, colors: dict, size: tuple, output_path: str) -> None:
    w, h = size
    bg  = _hex(colors.get('dominant', (30, 30, 50)))
    acc = _hex(colors.get('accent',   (220, 200, 140)))
    txt = _on(bg)

    uri, iw, ih = _img_uri(image_path)

    # Product image box — centred, top 60%
    box_w = int(w * 0.74)
    box_h = int(h * 0.60)
    box_x = (w - box_w) // 2
    box_y = int(h * 0.055)

    dx, dy, dw, dh = _cover(iw, ih, box_w, box_h, box_x, box_y)

    name_lines = _wrap(name, 20, 2)
    tag_lines  = _wrap(tagline, 30, 2)

    name_fs  = min(int(w * 0.058), 63)
    tag_fs   = int(name_fs * 0.40)
    brand_fs = int(tag_fs  * 0.84)

    text_top = box_y + box_h + int(h * 0.032)

    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="{w}" height="{h}" viewBox="0 0 {w} {h}">
<defs>
  <radialGradient id="bg" cx="32%" cy="28%" r="72%">
    <stop offset="0%"   stop-color="{_lighten(bg, 24)}"/>
    <stop offset="100%" stop-color="{_darken(bg, 10)}"/>
  </radialGradient>
  <clipPath id="pc">
    <rect x="{box_x}" y="{box_y}" width="{box_w}" height="{box_h}" rx="16"/>
  </clipPath>
  <filter id="sh" x="-25%" y="-25%" width="150%" height="150%">
    <feDropShadow dx="0" dy="18" stdDeviation="26"
                  flood-color="#000000" flood-opacity="0.52"/>
  </filter>
  <linearGradient id="imgfade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="55%" stop-color="{bg}" stop-opacity="0"/>
    <stop offset="100%" stop-color="{bg}" stop-opacity="0.8"/>
  </linearGradient>
</defs>

<!-- background -->
<rect width="{w}" height="{h}" fill="url(#bg)"/>

<!-- soft decorative circles -->
<circle cx="{int(w*0.88)}" cy="{int(h*0.10)}" r="{int(w*0.24)}"
        fill="{_lighten(acc, 55)}" opacity="0.05"/>
<circle cx="{int(w*0.08)}" cy="{int(h*0.90)}" r="{int(w*0.20)}"
        fill="{acc}" opacity="0.04"/>

<!-- product image -->
<g filter="url(#sh)">
  <image href="{uri}" x="{dx:.1f}" y="{dy:.1f}"
         width="{dw:.1f}" height="{dh:.1f}"
         preserveAspectRatio="none"
         clip-path="url(#pc)"/>
</g>
<!-- bottom image fade -->
<rect x="{box_x}" y="{box_y}" width="{box_w}" height="{box_h}"
      fill="url(#imgfade)" clip-path="url(#pc)"/>

<!-- brand -->
<text x="{w//2}" y="{text_top + brand_fs:.0f}"
      text-anchor="middle"
      font-family="Helvetica Neue, Arial, sans-serif"
      font-size="{brand_fs}" fill="{acc}"
      font-weight="300" letter-spacing="6" opacity="0.72">
  {_e(brand.upper())}
</text>

<!-- divider pill -->
<rect x="{w//2 - 18}" y="{text_top + brand_fs + int(h*0.014):.0f}"
      width="36" height="1.5" rx="1"
      fill="{acc}" opacity="0.38"/>

<!-- product name -->
<text x="{w//2}" y="{text_top + brand_fs + int(h*0.046):.0f}"
      text-anchor="middle"
      font-family="Georgia, 'Times New Roman', serif"
      font-size="{name_fs}" fill="{txt}"
      font-weight="700">
  {_tspan_block(name_lines, w/2, 0, name_fs * 1.14, 'middle')}
</text>

<!-- tagline -->
<text x="{w//2}" y="{text_top + brand_fs + int(h*0.046) + len(name_lines)*int(name_fs*1.14) + int(h*0.018):.0f}"
      text-anchor="middle"
      font-family="Helvetica Neue, Arial, sans-serif"
      font-size="{tag_fs}" fill="{txt}"
      font-weight="300" opacity="0.68">
  {_tspan_block(tag_lines, w/2, 0, tag_fs * 1.35, 'middle')}
</text>

<!-- CTA -->
<text x="{w//2}" y="{h - int(h*0.042):.0f}"
      text-anchor="middle"
      font-family="Helvetica Neue, Arial, sans-serif"
      font-size="{int(tag_fs * 0.88)}" fill="{acc}"
      font-weight="600" letter-spacing="3">
  {_e(cta.upper())}
</text>
</svg>'''

    _render(svg, output_path, w, h)


# ─────────────────────────────────────────────────────────────────────────────
#  TEMPLATE 2 — Stripe (bold, left sidebar, full-bleed product)
# ─────────────────────────────────────────────────────────────────────────────

def render_stripe(image_path: str, name: str, tagline: str, brand: str,
                  cta: str, colors: dict, size: tuple, output_path: str) -> None:
    w, h = size
    stripe_col = _hex(colors.get('dominant', (180, 40, 40)))
    acc        = _hex(colors.get('accent',   (240, 190, 50)))

    uri, iw, ih = _img_uri(image_path)

    stripe_w  = int(w * 0.26)
    img_x     = stripe_w
    img_w     = w - stripe_w

    dx, dy, dw, dh = _cover(iw, ih, img_w, h, img_x, 0)

    name_lines = _wrap(name,    18, 3)
    tag_lines  = _wrap(tagline, 26, 2)

    name_fs  = min(int(w * 0.052), 56)
    tag_fs   = int(name_fs * 0.37)
    brand_fs = int(stripe_w * 0.115)

    # Vertical brand: character stack
    brand_chars = list(brand.upper()[:16])
    char_h      = stripe_w * 0.13
    total_ch    = len(brand_chars) * char_h
    brand_y0    = (h - total_ch) / 2

    panel_h = int(h * 0.30)
    panel_y = h - panel_h
    txt_x   = img_x + int(img_w * 0.07)

    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="{w}" height="{h}" viewBox="0 0 {w} {h}">
<defs>
  <clipPath id="imgc">
    <rect x="{img_x}" y="0" width="{img_w}" height="{h}"/>
  </clipPath>
  <linearGradient id="btm" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="#000000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.82"/>
  </linearGradient>
  <linearGradient id="stripe_g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="{_darken(stripe_col, 18)}"/>
    <stop offset="100%" stop-color="{stripe_col}"/>
  </linearGradient>
  <filter id="sh2" x="-20%" y="0" width="140%" height="100%">
    <feDropShadow dx="6" dy="0" stdDeviation="14"
                  flood-color="#000000" flood-opacity="0.38"/>
  </filter>
</defs>

<!-- product image (right) -->
<image href="{uri}" x="{dx:.1f}" y="{dy:.1f}"
       width="{dw:.1f}" height="{dh:.1f}"
       preserveAspectRatio="none"
       clip-path="url(#imgc)"/>

<!-- bottom gradient overlay -->
<rect x="{img_x}" y="0" width="{img_w}" height="{h}"
      fill="url(#btm)"/>

<!-- left stripe -->
<rect x="0" y="0" width="{stripe_w}" height="{h}"
      fill="url(#stripe_g)" filter="url(#sh2)"/>

<!-- accent edge line on stripe -->
<rect x="{stripe_w - 3}" y="0" width="3" height="{h}"
      fill="{acc}" opacity="0.65"/>
'''

    # Vertical brand text (character by character)
    brand_txt = _on(stripe_col)
    for i, ch in enumerate(brand_chars):
        cy = brand_y0 + i * char_h + char_h * 0.75
        svg += f'''<text x="{stripe_w // 2}" y="{cy:.1f}"
      text-anchor="middle"
      font-family="Helvetica Neue, Arial, sans-serif"
      font-size="{brand_fs:.1f}" fill="{brand_txt}"
      font-weight="700">{_e(ch)}</text>\n'''

    # Product name on bottom panel
    name_y = panel_y + int(panel_h * 0.24)
    for i, line in enumerate(name_lines):
        fy = name_y + i * int(name_fs * 1.10)
        svg += f'''<text x="{txt_x}" y="{fy}"
      font-family="Georgia, 'Times New Roman', serif"
      font-size="{name_fs}" fill="#ffffff"
      font-weight="700">{_e(line)}</text>\n'''

    tag_y = name_y + len(name_lines) * int(name_fs * 1.10) + int(h * 0.014)
    for i, line in enumerate(tag_lines):
        fy = tag_y + i * int(tag_fs * 1.38)
        svg += f'''<text x="{txt_x}" y="{fy}"
      font-family="Helvetica Neue, Arial, sans-serif"
      font-size="{tag_fs}" fill="#ffffff"
      font-weight="300" opacity="0.82">{_e(line)}</text>\n'''

    cta_x = img_x + img_w - int(img_w * 0.07)
    cta_y = h - int(h * 0.034)
    svg += f'''<text x="{cta_x}" y="{cta_y}"
      text-anchor="end"
      font-family="Helvetica Neue, Arial, sans-serif"
      font-size="{int(tag_fs * 0.9)}" fill="{acc}"
      font-weight="700" letter-spacing="2">{_e(cta.upper())}</text>
</svg>'''

    _render(svg, output_path, w, h)


# ─────────────────────────────────────────────────────────────────────────────
#  TEMPLATE 3 — Frame (magazine, editorial left, product right bleed)
# ─────────────────────────────────────────────────────────────────────────────

def render_frame(image_path: str, name: str, tagline: str, brand: str,
                 cta: str, colors: dict, size: tuple, output_path: str) -> None:
    w, h = size
    bg      = '#f4f0e8'   # cream editorial
    primary = _hex(colors.get('dominant', (40, 55, 80)))
    acc     = _hex(colors.get('accent',   (210, 60, 50)))

    uri, iw, ih = _img_uri(image_path)

    img_x = int(w * 0.44)
    img_w = w - img_x

    dx, dy, dw, dh = _cover(iw, ih, img_w, h, img_x, 0)

    left_w = int(w * 0.41)
    pad    = int(left_w * 0.10)

    name_lines = _wrap(name,    14, 3)
    tag_lines  = _wrap(tagline, 20, 3)

    name_fs  = min(int(left_w * 0.118), 72)
    tag_fs   = int(name_fs * 0.36)
    brand_fs = int(tag_fs  * 0.84)

    # Decorative circle
    deco_r  = int(left_w * 0.34)
    deco_cx = left_w - int(left_w * 0.04)
    deco_cy = int(h * 0.70)

    name_top = int(h * 0.22)
    name_lh  = int(name_fs * 1.08)
    rule_y   = name_top + len(name_lines) * name_lh + int(h * 0.025)
    tag_top  = rule_y + int(h * 0.034)

    cta_chars = len(cta)
    cta_box_w = max(cta_chars * int(tag_fs * 0.60) + pad, int(left_w * 0.45))
    cta_y     = h - int(h * 0.068)

    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="{w}" height="{h}" viewBox="0 0 {w} {h}">
<defs>
  <clipPath id="imgc">
    <rect x="{img_x}" y="0" width="{img_w}" height="{h}"/>
  </clipPath>
  <linearGradient id="img_fade" x1="1" y1="0" x2="0" y2="0">
    <stop offset="0%"   stop-color="{bg}" stop-opacity="0"/>
    <stop offset="38%"  stop-color="{bg}" stop-opacity="0.55"/>
    <stop offset="100%" stop-color="{bg}" stop-opacity="1"/>
  </linearGradient>
  <linearGradient id="topbar" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%"   stop-color="{primary}"/>
    <stop offset="60%"  stop-color="{_lighten(primary, 22)}"/>
    <stop offset="100%" stop-color="{primary}" stop-opacity="0"/>
  </linearGradient>
</defs>

<!-- editorial background -->
<rect width="{w}" height="{h}" fill="{bg}"/>

<!-- product image (right bleed) -->
<image href="{uri}" x="{dx:.1f}" y="{dy:.1f}"
       width="{dw:.1f}" height="{dh:.1f}"
       preserveAspectRatio="none"
       clip-path="url(#imgc)"/>

<!-- fade from image into editorial left -->
<rect x="{img_x - int(left_w*0.12)}" y="0"
      width="{int(left_w*0.12) + img_w}" height="{h}"
      fill="url(#img_fade)"/>

<!-- decorative circle -->
<circle cx="{deco_cx}" cy="{deco_cy}" r="{deco_r}"
        fill="{acc}" opacity="0.07"/>
<circle cx="{deco_cx}" cy="{deco_cy}" r="{deco_r - 7}"
        fill="none" stroke="{acc}" stroke-width="1.5" opacity="0.22"/>

<!-- top accent bar -->
<rect x="{pad}" y="{int(h*0.058)}" width="{left_w - pad*2}" height="3"
      fill="url(#topbar)"/>

<!-- brand -->
<text x="{pad}" y="{int(h*0.058) + int(h*0.048):.0f}"
      font-family="Helvetica Neue, Arial, sans-serif"
      font-size="{brand_fs}" fill="{primary}"
      font-weight="300" letter-spacing="5" opacity="0.58">
  {_e(brand.upper())}
</text>

<!-- product name -->
<text x="{pad}" y="{name_top + name_fs:.0f}"
      font-family="Georgia, 'Times New Roman', serif"
      font-size="{name_fs}" fill="{primary}"
      font-weight="700">
  {_tspan_block(name_lines, pad, 0, name_lh)}
</text>

<!-- accent rule -->
<rect x="{pad}" y="{rule_y}" width="{int(left_w * 0.15)}" height="2.5"
      fill="{acc}"/>

<!-- tagline -->
<text x="{pad}" y="{tag_top + tag_fs:.0f}"
      font-family="Helvetica Neue, Arial, sans-serif"
      font-size="{tag_fs}" fill="{primary}"
      font-weight="300" opacity="0.76">
  {_tspan_block(tag_lines, pad, 0, int(tag_fs * 1.48))}
</text>

<!-- CTA button -->
<rect x="{pad - 10}" y="{cta_y - int(tag_fs * 1.08)}"
      width="{cta_box_w}" height="{int(tag_fs * 1.52)}"
      fill="{acc}" rx="4"/>
<text x="{pad + 4}" y="{cta_y:.0f}"
      font-family="Helvetica Neue, Arial, sans-serif"
      font-size="{int(tag_fs * 0.88)}" fill="#ffffff"
      font-weight="700" letter-spacing="2">
  {_e(cta.upper())}
</text>
</svg>'''

    _render(svg, output_path, w, h)
