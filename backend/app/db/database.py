"""Conexión a la base de datos con SQLAlchemy 2.0.

Define el "engine" (la conexión), la fábrica de sesiones y la clase Base
de la que heredan todos los modelos (tablas).
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

# SQLite necesita este argumento extra para funcionar con FastAPI (varios hilos).
# Con PostgreSQL este argumento se ignora.
connect_args = (
    {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)

# Cada petición usará una sesión creada por esta fábrica.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Clase base para todos los modelos de tablas."""
    pass


def get_db():
    """Entrega una sesión de base de datos a cada endpoint y la cierra al terminar."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
