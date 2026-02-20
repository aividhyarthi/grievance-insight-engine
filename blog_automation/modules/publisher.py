"""
Publisher Module
----------------
Publishes blog posts to WordPress via the REST API.

Requirements:
  - WordPress with REST API enabled (default since WP 4.7)
  - Application Password: WP Admin > Users > Profile > Application Passwords
  - Set env vars: WP_USERNAME, WP_APP_PASSWORD
"""

import base64
import json
import logging
import os
from pathlib import Path

import requests

from .content_generator import BlogPost

logger = logging.getLogger(__name__)


class WordPressPublisher:
    def __init__(self, config: dict):
        self.config = config
        self.wp_cfg = config.get("wordpress", {})
        self.site_url = self.wp_cfg.get("site_url", "").rstrip("/")
        self.username = os.getenv("WP_USERNAME", self.wp_cfg.get("username", ""))
        self.app_password = os.getenv("WP_APP_PASSWORD", self.wp_cfg.get("app_password", ""))
        self.default_status = self.wp_cfg.get("default_status", "draft")
        self.author_id = self.wp_cfg.get("author_id", 1)
        self._session = requests.Session()

    # ------------------------------------------------------------------ #
    # Public API                                                           #
    # ------------------------------------------------------------------ #

    def publish(self, post: BlogPost) -> dict:
        """
        Full publish flow:
          1. Upload the featured image
          2. Get or create the category
          3. Create the post with schema markup injected
          4. Return the published post data (including live URL)
        """
        if not self.wp_cfg.get("enabled", True):
            logger.info("WordPress publishing disabled — skipping.")
            return {}

        if not self._validate_config():
            return {}

        logger.info("Publishing '%s' to WordPress…", post.title)

        # 1. Upload featured image
        media_id = None
        if post.image_url and Path(post.image_url).exists():
            media_id = self._upload_media(post.image_url, post.image_alt_text)

        # 2. Get or create category
        category_id = self._get_or_create_category(post.category)

        # 3. Get or create tags
        tag_ids = self._get_or_create_tags(post.tags)

        # 4. Build post body with schema markup appended
        full_content = self._build_full_content(post)

        # 5. Create the WordPress post
        payload = {
            "title": post.title,
            "content": full_content,
            "slug": post.slug,
            "status": self.default_status,
            "author": self.author_id,
            "excerpt": post.meta_description,
            "categories": [category_id] if category_id else [],
            "tags": tag_ids,
            "meta": {
                "_yoast_wpseo_title": post.meta_title,
                "_yoast_wpseo_metadesc": post.meta_description,
                "_yoast_wpseo_focuskw": post.focus_keyword,
                # RankMath compatible fields
                "rank_math_focus_keyword": post.focus_keyword,
                "rank_math_description": post.meta_description,
            },
        }
        if media_id:
            payload["featured_media"] = media_id

        result = self._api_post("/wp-json/wp/v2/posts", payload)

        if result:
            live_url = result.get("link", "")
            logger.info("Post published! URL: %s", live_url)
            return {
                "id": result.get("id"),
                "url": live_url,
                "status": result.get("status"),
                "slug": result.get("slug"),
            }

        return {}

    # ------------------------------------------------------------------ #
    # Media Upload                                                         #
    # ------------------------------------------------------------------ #

    def _upload_media(self, image_path: str, alt_text: str = "") -> int | None:
        path = Path(image_path)
        if not path.exists():
            logger.warning("Image file not found: %s", image_path)
            return None

        suffix = path.suffix.lower()
        mime_types = {".jpg": "image/jpeg", ".jpeg": "image/jpeg",
                      ".png": "image/png", ".gif": "image/gif", ".webp": "image/webp"}
        mime = mime_types.get(suffix, "image/png")

        try:
            with open(path, "rb") as f:
                data = f.read()

            resp = self._session.post(
                f"{self.site_url}/wp-json/wp/v2/media",
                headers={
                    "Authorization": self._auth_header(),
                    "Content-Disposition": f'attachment; filename="{path.name}"',
                    "Content-Type": mime,
                },
                data=data,
                timeout=60,
            )
            resp.raise_for_status()
            media = resp.json()
            media_id = media.get("id")

            # Set alt text
            if alt_text and media_id:
                self._api_post(f"/wp-json/wp/v2/media/{media_id}",
                               {"alt_text": alt_text}, method="PUT")

            logger.info("Image uploaded (media ID: %s)", media_id)
            return media_id
        except Exception as e:
            logger.error("Media upload failed: %s", e)
            return None

    # ------------------------------------------------------------------ #
    # Categories & Tags                                                    #
    # ------------------------------------------------------------------ #

    def _get_or_create_category(self, name: str) -> int | None:
        if not name:
            return None
        try:
            resp = self._session.get(
                f"{self.site_url}/wp-json/wp/v2/categories",
                headers={"Authorization": self._auth_header()},
                params={"search": name},
                timeout=15,
            )
            resp.raise_for_status()
            existing = resp.json()
            if existing:
                return existing[0]["id"]

            result = self._api_post("/wp-json/wp/v2/categories", {"name": name})
            return result.get("id") if result else None
        except Exception as e:
            logger.error("Category lookup/create failed: %s", e)
            return None

    def _get_or_create_tags(self, tag_names: list[str]) -> list[int]:
        ids = []
        for name in tag_names[:10]:
            try:
                resp = self._session.get(
                    f"{self.site_url}/wp-json/wp/v2/tags",
                    headers={"Authorization": self._auth_header()},
                    params={"search": name},
                    timeout=10,
                )
                resp.raise_for_status()
                existing = resp.json()
                if existing:
                    ids.append(existing[0]["id"])
                else:
                    result = self._api_post("/wp-json/wp/v2/tags", {"name": name})
                    if result:
                        ids.append(result["id"])
            except Exception as e:
                logger.error("Tag '%s' lookup/create failed: %s", name, e)
        return ids

    # ------------------------------------------------------------------ #
    # Content Building                                                     #
    # ------------------------------------------------------------------ #

    def _build_full_content(self, post: BlogPost) -> str:
        """Inject schema markup as JSON-LD script tag into the post content."""
        schema_scripts = ""

        if post.schema_markup:
            schema_scripts += (
                '\n<script type="application/ld+json">\n'
                + json.dumps(post.schema_markup, indent=2)
                + "\n</script>\n"
            )

        if post.faq_schema:
            schema_scripts += (
                '\n<script type="application/ld+json">\n'
                + json.dumps(post.faq_schema, indent=2)
                + "\n</script>\n"
            )

        return post.body_html + schema_scripts

    # ------------------------------------------------------------------ #
    # HTTP Helpers                                                         #
    # ------------------------------------------------------------------ #

    def _api_post(self, endpoint: str, data: dict, method: str = "POST") -> dict:
        url = f"{self.site_url}{endpoint}"
        headers = {
            "Authorization": self._auth_header(),
            "Content-Type": "application/json",
        }
        try:
            if method == "PUT":
                resp = self._session.put(url, headers=headers,
                                         json=data, timeout=30)
            else:
                resp = self._session.post(url, headers=headers,
                                          json=data, timeout=30)
            resp.raise_for_status()
            return resp.json()
        except requests.HTTPError as e:
            logger.error("WordPress API error %s %s: %s — %s",
                         method, endpoint, e, resp.text[:300])
        except Exception as e:
            logger.error("WordPress API request failed: %s", e)
        return {}

    def _auth_header(self) -> str:
        credentials = f"{self.username}:{self.app_password}"
        encoded = base64.b64encode(credentials.encode()).decode()
        return f"Basic {encoded}"

    def _validate_config(self) -> bool:
        if not self.site_url:
            logger.error("WordPress site_url not configured.")
            return False
        if not self.username or not self.app_password:
            logger.error(
                "WordPress credentials missing. "
                "Set WP_USERNAME and WP_APP_PASSWORD environment variables."
            )
            return False
        return True
