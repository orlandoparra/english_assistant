"use client";

/**
 * Pagina_Login: página de inicio de sesión (`/login`).
 *
 * Client component que muestra el layout de dos columnas (AuthLayout + BrandPanel)
 * con una tarjeta de formulario a la derecha: campos Correo y Contraseña, checkbox
 * "Recordarme", enlace "¿Olvidaste tu contraseña?", botón "INICIAR SESIÓN", enlace
 * "Volver al inicio" (`/`) y enlace a `/register`.
 *
 * Responsabilidades:
 *  - Validación en cliente del correo (formato/obligatoriedad) y la contraseña
 *    (obligatoriedad) en blur y en submit, limpiando el error al corregir
 *    (Requirements 2.2, 3.2, 3.5, 3.6).
 *  - Al enviar datos válidos, invocar `login()` del Contexto_Auth con el valor de
 *    "Recordarme", deshabilitar el botón mientras la solicitud está en curso y
 *    navegar a `/dashboard` tras el éxito (Requirements 6.1, 6.2, 6.3).
 *  - Mapear errores del backend: `401` -> "Correo o contraseña incorrectos";
 *    `status === null` -> mensaje de conexión (Requirements 7.2, 7.4).
 *  - Mostrar el enlace "¿Olvidaste tu contraseña?" e indicar que la funcionalidad
 *    aún no está disponible al activarlo (Requirements 10.1, 10.2).
 */

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import FloatingField from "@/components/auth/FloatingField";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  validateLoginForm,
  type FieldErrors,
  type LoginFieldName,
  type LoginFormValues,
} from "@/lib/validation";

/** Aviso mostrado al activar "¿Olvidaste tu contraseña?" (Requirement 10.2). */
const FORGOT_PASSWORD_NOTICE =
  "La recuperación de contraseña aún no está disponible.";

/** Mensaje de credenciales inválidas (Requirement 7.2). */
const INVALID_CREDENTIALS_MESSAGE = "Correo o contraseña incorrectos";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [values, setValues] = useState<LoginFormValues>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FieldErrors<LoginFieldName>>({});
  // Campo que muestra el globo de error. Se fija al pulsar "Iniciar Sesión" y se
  // quita al escribir en ese campo, sin pasar al siguiente mientras se escribe.
  const [balloonField, setBalloonField] = useState<LoginFieldName | null>(null);
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [forgotNotice, setForgotNotice] = useState<string | null>(null);

  /** Actualiza el valor de un campo y quita su mensaje de error mientras escribe. */
  const handleChange = (field: LoginFieldName, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Al escribir, el mensaje de ese campo desaparece para dejar al usuario
    // escribir tranquilo. No se valida mientras se escribe: el formato se
    // comprueba al pulsar "Iniciar Sesión", que muestra el mensaje específico
    // (por ejemplo "Falta el '@' en el correo: orlando@").
    // El globo no salta a otro campo: solo reaparece al pulsar el botón.
    setBalloonField((current) => (current === field ? null : current));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };



  /** Mapea un error del backend al mensaje mostrado al usuario. */
  const mapBackendError = (error: unknown): string => {
    if (error instanceof ApiError) {
      // 401 -> credenciales incorrectas (Requirement 7.2).
      if (error.status === 401) {
        return INVALID_CREDENTIALS_MESSAGE;
      }
      // status === null -> error de conexión (Requirement 7.4). La Capa_API ya
      // provee un mensaje de conexión adecuado en `error.message`.
      return error.message;
    }
    return INVALID_CREDENTIALS_MESSAGE;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    // Validación en cliente: bloquea el envío si hay campos inválidos/vacíos.
    const nextErrors = validateLoginForm(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      // El globo se muestra solo en el primer campo con error (correo y luego
      // contraseña), de uno en uno a medida que el usuario los va completando.
      setBalloonField(nextErrors.email ? "email" : "password");
      return;
    }

    setSubmitting(true);
    try {
      await login(
        { email: values.email, password: values.password },
        remember,
      );
      router.push("/dashboard");
    } catch (error) {
      setFormError(mapBackendError(error));
      setSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    setForgotNotice(FORGOT_PASSWORD_NOTICE);
  };

  return (
    <AuthShell>
      <div className="flex flex-col gap-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-slate-600 transition-colors hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al inicio
        </Link>

        <h1 className="text-center text-2xl font-bold text-slate-900">
          Iniciar sesión
        </h1>

        {formError && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
          >
            {formError}
          </p>
        )}

        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FloatingField
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            value={values.email}
            error={balloonField === "email" ? errors.email : undefined}
            onChange={(value) => handleChange("email", value)}
          />

          <FloatingField
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            value={values.password}
            error={balloonField === "password" ? errors.password : undefined}
            onChange={(value) => handleChange("password", value)}
          />

          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500/40"
              />
              Recordarme
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm font-semibold text-slate-900 transition-colors hover:text-brand-500"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {forgotNotice && (
            <p role="status" className="text-xs font-medium text-slate-500">
              {forgotNotice}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex w-full items-center justify-center gap-3 rounded-full bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Iniciando Sesión…" : "Iniciar Sesión"}
            {!submitting && (
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500">
          ¿No tienes una cuenta?{" "}
          <Link
            href="/register"
            className="font-semibold text-slate-900 transition-colors hover:text-brand-500"
          >
            Crear cuenta
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
