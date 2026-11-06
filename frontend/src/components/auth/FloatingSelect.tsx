"use client";

import { useId } from "react";
import { ChevronDown } from "lucide-react";
import ErrorBalloon from "@/components/auth/ErrorBalloon";

type Option = { value: string; label: string };

type FloatingSelectProps = {
  /** Etiqueta flotante del selector. */
  label: string;
  /** Valor seleccionado (cadena vacía = sin selección). */
  value: string;
  /** Opciones disponibles. */
  options: ReadonlyArray<Option>;
  /** Mensaje de error mostrado en el globo flotante. */
  error?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
};

/**
 * FloatingSelect: selector con etiqueta flotante, a juego con `FloatingField`.
 *
 * La etiqueta se eleva sobre el borde cuando hay una opción elegida o el campo
 * está enfocado. Comparte estética (borde tipo píldora, acento azul de marca,
 * fondo azul suave al seleccionar) y el mismo globo de error que los campos de
 * texto. La flecha nativa del `<select>` se oculta y se dibuja una propia.
 */
export default function FloatingSelect({
  label,
  value,
  options,
  error,
  onChange,
  onBlur,
}: FloatingSelectProps) {
  const id = useId();
  const hasError = Boolean(error);
  const floated = value.length > 0;

  return (
    <div className="relative">
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          className={`peer w-full appearance-none rounded-full border px-5 py-2.5 pr-11 text-sm transition-colors focus:outline-none focus:ring-2 ${
            value ? "text-slate-900" : "text-transparent"
          } ${
            floated && !hasError ? "bg-brand-500/5" : "bg-white"
          } ${
            hasError
              ? "border-red-400 focus:border-red-500 focus:ring-red-200"
              : "border-slate-300 focus:border-brand-500 focus:ring-brand-500/20"
          }`}
        >
          <option value="" disabled hidden>
            {/* vacío: la etiqueta flotante hace de placeholder */}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-slate-900">
              {option.label}
            </option>
          ))}
        </select>

        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-4 bg-white px-1.5 transition-all duration-150
            peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-slate-900
            ${
              floated
                ? "top-0 -translate-y-1/2 text-xs font-semibold"
                : "top-1/2 -translate-y-1/2 text-sm"
            }
            ${hasError ? "text-red-500" : floated ? "text-slate-900" : "text-slate-400"}`}
        >
          {label}
        </label>

        <ChevronDown
          className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
      </div>

      {error && <ErrorBalloon message={error} />}
    </div>
  );
}
