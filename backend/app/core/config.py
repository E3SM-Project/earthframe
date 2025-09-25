import os

from dotenv import load_dotenv
from pydantic import PostgresDsn

load_dotenv()  # Load .env file


class Settings:
    FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    DATABASE_URL: PostgresDsn = os.getenv(
        "DATABASE_URL", "postgresql+psycopg://user:pass@localhost:5432/earthframe"
    )


settings = Settings()
