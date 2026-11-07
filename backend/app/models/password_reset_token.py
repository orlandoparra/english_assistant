"""Modelo del Token_Restablecimiento: tabla 'password_reset_tokens'.

Guarda únicamente el hash SHA-256 del token (nunca el valor en claro). Un token
es válido si no se ha usado (`used_at IS NULL`) y no ha caducado
(`now <= expires_at`). Es de un solo uso: al consumirse se fija `used_at`.
"""
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), index=True, nullable=False
    )
    # SHA-256 en hexadecimal (64 caracteres) del Token_Restablecimiento.
    token_hash: Mapped[str] = mapped_column(
        String(64), unique=True, index=True, nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True, default=None
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
