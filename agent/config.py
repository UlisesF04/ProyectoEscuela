import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # Twilio
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_WHATSAPP_FROM: str = os.getenv("TWILIO_WHATSAPP_FROM", "")

    # Alert thresholds
    AUSENCIA_UMBRAL: int = int(os.getenv("AUSENCIA_UMBRAL", "10"))

    # Environment
    NODE_ENV: str = os.getenv("NODE_ENV", "development")


config = Config()
