"""Rate limiter en memoria para /auth/forgot-password.

Ventana deslizante de 15 minutos por correo, máximo 5 solicitudes. El estado
vive en el proceso; en producción debería moverse a un almacén compartido
(p. ej. Redis) para funcionar con varias instancias.
"""
from __future__ import annotations

import time
from collections import defaultdict

from pydantic import BaseModel


class RateLimitResult(BaseModel):
    allowed: bool
    retry_after_seconds: int = 0


class SlidingWindowRateLimiter:
    WINDOW_SECONDS = 900
    MAX_REQUESTS = 5

    def __init__(self) -> None:
        # correo -> lista de instantes (epoch segundos) de solicitudes recientes.
        self._hits: dict[str, list[float]] = defaultdict(list)

    def check(self, email: str, now: float | None = None) -> RateLimitResult:
        """Registra y evalúa una solicitud para `email`.

        Permite la solicitud si en los `WINDOW_SECONDS` previos hay 5 o menos; en
        caso contrario la rechaza e informa cuántos segundos faltan para que la
        más antigua salga de la ventana.
        """
        now = time.time() if now is None else now
        cutoff = now - self.WINDOW_SECONDS

        recent = [t for t in self._hits[email] if t > cutoff]

        if len(recent) >= self.MAX_REQUESTS:
            self._hits[email] = recent
            retry_after = int(recent[0] + self.WINDOW_SECONDS - now) + 1
            return RateLimitResult(allowed=False, retry_after_seconds=max(retry_after, 1))

        recent.append(now)
        self._hits[email] = recent
        return RateLimitResult(allowed=True)


# Instancia única compartida por el proceso.
_limiter = SlidingWindowRateLimiter()


def get_rate_limiter() -> SlidingWindowRateLimiter:
    """Dependencia de FastAPI que devuelve el rate limiter compartido."""
    return _limiter
