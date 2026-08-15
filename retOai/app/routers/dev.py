"""Dev-only HTTP router.

Single Responsibility: expose dev utilities. Depends on the TokenMinter
contract; guarded by the ENABLE_DEV_AUTH setting.
"""

import logging

from fastapi import APIRouter, HTTPException

from ..contracts import TokenMinter
from ..schemas import DevTokenRequest

logger = logging.getLogger("retOai.dev")


class DevRouter:
    def __init__(self, token_minter: TokenMinter, enable_dev_auth: bool, firebase_web_api_key: str):
        self._token_minter = token_minter
        self._enable_dev_auth = enable_dev_auth
        self._firebase_web_api_key = firebase_web_api_key

        self.router = APIRouter(prefix="/dev", tags=["dev"])
        self._register_routes()

    def _register_routes(self) -> None:
        self.router.add_api_route("/token", self.mint_dev_token, methods=["POST"])

    async def mint_dev_token(self, body: DevTokenRequest) -> dict:
        """Dev-only: mint a Firebase ID token for testing.

        Requires ENABLE_DEV_AUTH=true in the environment. Never enable in production.
        """
        if not self._enable_dev_auth:
            logger.warning("Dev token endpoint called but ENABLE_DEV_AUTH is disabled")
            raise HTTPException(status_code=403, detail="Dev auth is disabled")

        if not body.uid.strip():
            raise HTTPException(status_code=400, detail="uid is required")

        if not self._firebase_web_api_key:
            raise HTTPException(status_code=500, detail="FIREBASE_WEB_API_KEY is not configured")

        logger.info("Dev token requested uid=%s (ENABLE_DEV_AUTH=true)", body.uid.strip())

        try:
            return await self._token_minter.mint_id_token(body.uid.strip())
        except Exception as exc:
            logger.exception("Failed to mint dev token uid=%s", body.uid.strip())
            raise HTTPException(status_code=502, detail=f"Failed to mint token: {exc}")
