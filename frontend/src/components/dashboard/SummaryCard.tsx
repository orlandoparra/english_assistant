import type { LucideIcon } from "lucide-react";

/**
 * Tarjeta de resumen del dashboard: icono, título, valor destacado y una
 * leyenda opcional. Es un componente de presentación puro, reutilizado para
 * componer el conjunto de tarjetas del panel (nivel, progreso, actividad).
 */
export interface SummaryCardProps {
  /** Icono de lucide-react que ilustra la tarjeta. */
  icon: LucideIcon;
  /** Título corto de la tarjeta (p. ej. "Nivel actual"). */
  title: string;
  /** Valor destacado (p. ej. "B1" o "0%"). */
  value: string;
  /** Leyenda opcional bajo el valor. */
  caption?: string;
  /** Contenido opcional extra (p. ej. una barra de progreso). */
  children?: React.ReactNode;
}

export default function SummaryCard({
  icon: Icon,
  title,
  value,
  caption,
  children,
}: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-soft text-brand-700">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </h3>
      </div>
      <p className="text-3xl font-bold text-brand-900">{value}</p>
      {caption && <p className="mt-1 text-sm text-slate-500">{caption}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
