"""Mongo-backed chat repository.

Single Responsibility: persist and read chat data. Implements the
ChatRepository contract; swappable without touching callers.
"""

import logging
from datetime import datetime, timezone

from bson import ObjectId

from ..contracts import ChatRepository
from ..database import Database

logger = logging.getLogger("retOai.store")

NEW_CHAT_TITLE = "New chat"


class MongoChatRepository(ChatRepository):
    def __init__(self, database: Database):
        self._sessions = database.chat_sessions
        self._messages = database.chat_messages
        self._letters = database.letters

    @staticmethod
    def _now() -> datetime:
        return datetime.now(timezone.utc)

    @staticmethod
    def _to_str_or_none(value) -> str | None:
        return str(value) if value else None

    @classmethod
    def _serialize_session(cls, doc) -> dict:
        return {
            "_id": str(doc["_id"]),
            "userId": doc.get("userId"),
            "title": doc.get("title", NEW_CHAT_TITLE),
            "letterId": cls._to_str_or_none(doc.get("letterId")),
            "letterTitle": doc.get("letterTitle", ""),
            "createdAt": doc.get("createdAt").isoformat() if doc.get("createdAt") else None,
            "updatedAt": doc.get("updatedAt").isoformat() if doc.get("updatedAt") else None,
        }

    @classmethod
    def _serialize_message(cls, doc) -> dict:
        return {
            "_id": str(doc["_id"]),
            "sessionId": str(doc.get("sessionId")),
            "role": doc.get("role"),
            "content": doc.get("content"),
            "createdAt": doc.get("createdAt").isoformat() if doc.get("createdAt") else None,
        }

    async def create_session(
        self,
        user_id: str,
        title: str,
        letter_id: str | None,
        letter_title: str,
    ) -> dict:
        now = self._now()
        doc = {
            "userId": user_id,
            "title": title or NEW_CHAT_TITLE,
            "letterId": ObjectId(letter_id) if letter_id else None,
            "letterTitle": letter_title or "",
            "createdAt": now,
            "updatedAt": now,
        }
        try:
            result = await self._sessions.insert_one(doc)
            doc["_id"] = result.inserted_id
            logger.info("Session created uid=%s id=%s letterId=%s", user_id, doc["_id"], letter_id)
            return self._serialize_session(doc)
        except Exception:
            logger.exception("Failed to create session uid=%s", user_id)
            raise

    async def get_session(self, session_id: str, user_id: str) -> dict | None:
        try:
            _id = ObjectId(session_id)
        except Exception:
            return None
        doc = await self._sessions.find_one({"_id": _id, "userId": user_id})
        if not doc:
            logger.warning("Session not found or not owned id=%s uid=%s", session_id, user_id)
        return self._serialize_session(doc) if doc else None

    async def list_sessions(self, user_id: str) -> list[dict]:
        cursor = self._sessions.find({"userId": user_id}).sort("updatedAt", -1)
        docs = [self._serialize_session(doc) async for doc in cursor]
        logger.info("Listed sessions uid=%s count=%d", user_id, len(docs))
        return docs

    async def touch_session(self, session_id: str, title: str | None = None) -> None:
        update = {"updatedAt": self._now()}
        if title:
            update["title"] = title
        try:
            await self._sessions.update_one({"_id": ObjectId(session_id)}, {"$set": update})
        except Exception:
            logger.exception("Failed to touch session id=%s", session_id)
            raise

    async def delete_session(self, session_id: str) -> None:
        try:
            await self._messages.delete_many({"sessionId": ObjectId(session_id)})
            await self._sessions.delete_one({"_id": ObjectId(session_id)})
            logger.info("Session deleted id=%s (messages purged)", session_id)
        except Exception:
            logger.exception("Failed to delete session id=%s", session_id)
            raise

    async def add_message(self, session_id: str, role: str, content: str) -> dict:
        now = self._now()
        doc = {
            "sessionId": ObjectId(session_id),
            "role": role,
            "content": content,
            "createdAt": now,
        }
        try:
            result = await self._messages.insert_one(doc)
            doc["_id"] = result.inserted_id
            logger.info("Message stored id=%s role=%s chars=%d", session_id, role, len(content))
            return self._serialize_message(doc)
        except Exception:
            logger.exception("Failed to store message id=%s role=%s", session_id, role)
            raise

    async def get_messages(self, session_id: str) -> list[dict]:
        cursor = self._messages.find({"sessionId": ObjectId(session_id)}).sort("createdAt", 1)
        return [self._serialize_message(doc) async for doc in cursor]

    async def get_letter(self, letter_id: str) -> dict | None:
        try:
            _id = ObjectId(letter_id)
        except Exception:
            return None
        doc = await self._letters.find_one({"_id": _id})
        if not doc:
            logger.warning("Letter not found for context letterId=%s", letter_id)
        return doc
