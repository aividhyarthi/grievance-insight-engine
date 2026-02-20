"""
Image Generator Module
----------------------
Generates blog header images and social-media-sized images using:
  - OpenAI DALL-E 3 (default)
  - Stability AI (alternative)
  - Placeholder (fallback — downloads a free stock photo via Unsplash)

Images are saved locally and the URL/path is returned.
"""

import logging
import os
import time
from pathlib import Path

import requests

logger = logging.getLogger(__name__)


class ImageGenerator:
    def __init__(self, config: dict):
        self.config = config
        self.img_cfg = config.get("image", {})
        self.provider = self.img_cfg.get("provider", "placeholder")
        self.output_dir = Path(config.get("output", {}).get("output_dir", "output"))
        self.output_dir.mkdir(parents=True, exist_ok=True)

    # ------------------------------------------------------------------ #
    # Public API                                                           #
    # ------------------------------------------------------------------ #

    def generate_blog_header(self, prompt: str, slug: str) -> str:
        """Generate the main blog header image. Returns local file path."""
        size = self.img_cfg.get("size", "1792x1024")
        return self._generate(prompt, slug, size, suffix="header")

    def generate_social_image(self, prompt: str, slug: str) -> str:
        """Generate a square social media image. Returns local file path."""
        size = self.img_cfg.get("social_media_size", "1080x1080")
        return self._generate(prompt, slug, size, suffix="social")

    # ------------------------------------------------------------------ #
    # Routing                                                              #
    # ------------------------------------------------------------------ #

    def _generate(self, prompt: str, slug: str, size: str, suffix: str) -> str:
        if not self.img_cfg.get("enabled", True):
            logger.info("Image generation disabled — skipping.")
            return ""

        filename = f"{slug[:50]}_{suffix}.png"
        save_path = self.output_dir / filename

        if self.provider == "openai":
            return self._dalle(prompt, size, save_path)
        elif self.provider == "stability":
            return self._stability(prompt, size, save_path)
        else:
            return self._placeholder(prompt, size, save_path)

    # ------------------------------------------------------------------ #
    # OpenAI DALL-E 3                                                      #
    # ------------------------------------------------------------------ #

    def _dalle(self, prompt: str, size: str, save_path: Path) -> str:
        api_key = os.getenv("OPENAI_API_KEY", self.config.get("api_keys", {}).get("openai", ""))
        if not api_key:
            logger.warning("OPENAI_API_KEY not set — falling back to placeholder.")
            return self._placeholder(prompt, size, save_path)

        # DALL-E 3 supports: 1024x1024, 1792x1024, 1024x1792
        dalle_size = self._nearest_dalle_size(size)
        style = self.img_cfg.get("style", "")
        full_prompt = f"{prompt}. Style: {style}".strip(". ")

        try:
            resp = requests.post(
                "https://api.openai.com/v1/images/generations",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "dall-e-3",
                    "prompt": full_prompt[:4000],
                    "n": 1,
                    "size": dalle_size,
                    "quality": "standard",
                    "response_format": "url",
                },
                timeout=60,
            )
            resp.raise_for_status()
            image_url = resp.json()["data"][0]["url"]
            self._download_image(image_url, save_path)
            logger.info("DALL-E image saved: %s", save_path)
            return str(save_path)
        except Exception as e:
            logger.error("DALL-E generation failed: %s — falling back to placeholder", e)
            return self._placeholder(prompt, size, save_path)

    def _nearest_dalle_size(self, size: str) -> str:
        """Map arbitrary size string to nearest DALL-E 3 supported size."""
        try:
            w, h = map(int, size.split("x"))
        except ValueError:
            return "1792x1024"
        if w >= h:
            return "1792x1024"
        elif h > w:
            return "1024x1792"
        return "1024x1024"

    # ------------------------------------------------------------------ #
    # Stability AI                                                         #
    # ------------------------------------------------------------------ #

    def _stability(self, prompt: str, size: str, save_path: Path) -> str:
        api_key = os.getenv("STABILITY_API_KEY",
                            self.config.get("api_keys", {}).get("stability", ""))
        if not api_key:
            logger.warning("STABILITY_API_KEY not set — falling back to placeholder.")
            return self._placeholder(prompt, size, save_path)

        try:
            w, h = self._parse_size(size, default_w=1344, default_h=768)
            style = self.img_cfg.get("style", "digital-art")
            # Map style string to Stability style preset
            style_preset = "digital-art" if "digital" in style else "photographic"

            resp = requests.post(
                "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                json={
                    "text_prompts": [{"text": prompt, "weight": 1}],
                    "cfg_scale": 7,
                    "height": h,
                    "width": w,
                    "samples": 1,
                    "steps": 30,
                    "style_preset": style_preset,
                },
                timeout=120,
            )
            resp.raise_for_status()
            image_b64 = resp.json()["artifacts"][0]["base64"]
            import base64
            save_path.write_bytes(base64.b64decode(image_b64))
            logger.info("Stability AI image saved: %s", save_path)
            return str(save_path)
        except Exception as e:
            logger.error("Stability AI generation failed: %s — falling back to placeholder", e)
            return self._placeholder(prompt, size, save_path)

    # ------------------------------------------------------------------ #
    # Placeholder (Unsplash free stock photo)                              #
    # ------------------------------------------------------------------ #

    def _placeholder(self, prompt: str, size: str, save_path: Path) -> str:
        """
        Downloads a relevant free image from Unsplash as a placeholder.
        No API key required for basic usage.
        """
        w, h = self._parse_size(size, default_w=1200, default_h=630)
        # Use first few words of prompt as search term
        search_term = "+".join(prompt.split()[:4])

        try:
            url = f"https://source.unsplash.com/{w}x{h}/?{search_term}"
            self._download_image(url, save_path)
            logger.info("Placeholder image saved from Unsplash: %s", save_path)
            return str(save_path)
        except Exception as e:
            logger.error("Placeholder image download failed: %s", e)
            return ""

    # ------------------------------------------------------------------ #
    # Utilities                                                            #
    # ------------------------------------------------------------------ #

    def _download_image(self, url: str, save_path: Path, retries: int = 3) -> None:
        for attempt in range(retries):
            try:
                resp = requests.get(url, timeout=30, stream=True)
                resp.raise_for_status()
                with open(save_path, "wb") as f:
                    for chunk in resp.iter_content(chunk_size=8192):
                        f.write(chunk)
                return
            except Exception as e:
                if attempt < retries - 1:
                    wait = 2 ** attempt
                    logger.warning("Image download failed (attempt %d/%d): %s — retrying in %ds",
                                   attempt + 1, retries, e, wait)
                    time.sleep(wait)
                else:
                    raise

    def _parse_size(self, size: str, default_w: int = 1200,
                    default_h: int = 630) -> tuple[int, int]:
        try:
            w, h = map(int, size.lower().split("x"))
            return w, h
        except ValueError:
            return default_w, default_h
