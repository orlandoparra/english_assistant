"""Script de migración idempotente y transaccional de ``full_name``.

Convierte el antiguo esquema de la tabla ``users`` (con un único campo
``full_name``) al nuevo esquema con los campos separados ``first_name``,
``last_name`` y ``english_level`` (ver design.md, requisito 9.6).

El proyecto usa SQLite con SQLAlchemy ORM y no tiene Alembic configurado, por lo
que la conversión se realiza aquí con las siguientes garantías:

- **Idempotente**: puede ejecutarse varias veces sin efectos adversos. Las
  columnas solo se añaden si no existen y las filas solo se convierten mientras
  exista la columna ``full_name`` de origen con datos.
- **Transaccional**: todos los cambios (ALTER TABLE + UPDATEs) ocurren dentro de
  una única transacción. Si algo falla a mitad, se hace ``ROLLBACK`` y la tabla
  no queda en un estado inconsistente ni se pierden filas.
- **Sin pérdida de filas**: la conversión usa la función pura ``split_full_name``
  (que siempre devuelve valores válidos de >= 2 caracteres) y asigna el nivel de
  inglés por defecto ``"A1"``, de modo que ninguna fila queda con campos
  obligatorios nulos ni es descartada.

Nota sobre SQLite: no se elimina la columna ``full_name`` en el paso de
migración. ``DROP COLUMN`` solo está disponible en versiones recientes de SQLite
y hacerlo rompería la idempotencia de la conversión. La columna antigua se deja
sin usar (el modelo ORM ya no la referencia), tal y como contempla el diseño
("Elimina (o deja de usar) la columna ``full_name``").
"""
from __future__ import annotations

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

from app.db.database import engine as default_engine
from app.db.user_name_split import split_full_name

# Nivel de inglés por defecto para las filas migradas: no existía dato previo,
# así que se asigna el nivel inicial del Marco Común Europeo (requisito 9.6).
DEFAULT_ENGLISH_LEVEL = "A1"

TABLE_NAME = "users"

# Columnas de destino y su definición SQL. ``english_level`` recibe un valor por
# defecto para que el ALTER TABLE sobre una tabla con filas no falle y para que
# las filas existentes queden con un nivel válido.
_NEW_COLUMNS: dict[str, str] = {
    "first_name": "VARCHAR(60)",
    "last_name": "VARCHAR(60)",
    "english_level": f"VARCHAR(2) DEFAULT '{DEFAULT_ENGLISH_LEVEL}'",
}


def _existing_columns(connection, table_name: str) -> set[str]:
    """Devuelve el conjunto de nombres de columnas existentes en la tabla."""
    inspector = inspect(connection)
    return {col["name"] for col in inspector.get_columns(table_name)}


def _table_exists(connection, table_name: str) -> bool:
    inspector = inspect(connection)
    return inspector.has_table(table_name)


def migrate(engine: Engine | None = None) -> int:
    """Ejecuta la migración de forma idempotente y transaccional.

    Args:
        engine: Motor de SQLAlchemy a usar. Por defecto, el motor de la app.

    Returns:
        El número de filas convertidas (cuyos ``first_name``/``last_name`` se
        poblaron a partir de ``full_name``) en esta ejecución.
    """
    engine = engine or default_engine
    converted_rows = 0

    # ``engine.begin()`` abre una única transacción: al salir del bloque hace
    # COMMIT si todo fue bien o ROLLBACK si se lanzó una excepción. Así la
    # migración es atómica (requisito 9.6 / Error Handling del diseño).
    with engine.begin() as connection:
        if not _table_exists(connection, TABLE_NAME):
            # Sin tabla no hay nada que migrar; el esquema lo crea el modelo ORM.
            return 0

        existing = _existing_columns(connection, TABLE_NAME)

        # 1) Añadir las columnas nuevas solo si no existen (idempotencia).
        for column_name, column_def in _NEW_COLUMNS.items():
            if column_name not in existing:
                connection.execute(
                    text(
                        f"ALTER TABLE {TABLE_NAME} "
                        f"ADD COLUMN {column_name} {column_def}"
                    )
                )

        existing_after = _existing_columns(connection, TABLE_NAME)
        has_full_name = "full_name" in existing_after

        # 2) Convertir cada fila cuyo nombre separado aún no esté poblado.
        #    Solo tocamos filas con ``first_name`` sin poblar, lo que hace la
        #    conversión segura de repetir (idempotente). La fuente del nombre es
        #    ``full_name`` cuando existe la columna; si no, ``split_full_name``
        #    recibe ``None`` y usa su valor de respaldo documentado, de modo que
        #    ninguna fila queda con los campos obligatorios vacíos (sin pérdida).
        select_cols = "id, full_name" if has_full_name else "id"
        rows = connection.execute(
            text(
                f"SELECT {select_cols} FROM {TABLE_NAME} "
                "WHERE first_name IS NULL OR first_name = ''"
            )
        ).fetchall()

        for row in rows:
            source_name = row.full_name if has_full_name else None
            first_name, last_name = split_full_name(source_name)
            connection.execute(
                text(
                    f"UPDATE {TABLE_NAME} SET "
                    "first_name = :first_name, "
                    "last_name = :last_name, "
                    "english_level = COALESCE(english_level, :level) "
                    "WHERE id = :id"
                ),
                {
                    "first_name": first_name,
                    "last_name": last_name,
                    "level": DEFAULT_ENGLISH_LEVEL,
                    "id": row.id,
                },
            )
            converted_rows += 1

        # 3) Red de seguridad: cualquier fila que aún tenga ``english_level``
        #    nulo (p. ej. filas sin ``full_name``) recibe el nivel por defecto,
        #    para que ningún registro quede con el campo obligatorio vacío.
        connection.execute(
            text(
                f"UPDATE {TABLE_NAME} SET english_level = :level "
                "WHERE english_level IS NULL OR english_level = ''"
            ),
            {"level": DEFAULT_ENGLISH_LEVEL},
        )

    return converted_rows


if __name__ == "__main__":
    count = migrate()
    print(f"Migración completada. Filas convertidas: {count}")
