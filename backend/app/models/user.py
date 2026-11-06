"""Modelo de usuario: representa la tabla 'users' en la base de datos."""
import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum as SAEnum, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class EnglishLevel(str, enum.Enum):
    """Nivel de inglés según el Marco Común Europeo (A1–C2)."""

    A1 = "A1"
    A2 = "A2"
    B1 = "B1"
    B2 = "B2"
    C1 = "C1"
    C2 = "C2"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    first_name: Mapped[str] = mapped_column(String(60), nullable=False)
    last_name: Mapped[str] = mapped_column(String(60), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    english_level: Mapped[EnglishLevel] = mapped_column(
        SAEnum(EnglishLevel, native_enum=False), nullable=False
    )
    # Nunca guardamos la contraseña real, solo su "hash" (versión cifrada).
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
