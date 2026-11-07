"""Punto de entrada de la API.

Crea la aplicación FastAPI, configura CORS (para que el frontend pueda llamarla)
y registra las rutas.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine
from app.db import migrate_password_security
from app.models import user as user_model  # noqa: F401 (registra la tabla)
from app.models import password_reset_token as reset_token_model  # noqa: F401 (registra la tabla)
from app.routers import auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Al arrancar: añade columnas nuevas a tablas existentes (migración ligera
    # idempotente) y crea las tablas que falten.
    # (Más adelante esto lo hará Alembic con migraciones.)
    migrate_password_security.migrate(engine)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="English Assistant API", version="0.1.0", lifespan=lifespan)

# CORS: permite que el frontend (localhost:3000) hable con la API (localhost:8000).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)


@app.get("/")
def root():
    """Ruta simple para comprobar que la API está viva."""
    return {"message": "English Assistant API funcionando"}
