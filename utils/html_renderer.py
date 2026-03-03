"""
HTML/CSS → Playwright renderer for Instagram-quality post images.

Three templates:
  studio  (minimal) – radial gradient bg · ghost letter · product hero · clean type
  stripe  (bold)    – full product photo · left colour sidebar · bold bottom panel
  frame   (magazine)– light canvas · product right with mask-fade · editorial type left
"""
from __future__ import annotations

import asyncio
import base64
import html as _html_lib
import os
from pathlib import Path

# ── helpers ───────────────────────────────────────────────────────────────────

_FONT_CACHE = Path.home() / '.postcraft_fonts'
_FONT_FILES = {
    'bold':     'Montserrat-Bold',
    'semibold': 'Montserrat-SemiBold',
    'regular':  'Montserrat-Regular',
    'light':    'Montserrat-Light',
}
_FONT_WEIGHTS = {'bold': 800, 'semibold': 600, 'regular': 400, 'light': 300}


def _font_face_css() -> str:
    rules: list[str] = []
    for key, fname in _FONT_FILES.items():
        path = _FONT_CACHE / f'{fname}.ttf'
        if path.exists():
            b64 = base64.b64encode(path.read_bytes()).decode('ascii')
            rules.append(
                f"@font-face{{font-family:'M';font-weight:{_FONT_WEIGHTS[key]};"
                f"src:url('data:font/truetype;base64,{b64}') format('truetype');}}"
            )
    return '\n'.join(rules) or ''


def _img_url(image_path: str) -> str:
    ext  = Path(image_path).suffix.lower().lstrip('.')
    mime = {'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
            'png': 'image/png', 'webp': 'image/webp',
            'gif': 'image/gif'}.get(ext, 'image/jpeg')
    data = base64.b64encode(Path(image_path).read_bytes()).decode('ascii')
    return f'data:{mime};base64,{data}'


def _hex(rgb: tuple) -> str:
    return '#{:02x}{:02x}{:02x}'.format(int(rgb[0]), int(rgb[1]), int(rgb[2]))


def _rgba(rgb: tuple, a: float) -> str:
    return f'rgba({int(rgb[0])},{int(rgb[1])},{int(rgb[2])},{a})'


def _lighten(c: tuple, f: float) -> tuple:
    return tuple(min(255, int(v + (255 - v) * f)) for v in c[:3])


def _darken(c: tuple, f: float) -> tuple:
    return tuple(max(0, int(v * (1 - f))) for v in c[:3])


def _e(s: str) -> str:
    """HTML-escape user text to prevent injection."""
    return _html_lib.escape(str(s))


def _screenshot(html_src: str, output_path: str, w: int, h: int) -> None:
    """Render HTML to an image file using Playwright Chromium."""

    async def _run() -> None:
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                args=['--no-sandbox', '--disable-dev-shm-usage',
                      '--disable-gpu', '--disable-setuid-sandbox']
            )
            page = await browser.new_page(viewport={'width': w, 'height': h})
            await page.set_content(html_src, wait_until='load')
            await page.screenshot(path=output_path, clip={'x': 0, 'y': 0, 'width': w, 'height': h})
            await browser.close()

    asyncio.run(_run())


# ── Template 1: STUDIO ────────────────────────────────────────────────────────

def render_studio(
    image_path: str, name: str, tagline: str, brand: str, cta: str,
    colors: dict, size: tuple, output_path: str,
) -> None:
    """
    STUDIO — Radial gradient background from extracted brand colour.
    Giant ghost letter as texture. Product floats with drop-shadow.
    Bold text block at the bottom with CTA pill.
    """
    w, h  = size
    dom   = colors['dominant']
    bg_l  = _hex(_lighten(dom, 0.91))
    bg_m  = _hex(_lighten(dom, 0.80))
    dom_h = _hex(dom)
    tag_c = _hex(_darken(dom, 0.05))
    brand_c = _hex(_darken(dom, 0.18))
    first = _e((name[0] if name else 'A').upper())
    fc    = _font_face_css()
    iurl  = _img_url(image_path)

    html = f"""<!DOCTYPE html><html><head><meta charset="utf-8"><style>
{fc}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:{w}px;height:{h}px;overflow:hidden;
  font-family:'M','Helvetica Neue',Arial,sans-serif}}
.c{{width:{w}px;height:{h}px;position:relative;overflow:hidden;
  background:radial-gradient(ellipse at 38% 36%,{bg_l} 0%,{bg_m} 52%,{bg_l} 100%)}}
.ghost{{position:absolute;top:-4%;right:-3%;
  font-size:{int(h*.48)}px;font-weight:800;line-height:1;
  color:{dom_h};opacity:.065;pointer-events:none;user-select:none;
  font-family:'M','Helvetica Neue',Arial,sans-serif}}
.brand-top{{position:absolute;top:4.2%;left:7%;
  font-size:{int(w*.022)}px;font-weight:600;letter-spacing:.16em;
  color:{brand_c};text-transform:uppercase}}
.pzone{{position:absolute;top:8%;left:10%;right:10%;height:55%;
  display:flex;align-items:center;justify-content:center}}
.pzone img{{max-width:100%;max-height:100%;object-fit:contain;
  filter:drop-shadow(0 20px 44px rgba(0,0,0,.17))}}
.txt{{position:absolute;bottom:0;left:0;right:0;
  padding:0 7% {int(h*.076)}px}}
.bar{{width:72px;height:7px;background:{dom_h};border-radius:4px;
  margin-bottom:{int(h*.018)}px}}
.name{{font-size:{int(w*.070)}px;font-weight:800;line-height:1.06;
  color:#0d0d0d;letter-spacing:.03em;text-transform:uppercase;
  margin-bottom:{int(h*.011)}px;
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}}
.tag{{font-size:{int(w*.030)}px;font-weight:300;line-height:1.45;
  color:{tag_c};margin-bottom:{int(h*.020)}px;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}}
.row{{display:flex;align-items:center;justify-content:space-between}}
.cta{{background:{dom_h};color:#fff;
  font-size:{int(w*.023)}px;font-weight:700;letter-spacing:.06em;
  padding:{int(h*.013)}px {int(w*.028)}px;border-radius:100px;text-transform:uppercase}}
.bmark{{font-size:{int(w*.019)}px;font-weight:300;color:#aaa;letter-spacing:.10em}}
</style></head><body>
<div class="c">
  <div class="ghost">{first}</div>
  {'<div class="brand-top">'+_e(brand).upper()+'</div>' if brand else ''}
  <div class="pzone"><img src="{iurl}"/></div>
  <div class="txt">
    <div class="bar"></div>
    <div class="name">{_e(name).upper()}</div>
    {'<div class="tag">'+_e(tagline)+'</div>' if tagline else ''}
    <div class="row">
      {'<div class="cta">'+_e(cta)+'</div>' if cta else '<div></div>'}
      {'<div class="bmark">'+_e(brand)+'</div>' if brand else '<div></div>'}
    </div>
  </div>
</div></body></html>"""

    _screenshot(html, output_path, w, h)


# ── Template 2: STRIPE ────────────────────────────────────────────────────────

def render_stripe(
    image_path: str, name: str, tagline: str, brand: str, cta: str,
    colors: dict, size: tuple, output_path: str,
) -> None:
    """
    STRIPE — Crystal-clear full product photo as background.
    Left colour sidebar with rotated brand name.
    Solid colour bottom panel — white bold text + inverted CTA.
    """
    w, h    = size
    dom     = colors['dominant']
    dom_h   = _hex(dom)
    acc_l   = _hex(_lighten(dom, 0.38))
    fc      = _font_face_css()
    iurl    = _img_url(image_path)
    s_pct   = 15   # sidebar %
    p_pct   = 34   # bottom panel %

    html = f"""<!DOCTYPE html><html><head><meta charset="utf-8"><style>
{fc}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:{w}px;height:{h}px;overflow:hidden;
  font-family:'M','Helvetica Neue',Arial,sans-serif}}
.c{{width:{w}px;height:{h}px;position:relative;overflow:hidden}}
.bg{{position:absolute;inset:0;
  background:url('{iurl}') center/cover no-repeat}}
.strip{{position:absolute;left:0;top:0;bottom:0;width:{s_pct}%;
  background:{dom_h};
  display:flex;flex-direction:column;align-items:center;justify-content:center}}
.diamond{{width:{int(w*s_pct/100*.40)}px;height:{int(w*s_pct/100*.40)}px;
  background:rgba(255,255,255,.18);transform:rotate(45deg);
  position:absolute;top:{int(h*.055)}px}}
.vbrand{{writing-mode:vertical-rl;transform:rotate(180deg);
  font-size:{int(w*.021)}px;font-weight:600;letter-spacing:.18em;
  color:rgba(255,255,255,.88);text-transform:uppercase}}
.panel{{position:absolute;left:0;right:0;bottom:0;height:{p_pct}%;
  background:{dom_h}}}
.panel-line{{position:absolute;top:0;left:{s_pct}%;right:0;height:3px;background:{acc_l}}}
.ptxt{{position:absolute;top:0;left:{s_pct+5}%;right:5%;bottom:0;
  display:flex;flex-direction:column;justify-content:center;
  padding:{int(h*p_pct/100*.12)}px 0}}
.pname{{font-size:{int(w*.072)}px;font-weight:800;line-height:1.06;
  color:#fff;text-transform:uppercase;letter-spacing:.03em;
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;
  margin-bottom:{int(h*.009)}px}}
.ptag{{font-size:{int(w*.027)}px;font-weight:300;
  color:rgba(255,255,255,.82);line-height:1.4;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}
.cta-wrap{{position:absolute;bottom:{int(h*.035)}px;right:5%}}
.cta{{display:inline-block;background:#fff;color:{dom_h};
  font-size:{int(w*.023)}px;font-weight:700;letter-spacing:.06em;
  padding:{int(h*.012)}px {int(w*.028)}px;border-radius:100px;text-transform:uppercase}}
</style></head><body>
<div class="c">
  <div class="bg"></div>
  <div class="strip">
    <div class="diamond"></div>
    {'<div class="vbrand">'+_e(brand).upper()+'</div>' if brand else ''}
  </div>
  <div class="panel">
    <div class="panel-line"></div>
    <div class="ptxt">
      <div class="pname">{_e(name).upper()}</div>
      {'<div class="ptag">'+_e(tagline)+'</div>' if tagline else ''}
    </div>
    {'<div class="cta-wrap"><div class="cta">'+_e(cta)+'</div></div>' if cta else ''}
  </div>
</div></body></html>"""

    _screenshot(html, output_path, w, h)


# ── Template 3: FRAME ─────────────────────────────────────────────────────────

def render_frame(
    image_path: str, name: str, tagline: str, brand: str, cta: str,
    colors: dict, size: tuple, output_path: str,
) -> None:
    """
    FRAME — Light canvas in extracted brand colour.
    Product photo bleeds right edge with CSS mask gradient fade (seamless blend).
    Editorial left column: thin edge bar · brand · accent line · name · tagline · CTA.
    Large decorative circle as background accent.
    """
    w, h   = size
    dom    = colors['dominant']
    dom_h  = _hex(dom)
    bg_c   = _hex(_lighten(dom, 0.93))
    txt_c  = _hex(_darken(dom, 0.22))
    fc     = _font_face_css()
    iurl   = _img_url(image_path)

    # Circle geometry
    cr   = int(h * 0.37)
    ccx  = int(w * 0.39)
    ccy  = int(h * 0.50)

    html = f"""<!DOCTYPE html><html><head><meta charset="utf-8"><style>
{fc}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:{w}px;height:{h}px;overflow:hidden;
  font-family:'M','Helvetica Neue',Arial,sans-serif}}
.c{{width:{w}px;height:{h}px;position:relative;overflow:hidden;background:{bg_c}}}
.edge{{position:absolute;left:0;top:0;bottom:0;width:5px;background:{dom_h}}}
.ring1{{position:absolute;
  left:{ccx-cr}px;top:{ccy-cr}px;width:{cr*2}px;height:{cr*2}px;
  border-radius:50%;border:{max(3,int(w*.004))}px solid {_rgba(dom,.20)}}}
.ring2{{position:absolute;
  left:{ccx-int(cr*.72)}px;top:{ccy-int(cr*.72)}px;
  width:{int(cr*1.44)}px;height:{int(cr*1.44)}px;
  border-radius:50%;border:{max(2,int(w*.002))}px solid {_rgba(dom,.11)}}}
.photo{{position:absolute;right:0;top:0;bottom:0;width:63%;
  -webkit-mask-image:linear-gradient(to right,transparent 0%,black 40%);
  mask-image:linear-gradient(to right,transparent 0%,black 40%)}}
.photo img{{width:100%;height:100%;object-fit:cover;object-position:center}}
.col{{position:absolute;left:0;top:0;bottom:0;width:44%;
  padding:{int(h*.08)}px {int(w*.05)}px {int(h*.08)}px {int(w*.078)}px;
  display:flex;flex-direction:column;justify-content:center;gap:{int(h*.014)}px}}
.brand-lbl{{font-size:{int(w*.021)}px;font-weight:600;color:{txt_c};
  letter-spacing:.16em;text-transform:uppercase;opacity:.88}}
.bar{{width:{int(w*.10)}px;height:6px;background:{dom_h};border-radius:3px}}
.name{{font-size:{int(w*.068)}px;font-weight:800;line-height:1.06;
  color:#090909;letter-spacing:.03em;text-transform:uppercase;
  display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}}
.tag{{font-size:{int(w*.025)}px;font-weight:400;color:#6a6a6a;line-height:1.5;
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}}
.cta{{display:inline-block;align-self:flex-start;
  background:{dom_h};color:#fff;
  font-size:{int(w*.023)}px;font-weight:700;letter-spacing:.06em;
  padding:{int(h*.013)}px {int(w*.030)}px;border-radius:100px;text-transform:uppercase}}
</style></head><body>
<div class="c">
  <div class="edge"></div>
  <div class="ring1"></div>
  <div class="ring2"></div>
  <div class="photo"><img src="{iurl}"/></div>
  <div class="col">
    {'<div class="brand-lbl">'+_e(brand).upper()+'</div>' if brand else ''}
    <div class="bar"></div>
    <div class="name">{_e(name).upper()}</div>
    {'<div class="tag">'+_e(tagline)+'</div>' if tagline else ''}
    {'<div class="cta">'+_e(cta)+'</div>' if cta else ''}
  </div>
</div></body></html>"""

    _screenshot(html, output_path, w, h)
