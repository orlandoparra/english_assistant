/**
 * Funciones puras que limpian lo que escribe o pega el usuario en los formularios
 * de autenticación (caracteres invisibles, mayúsculas, espacios sobrantes).
 *
 * Son independientes de la validación: primero se limpia el valor y después se
 * valida (`src/lib/validation.ts`).
 */

import type { RegisterFieldName } from "@/lib/validation";

/** Espacios y caracteres invisibles que aparecen al copiar desde un .txt o la web. */
const WHITESPACE_AND_INVISIBLES = /[\s\u200B-\u200D\uFEFF]/g;

/** Correo: sin espacios ni caracteres invisibles, y en minúsculas. */
export function cleanEmail(value: string): string {
  return value.replace(WHITESPACE_AND_INVISIBLES, "").toLowerCase();
}

/**
 * Nombre y apellido mientras se escribe: sin saltos de línea ni tabulaciones, sin
 * espacios al inicio y con las tildes en forma compuesta (NFC), para que "é" no
 * llegue como "e" + acento suelto.
 */
export function cleanNameInput(value: string): string {
  return value
    .normalize("NFC")
    .replace(/[\r\n\t]/g, "")
    .replace(/^\s+/, "")
    // Un solo espacio entre palabras ("María  José" -> "María José"). El espacio
    // final se permite mientras se escribe y se recorta al salir del campo.
    .replace(/\s{2,}/g, " ");
}

/**
 * Contraseña nueva (registro): sin ningún espacio ni salto de línea. Los espacios
 * invisibles son una fuente típica de "no puedo entrar" y no aportan seguridad.
 */
export function cleanNewPassword(value: string): string {
  return value.replace(/\s/g, "");
}

/**
 * Formato "Título" ("nelson parra" -> "Nelson Parra"). Pone en mayúscula la letra
 * que va al inicio o tras un espacio, guion o apóstrofe ("o'brien" -> "O'Brien").
 *
 * No usa `\b`: esa marca de palabra no reconoce las letras con tilde y dejaría
 * "ángel" como "áNgel".
 */
export function toTitleCase(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /(^|[\s'-])(\p{L})/gu,
      (_match, separator: string, letter: string) =>
        separator + letter.toUpperCase(),
    );
}

/**
 * Contraseña al pegar: quita saltos de línea, tabulaciones y los espacios de los
 * extremos (típico al copiarla desde un .txt). Solo se aplica al pegar: si se
 * recortara al teclear, nadie podría escribir un espacio dentro de la contraseña.
 */
export function cleanPastedPassword(text: string): string {
  return text.replace(/[\r\n\t]/g, "").trim();
}

/** Limpia el valor de un campo del registro según su tipo. */
export function cleanRegisterInput(
  field: RegisterFieldName,
  value: string,
): string {
  switch (field) {
    case "email":
      return cleanEmail(value);
    case "first_name":
    case "last_name":
      return cleanNameInput(value);
    case "password":
      return cleanNewPassword(value);
    default:
      return value;
  }
}
