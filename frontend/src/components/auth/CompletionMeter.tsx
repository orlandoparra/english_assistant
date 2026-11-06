import { completionPercentage, type RegisterFormValues } from "@/lib/validation";

type CompletionMeterProps = {
  /** Valores actuales de los campos del formulario de registro */
  values: RegisterFormValues;
};

/**
 * Indicador de porcentaje completado del formulario de registro.
 *
 * Calcula el porcentaje con `completionPercentage` de `src/lib/validation.ts`
 * (campos requeridos no vacíos / total) y lo muestra como texto y como barra de
 * progreso accesible (`role="progressbar"` con `aria-valuenow`).
 *
 * Requirements: 1.4
 */
export default function CompletionMeter({ values }: CompletionMeterProps) {
  const percent = Math.round(completionPercentage(values));

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs font-medium text-brand-900">
        <span>Progreso del formulario</span>
        <span className="tabular-nums text-brand-700">{percent}%</span>
      </div>

      <div
        role="progressbar"
        aria-label="Porcentaje completado del formulario"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
      >
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#1565a6_0%,#2b86c5_100%)] transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
