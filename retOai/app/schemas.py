from typing import Optional

from pydantic import BaseModel


class CreateChatRequest(BaseModel):
    title: Optional[str] = None
    letterId: Optional[str] = None


class RenameChatRequest(BaseModel):
    title: str


class SendMessageRequest(BaseModel):
    content: str


class DevTokenRequest(BaseModel):
    uid: str
