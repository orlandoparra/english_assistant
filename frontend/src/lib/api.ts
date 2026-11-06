/**
 * Capa_API: centraliza las llamadas HTTP al Backend_Auth.
 *
 * Todas las peticiones se construyen a partir de `NEXT_PUBLIC_API_URL` y los
 * errores se normalizan en la clase `ApiError`:
 *  - Respuesta HTTP de error -> ApiError(detail, status) leyendo `detail` del cuerpo.
 *  - `fetch` lanza (sin respuesta del servidor) -> ApiError(mensaje, null).
 */

// --- Tipos de datos -------------------------------------------------------

export type EnglishLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface RegisterInput {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  english_level: EnglishLevel;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UserOut {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  english_level: EnglishLevel;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// --- Error normalizado ----------------------------------------------------

/**
 * Error que la Capa_API lanza en cualquier fallo.
 * `status` es el código HTTP devuelto por el backend, o `null` cuando `fetch`
 * lanza (error de red/conexión).
 */
export class ApiError extends Error {
  status: number | null;

  constructor(message: string, status: number | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Mensaje usado cuando no se puede establecer comunicación con el backend.
const CONNECTION_ERROR_MESSAGE =
  "No se pudo conectar con el servidor. Inténtalo de nuevo.";

// --- Helper interno -------------------------------------------------------

interface RequestOptions {
  method: "GET" | "POST";
  body?: unknown;
  token?: string;
}

/**
 * Construye la URL base a partir de `NEXT_PUBLIC_API_URL`, eliminando una
 * posible barra final para evitar dobles barras al concatenar la ruta.
 */
function baseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL ?? "";
  return url.replace(/\/+$/, "");
}

/**
 * Realiza una petición al backend y devuelve el cuerpo JSON ya parseado.
 * Normaliza todos los fallos en `ApiError`.
 */
async function request<T>(path: string, options: RequestOptions): Promise<T> {
  const headers: Record<string, string> = {};

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (options.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl()}${path}`, {
      method: options.method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    // `fetch` lanza cuando no hay respuesta del servidor (red/conexión).
    throw new ApiError(CONNECTION_ERROR_MESSAGE, null);
  }

  if (!response.ok) {
    throw new ApiError(await readErrorDetail(response), response.status);
  }

  return (await response.json()) as T;
}

/**
 * Intenta leer el campo `detail` del cuerpo de una respuesta de error.
 * Si no está disponible, devuelve un mensaje genérico con el código de estado.
 */
async function readErrorDetail(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (data && typeof data.detail === "string") {
      return data.detail;
    }
  } catch {
    // El cuerpo no es JSON válido; se usa el mensaje de respaldo.
  }
  return `Error ${response.status}`;
}

// --- Funciones públicas ---------------------------------------------------

/** POST `/auth/register` -> crea una cuenta y devuelve el usuario creado. */
export function register(input: RegisterInput): Promise<UserOut> {
  return request<UserOut>("/auth/register", { method: "POST", body: input });
}

/** POST `/auth/login` -> devuelve el token de acceso. */
export function login(input: LoginInput): Promise<TokenResponse> {
  return request<TokenResponse>("/auth/login", { method: "POST", body: input });
}

/** GET `/auth/me` con `Authorization: Bearer <token>` -> perfil del usuario. */
export function getMe(token: string): Promise<UserOut> {
  return request<UserOut>("/auth/me", { method: "GET", token });
}
