"""System prompt builder.

Single Responsibility: assemble the system instruction for a chat turn,
optionally grounding it in an attached Workspace (letter). Open for
extension (new prompt sections) without touching the router.
"""

import logging
import re

from ..contracts import ChatRepository

logger = logging.getLogger("retOai.prompt")


class SystemPromptBuilder:
    def __init__(self, repository: ChatRepository):
        self._repository = repository

    @staticmethod
    def _strip_html(html: str) -> str:
        text = re.sub(r"<[^>]*>", " ", html or "")
        text = text.replace("&nbsp;", " ").replace("&amp;", "&")
        return re.sub(r"\s+", " ", text).strip()

    async def build(self, session: dict) -> str:
        parts = [
            "You are RETOAI, an AI assistant built into RTEX, a real-time collaborative text editor.",
            "Be concise, helpful, and grounded in the context provided. don't hallucinate. If you don't know the answer, say something like 'I don't know' or 'I don't have enough information to answer that'. also if user asks some question that is not related to the context, politely inform them that you can only answer questions related to the context provided."
        ]

        if session.get("letterId"):
            letter = await self._repository.get_letter(session["letterId"])
            if letter:
                content = self._strip_html(letter.get("content", ""))[:6000]
                title = letter.get("title", "")
                parts.append(
                    f'The user is currently working on the Workspace titled "{title}". '
                    f"Here is its content:\n\"\"\"\n{content}\n\"\"\""
                )
                parts.append(
                    "Answer the user's questions about their Workspace using the provided content. "
                    "You may also help draft, improve, summarize, or expand their writing."
                )
        else:
            parts.append(
                "No specific Workspace is attached. The user can attach a Workspace to get document-aware help."
            )

        return "\n\n".join(parts)
