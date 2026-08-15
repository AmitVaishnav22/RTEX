"""Chat HTTP router.

Single Responsibility: translate HTTP into service calls. Depends on the
ChatRepository and LLMProvider contracts (injected), never on concretions.
"""

import asyncio
import json
import logging
import queue
import threading
import time

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from ..contracts import ChatRepository, LLMProvider
from ..deps import current_user
from ..models.chat import NEW_CHAT_TITLE
from ..schemas import CreateChatRequest, RenameChatRequest, SendMessageRequest
from ..services.system_prompt import SystemPromptBuilder

logger = logging.getLogger("retOai.chats")


class ChatRouter:
    def __init__(self, repository: ChatRepository, llm_provider: LLMProvider, prompt_builder: SystemPromptBuilder):
        self._repository = repository
        self._llm_provider = llm_provider
        self._prompt_builder = prompt_builder

        self.router = APIRouter(prefix="/chats", tags=["chats"])
        self._register_routes()

    def _register_routes(self) -> None:
        self.router.add_api_route("", self.create_chat, methods=["POST"], status_code=201)
        self.router.add_api_route("", self.list_chats, methods=["GET"])
        self.router.add_api_route("/{session_id}/messages", self.get_messages, methods=["GET"])
        self.router.add_api_route("/{session_id}/messages", self.send_message, methods=["POST"])
        self.router.add_api_route("/{session_id}/messages/stream", self.send_message_stream, methods=["POST"])
        self.router.add_api_route("/{session_id}", self.rename_chat, methods=["PUT"])
        self.router.add_api_route("/{session_id}", self.delete_chat, methods=["DELETE"])

    async def create_chat(self, body: CreateChatRequest, user: dict = Depends(current_user)) -> dict:
        letter_id = None
        letter_title = ""
        if body.letterId:
            letter = await self._repository.get_letter(body.letterId)
            if not letter or letter.get("userId") != user["uid"]:
                logger.warning("Workspace attach rejected uid=%s letterId=%s", user["uid"], body.letterId)
                raise HTTPException(status_code=404, detail="Workspace not found or unauthorized")
            letter_id = body.letterId
            letter_title = letter.get("title", "")

        session = await self._repository.create_session(
            user_id=user["uid"],
            title=(body.title or "").strip(),
            letter_id=letter_id,
            letter_title=letter_title,
        )
        logger.info("Chat created uid=%s session=%s letterId=%s", user["uid"], session["_id"], letter_id)
        return session

    async def list_chats(self, user: dict = Depends(current_user)) -> list[dict]:
        return await self._repository.list_sessions(user["uid"])

    async def get_messages(self, session_id: str, user: dict = Depends(current_user)) -> dict:
        session = await self._repository.get_session(session_id, user["uid"])
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")

        messages = await self._repository.get_messages(session_id)
        logger.info("Messages fetched uid=%s session=%s count=%d", user["uid"], session_id, len(messages))
        return {"session": session, "messages": messages}

    async def _prepare_turn(self, session_id: str, content: str, user: dict):
        """Validate session, persist the user message, auto-title, and build model inputs."""
        session = await self._repository.get_session(session_id, user["uid"])
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")

        await self._repository.add_message(session_id, "user", content)

        if session["title"] == NEW_CHAT_TITLE:
            title = content if len(content) <= 48 else content[:48] + "…"
            await self._repository.touch_session(session_id, title=title)
            session["title"] = title
        else:
            await self._repository.touch_session(session_id)

        messages = await self._repository.get_messages(session_id)
        history_payload = [{"role": m["role"], "content": m["content"]} for m in messages]
        return session, history_payload, await self._prompt_builder.build(session)

    async def send_message(
        self,
        session_id: str,
        body: SendMessageRequest,
        user: dict = Depends(current_user),
    ) -> dict:
        content = body.content.strip()
        if not content:
            raise HTTPException(status_code=400, detail="Message content is required")

        start = time.perf_counter()
        logger.info("Send start uid=%s session=%s user_chars=%d", user["uid"], session_id, len(content))
        _, history_payload, system_instruction = await self._prepare_turn(session_id, content, user)

        try:
            reply = self._llm_provider.generate_reply(
                history=history_payload,
                system_instruction=system_instruction,
                user_message=content,
            )
        except RuntimeError as exc:
            logger.error("Gemini not configured for session=%s: %s", session_id, exc)
            raise HTTPException(status_code=500, detail=str(exc))
        except Exception as exc:
            logger.exception("AI generation failed session=%s", session_id)
            raise HTTPException(status_code=502, detail=f"AI generation failed: {exc}")

        message = await self._repository.add_message(session_id, "assistant", reply)
        logger.info(
            "Send complete uid=%s session=%s reply_chars=%d elapsed=%.2fs",
            user["uid"],
            session_id,
            len(reply),
            time.perf_counter() - start,
        )
        return message

    async def send_message_stream(
        self,
        session_id: str,
        body: SendMessageRequest,
        user: dict = Depends(current_user),
    ):
        content = body.content.strip()
        if not content:
            raise HTTPException(status_code=400, detail="Message content is required")

        logger.info("Stream start uid=%s session=%s user_chars=%d", user["uid"], session_id, len(content))
        _, history_payload, system_instruction = await self._prepare_turn(session_id, content, user)

        def _generate(q: queue.Queue):
            try:
                full = ""
                for delta in self._llm_provider.generate_reply_stream(
                    history=history_payload,
                    system_instruction=system_instruction,
                    user_message=content,
                ):
                    full += delta
                    q.put(("delta", delta))
                q.put(("done", full))
            except Exception as exc:
                logger.exception("Stream generation failed session=%s", session_id)
                q.put(("error", str(exc)))

        async def event_source():
            q: queue.Queue = queue.Queue()
            thread = threading.Thread(target=_generate, args=(q,), daemon=True)
            start = time.perf_counter()
            chunk_count = 0
            thread.start()

            while True:
                kind, payload = await asyncio.to_thread(q.get)
                if kind == "delta":
                    chunk_count += 1
                    yield f"data: {json.dumps({'delta': payload})}\n\n"
                elif kind == "done":
                    await self._repository.add_message(session_id, "assistant", payload)
                    logger.info(
                        "Stream complete uid=%s session=%s chunks=%d reply_chars=%d elapsed=%.2fs",
                        user["uid"],
                        session_id,
                        chunk_count,
                        len(payload),
                        time.perf_counter() - start,
                    )
                    yield f"event: done\ndata: {json.dumps({'message': payload})}\n\n"
                    break
                elif kind == "error":
                    logger.error("Stream error session=%s: %s", session_id, payload)
                    yield f"event: error\ndata: {json.dumps({'detail': payload})}\n\n"
                    break

            thread.join(timeout=1)

        return StreamingResponse(
            event_source(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    async def rename_chat(
        self,
        session_id: str,
        body: RenameChatRequest,
        user: dict = Depends(current_user),
    ) -> dict:
        title = body.title.strip()
        if not title:
            raise HTTPException(status_code=400, detail="Title is required")

        session = await self._repository.get_session(session_id, user["uid"])
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")

        await self._repository.touch_session(session_id, title=title)
        session["title"] = title
        logger.info("Chat renamed uid=%s session=%s", user["uid"], session_id)
        return session

    async def delete_chat(self, session_id: str, user: dict = Depends(current_user)) -> dict:
        session = await self._repository.get_session(session_id, user["uid"])
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")

        await self._repository.delete_session(session_id)
        logger.info("Chat deleted uid=%s session=%s", user["uid"], session_id)
        return {"message": "Chat session deleted"}
