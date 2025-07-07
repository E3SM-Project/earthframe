from dotenv import load_dotenv
import os

load_dotenv()  # Load .env file


class Settings:
    FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")


settings = Settings()
