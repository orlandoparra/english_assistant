"""Función pura para dividir un ``full_name`` en nombre y apellido.

Esta lógica es el núcleo verificable de la migración de datos que convierte el
antiguo campo único ``full_name`` en los campos separados ``first_name`` y
``last_name`` (ver design.md, requisito 9.6).

Se mantiene aislada en su propio módulo para poder:
- importarla desde el script de migración (``migrate_user_names.py``), y
- someterla a pruebas basadas en propiedades sin tocar la base de datos.
"""

# Valor de respaldo documentado para filas cuyo ``full_name`` está vacío o solo
# contiene espacios. Debe tener al menos 2 caracteres para respetar la cota
# mínima de ``first_name``/``last_name`` (2..60) y así no perder la fila durante
# la migración.
FALLBACK_NAME = "Usuario"


def split_full_name(full_name: str | None) -> tuple[str, str]:
    """Divide ``full_name`` en una tupla ``(first_name, last_name)``.

    Reglas (según el diseño, requisito 9.6):

    - ``>= 2`` tokens: ``first`` es el primer token y ``last`` es la unión del
      resto separada por un espacio. Así se preservan todas las palabras
      originales en la concatenación ``first + " " + last``.
    - ``1`` token: ``first`` y ``last`` toman ese mismo token (respaldo para
      cumplir la obligatoriedad de ambos campos sin perder el dato original).
    - ``0`` tokens / cadena vacía / ``None`` / solo espacios: se usa el valor de
      respaldo documentado ``FALLBACK_NAME`` en ambos campos, garantizando que
      la fila sobreviva a la migración con valores válidos (>= 2 caracteres).

    Args:
        full_name: El nombre completo original. Puede ser ``None``.

    Returns:
        Una tupla ``(first_name, last_name)``.
    """
    tokens = full_name.split() if full_name else []

    if len(tokens) >= 2:
        return tokens[0], " ".join(tokens[1:])
    if len(tokens) == 1:
        return tokens[0], tokens[0]
    return FALLBACK_NAME, FALLBACK_NAME
