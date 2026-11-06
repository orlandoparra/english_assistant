"use client";

import { useState, type InputHTMLAttributes } from "react";
import FormField from "@/components/auth/FormField";

type PasswordFieldProps = {
  /** Identificador único del input */
  id: string;
  /** Texto de la etiqueta (por defecto "Contraseña") */
  label?: string;
  /** Mensaje de error del campo */
  error?: string | null;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type">;

/**
 * Campo de contraseña con un control para alternar entre texto visible y oculto.
 *
 * Reutiliza `FormField` para la etiqueta y el mensaje de error, y añade un botón
 * dentro del input que cambia el `type` entre `password` y `text`. El botón es
 * accesible (`aria-pressed`, `aria-label` descriptivo) y no envía el formulario
 * (`type="button"`).
 *
 * Requirements: 1.3, 2.2
 */
export default function PasswordField({
  id,
  label = "Contraseña",
  error,
  className,
  ...inputProps
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const hasError = error != null && error.length > 0;
  const errorId = `${id}-error`;

  return (
    <FormField id={id} label={label} error={error}>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className={
            className ??
            `w-full rounded-xl border bg-white px-4 py-2.5 pr-12 text-sm text-brand-900 outline-none transition-colors placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/40 ${
              hasError
                ? "border-accent-500 focus:border-accent-500"
                : "border-slate-200 focus:border-brand-500"
            }`
          }
          {...inputProps}
        />

        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          title={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-xs font-semibold text-brand-500 transition-colors hover:text-brand-700"
        >
          {visible ? "Ocultar" : "Mostrar"}
        </button>
      </div>
    </FormField>
  );
}
