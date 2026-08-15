"""Configuration value object.

Single Responsibility: load and validate environment configuration once,
exposing typed attributes. No other module reads os.getenv directly.
"""

import os

from dotenv import load_dotenv
from pydantic import BaseModel, Field

load_dotenv()

_FIREBASE_KEYS = (
    "type",
    "project_id",
    "private_key_id",
    "private_key",
    "client_email",
    "client_id",
    "auth_uri",
    "token_uri",
    "auth_provider_x509_cert_url",
    "client_x509_cert_url",
    "universe_domain",
)


class Settings(BaseModel):
    service_name: str = "retOai"
    port: int = 8000
    client_url: str = "http://localhost:5173"

    mongo_url: str = "mongodb://localhost:27017"
    db_name: str = "RTEX"

    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.6-flash"

    log_level: str = "INFO"
    log_file: str = ""

    enable_dev_auth: bool = False
    firebase_web_api_key: str = ""
    firebase: dict = Field(default_factory=dict)

    @classmethod
    def from_env(cls) -> "Settings":
        firebase = {key: os.getenv(f"FIREBASE_{key.upper()}") for key in _FIREBASE_KEYS}
        firebase["private_key"] = os.getenv("FIREBASE_PRIVATE_KEY", "").replace("\\n", "\n")

        return cls(
            port=int(os.getenv("RETOAI_PORT", "8000")),
            client_url=os.getenv("CLIENT_URL", "http://localhost:5173"),
            mongo_url=os.getenv("MONGODB_URL", "mongodb://localhost:27017"),
            db_name=os.getenv("MONGO_DB_NAME", "RTEX"),
            gemini_api_key=os.getenv("GEMINI_API_KEY", ""),
            gemini_model=os.getenv("GEMINI_MODEL", "gemini-3.6-flash"),
            log_level=os.getenv("LOG_LEVEL", "INFO"),
            log_file=os.getenv("LOG_FILE", ""),
            enable_dev_auth=os.getenv("ENABLE_DEV_AUTH", "false").lower() == "true",
            firebase_web_api_key=os.getenv("FIREBASE_WEB_API_KEY", ""),
            firebase=firebase,
        )

    @property
    def gemini_key_configured(self) -> bool:
        return bool(self.gemini_api_key)
