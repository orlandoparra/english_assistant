"""Servicio_Correo: entrega del Enlace_Restablecimiento.

Se define una interfaz abstracta (`EmailService`) para que la implementación
real (SMTP, SendGrid, Resend...) se pueda conectar más adelante sin tocar los
endpoints. En desarrollo se usa `ConsoleEmailService`, que registra el enlace en
la consola del servidor en lugar de enviar un correo real.
"""
from __future__ import annotations

import logging
from typing import Protocol

logger = logging.getLogger("app.email")


class EmailService(Protocol):
    """Contrato para enviar el Enlace_Restablecimiento a un correo."""

    def send_reset_link(self, email: str, link: str) -> None: ...


class ConsoleEmailService:
    """Implementación de desarrollo: registra el enlace en consola (no envía correo)."""

    def send_reset_link(self, email: str, link: str) -> None:
        logger.info("Enlace de restablecimiento para %s: %s", email, link)
        # También por print para que sea visible aunque el logging no esté configurado.
        print(f"[DEV] Enlace de restablecimiento para {email}: {link}")


def get_email_service() -> EmailService:
    """Dependencia de FastAPI. Devuelve la implementación activa del Servicio_Correo.

    Para producción, se sustituirá por una implementación real de `EmailService`.
    """
    return ConsoleEmailService()
