"""FastAPI application factory.

Single Responsibility: assemble the app. The composition root (Container)
wires dependencies; routers receive them via constructor injection.
"""

import logging
import time

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

from .container import Container
from .routers import chats, dev

logger = logging.getLogger("retOai.main")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Logs method, path, status, and duration for every request."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000
        logger.info(
            "%s %s -> %s (%.1fms)",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )
        return response


class GlobalExceptionHandler:
    """Logs unhandled exceptions and returns a generic 500."""

    async def __call__(self, request: Request, exc: Exception):
        logger.exception("Unhandled error on %s %s", request.method, request.url.path)
        return JSONResponse(status_code=500, content={"detail": f"Internal server error on {exc}"})


def create_app(container: Container | None = None) -> FastAPI:
    container = container or Container()

    @asynccontextmanager
    async def lifespan(_app: FastAPI):
        _app.state.container = container
        settings = container.settings
        logger.info(
            "RETOAI starting | model=%s | db=%s | gemini_key=%s | dev_auth=%s",
            settings.gemini_model,
            settings.db_name,
            "configured" if settings.gemini_key_configured else "MISSING",
            "enabled" if settings.enable_dev_auth else "disabled",
        )
        yield
        await container.close()
        logger.info("RETOAI shutting down")

    app = FastAPI(title="RETOAI", version="1.0.0", lifespan=lifespan)
    app.state.container = container

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[container.settings.client_url],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestLoggingMiddleware)
    app.add_exception_handler(Exception, GlobalExceptionHandler())

    chat_router = chats.ChatRouter(
        repository=container.chat_repository,
        llm_provider=container.llm_provider,
        prompt_builder=container.system_prompt_builder,
    )
    dev_router = dev.DevRouter(
        token_minter=container.auth_service,
        enable_dev_auth=container.settings.enable_dev_auth,
        firebase_web_api_key=container.settings.firebase_web_api_key,
    )
    app.include_router(chat_router.router)
    app.include_router(dev_router.router)

    @app.get("/health")
    async def health():
        settings = container.settings
        db_connected = await container.database.ping()
        return {
            "status": "ok" if db_connected else "degraded",
            "service": "retOai",
            "version": "1.0.0",
            "model": settings.gemini_model,
            "database": "connected" if db_connected else "unreachable",
            "geminiApiKeyConfigured": settings.gemini_key_configured,
        }

    return app


app = create_app()
