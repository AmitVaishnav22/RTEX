"""Gemini LLM provider.

Single Responsibility: translate chat history + system instruction into
Gemini replies. Implements the LLMProvider contract; the client is built
lazily so a missing API key fails on first use, not at import time.
"""

import logging
from typing import Any, Iterator

from google import genai
from google.genai import types

from ..contracts import LLMProvider

logger = logging.getLogger("retOai.gemini")


class GeminiProvider(LLMProvider):
    def __init__(
        self,
        api_key: str,
        model: str,
        temperature: float = 0.7,
        max_output_tokens: int = 1024,
    ):
        self._api_key = api_key
        self._model = model
        self._temperature = temperature
        self._max_output_tokens = max_output_tokens
        self._client: genai.Client | None = None

    def _get_client(self) -> genai.Client:
        if not self._api_key:
            logger.error("GEMINI_API_KEY is not configured")
            raise RuntimeError("Server misconfiguration: Missing GEMINI_API_KEY")
        if self._client is None:
            self._client = genai.Client(api_key=self._api_key)
        return self._client

    def _start_chat(
        self,
        *,
        history: list[dict[str, Any]],
        system_instruction: str,
    ):
        return self._get_client().chats.create(
            model=self._model,
            history=[
                types.Content(
                    role="model" if message["role"] == "assistant" else "user",
                    parts=[types.Part(text=message["content"])],
                )
                for message in history
            ],
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=self._temperature,
                max_output_tokens=self._max_output_tokens,
            ),
        )

    def generate_reply(
        self,
        *,
        history: list[dict[str, Any]],
        system_instruction: str,
        user_message: str,
    ) -> str:
        logger.info(
            "Gemini request model=%s history=%d msgs system_instruction=%d chars",
            self._model,
            len(history),
            len(system_instruction),
        )
        chat = self._start_chat(history=history, system_instruction=system_instruction)
        response = chat.send_message(user_message)
        text = response.text or ""
        logger.info("Gemini reply chars=%d", len(text))
        return text

    def generate_reply_stream(
        self,
        *,
        history: list[dict[str, Any]],
        system_instruction: str,
        user_message: str,
    ) -> Iterator[str]:
        """Yields incremental text deltas of the model reply."""
        logger.info(
            "Gemini stream start model=%s history=%d msgs system_instruction=%d chars",
            self._model,
            len(history),
            len(system_instruction),
        )
        chat = self._start_chat(history=history, system_instruction=system_instruction)
        accumulated = ""
        for chunk in chat.send_message_stream(user_message):
            text = chunk.text or ""
            if len(text) > len(accumulated):
                yield text[len(accumulated):]
            accumulated = text
        logger.info("Gemini stream complete chars=%d", len(accumulated))
