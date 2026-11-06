"use client";

/**
 * Contexto_Auth: capa de estado de sesión del frontend.
 *
 * El `AuthProvider` mantiene `{ user, status, sessionExpired }` y expone las
 * acciones `login`, `register` y `logout` a toda la aplicación. Encapsula la
 * política de persistencia del token (`src/lib/tokenStorage.ts`) y las llamadas
 * al Backend_Auth a través de la Capa_API (`src/lib/api.ts`).
 *
 * Responsabilidades (Requirements 5.2, 5.3, 6.2, 8.3, 8.4, 8.5, 8.6, 8.7):
 *  - Al montar, rehidrata la sesión leyendo el token (`readToken()`) y, si
 *    existe, recupera al usuario con `getMe()`. Si `getMe()` falla con `401`
 *    (token caducado o inválido) limpia ambos almacenamientos, deja el estado
 *    en `unauthenticated` y activa `sessionExpired`.
 *  - `login(input, remember)` obtiene el token, lo persiste según `remember`
 *    (localStorage si `remember`, sessionStorage si no) y rehidrata al usuario.
 *  - `register(input, remember)` crea la cuenta y, acto seguido, inicia sesión
 *    automáticamente con las mismas credenciales.
 *  - `logout()` limpia el token de ambos almacenamientos y restablece el estado.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ApiError,
  getMe,
  login as apiLogin,
  register as apiRegister,
  type LoginInput,
  type RegisterInput,
  type UserOut,
} from "@/lib/api";
import { clearToken, readToken, saveToken } from "@/lib/tokenStorage";

/** Estados posibles del Contexto_Auth. */
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

/** Valor expuesto por el Contexto_Auth. */
export interface AuthContextValue {
  /** Usuario autenticado actual, o `null` si no hay sesión. */
  user: UserOut | null;
  /** Estado de la sesión: cargando, autenticado o no autenticado. */
  status: AuthStatus;
  /** Indica que la sesión expiró (token caducado/inválido en `getMe()`). */
  sessionExpired: boolean;
  /** Inicia sesión y persiste el token según la preferencia "Recordarme". */
  login: (input: LoginInput, remember: boolean) => Promise<void>;
  /** Crea una cuenta e inicia sesión automáticamente con esas credenciales. */
  register: (input: RegisterInput, remember: boolean) => Promise<void>;
  /** Cierra sesión: limpia el token y restablece el estado. */
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null);
  // Arrancamos en `loading` tanto en SSR como en el cliente para que el primer
  // render sea idéntico y no haya desajuste de hidratación. La resolución a
  // `authenticated`/`unauthenticated` ocurre de forma asíncrona en el efecto,
  // una vez que el navegador puede leer el token persistido.
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [sessionExpired, setSessionExpired] = useState(false);

  // Evita rehidratar más de una vez (p. ej. con React StrictMode en desarrollo).
  const didHydrate = useRef(false);

  /**
   * Limpia por completo el estado de sesión y los almacenamientos.
   * `expired` indica si la causa fue una sesión expirada (token 401).
   */
  const resetSession = useCallback((expired: boolean) => {
    clearToken();
    setUser(null);
    setStatus("unauthenticated");
    setSessionExpired(expired);
  }, []);

  /**
   * Recupera al usuario a partir de un token ya persistido.
   * Ante `401` (caducado/inválido) limpia la sesión y marca `sessionExpired`.
   * Devuelve `true` si la sesión queda autenticada.
   */
  const hydrateUser = useCallback(
    async (token: string): Promise<boolean> => {
      try {
        const profile = await getMe(token);
        setUser(profile);
        setStatus("authenticated");
        setSessionExpired(false);
        return true;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          resetSession(true);
        } else {
          // Otros errores (red, 5xx): no hay sesión utilizable, pero no es una
          // expiración de token, así que no mostramos el aviso de "sesión expirada".
          resetSession(false);
        }
        return false;
      }
    },
    [resetSession],
  );

  // Rehidratación al arrancar (Requirement 8.3, 8.4).
  useEffect(() => {
    if (didHydrate.current) {
      return;
    }
    didHydrate.current = true;

    // La rehidratación lee `localStorage`/`sessionStorage` (solo disponibles en
    // el navegador) y, en su caso, llama a `getMe()`. Se difiere a un microtask
    // para no ejecutar actualizaciones de estado síncronamente dentro del
    // cuerpo del efecto (sincronización con un sistema externo: el almacenamiento).
    queueMicrotask(() => {
      const token = readToken();
      if (!token) {
        setStatus("unauthenticated");
        return;
      }
      void hydrateUser(token);
    });
  }, [hydrateUser]);

  const login = useCallback(
    async (input: LoginInput, remember: boolean): Promise<void> => {
      // Cualquier intento de login descarta un aviso de expiración previo.
      setSessionExpired(false);
      const { access_token } = await apiLogin(input);
      // Persistir el token según "Recordarme" (Requirements 8.1, 8.2, 8.5, 8.6).
      saveToken(access_token, remember);
      await hydrateUser(access_token);
    },
    [hydrateUser],
  );

  const register = useCallback(
    async (input: RegisterInput, remember: boolean): Promise<void> => {
      // Crear la cuenta y, acto seguido, iniciar sesión automáticamente
      // con el mismo correo y contraseña (Requirements 5.2, 5.3).
      await apiRegister(input);
      await login({ email: input.email, password: input.password }, remember);
    },
    [login],
  );

  const logout = useCallback((): void => {
    // Limpia ambos almacenamientos y restablece el estado (Requirement 8.7).
    resetSession(false);
  }, [resetSession]);

  const value: AuthContextValue = {
    user,
    status,
    sessionExpired,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para consumir el Contexto_Auth. Debe usarse dentro de `AuthProvider`.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
