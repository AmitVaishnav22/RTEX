"""Abstract contracts (interfaces) for the RETOAI service.

Following Dependency Inversion: high-level code depends on these
abstractions, never on concrete implementations. Swap an implementation
(e.g. Mongo -> Postgres, Gemini -> Claude) without touching callers.
"""

from abc import ABC, abstractmethod
from typing import Any, Iterator


class ChatRepository(ABC):
    """Persistence boundary for chat sessions, messages, and letters."""

    @abstractmethod
    async def create_session(
        self,
        user_id: str,
        title: str,
        letter_id: str | None,
        letter_title: str,
    ) -> dict:
        ...

    @abstractmethod
    async def get_session(self, session_id: str, user_id: str) -> dict | None:
        ...

    @abstractmethod
    async def list_sessions(self, user_id: str) -> list[dict]:
        ...

    @abstractmethod
    async def touch_session(self, session_id: str, title: str | None = None) -> None:
        ...

    @abstractmethod
    async def delete_session(self, session_id: str) -> None:
        ...

    @abstractmethod
    async def add_message(self, session_id: str, role: str, content: str) -> dict:
        ...

    @abstractmethod
    async def get_messages(self, session_id: str) -> list[dict]:
        ...

    @abstractmethod
    async def get_letter(self, letter_id: str) -> dict | None:
        ...


class LLMProvider(ABC):
    """Generative model boundary for RETOAI replies."""

    @abstractmethod
    def generate_reply(
        self,
        *,
        history: list[dict[str, Any]],
        system_instruction: str,
        user_message: str,
    ) -> str:
        ...

    @abstractmethod
    def generate_reply_stream(
        self,
        *,
        history: list[dict[str, Any]],
        system_instruction: str,
        user_message: str,
    ) -> Iterator[str]:
        ...


class TokenVerifier(ABC):
    """Verifies bearer tokens and returns the authenticated user claims."""

    @abstractmethod
    def verify_id_token(self, token: str) -> dict:
        ...


class TokenMinter(ABC):
    """Mints ID tokens (dev-only path for local testing)."""

    @abstractmethod
    async def mint_id_token(self, uid: str) -> dict:
        ...
