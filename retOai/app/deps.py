"""FastAPI dependency wiring.

Class-based authentication dependency. NOTE: to get the return value of a
callable class you must pass an *instance* to Depends (`Depends(current_user)`);
passing the class returns the instance itself.
"""

import logging

from fastapi import Depends, Header, HTTPException, Request

from .container import Container
from .contracts import TokenVerifier

logger = logging.getLogger("retOai.auth")


def get_container(request: Request) -> Container:
    container: Container | None = getattr(request.app.state, "container", None)
    if container is None:
        raise HTTPException(status_code=500, detail="Application not initialized")
    return container


def get_token_verifier(container: Container = Depends(get_container)) -> TokenVerifier:
    return container.auth_service


class CurrentUser:
    """Resolves the authenticated user claims from the Authorization header."""

    async def __call__(
        self,
        token_verifier: TokenVerifier = Depends(get_token_verifier),
        authorization: str | None = Header(default=None),
    ) -> dict:
        if not authorization or not authorization.startswith("Bearer "):
            logger.warning("Request without bearer token")
            raise HTTPException(status_code=401, detail="Unauthorized")

        token = authorization.split(" ", 1)[1]
        try:
            decoded = token_verifier.verify_id_token(token)
            logger.info("Auth ok uid=%s", decoded.get("uid"))
            return decoded
        except Exception as exc:
            logger.warning("Auth failed (invalid token): %s", exc)
            raise HTTPException(status_code=401, detail="Invalid token")


current_user = CurrentUser()
