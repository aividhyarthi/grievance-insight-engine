"""
Google Search Console OAuth2 authentication.

Two modes:
  1. Service Account (recommended for production): set GOOGLE_SERVICE_ACCOUNT_JSON env var
  2. OAuth2 web flow (for Streamlit): uses client_id/client_secret + user consent

Usage:
    auth = GSCAuth()
    credentials = auth.get_credentials()
"""

import json
import os
from pathlib import Path
from typing import Optional


SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
TOKEN_CACHE_PATH = Path.home() / ".serp_volatility" / "gsc_token.json"


class GSCAuth:
    """Handles GSC authentication. Tries service account first, then OAuth2."""

    def __init__(
        self,
        client_secrets_file: Optional[str] = None,
        token_cache: Path = TOKEN_CACHE_PATH,
    ):
        self.client_secrets_file = client_secrets_file or os.getenv("GSC_CLIENT_SECRETS_FILE")
        self.token_cache = token_cache
        self._credentials = None

    def get_credentials(self):
        """Return valid Google credentials. Raises if not configured."""
        # Option 1: Service account JSON (env var)
        sa_json = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")
        if sa_json:
            return self._from_service_account(sa_json)

        # Option 2: Service account file
        sa_file = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE")
        if sa_file and Path(sa_file).exists():
            return self._from_service_account_file(sa_file)

        # Option 3: OAuth2 with cached token
        return self._from_oauth2()

    def _from_service_account(self, json_str: str):
        from google.oauth2 import service_account
        info = json.loads(json_str)
        return service_account.Credentials.from_service_account_info(info, scopes=SCOPES)

    def _from_service_account_file(self, path: str):
        from google.oauth2 import service_account
        return service_account.Credentials.from_service_account_file(path, scopes=SCOPES)

    def _from_oauth2(self):
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow
        from google.auth.transport.requests import Request

        creds = None

        # Load cached token
        if self.token_cache.exists():
            creds = Credentials.from_authorized_user_file(str(self.token_cache), SCOPES)

        # Refresh or re-authenticate
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not self.client_secrets_file:
                    raise ValueError(
                        "GSC not configured. Set one of:\n"
                        "  - GOOGLE_SERVICE_ACCOUNT_JSON (service account, recommended)\n"
                        "  - GSC_CLIENT_SECRETS_FILE (OAuth2 client secrets)\n"
                        "Download OAuth2 credentials from Google Cloud Console → APIs & Services → Credentials"
                    )
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.client_secrets_file, SCOPES
                )
                creds = flow.run_local_server(port=0)

            # Cache the token
            self.token_cache.parent.mkdir(parents=True, exist_ok=True)
            self.token_cache.write_text(creds.to_json())

        return creds

    @staticmethod
    def build_service(credentials):
        """Build the GSC API service object."""
        from googleapiclient.discovery import build
        return build("webmasters", "v3", credentials=credentials, cache_discovery=False)

    def is_configured(self) -> bool:
        """Check if any GSC credentials are available without triggering auth flow."""
        return bool(
            os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")
            or os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE")
            or self.token_cache.exists()
            or self.client_secrets_file
        )
