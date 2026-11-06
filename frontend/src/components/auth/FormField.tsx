import type { InputHTMLAttributes, ReactNode } from "react";

type FormFieldProps = {
  /** Identificador único del input (se enlaza con el label y el mensaje de error) */
  id: string;
  /** Texto de la etiqueta visible sobre el input */
  label: string;
  /** Mensaje de error del campo; si es `null`/`undefined` no se muestra error */
  error?: string | null;
  /**
   * Contenido personalizado del control. Si se proporciona, se renderiza en
   * lugar del `<input>` por defecto (p. ej. para `PasswordField` o `LevelSelect`).
   * El consumidor es responsable de enlazar `id`, `aria-invalid` y
   * `aria-describedby` en su propio control.
   */
  children?: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id">;

/**
 * Campo de formulario reutilizable: etiqueta + control + mensaje de error.
 *
 * Por defecto renderiza un `<input>` estándar; cuando se pasan `children`, se
 * usan como control (permitiendo componer `PasswordField` o `LevelSelect`).
 * El mensaje de error se anuncia a lectores de pantalla mediante
 * `role="alert"` y queda vinculado al control vía `aria-describedby`.
 *
 * Requirements: 1.2, 2.2
 */
export default function FormField({
  id,
  label,
  error,
  children,
  className,
  ...inputProps
}: FormFieldProps) {
  const hasError = error != null && error.length > 0;
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-brand-900">
        {label}
      </label>

      {children ?? (
        <input
          id={id}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className={
            className ??
            `w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-brand-900 outline-none transition-colors placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/40 ${
              hasError
                ? "border-accent-500 focus:border-accent-500"
                : "border-slate-200 focus:border-brand-500"
            }`
          }
          {...inputProps}
        />
      )}

      {hasError && (
        <p id={errorId} role="alert" className="text-xs font-medium text-accent-500">
          {error}
        </p>
      )}
    </div>
  );
}
