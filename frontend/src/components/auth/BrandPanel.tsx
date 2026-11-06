import Logo from "@/components/Logo";

type BrandPanelProps = {
  /** Título principal del panel de marca */
  title?: string;
  /** Texto descriptivo bajo el título */
  subtitle?: string;
};

/**
 * Panel de marca "English Assistant" que ocupa la columna izquierda del
 * layout de autenticación. Usa el degradado de la paleta de marca definida
 * en globals.css (brand-900 -> brand-700 -> accent-500) y reutiliza el
 * componente Logo en su variante oscura (texto blanco sobre fondo oscuro).
 */
export default function BrandPanel({
  title = "Aprende inglés a tu ritmo",
  subtitle = "Un método claro, flexible y profesional para avanzar desde cero hasta la fluidez total.",
}: BrandPanelProps) {
  return (
    <aside className="relative hidden overflow-hidden bg-[linear-gradient(160deg,#0a2540_0%,#1565a6_55%,#dc2626_130%)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
      {/* Brillo suave en la esquina superior para dar profundidad */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_55%)]"
      />

      {/* Marca */}
      <div className="relative">
        <Logo dark />
      </div>

      {/* Mensaje de marca */}
      <div className="relative max-w-md">
        <h2 className="text-3xl font-semibold leading-tight">{title}</h2>
        <p className="mt-4 text-sm leading-6 text-white/85">{subtitle}</p>
      </div>

      {/* Pie del panel */}
      <p className="relative text-xs text-white/70">
        English Assistant · Tu complemento educativo
      </p>
    </aside>
  );
}
