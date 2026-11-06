"""Esquemas Pydantic: definen la forma de los datos que entran y salen de la API.

FastAPI los usa para validar automáticamente y para la documentación Swagger.
"""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.user import EnglishLevel


class UserCreate(BaseModel):
    """Datos que llegan al registrarse."""
    first_name: str = Field(min_length=2, max_length=60)
    last_name: str = Field(min_length=2, max_length=60)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    english_level: EnglishLevel

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        """Guarda el correo siempre en minúsculas (así no hay duplicados por mayúsculas)."""
        return value.lower()


class UserLogin(BaseModel):
    """Datos que llegan al iniciar sesión."""
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        """Busca el correo en minúsculas, igual que se guarda al registrarse."""
        return value.lower()


class UserOut(BaseModel):
    """Datos del usuario que la API devuelve (nunca incluye la contraseña)."""
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    english_level: EnglishLevel
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    """Respuesta al iniciar sesión: el token de acceso."""
    access_token: str
    token_type: str = "bearer"
