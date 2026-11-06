"""Configuración central de la aplicación.

Lee los valores desde el archivo .env usando pydantic-settings.
Así los secretos (clave JWT, URL de la base de datos) no quedan escritos en el código.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Valores por defecto; se sobrescriben con lo que haya en .env
    DATABASE_URL: str = "sqlite:///./english_assistant.db"
    SECRET_KEY: str = "clave-insegura-solo-para-desarrollo"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


# Instancia única que se importa en el resto del proyecto
settings = Settings()
