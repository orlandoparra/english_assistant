"use client";

/**
 * Pagina_Registro: página servida en `/register`.
 *
 * Client component que compone el layout de autenticación (`AuthLayout` +
 * `BrandPanel`) con los campos Nombre, Apellido, Correo, Contraseña
 * (`PasswordField`), `LevelSelect`, el indicador `CompletionMeter`, el botón
 * "CREAR CUENTA" y el enlace a `/login`.
 *
 * Responsabilidades (Requirements 1.x, 3.x, 5.x, 7.x):
 *  - Validar en cliente con `src/lib/validation.ts` tanto en `blur` como en el
 *    envío, limpiando el error de un campo cuando pasa a ser válido (3.1, 3.3,
 *    3.4, 3.6).
 *  - Actualizar el porcentaje de completado al cambiar cualquier campo (3.7).
 *  - Al enviar datos válidos, invocar `register()` del `Contexto_Auth`,
 *    deshabilitar el botón mientras la solicitud está en curso y navegar a
 *    `/dashboard` tras el éxito (5.1, 5.2, 5.3, 5.4).
 *  - Mapear errores del backend: `409` -> "Ya existe una cuenta con ese correo";
 *    `status === null` -> mensaje de conexión (7.1, 7.3).
 */

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import FormField from "@/components/auth/FormField";
import PasswordField from "@/components/auth/PasswordField";
import LevelSelect from "@/components/auth/LevelSelect";
import CompletionMeter from "@/components/auth/CompletionMeter";
import { useAuth } from "@/context/AuthContext";
import { ApiError, type EnglishLevel } from "@/lib/api";
import {
  canSubmit,
  revalidateRegisterField,
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
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /**
   * Actualiza el valor de un campo y, si ese campo tenía un error, lo revalida
   * para limpiarlo en cuanto el valor pasa a ser válido (Requirement 3.6). El
   * cambio de valor actualiza el porcentaje de completado automáticamente, pues
   * `CompletionMeter` deriva su valor de `values` (Requirement 3.7).
   */
  const handleChange = (field: RegisterFieldName, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) =>
      prev[field] != null ? revalidateRegisterField(prev, field, value) : prev,
    );
  };

  /**
   * Valida el campo al perder el foco (Requirements 3.1, 3.3, 3.4). Reutiliza la
   * misma lógica de revalidación por campo.
   */
  const handleBlur = (field: RegisterFieldName) => {
    setErrors((prev) => revalidateRegisterField(prev, field, values[field]));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    // Validación completa en el envío (Requirements 3.1, 3.3, 3.4). Si hay algún
    // error, se muestran y se impide el envío de la solicitud.
    const nextErrors = validateRegisterForm(values);
    setErrors(nextErrors);
    if (!canSubmit(nextErrors)) {
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

  // Deshabilita el botón mientras la solicitud está en curso (Requirement 5.4).
  const submitDisabled = submitting;

  const completionValues = useMemo(() => values, [values]);

  return (
    <AuthLayout>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-brand-900">Crear cuenta</h1>
        <p className="mt-1 text-sm text-slate-500">
          Empieza a aprender inglés a tu ritmo con English Assistant.
        </p>
      </header>

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            id="first_name"
            label="Nombre"
            autoComplete="given-name"
            value={values.first_name}
            error={errors.first_name}
            onChange={(e) => handleChange("first_name", e.target.value)}
            onBlur={() => handleBlur("first_name")}
          />
          <FormField
            id="last_name"
            label="Apellido"
            autoComplete="family-name"
            value={values.last_name}
            error={errors.last_name}
            onChange={(e) => handleChange("last_name", e.target.value)}
            onBlur={() => handleBlur("last_name")}
          />
        </div>

        <FormField
          id="email"
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          value={values.email}
          error={errors.email}
          onChange={(e) => handleChange("email", e.target.value)}
          onBlur={() => handleBlur("email")}
        />

        <PasswordField
          id="password"
          label="Contraseña"
          autoComplete="new-password"
          value={values.password}
          error={errors.password}
          onChange={(e) => handleChange("password", e.target.value)}
          onBlur={() => handleBlur("password")}
        />

        <FormField id="english_level" label="Nivel de inglés" error={errors.english_level}>
          <LevelSelect
            id="english_level"
            value={values.english_level}
            hasError={errors.english_level != null}
            errorId="english_level-error"
            onChange={(e) => handleChange("english_level", e.target.value)}
            onBlur={() => handleBlur("english_level")}
          />
        </FormField>

        <CompletionMeter values={completionValues} />

        {formError && (
          <p
            role="alert"
            className="rounded-xl bg-accent-500/10 px-4 py-2.5 text-sm font-medium text-accent-600"
          >
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitDisabled}
          className="mt-1 w-full rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        ¿Ya tienes una cuenta?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-700 transition-colors hover:text-brand-900"
        >
          Iniciar sesión
        </Link>
      </p>
    </AuthLayout>
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
