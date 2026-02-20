"""
Social Media Poster Module
--------------------------
Posts to Twitter/X, LinkedIn, and Instagram after a blog is published.

Env vars required (set only the ones you use):
  Twitter:   TWITTER_API_KEY, TWITTER_API_SECRET,
             TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET
  LinkedIn:  LINKEDIN_ACCESS_TOKEN, LINKEDIN_PERSON_URN
             (urn:li:person:XXXX  — from LinkedIn developer portal)
  Instagram: INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_BUSINESS_ACCOUNT_ID
"""

import logging
import os
from pathlib import Path

import requests

from .content_generator import BlogPost

logger = logging.getLogger(__name__)


class SocialMediaPoster:
    def __init__(self, config: dict):
        self.config = config
        self.sm_cfg = config.get("social_media", {})

    # ------------------------------------------------------------------ #
    # Public API                                                           #
    # ------------------------------------------------------------------ #

    def post_all(self, post: BlogPost, blog_url: str,
                 social_image_path: str = "") -> dict[str, str]:
        """
        Post to all enabled social platforms.
        Returns dict of platform → post URL (where available).
        """
        results: dict[str, str] = {}

        if self.sm_cfg.get("twitter", {}).get("enabled"):
            url = self._post_twitter(post, blog_url, social_image_path)
            if url:
                results["twitter"] = url

        if self.sm_cfg.get("linkedin", {}).get("enabled"):
            url = self._post_linkedin(post, blog_url, social_image_path)
            if url:
                results["linkedin"] = url

        if self.sm_cfg.get("instagram", {}).get("enabled"):
            url = self._post_instagram(post, blog_url, social_image_path)
            if url:
                results["instagram"] = url

        return results

    # ------------------------------------------------------------------ #
    # Twitter / X                                                          #
    # ------------------------------------------------------------------ #

    def _post_twitter(self, post: BlogPost, blog_url: str,
                      image_path: str = "") -> str:
        try:
            import tweepy
        except ImportError:
            logger.error("tweepy not installed. Run: pip install tweepy")
            return ""

        api_key = os.getenv("TWITTER_API_KEY", "")
        api_secret = os.getenv("TWITTER_API_SECRET", "")
        access_token = os.getenv("TWITTER_ACCESS_TOKEN", "")
        access_secret = os.getenv("TWITTER_ACCESS_TOKEN_SECRET", "")

        if not all([api_key, api_secret, access_token, access_secret]):
            logger.warning("Twitter credentials not fully set — skipping.")
            return ""

        try:
            # v1.1 client for media upload, v2 for tweet creation
            auth = tweepy.OAuth1UserHandler(api_key, api_secret,
                                            access_token, access_secret)
            api_v1 = tweepy.API(auth)
            client_v2 = tweepy.Client(
                consumer_key=api_key,
                consumer_secret=api_secret,
                access_token=access_token,
                access_token_secret=access_secret,
            )

            # Upload image if available
            media_id = None
            if image_path and Path(image_path).exists():
                media = api_v1.media_upload(filename=image_path)
                media_id = media.media_id

            caption = post.twitter_caption or self._default_twitter_caption(post, blog_url)

            if media_id:
                tweet = client_v2.create_tweet(text=caption, media_ids=[media_id])
            else:
                tweet = client_v2.create_tweet(text=caption)

            tweet_id = tweet.data["id"]
            username = api_v1.verify_credentials().screen_name
            tweet_url = f"https://twitter.com/{username}/status/{tweet_id}"
            logger.info("Twitter post published: %s", tweet_url)
            return tweet_url

        except Exception as e:
            logger.error("Twitter posting failed: %s", e)
            return ""

    def _default_twitter_caption(self, post: BlogPost, url: str) -> str:
        hashtags = " ".join(post.hashtags[:3])
        text = f"{post.title}\n\n{url}\n\n{hashtags}"
        return text[:280]

    # ------------------------------------------------------------------ #
    # LinkedIn                                                             #
    # ------------------------------------------------------------------ #

    def _post_linkedin(self, post: BlogPost, blog_url: str,
                       image_path: str = "") -> str:
        access_token = os.getenv("LINKEDIN_ACCESS_TOKEN", "")
        person_urn = os.getenv("LINKEDIN_PERSON_URN", "")  # urn:li:person:XXXX

        if not access_token or not person_urn:
            logger.warning("LinkedIn credentials not set — skipping.")
            return ""

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
        }

        try:
            caption = post.linkedin_caption or self._default_linkedin_caption(post, blog_url)

            # Upload image if available
            image_urn = None
            if image_path and Path(image_path).exists():
                image_urn = self._upload_linkedin_image(image_path, person_urn,
                                                        access_token, headers)

            # Build share payload
            share_content: dict = {
                "shareCommentary": {"text": caption},
                "shareMediaCategory": "NONE",
            }

            if image_urn:
                share_content["shareMediaCategory"] = "IMAGE"
                share_content["media"] = [{
                    "status": "READY",
                    "description": {"text": post.meta_description[:200]},
                    "media": image_urn,
                    "title": {"text": post.title},
                }]
            else:
                share_content["shareMediaCategory"] = "ARTICLE"
                share_content["media"] = [{
                    "status": "READY",
                    "description": {"text": post.meta_description[:200]},
                    "originalUrl": blog_url,
                    "title": {"text": post.title},
                }]

            payload = {
                "author": person_urn,
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.ShareContent": share_content,
                },
                "visibility": {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
                },
            }

            resp = requests.post(
                "https://api.linkedin.com/v2/ugcPosts",
                headers=headers,
                json=payload,
                timeout=30,
            )
            resp.raise_for_status()
            post_id = resp.json().get("id", "")
            post_url = f"https://www.linkedin.com/feed/update/{post_id}"
            logger.info("LinkedIn post published: %s", post_url)
            return post_url

        except Exception as e:
            logger.error("LinkedIn posting failed: %s", e)
            return ""

    def _upload_linkedin_image(self, image_path: str, person_urn: str,
                                access_token: str, headers: dict) -> str | None:
        try:
            # Step 1: Register upload
            register_resp = requests.post(
                "https://api.linkedin.com/v2/assets?action=registerUpload",
                headers=headers,
                json={
                    "registerUploadRequest": {
                        "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
                        "owner": person_urn,
                        "serviceRelationships": [{
                            "relationshipType": "OWNER",
                            "identifier": "urn:li:userGeneratedContent",
                        }],
                    }
                },
                timeout=15,
            )
            register_resp.raise_for_status()
            reg_data = register_resp.json()
            upload_url = reg_data["value"]["uploadMechanism"] \
                                 ["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"] \
                                 ["uploadUrl"]
            asset_urn = reg_data["value"]["asset"]

            # Step 2: Upload binary
            with open(image_path, "rb") as f:
                upload_resp = requests.put(
                    upload_url,
                    headers={"Authorization": f"Bearer {access_token}"},
                    data=f,
                    timeout=60,
                )
                upload_resp.raise_for_status()

            return asset_urn
        except Exception as e:
            logger.error("LinkedIn image upload failed: %s", e)
            return None

    def _default_linkedin_caption(self, post: BlogPost, url: str) -> str:
        hashtags = " ".join(post.hashtags[:10])
        return f"{post.title}\n\n{post.meta_description}\n\nRead more: {url}\n\n{hashtags}"

    # ------------------------------------------------------------------ #
    # Instagram                                                            #
    # ------------------------------------------------------------------ #

    def _post_instagram(self, post: BlogPost, blog_url: str,
                        image_path: str = "") -> str:
        """
        Instagram requires:
          1. A public image URL (Instagram fetches it from your server)
          2. Facebook Graph API access via Meta Business account
        """
        access_token = os.getenv("INSTAGRAM_ACCESS_TOKEN", "")
        ig_account_id = os.getenv("INSTAGRAM_BUSINESS_ACCOUNT_ID", "")

        if not access_token or not ig_account_id:
            logger.warning("Instagram credentials not set — skipping.")
            return ""

        if not image_path:
            logger.warning("Instagram requires an image — skipping (no image available).")
            return ""

        # Instagram needs a publicly accessible URL for the image.
        # You need to upload the image to your server/CDN first.
        # Here we check if post.image_url is a public HTTP URL.
        if not post.image_url or not post.image_url.startswith("http"):
            logger.warning(
                "Instagram needs a public image URL. "
                "Upload the image to your CDN and set post.image_url."
            )
            return ""

        try:
            caption = post.instagram_caption or self._default_instagram_caption(post, blog_url)
            graph_url = "https://graph.facebook.com/v18.0"

            # Step 1: Create media container
            container_resp = requests.post(
                f"{graph_url}/{ig_account_id}/media",
                params={
                    "image_url": post.image_url,
                    "caption": caption[:2200],  # Instagram caption limit
                    "access_token": access_token,
                },
                timeout=30,
            )
            container_resp.raise_for_status()
            container_id = container_resp.json()["id"]

            # Step 2: Publish the container
            publish_resp = requests.post(
                f"{graph_url}/{ig_account_id}/media_publish",
                params={
                    "creation_id": container_id,
                    "access_token": access_token,
                },
                timeout=30,
            )
            publish_resp.raise_for_status()
            media_id = publish_resp.json()["id"]

            logger.info("Instagram post published (media ID: %s)", media_id)
            return f"https://www.instagram.com/p/{media_id}/"

        except Exception as e:
            logger.error("Instagram posting failed: %s", e)
            return ""

    def _default_instagram_caption(self, post: BlogPost, url: str) -> str:
        hashtags = " ".join(post.hashtags[:30])
        return f"{post.title}\n\n{post.meta_description}\n\nLink in bio!\n\n{hashtags}"
