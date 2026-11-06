/**
 * Almacenamiento del Token_Acceso en el cliente.
 *
 * Centraliza la política de persistencia del token JWT según la preferencia
 * "Recordarme" (Requirements 8.1, 8.2, 8.3, 8.7):
 *  - `saveToken(token, remember)`: guarda en `localStorage` si `remember` es
 *    verdadero (y limpia `sessionStorage`), o en `sessionStorage` si es falso
 *    (y limpia `localStorage`). Nunca queda el token en el almacenamiento opuesto.
 *  - `readToken()`: lee primero de `localStorage` y, si no existe, de `sessionStorage`.
 *  - `clearToken()`: elimina el token de ambos almacenamientos.
 *
 * Todas las funciones son seguras en SSR: comprueban que `window` existe antes
 * de tocar `localStorage`/`sessionStorage`, de modo que puedan invocarse durante
 * el renderizado en servidor de Next.js sin lanzar.
 */

/** Clave bajo la que se almacena el Token_Acceso. */
export const TOKEN_KEY = "ea_access_token";

/**
 * Indica si el código se ejecuta en un entorno de navegador con acceso a
 * `window`. En SSR (Next.js) `window` no existe, por lo que las operaciones de
 * almacenamiento deben omitirse para no lanzar.
 */
function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Persiste el Token_Acceso según la preferencia "Recordarme".
 *
 * `remember = true`  -> `localStorage.setItem` y limpia `sessionStorage`.
 * `remember = false` -> `sessionStorage.setItem` y limpia `localStorage`.
 *
 * En ambos casos se elimina el token del almacenamiento opuesto para que nunca
 * quede una copia residual fuera del almacenamiento elegido.
 *
 * Validates: Requirements 8.1, 8.2
 */
export function saveToken(token: string, remember: boolean): void {
  if (!isBrowser()) {
    return;
  }
  if (remember) {
    window.localStorage.setItem(TOKEN_KEY, token);
    window.sessionStorage.removeItem(TOKEN_KEY);
  } else {
    window.sessionStorage.setItem(TOKEN_KEY, token);
    window.localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * Lee el Token_Acceso priorizando `localStorage` sobre `sessionStorage`.
 *
 * @returns el token de `localStorage` si existe; en su defecto el de
 *          `sessionStorage`; o `null` si no hay ninguno (o en SSR).
 *
 * Validates: Requirements 8.3
 */
export function readToken(): string | null {
  if (!isBrowser()) {
    return null;
  }
  return window.localStorage.getItem(TOKEN_KEY) ?? window.sessionStorage.getItem(TOKEN_KEY);
}

/**
 * Elimina el Token_Acceso tanto de `localStorage` como de `sessionStorage`.
 *
 * Validates: Requirements 8.7
 */
export function clearToken(): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
}
