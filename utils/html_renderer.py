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

from PIL import Image


def _clamp(v: float) -> int:
    return max(0, min(255, int(v)))


def _parse(c) -> tuple:
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
    return f'#{_clamp(r+(255-r)*f):02x}{_clamp(g+(255-g)*f):02x}{_clamp(b+(255-b)*f):02x}'


def _darken(c, pct: float) -> str:
    r, g, b = _parse(c)
    f = pct / 100
    return f'#{_clamp(r*(1-f)):02x}{_clamp(g*(1-f)):02x}{_clamp(b*(1-f)):02x}'


def _luminance(c) -> float:
    r, g, b = _parse(c)
    return 0.299*r + 0.587*g + 0.114*b


def _on(c) -> str:
    return '#ffffff' if _luminance(c) < 145 else '#111111'


def _e(text) -> str:
    return html.escape(str(text))


def _img_uri(image_path: str):
    with Image.open(image_path) as img:
        nw, nh = img.size
        img = img.convert('RGBA')
        buf = io.BytesIO()
        img.save(buf, 'PNG')
        b64 = base64.b64encode(buf.getvalue()).decode()
    return f'data:image/png;base64,{b64}', nw, nh


def _wrap(text: str, max_chars: int, max_lines: int) -> list:
    lines = []
    for line in textwrap.wrap(str(text), width=max_chars):
        lines.append(line)
        if len(lines) >= max_lines:
            break
    return lines or [str(text)[:max_chars]]


def _tspan(lines: list, x: float, dy: float) -> str:
    parts = []
    for i, line in enumerate(lines):
        shift = 0 if i == 0 else dy
        parts.append(f'<tspan x="{x:.1f}" dy="{shift:.1f}">{_e(line)}</tspan>')
    return '\n'.join(parts)


def _cover(iw, ih, bw, bh, ox=0, oy=0):
    scale = max(bw / iw, bh / ih)
    dw = iw * scale
    dh = ih * scale
    return ox + (bw - dw) / 2, oy + (bh - dh) / 2, dw, dh


def _render(svg: str, output_path: str, w: int, h: int) -> None:
    import cairosvg
    cairosvg.svg2png(bytestring=svg.encode('utf-8'),
                     write_to=str(output_path),
                     output_width=w, output_height=h)


# ── Studio (minimal) ──────────────────────────────────────────────────────────

def render_studio(image_path, name, tagline, brand, cta, colors, size, output_path):
    w, h = size
    bg  = _hex(colors.get('dominant', (30, 30, 50)))
    acc = _hex(colors.get('accent',   (220, 200, 140)))
    txt = _on(bg)

    uri, iw, ih = _img_uri(image_path)

    bw, bh = int(w * 0.74), int(h * 0.60)
    bx, by = (w - bw) // 2, int(h * 0.055)

    nl = _wrap(name, 20, 2)
    tl = _wrap(tagline, 30, 2)
    nfs = min(int(w * 0.058), 63)
    tfs = int(nfs * 0.40)
    bfs = int(tfs * 0.84)
    top = by + bh + int(h * 0.032)

    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="{w}" height="{h}" viewBox="0 0 {w} {h}">
<defs>
  <radialGradient id="bg" cx="32%" cy="28%" r="72%">
    <stop offset="0%"   stop-color="{_lighten(bg,24)}"/>
    <stop offset="100%" stop-color="{_darken(bg,10)}"/>
  </radialGradient>
  <clipPath id="pc"><rect x="{bx}" y="{by}" width="{bw}" height="{bh}" rx="16"/></clipPath>
  <filter id="sh" x="-25%" y="-25%" width="150%" height="150%">
    <feDropShadow dx="0" dy="18" stdDeviation="26" flood-color="#000" flood-opacity="0.52"/>
  </filter>
  <linearGradient id="imgfade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="55%" stop-color="{bg}" stop-opacity="0"/>
    <stop offset="100%" stop-color="{bg}" stop-opacity="0.8"/>
  </linearGradient>
</defs>
<rect width="{w}" height="{h}" fill="url(#bg)"/>
<circle cx="{int(w*.88)}" cy="{int(h*.10)}" r="{int(w*.24)}" fill="{_lighten(acc,55)}" opacity="0.05"/>
<circle cx="{int(w*.08)}" cy="{int(h*.90)}" r="{int(w*.20)}" fill="{acc}" opacity="0.04"/>
<g filter="url(#sh)">
  <image href="{uri}" x="{bx}" y="{by}" width="{bw}" height="{bh}"
         preserveAspectRatio="xMidYMid meet" clip-path="url(#pc)"/>
</g>
<rect x="{bx}" y="{by}" width="{bw}" height="{bh}" fill="url(#imgfade)" clip-path="url(#pc)"/>
<text x="{w//2}" y="{top+bfs:.0f}" text-anchor="middle"
      font-family="Helvetica Neue,Arial,sans-serif" font-size="{bfs}"
      fill="{acc}" font-weight="300" letter-spacing="6" opacity="0.72">{_e(brand.upper())}</text>
<rect x="{w//2-18}" y="{top+bfs+int(h*.014):.0f}" width="36" height="1.5" rx="1" fill="{acc}" opacity="0.38"/>
<text x="{w//2}" y="{top+bfs+int(h*.046):.0f}" text-anchor="middle"
      font-family="Georgia,'Times New Roman',serif" font-size="{nfs}" fill="{txt}" font-weight="700">
  {_tspan(nl, w/2, nfs*1.14)}
</text>
<text x="{w//2}" y="{top+bfs+int(h*.046)+len(nl)*int(nfs*1.14)+int(h*.018):.0f}" text-anchor="middle"
      font-family="Helvetica Neue,Arial,sans-serif" font-size="{tfs}" fill="{txt}" font-weight="300" opacity="0.68">
  {_tspan(tl, w/2, tfs*1.35)}
</text>
<text x="{w//2}" y="{h-int(h*.042):.0f}" text-anchor="middle"
      font-family="Helvetica Neue,Arial,sans-serif" font-size="{int(tfs*.88)}"
      fill="{acc}" font-weight="600" letter-spacing="3">{_e(cta.upper())}</text>
</svg>'''
    _render(svg, output_path, w, h)


# ── Stripe (bold) ─────────────────────────────────────────────────────────────

def render_stripe(image_path, name, tagline, brand, cta, colors, size, output_path):
    w, h = size
    sc  = _hex(colors.get('dominant', (180, 40, 40)))
    acc = _hex(colors.get('accent',   (240, 190, 50)))

    uri, iw, ih = _img_uri(image_path)

    sw = int(w * 0.26)
    ix = sw
    iw2 = w - sw

    nl = _wrap(name,    18, 3)
    tl = _wrap(tagline, 26, 2)
    nfs = min(int(w * 0.052), 56)
    tfs = int(nfs * 0.37)
    bfs = int(sw  * 0.115)

    chars  = list(brand.upper()[:16])
    char_h = sw * 0.13
    by0    = (h - len(chars) * char_h) / 2
    ph     = int(h * 0.30)
    py     = h - ph
    tx     = ix + int(iw2 * 0.07)

    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="{w}" height="{h}" viewBox="0 0 {w} {h}">
<defs>
  <clipPath id="imgc"><rect x="{ix}" y="0" width="{iw2}" height="{h}"/></clipPath>
  <linearGradient id="btm" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="#000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#000" stop-opacity="0.82"/>
  </linearGradient>
  <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="{_darken(sc,18)}"/>
    <stop offset="100%" stop-color="{sc}"/>
  </linearGradient>
  <filter id="sh2" x="-20%" y="0" width="140%" height="100%">
    <feDropShadow dx="6" dy="0" stdDeviation="14" flood-color="#000" flood-opacity="0.38"/>
  </filter>
</defs>
<image href="{uri}" x="{ix}" y="0" width="{iw2}" height="{h}"
       preserveAspectRatio="xMidYMid slice" clip-path="url(#imgc)"/>
<rect x="{ix}" y="0" width="{iw2}" height="{h}" fill="url(#btm)"/>
<rect x="0"   y="0" width="{sw}"  height="{h}" fill="url(#sg)" filter="url(#sh2)"/>
<rect x="{sw-3}" y="0" width="3" height="{h}" fill="{acc}" opacity="0.65"/>
'''
    bt = _on(sc)
    for i, ch in enumerate(chars):
        cy = by0 + i * char_h + char_h * 0.75
        svg += (f'<text x="{sw//2}" y="{cy:.1f}" text-anchor="middle" '
                f'font-family="Helvetica Neue,Arial,sans-serif" '
                f'font-size="{bfs:.1f}" fill="{bt}" font-weight="700">{_e(ch)}</text>\n')

    ny = py + int(ph * 0.24)
    for i, line in enumerate(nl):
        svg += (f'<text x="{tx}" y="{ny+i*int(nfs*1.1)}" '
                f'font-family="Georgia,\'Times New Roman\',serif" '
                f'font-size="{nfs}" fill="#fff" font-weight="700">{_e(line)}</text>\n')

    ty2 = ny + len(nl) * int(nfs * 1.1) + int(h * 0.014)
    for i, line in enumerate(tl):
        svg += (f'<text x="{tx}" y="{ty2+i*int(tfs*1.38)}" '
                f'font-family="Helvetica Neue,Arial,sans-serif" '
                f'font-size="{tfs}" fill="#fff" font-weight="300" opacity="0.82">{_e(line)}</text>\n')

    cx2 = ix + iw2 - int(iw2 * 0.07)
    svg += (f'<text x="{cx2}" y="{h-int(h*.034)}" text-anchor="end" '
            f'font-family="Helvetica Neue,Arial,sans-serif" '
            f'font-size="{int(tfs*.9)}" fill="{acc}" font-weight="700" '
            f'letter-spacing="2">{_e(cta.upper())}</text>\n</svg>')
    _render(svg, output_path, w, h)


# ── Frame (magazine) ──────────────────────────────────────────────────────────

def render_frame(image_path, name, tagline, brand, cta, colors, size, output_path):
    w, h = size
    bg  = '#f4f0e8'
    pri = _hex(colors.get('dominant', (40, 55, 80)))
    acc = _hex(colors.get('accent',   (210, 60, 50)))

    uri, iw, ih = _img_uri(image_path)

    ix  = int(w * 0.44)
    iw2 = w - ix

    lw  = int(w * 0.41)
    pad = int(lw * 0.10)

    nl  = _wrap(name,    14, 3)
    tl  = _wrap(tagline, 20, 3)
    nfs = min(int(lw * 0.118), 72)
    tfs = int(nfs * 0.36)
    bfs = int(tfs * 0.84)

    dr  = int(lw * 0.34)
    dcx = lw - int(lw * 0.04)
    dcy = int(h * 0.70)

    nt  = int(h * 0.22)
    nlh = int(nfs * 1.08)
    ry  = nt + len(nl) * nlh + int(h * 0.025)
    tt  = ry + int(h * 0.034)
    cbw = max(len(cta) * int(tfs * 0.60) + pad, int(lw * 0.45))
    cy  = h - int(h * 0.068)

    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="{w}" height="{h}" viewBox="0 0 {w} {h}">
<defs>
  <clipPath id="imgc"><rect x="{ix}" y="0" width="{iw2}" height="{h}"/></clipPath>
  <linearGradient id="ifade" x1="1" y1="0" x2="0" y2="0">
    <stop offset="0%"   stop-color="{bg}" stop-opacity="0"/>
    <stop offset="38%"  stop-color="{bg}" stop-opacity="0.55"/>
    <stop offset="100%" stop-color="{bg}" stop-opacity="1"/>
  </linearGradient>
  <linearGradient id="tb" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%"   stop-color="{pri}"/>
    <stop offset="60%"  stop-color="{_lighten(pri,22)}"/>
    <stop offset="100%" stop-color="{pri}" stop-opacity="0"/>
  </linearGradient>
</defs>
<rect width="{w}" height="{h}" fill="{bg}"/>
<image href="{uri}" x="{ix}" y="0" width="{iw2}" height="{h}"
       preserveAspectRatio="xMidYMid slice" clip-path="url(#imgc)"/>
<rect x="{ix-int(lw*.12)}" y="0" width="{int(lw*.12)+iw2}" height="{h}" fill="url(#ifade)"/>
<circle cx="{dcx}" cy="{dcy}" r="{dr}"   fill="{acc}" opacity="0.07"/>
<circle cx="{dcx}" cy="{dcy}" r="{dr-7}" fill="none" stroke="{acc}" stroke-width="1.5" opacity="0.22"/>
<rect x="{pad}" y="{int(h*.058)}" width="{lw-pad*2}" height="3" fill="url(#tb)"/>
<text x="{pad}" y="{int(h*.058)+int(h*.048):.0f}"
      font-family="Helvetica Neue,Arial,sans-serif" font-size="{bfs}"
      fill="{pri}" font-weight="300" letter-spacing="5" opacity="0.58">{_e(brand.upper())}</text>
<text x="{pad}" y="{nt+nfs:.0f}"
      font-family="Georgia,'Times New Roman',serif" font-size="{nfs}" fill="{pri}" font-weight="700">
  {_tspan(nl, pad, nlh)}
</text>
<rect x="{pad}" y="{ry}" width="{int(lw*.15)}" height="2.5" fill="{acc}"/>
<text x="{pad}" y="{tt+tfs:.0f}"
      font-family="Helvetica Neue,Arial,sans-serif" font-size="{tfs}" fill="{pri}" font-weight="300" opacity="0.76">
  {_tspan(tl, pad, int(tfs*1.48))}
</text>
<rect x="{pad-10}" y="{cy-int(tfs*1.08)}" width="{cbw}" height="{int(tfs*1.52)}" fill="{acc}" rx="4"/>
<text x="{pad+4}" y="{cy:.0f}"
      font-family="Helvetica Neue,Arial,sans-serif" font-size="{int(tfs*.88)}"
      fill="#ffffff" font-weight="700" letter-spacing="2">{_e(cta.upper())}</text>
</svg>'''
    _render(svg, output_path, w, h)
