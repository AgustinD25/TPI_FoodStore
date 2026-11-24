"""Configuración centralizada, leída de variables de entorno y del archivo .env."""
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str  # obligatoria: se lee de .env
    SECRET_KEY: str = Field(min_length=32)  # obligatoria, sin valor por defecto
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    COOKIE_SECURE: bool = False  # en producción con HTTPS debe ser True

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


# Instancia global: importar desde acá en toda la aplicación.
settings = Settings()
