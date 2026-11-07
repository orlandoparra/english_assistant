"""Esquemas Pydantic: definen la forma de los datos que entran y salen de la API.

FastAPI los usa para validar automáticamente y para la documentación Swagger.
"""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.user import EnglishLevel

# Límites de la Regla_Fortaleza (mismos que la validación del frontend).
PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 128


def validate_password_strength(value: str) -> str:
    """Valida la Regla_Fortaleza: 8–128 caracteres, >= 1 número y >= 1 mayúscula.

    Se usa en el backend como red de seguridad, ya que la validación del cliente
    puede saltarse llamando a la API directamente.
    """
    if not (PASSWORD_MIN_LENGTH <= len(value) <= PASSWORD_MAX_LENGTH):
        raise ValueError(
            f"La contraseña debe tener entre {PASSWORD_MIN_LENGTH} y "
            f"{PASSWORD_MAX_LENGTH} caracteres."
        )
    if not any(c.isdigit() for c in value):
        raise ValueError("La contraseña debe incluir al menos 1 número.")
    if not any(c.isupper() for c in value):
        raise ValueError("La contraseña debe incluir al menos 1 mayúscula.")
    return value


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


# --- Gestión de contraseña (password-management) ---------------------------


class ForgotPasswordRequest(BaseModel):
    """Solicitud de recuperación: el correo del usuario."""
    email: EmailStr

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.lower()


class ResetPasswordRequest(BaseModel):
    """Restablecimiento: el token del enlace y la contraseña nueva."""
    token: str = Field(min_length=1)
    new_password: str

    @field_validator("new_password")
    @classmethod
    def strong_password(cls, value: str) -> str:
        return validate_password_strength(value)


class ChangePasswordRequest(BaseModel):
    """Cambio autenticado: la contraseña actual y la nueva."""
    current_password: str = Field(min_length=1)
    new_password: str

    @field_validator("new_password")
    @classmethod
    def strong_password(cls, value: str) -> str:
        return validate_password_strength(value)


class MessageResponse(BaseModel):
    """Cuerpo de respuesta uniforme (p. ej. para la recuperación)."""
    message: str
