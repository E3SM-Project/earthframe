# app/core/config.py
from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    # General application configuration
    # ----------------------------------------
    env: str = "development"
    port: int = 8000

    # Frontend
    # ----------------------------------------
    frontend_origin: AnyHttpUrl = "http://localhost:5173"

    # Database configuration (must be supplied via .env)
    # --------------------------------------------------------
    database_url: str
    # Used only for tests; must include "test" in the path.
    test_database_url: str


settings = Settings()
