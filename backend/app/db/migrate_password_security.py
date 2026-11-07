"""Script de migración idempotente y transaccional de la Marca_Invalidacion.

Añade la columna ``tokens_valid_after`` a la tabla ``users`` existente. El
proyecto usa SQLite con SQLAlchemy ORM sin Alembic: ``Base.metadata.create_all``
crea las tablas nuevas (como ``password_reset_tokens``), pero no modifica una
tabla ya creada, por lo que la columna nueva de ``users`` se añade aquí.

Garantías:

- **Idempotente**: la columna solo se añade si no existe; una segunda ejecución
  no hace nada. Si la tabla ``users`` no existe aún, no hay nada que migrar.
- **Transaccional**: el ``ALTER TABLE`` ocurre dentro de ``engine.begin()``; si
  algo falla se hace ROLLBACK y la tabla no queda en estado inconsistente.
- **Sin pérdida de filas**: la columna nace ``NULL`` (sin invalidación), que es
  el estado deseado para los usuarios existentes; no se reescribe ninguna fila.
"""
from __future__ import annotations

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

from app.db.database import engine as default_engine

TABLE_NAME = "users"
COLUMN_NAME = "tokens_valid_after"
COLUMN_DEF = "DATETIME NULL"


def _table_exists(connection, table_name: str) -> bool:
    return inspect(connection).has_table(table_name)


def _column_exists(connection, table_name: str, column_name: str) -> bool:
    inspector = inspect(connection)
    return column_name in {col["name"] for col in inspector.get_columns(table_name)}


def migrate(engine: Engine | None = None) -> bool:
    """Añade ``tokens_valid_after`` a ``users`` si falta.

    Returns:
        True si la columna se añadió en esta ejecución; False si no hubo nada
        que hacer (la tabla no existe o la columna ya estaba presente).
    """
    engine = engine or default_engine

    with engine.begin() as connection:
        if not _table_exists(connection, TABLE_NAME):
            return False
        if _column_exists(connection, TABLE_NAME, COLUMN_NAME):
            return False
        connection.execute(
            text(f"ALTER TABLE {TABLE_NAME} ADD COLUMN {COLUMN_NAME} {COLUMN_DEF}")
        )
        return True


if __name__ == "__main__":
    added = migrate()
    print(
        "Columna 'tokens_valid_after' añadida."
        if added
        else "Nada que migrar (la columna ya existe o no hay tabla 'users')."
    )
