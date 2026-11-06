import type { SelectHTMLAttributes } from "react";
import type { EnglishLevel } from "@/lib/api";

/**
 * Opciones de Nivel_Ingles en orden ascendente (A1 -> C2) con una descripción
 * corta del Marco Común Europeo para orientar a la persona usuaria.
 */
export const LEVEL_OPTIONS: ReadonlyArray<{ value: EnglishLevel; label: string }> = [
  { value: "A1", label: "A1 · Principiante" },
  { value: "A2", label: "A2 · Básico" },
  { value: "B1", label: "B1 · Intermedio" },
  { value: "B2", label: "B2 · Intermedio alto" },
  { value: "C1", label: "C1 · Avanzado" },
  { value: "C2", label: "C2 · Dominio" },
];

type LevelSelectProps = {
  /** Identificador único del select */
  id: string;
  /** Indica si el campo tiene error (afecta el estilo y aria-invalid) */
  hasError?: boolean;
  /** Id del mensaje de error asociado (para aria-describedby) */
  errorId?: string;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "children">;

/**
 * Selector de Nivel_Ingles con las seis opciones A1–C2.
 *
 * Pensado para componerse dentro de `FormField` pasándolo como `children`, de
 * modo que `FormField` aporte la etiqueta y el mensaje de error. Incluye una
 * opción placeholder deshabilitada para representar el estado "sin selección".
 *
 * Requirements: 1.2
 */
export default function LevelSelect({
  id,
  hasError = false,
  errorId,
  className,
  value,
  ...selectProps
}: LevelSelectProps) {
  return (
    <select
      id={id}
      value={value ?? ""}
      aria-invalid={hasError}
      aria-describedby={hasError ? errorId : undefined}
      className={
        className ??
        `w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-brand-900 outline-none transition-colors focus:ring-2 focus:ring-brand-500/40 ${
          hasError
            ? "border-accent-500 focus:border-accent-500"
            : "border-slate-200 focus:border-brand-500"
        } ${value ? "" : "text-slate-400"}`
      }
      {...selectProps}
    >
      <option value="" disabled>
        Selecciona tu nivel
      </option>
      {LEVEL_OPTIONS.map((option) => (
        <option key={option.value} value={option.value} className="text-brand-900">
          {option.label}
        </option>
      ))}
    </select>
  );
}
