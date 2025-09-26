# app/core/config.py
from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    # Frontend
    # ----------------------------------------
    frontend_origin: AnyHttpUrl = "http://localhost:5173"

    # FastAPI config (Server/runtime)
    # ----------------------------------------
    env: str = "development"  # reads ENV
    port: int = 8000  # reads PORT

    # Database URL (same values as db/.env)
    # ----------------------------------------
    database_url: str = (
        "postgresql+psycopg://earthframe:earthframe@localhost:5432/earthframe"
    )


settings = Settings()
