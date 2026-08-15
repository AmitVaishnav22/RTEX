"""Database wrapper.

Single Responsibility: own the Mongo client lifecycle and expose the
collections the repository needs. Lower layers never touch the client.
"""

import logging

from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger("retOai.db")


class Database:
    def __init__(self, url: str, db_name: str):
        self._client = AsyncIOMotorClient(url)
        self._db = self._client[db_name]

        self.chat_sessions = self._db.chatsessions
        self.chat_messages = self._db.chatmessages
        self.letters = self._db.letters

    async def ping(self) -> bool:
        try:
            await self._db.command("ping")
            return True
        except Exception as exc:
            logger.error("Database ping failed: %s", exc)
            return False

    async def close(self) -> None:
        result = self._client.close()
        if hasattr(result, "__await__"):
            await result
