"""Endpoints de autenticación: registro, login, perfil y gestión de contraseña."""
import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.email import EmailService, get_email_service
from app.core.rate_limit import SlidingWindowRateLimiter, get_rate_limiter
from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    hash_reset_token,
    verify_password,
)
from app.db.database import get_db
from app.models.password_reset_token import PasswordResetToken
from app.models.user import User
from app.schemas.user import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    MessageResponse,
    ResetPasswordRequest,
    Token,
    UserCreate,
    UserLogin,
    UserOut,
)

router = APIRouter(prefix="/auth", tags=["auth"])

# Mensaje uniforme de la recuperación: no revela si el correo existe.
RESET_REQUEST_MESSAGE = (
    "Si el correo está registrado, te enviaremos un enlace para restablecer "
    "tu contraseña."
)

# Indica a FastAPI de dónde sacar el token en las peticiones protegidas.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: Session = Depends(get_db)):
    """Crea una cuenta nueva."""
    # ¿Ya existe un usuario con ese correo?
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una cuenta con ese correo.",
        )

    user = User(
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        english_level=data.english_level,
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Inicia sesión y devuelve un token de acceso."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos.",
        )

    token = create_access_token(subject=user.email)
    return Token(access_token=token)


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    """Dependencia que identifica al usuario a partir del token JWT."""
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = decode_access_token(token)
    if token_data is None:
        raise credentials_error

    user = db.query(User).filter(User.email == token_data.sub).first()
    if user is None:
        raise credentials_error

    # Marca_Invalidacion: un token emitido antes de que el usuario cambiara o
    # restableciera su contraseña queda invalidado (Requirements 4.10, 5.5, 5.6).
    if user.tokens_valid_after is not None and token_data.iat < user.tokens_valid_after:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="La sesión fue invalidada. Inicia sesión de nuevo.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


@router.get("/me", response_model=UserOut)
def read_me(current_user: User = Depends(get_current_user)):
    """Devuelve los datos del usuario que está autenticado."""
    return current_user


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db),
    email_service: EmailService = Depends(get_email_service),
    limiter: SlidingWindowRateLimiter = Depends(get_rate_limiter),
):
    """Solicita un enlace de recuperación. Responde siempre igual (anti-enumeración)."""
    # El rate limit se aplica antes de mirar si el correo existe, para que la
    # respuesta no delate la existencia del usuario (Requirements 7.1-7.4).
    verdict = limiter.check(data.email)
    if not verdict.allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                "Demasiadas solicitudes. Inténtalo de nuevo en "
                f"{verdict.retry_after_seconds} segundos."
            ),
            headers={"Retry-After": str(verdict.retry_after_seconds)},
        )

    user = db.query(User).filter(User.email == data.email).first()
    if user is not None:
        # Fechas naive en UTC: coherente con cómo SQLite devuelve los DateTime.
        now = datetime.utcnow()
        # Invalidar tokens anteriores no usados y no caducados (máx. 1 válido).
        (
            db.query(PasswordResetToken)
            .filter(
                PasswordResetToken.user_id == user.id,
                PasswordResetToken.used_at.is_(None),
                PasswordResetToken.expires_at > now,
            )
            .update({PasswordResetToken.used_at: now}, synchronize_session=False)
        )

        # Generar el token: se guarda solo su hash; el valor en claro va al enlace.
        raw_token = secrets.token_urlsafe(32)
        reset = PasswordResetToken(
            user_id=user.id,
            token_hash=hash_reset_token(raw_token),
            expires_at=now + timedelta(minutes=settings.RESET_TOKEN_EXPIRE_MINUTES),
        )
        db.add(reset)
        db.commit()

        link = f"{settings.FRONTEND_URL}/reset-password?token={raw_token}"
        try:
            email_service.send_reset_link(user.email, link)
        except Exception:  # noqa: BLE001 - un fallo de envío no debe delatarse
            # No se expone el fallo al solicitante (anti-enumeración).
            pass

    return MessageResponse(message=RESET_REQUEST_MESSAGE)


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Restablece la contraseña usando un Token_Restablecimiento válido."""
    now = datetime.utcnow()
    token_hash = hash_reset_token(data.token)
    record = (
        db.query(PasswordResetToken)
        .filter(PasswordResetToken.token_hash == token_hash)
        .first()
    )

    # Prioridad: validar el token antes que la fortaleza (Pydantic ya validó la
    # fortaleza, pero el token manda si es inválido/caducado/usado).
    invalid_token = HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="El enlace de recuperación no es válido o ha caducado.",
    )
    if record is None or record.used_at is not None or record.expires_at <= now:
        raise invalid_token

    user = db.query(User).filter(User.id == record.user_id).first()
    if user is None:
        raise invalid_token

    user.hashed_password = hash_password(data.new_password)
    user.tokens_valid_after = now  # invalida las sesiones anteriores
    record.used_at = now  # un solo uso
    db.commit()

    return MessageResponse(message="Tu contraseña se ha restablecido correctamente.")


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cambia la contraseña del usuario autenticado tras verificar la actual."""
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña actual no es correcta.",
        )
    if data.new_password == data.current_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña nueva debe ser distinta de la actual.",
        )

    current_user.hashed_password = hash_password(data.new_password)
    current_user.tokens_valid_after = datetime.utcnow()
    db.commit()

    return MessageResponse(message="Tu contraseña se ha cambiado correctamente.")
