import os
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=dotenv_path)


class Config:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")
    FROM_EMAIL: str = os.getenv("FROM_EMAIL", "noreply@escuela.edu")

    AUSENCIA_UMBRAL: int = int(os.getenv("AUSENCIA_UMBRAL", "10"))

    NODE_ENV: str = os.getenv("NODE_ENV", "development")


config = Config()
