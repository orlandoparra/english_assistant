"""Funciones de seguridad: cifrado de contraseñas (Argon2) y tokens JWT."""
import hashlib
from datetime import datetime, timedelta

from jose import JWTError, jwt
from pydantic import BaseModel

from app.core.config import settings

# Contexto de hashing con Argon2, el algoritmo recomendado hoy en día.
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


class TokenData(BaseModel):
    """Datos extraídos de un Token_Acceso válido."""

    # Correo del usuario (subject del JWT).
    sub: str
    # Instante de emisión del token (claim `iat`). Permite invalidar sesiones
    # anteriores a la Marca_Invalidacion del usuario (`tokens_valid_after`).
    iat: datetime


def hash_password(password: str) -> str:
    """Convierte la contraseña en un hash seguro para guardar en la base de datos."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Comprueba si una contraseña coincide con su hash guardado."""
    return pwd_context.verify(plain_password, hashed_password)


def hash_reset_token(token: str) -> str:
    """Devuelve el hash SHA-256 (hexadecimal) de un Token_Restablecimiento.

    En la base de datos se guarda solo este hash, nunca el token en claro, para
    que una filtración de la tabla no exponga tokens utilizables.
    """
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_access_token(subject: str) -> str:
    """Crea un token JWT firmado que identifica al usuario (por su email).

    Incluye el claim `iat` (instante de emisión) para poder invalidar los tokens
    emitidos antes de que el usuario cambie o restablezca su contraseña.
    """
    # Fechas naive en UTC: `exp`/`iat` se serializan a epoch y al comparar `iat`
    # con `tokens_valid_after` (que SQLite devuelve naive) deben ser del mismo tipo.
    now = datetime.utcnow()
    expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": subject, "exp": expire, "iat": now}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> TokenData | None:
    """Lee un token y devuelve sus datos (`sub` e `iat`), o None si no es válido.

    Los tokens antiguos sin claim `iat` se tratan como emitidos en el origen del
    tiempo (epoch), de modo que solo se rechazan si el usuario tiene una
    Marca_Invalidacion posterior.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None

    subject = payload.get("sub")
    if subject is None:
        return None

    iat_claim = payload.get("iat")
    if iat_claim is None:
        issued_at = datetime.utcfromtimestamp(0)
    else:
        # python-jose entrega `iat` como entero (segundos epoch). Se usa UTC naive
        # para poder compararlo con `tokens_valid_after` (naive en la BD).
        issued_at = datetime.utcfromtimestamp(int(iat_claim))

    return TokenData(sub=subject, iat=issued_at)
