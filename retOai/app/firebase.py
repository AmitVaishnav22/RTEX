"""Firebase auth provider.

Implements both TokenVerifier (verify bearer tokens) and TokenMinter
(dev-only custom token -> ID token exchange) against Firebase Admin.
"""

import asyncio
import logging

import firebase_admin
import httpx
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials

from .contracts import TokenMinter, TokenVerifier

logger = logging.getLogger("retOai.firebase")

_IDENTITY_TOOLKIT_URL = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken"


class FirebaseAuthService(TokenVerifier, TokenMinter):
    def __init__(self, firebase_credentials: dict, web_api_key: str):
        if not firebase_admin._apps:
            cred = credentials.Certificate(firebase_credentials)
            firebase_admin.initialize_app(cred)
        self._auth = firebase_auth
        self._web_api_key = web_api_key

    def verify_id_token(self, token: str) -> dict:
        return self._auth.verify_id_token(token)

    async def mint_id_token(self, uid: str) -> dict:
        custom_token = await asyncio.to_thread(self._auth.create_custom_token, uid)
        if isinstance(custom_token, bytes):
            custom_token = custom_token.decode("utf-8")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                _IDENTITY_TOOLKIT_URL,
                params={"key": self._web_api_key},
                json={"token": custom_token, "returnSecureToken": True},
            )
        response.raise_for_status()
        data = response.json()

        return {
            "uid": data.get("uid"),
            "idToken": data.get("idToken"),
            "refreshToken": data.get("refreshToken"),
            "expiresIn": data.get("expiresIn"),
        }
