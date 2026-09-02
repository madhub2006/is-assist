import os
from typing import List, Union
from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "IS-Assist"
    TAGLINE: str = "AI-Powered Indian Standards & Procurement Intelligence"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "is-assist-super-secret-production-key-change-in-env-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Database
    # Defaults to PostgreSQL, with fallback to SQLite for local development
    DATABASE_URL: str = "sqlite:///./is_assist.db"

    # CORS
    BACKEND_CORS_ORIGINS: str = (
        "http://localhost:5173,http://127.0.0.1:5173,"
        "http://localhost:3000,http://127.0.0.1:3000,"
        "https://frontend-m4a02jbms-syntax-optimizers.vercel.app,"
        "https://frontend-m4a02jbms-syntax-optimizers.vercel.app/"
    )

    # File uploads
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
    MAX_UPLOAD_SIZE_BYTES: int = 25 * 1024 * 1024  # 25 MB

    # Model / Environment flags
    ENVIRONMENT: str = "development"
    IS_PHASE_1: bool = True
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = ""
    LLM_API_URL: str = "https://api.openai.com/v1/chat/completions"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
