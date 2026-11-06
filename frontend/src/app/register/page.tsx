"use client";

/**
 * Pagina_Registro: página servida en `/register`.
 *
 * Client component que usa el mismo diseño que el login (`AuthShell`: tarjeta
 * compacta con panel de marca) y los campos con etiqueta flotante
 * (`FloatingField`, `FloatingSelect`): Nombre, Apellido, Correo, Contraseña y
 * Nivel de inglés, más el indicador `CompletionMeter`, el botón "Crear Cuenta" y
 * el enlace a `/login`.
 *
 * Responsabilidades (Requirements 1.x, 3.x, 5.x, 7.x):
 *  - Validar en cliente con `src/lib/validation.ts` al pulsar "Crear Cuenta". El
 *    mensaje se muestra en un globo bajo el primer campo con error y desaparece
 *    cuando el usuario escribe en él; no se valida mientras se escribe.
 *  - Actualizar el porcentaje de completado al cambiar cualquier campo (3.7).
 *  - Al enviar datos válidos, invocar `register()` del `Contexto_Auth`,
 *    deshabilitar el botón mientras la solicitud está en curso y navegar a
 *    `/dashboard` tras el éxito (5.1, 5.2, 5.3, 5.4).
 *  - Mapear errores del backend: `409` -> "Ya existe una cuenta con ese correo";
 *    `status === null` -> mensaje de conexión (7.1, 7.3).
 */

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import FloatingField from "@/components/auth/FloatingField";
import FloatingSelect from "@/components/auth/FloatingSelect";
import CompletionMeter from "@/components/auth/CompletionMeter";
import PasswordChecklist from "@/components/auth/PasswordChecklist";
import { LEVEL_OPTIONS } from "@/components/auth/LevelSelect";
import { useAuth } from "@/context/AuthContext";
import { ApiError, type EnglishLevel } from "@/lib/api";
import {
  REGISTER_REQUIRED_FIELDS,
  canSubmit,
  validateRegisterForm,
  type FieldErrors,
  type RegisterFieldName,
  type RegisterFormValues,
} from "@/lib/validation";

/** Destino tras un registro exitoso (Zona_Autenticada). */
const DASHBOARD_ROUTE = "/dashboard";

/** Mensaje mostrado cuando el correo ya está registrado (Requirement 7.1). */
const DUPLICATE_EMAIL_MESSAGE = "Ya existe una cuenta con ese correo";

/** Mensaje mostrado ante un fallo de conexión (Requirement 7.3). */
const CONNECTION_ERROR_MESSAGE =
  "No se pudo conectar con el servidor. Inténtalo de nuevo.";

/** Valores iniciales del formulario de registro. */
const INITIAL_VALUES: RegisterFormValues = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  english_level: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [values, setValues] = useState<RegisterFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FieldErrors<RegisterFieldName>>({});
  // Campo que muestra el globo de error. Se fija al pulsar "Crear Cuenta" en el
  // primer campo con error y se quita al escribir en él, sin saltar a otro campo.
  const [balloonField, setBalloonField] = useState<RegisterFieldName | null>(
    null,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /**
   * Actualiza el valor de un campo y quita su mensaje de error mientras el
   * usuario escribe. El cambio de valor actualiza el porcentaje de completado
   * automáticamente, pues `CompletionMeter` deriva su valor de `values`
   * (Requirement 3.7).
   */
  const handleChange = (field: RegisterFieldName, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setBalloonField((current) => (current === field ? null : current));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    // Validación completa en el envío (Requirements 3.1, 3.3, 3.4). Si hay algún
    // error, se impide el envío y el globo se fija en el primer campo con error
    // (en el orden del formulario).
    const nextErrors = validateRegisterForm(values);
    setErrors(nextErrors);
    if (!canSubmit(nextErrors)) {
      setBalloonField(
        REGISTER_REQUIRED_FIELDS.find((field) => nextErrors[field]) ?? null,
      );
      return;
    }

    setSubmitting(true);
    try {
      await register(
        {
          first_name: values.first_name.trim(),
          last_name: values.last_name.trim(),
          email: values.email.trim(),
          password: values.password,
          // Tras pasar la validación, el nivel es uno de los valores del enum.
          english_level: values.english_level as EnglishLevel,
        },
        // El registro usa almacenamiento de sesión por defecto (no hay checkbox
        // "Recordarme" en el registro; esa preferencia vive en la página de login).
        false,
      );
      // Navegación a la Zona_Autenticada tras el éxito (Requirement 5.3).
      router.push(DASHBOARD_ROUTE);
    } catch (error) {
      setFormError(mapRegisterError(error));
      setSubmitting(false);
    }
  };

  /** Mensaje del campo solo si le toca mostrar el globo. */
  const balloonFor = (field: RegisterFieldName) =>
    balloonField === field ? errors[field] : undefined;

  return (
    <AuthShell
      title={
        <>
          Empieza tu camino hacia la <span className="text-white">fluidez</span>.
        </>
      }
      subtitle="Crea tu cuenta y aprende inglés a tu ritmo, desde A1 hasta C2."
    >
      <div className="flex flex-col gap-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-slate-600 transition-colors hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al inicio
        </Link>

        <h1 className="text-center text-2xl font-bold text-slate-900">
          Crear cuenta
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
          <div className="grid gap-4 sm:grid-cols-2">
            <FloatingField
              label="Nombre"
              autoComplete="given-name"
              value={values.first_name}
              error={balloonFor("first_name")}
              onChange={(value) => handleChange("first_name", value)}
            />
            <FloatingField
              label="Apellido"
              autoComplete="family-name"
              value={values.last_name}
              error={balloonFor("last_name")}
              onChange={(value) => handleChange("last_name", value)}
            />
          </div>

          <FloatingField
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            value={values.email}
            error={balloonFor("email")}
            onChange={(value) => handleChange("email", value)}
          />

          <FloatingField
            label="Contraseña"
            type="password"
            autoComplete="new-password"
            value={values.password}
            error={balloonFor("password")}
            onChange={(value) => handleChange("password", value)}
          />
          <PasswordChecklist password={values.password} />

          <FloatingSelect
            label="Nivel de inglés"
            value={values.english_level}
            options={LEVEL_OPTIONS}
            error={balloonFor("english_level")}
            onChange={(value) => handleChange("english_level", value)}
          />

          <CompletionMeter values={values} />

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex w-full items-center justify-center gap-3 rounded-full bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creando Cuenta…" : "Crear Cuenta"}
            {!submitting && (
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/login"
            className="font-semibold text-slate-900 transition-colors hover:text-brand-500"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

/**
 * Traduce un error de la Capa_API al mensaje que ve la persona usuaria.
 *  - `409` -> correo duplicado (Requirement 7.1).
 *  - `status === null` -> error de conexión (Requirement 7.3).
 *  - Otros estados (p. ej. `422`) -> el mensaje `detail` que trae el `ApiError`.
 */
function mapRegisterError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return DUPLICATE_EMAIL_MESSAGE;
    }
    if (error.status === null) {
      return CONNECTION_ERROR_MESSAGE;
    }
    return error.message;
  }
  return CONNECTION_ERROR_MESSAGE;
}
