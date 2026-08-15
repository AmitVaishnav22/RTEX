"""Composition root.

Single Responsibility: construct and wire every dependency once, following
Dependency Inversion. Nothing else builds services; everything else
receives them.
"""

import logging

from .config import Settings
from .contracts import ChatRepository, LLMProvider, TokenMinter, TokenVerifier
from .database import Database
from .firebase import FirebaseAuthService
from .logging_config import LoggingConfigurator
from .models.chat import MongoChatRepository
from .services.gemini import GeminiProvider
from .services.system_prompt import SystemPromptBuilder


class Container:
    def __init__(self, settings: Settings | None = None):
        self.settings = settings or Settings.from_env()

        LoggingConfigurator(self.settings).configure()
        self.logger = logging.getLogger("retOai.main")

        self.database = Database(self.settings.mongo_url, self.settings.db_name)
        self.chat_repository: ChatRepository = MongoChatRepository(self.database)
        self.llm_provider: LLMProvider = GeminiProvider(
            api_key=self.settings.gemini_api_key,
            model=self.settings.gemini_model,
        )
        self.system_prompt_builder = SystemPromptBuilder(self.chat_repository)
        self.auth_service: TokenVerifier & TokenMinter = FirebaseAuthService(
            firebase_credentials=self.settings.firebase,
            web_api_key=self.settings.firebase_web_api_key,
        )

    async def close(self) -> None:
        await self.database.close()
        self.logger.info("Container closed")
