"""
Downloads and caches Google Fonts used by the image templates.
Falls back gracefully to system / Pillow default fonts if download fails.
"""

import os
import requests
from PIL import ImageFont

FONTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'static', 'fonts')

# Stable raw GitHub URLs for Montserrat (OFL-licensed)
FONT_URLS = {
    'Montserrat-Bold.ttf': (
        'https://github.com/google/fonts/raw/main/ofl/montserrat/static/Montserrat-Bold.ttf'
    ),
    'Montserrat-SemiBold.ttf': (
        'https://github.com/google/fonts/raw/main/ofl/montserrat/static/Montserrat-SemiBold.ttf'
    ),
    'Montserrat-Regular.ttf': (
        'https://github.com/google/fonts/raw/main/ofl/montserrat/static/Montserrat-Regular.ttf'
    ),
    'Montserrat-Light.ttf': (
        'https://github.com/google/fonts/raw/main/ofl/montserrat/static/Montserrat-Light.ttf'
    ),
}

# System-font fallback candidates (Debian / Ubuntu / macOS)
SYSTEM_BOLD = [
    '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    '/System/Library/Fonts/Helvetica.ttc',
    'C:/Windows/Fonts/arialbd.ttf',
]
SYSTEM_REGULAR = [
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/System/Library/Fonts/Helvetica.ttc',
    'C:/Windows/Fonts/arial.ttf',
]


def ensure_fonts() -> None:
    """Download missing fonts; silently skip on network failure."""
    os.makedirs(FONTS_DIR, exist_ok=True)
    for name, url in FONT_URLS.items():
        dest = os.path.join(FONTS_DIR, name)
        if os.path.exists(dest):
            continue
        try:
            r = requests.get(url, timeout=20)
            if r.status_code == 200:
                with open(dest, 'wb') as f:
                    f.write(r.content)
                print(f'[fonts] downloaded {name}')
            else:
                print(f'[fonts] HTTP {r.status_code} for {name}')
        except Exception as exc:
            print(f'[fonts] could not download {name}: {exc}')


def _first_existing(paths: list) -> str | None:
    for p in paths:
        if p and os.path.exists(p):
            return p
    return None


def get_font(weight: str, size: int) -> ImageFont.FreeTypeFont:
    """
    weight: 'bold' | 'semibold' | 'regular' | 'light'
    Returns a Pillow font at the requested size.
    """
    mapping = {
        'bold':     'Montserrat-Bold.ttf',
        'semibold': 'Montserrat-SemiBold.ttf',
        'regular':  'Montserrat-Regular.ttf',
        'light':    'Montserrat-Light.ttf',
    }
    fname = mapping.get(weight, 'Montserrat-Regular.ttf')
    local = os.path.join(FONTS_DIR, fname)

    if os.path.exists(local):
        try:
            return ImageFont.truetype(local, size)
        except Exception:
            pass

    # fall back to system fonts
    candidates = SYSTEM_BOLD if weight in ('bold', 'semibold') else SYSTEM_REGULAR
    sys_font = _first_existing(candidates)
    if sys_font:
        try:
            return ImageFont.truetype(sys_font, size)
        except Exception:
            pass

    # last resort: Pillow built-in (tiny bitmap font)
    return ImageFont.load_default()
