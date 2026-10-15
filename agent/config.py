import os
from urllib.parse import quote
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=dotenv_path)


class Config:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # Docker and the backend share DB_* settings; encode credentials as URL components.
    if not DATABASE_URL and os.getenv("DB_NAME"):
        db_user = quote(os.getenv("DB_USER", ""), safe="")
        db_password = quote(os.getenv("DB_PASSWORD", ""), safe="")
        db_name = quote(os.environ["DB_NAME"], safe="")
        db_host = os.getenv("DB_HOST", "localhost")
        db_port = os.getenv("DB_PORT", "5432")
        DATABASE_URL = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

    if DATABASE_URL and "sslmode" not in DATABASE_URL:
        if os.getenv("NODE_ENV") == "production":
            separator = "&" if "?" in DATABASE_URL else "?"
            DATABASE_URL += f"{separator}sslmode=require"

    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")
    FROM_EMAIL: str = os.getenv("FROM_EMAIL", "noreply@escuela.edu")

    raw_umbral = os.getenv("AUSENCIA_UMBRAL", "10")
    try:
        AUSENCIA_UMBRAL: int = int(raw_umbral)
    except ValueError:
        raise RuntimeError(f"AUSENCIA_UMBRAL debe ser un numero entero, se recibio: {raw_umbral}")

    NODE_ENV: str = os.getenv("NODE_ENV", "development")


config = Config()
