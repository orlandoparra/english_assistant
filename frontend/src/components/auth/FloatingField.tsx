"use client";

import { useEffect, useId, useRef, useState } from "react";
import ErrorBalloon from "@/components/auth/ErrorBalloon";

/**
 * Ojo relleno para mostrar/ocultar la contraseña: contorno sólido con un anillo
 * blanco y la pupila. Con `crossed` se le superpone una línea diagonal.
 */
function PasswordEyeIcon({ crossed }: { crossed: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 5C6.5 5 2.5 9 1 12c1.5 3 5.5 7 11 7s9.5-4 11-7c-1.5-3-5.5-7-11-7z"
        fill="currentColor"
      />
      <circle cx="12" cy="12" r="4.6" stroke="#ffffff" strokeWidth="1.5" />
      <circle cx="12.6" cy="12.4" r="2.4" fill="currentColor" />
      {/* Brillo: punto blanco cerca del borde superior del iris */}
      <circle cx="11.2" cy="9.6" r="1.4" fill="#ffffff" />
      {crossed && (
        <>
          <path
            d="M4 4l16 16"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M4 4l16 16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

type FloatingFieldProps = {
  /** Etiqueta flotante que hace las veces de placeholder. */
  label: string;
  /** Valor controlado del campo. */
  value: string;
  /** Tipo de input. `password` activa el botón de mostrar/ocultar. */
  type?: "text" | "email" | "password";
  /** Valor de `autocomplete`. */
  autoComplete?: string;
  /** Mensaje de error mostrado en el globo flotante bajo el campo. */
  error?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
};

/**
 * FloatingField: campo de texto con etiqueta flotante (floating label).
 *
 * La etiqueta empieza dentro del campo (como un placeholder). Al enfocar o
 * cuando el campo tiene contenido, la etiqueta se eleva hasta montarse sobre el
 * borde superior del input: queda en `top-0` con un fondo blanco que "corta" la
 * línea del borde, como en el patrón clásico de Material/Outlined.
 *
 * El efecto es puro CSS mediante el truco `peer` + `placeholder-transparent`:
 * un placeholder invisible (" ") permite que `:placeholder-shown` detecte si el
 * campo está vacío, y la etiqueta reacciona a `peer-focus` y
 * `peer-not-placeholder-shown`.
 *
 * Los colores usan la paleta de marca (`brand-500`) para mantener la coherencia
 * con la página principal. Para `type="password"` incluye un botón de ojo.
 */
export default function FloatingField({
  label,
  value,
  type = "text",
  autoComplete,
  error,
  onChange,
  onBlur,
}: FloatingFieldProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [show, setShow] = useState(false);
  // `autofilled` detecta el autocompletado del navegador, que NO dispara
  // `onChange` de forma fiable. Se activa con la animación CSS `onAnimationStart`
  // (truco estándar: una keyframe se asocia al pseudo-selector `:autofill`).
  const [autofilled, setAutofilled] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && show ? "text" : type;
  const hasError = Boolean(error);

  // El navegador puede autocompletar el campo sin disparar `onChange`. El
  // autofill suele ocurrir poco después del montaje, por eso comprobamos el
  // valor real del DOM varias veces durante el primer segundo y, si difiere del
  // estado, lo propagamos con `onChange` para sincronizar `value`. Así `floated`
  // pasa a true y el fondo azul (clase controlada por React) persiste aunque el
  // usuario avance con Tab.
  useEffect(() => {
    const syncFromDom = () => {
      const el = inputRef.current;
      if (el && el.value && el.value !== value) {
        onChange(el.value);
      }
    };
    syncFromDom();
    const timers = [50, 150, 350, 700].map((ms) => setTimeout(syncFromDom, ms));
    return () => timers.forEach(clearTimeout);
    // Solo al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // La etiqueta se eleva y el fondo se tiñe si el campo tiene contenido, está
  // enfocado o fue autocompletado por el navegador.
  const floated = value.length > 0 || autofilled;

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type={inputType}
          value={value}
          autoComplete={autoComplete}
          placeholder=" "
          onChange={(event) => {
            setAutofilled(false);
            onChange(event.target.value);
          }}
          onBlur={onBlur}
          // Detecta el autofill del navegador mediante la animación CSS
          // `autofill-hook` asociada al pseudo-selector `:autofill`.
          onAnimationStart={(event) => {
            if (event.animationName === "onAutoFillStart") {
              setAutofilled(true);
              const el = inputRef.current;
              if (el && el.value && el.value !== value) {
                onChange(el.value);
              }
            }
          }}
          className={`peer w-full rounded-full border px-5 py-2.5 text-sm text-slate-900 transition-colors placeholder-transparent focus:outline-none focus:ring-2 ${
            isPassword ? "pr-11" : ""
          } ${
            // Fondo azul suave cuando el campo tiene contenido; blanco si está
            // vacío. Basarlo en `value` lo hace consistente al escribir, pegar
            // o autocompletar.
            floated && !hasError ? "bg-brand-500/5" : "bg-white"
          } ${
            hasError
              ? "border-red-400 focus:border-red-500 focus:ring-red-200"
              : "border-slate-300 focus:border-brand-500 focus:ring-brand-500/20"
          }`}
        />

        {/* Etiqueta flotante:
            - Reposo (campo vacío, sin foco): centrada dentro del campo.
            - Activa (foco o con contenido): montada sobre el borde superior
              (top-0, -translate-y-1/2) con fondo blanco y padding horizontal
              para "cortar" la línea del borde. */}
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

        {/* Botón mostrar/ocultar para contraseñas */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 transition-colors hover:text-slate-700"
          >
            <PasswordEyeIcon crossed={show} />
          </button>
        )}
      </div>

      {/* Globo de error flotante: no desplaza el layout. */}
      {error && <ErrorBalloon message={error} />}
    </div>
  );
}
