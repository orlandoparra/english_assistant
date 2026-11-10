import type { ReactNode } from "react";
import Logo from "@/components/Logo";

type AuthShellProps = {
  /** Contenido de la tarjeta de formulario (panel derecho). */
  children: ReactNode;
  /** Titular del panel de marca. */
  title?: ReactNode;
  /** Texto descriptivo bajo el titular. */
  subtitle?: string;
};

/**
 * AuthShell: tarjeta compacta centrada para las páginas de autenticación.
 *
 * La tarjeta NO cubre toda la página: flota centrada vertical y horizontalmente
 * sobre un fondo claro. Dentro agrupa dos mitades:
 *  - Izquierda (oculta en móvil): panel de marca con los colores del Hero de la
 *    opción C (azul noche inmersivo), logo, titular de marca y pie.
 *  - Derecha: la tarjeta blanca del formulario (`children`).
 *
 * Los colores replican los del Hero de la opción C (`HeroHoloEdu.tsx`) para
 * mantener la coherencia visual con la página principal.
 */
export default function AuthShell({
  children,
  title = (
    <>
      Continúa tu camino hacia la <span className="text-white">fluidez</span>.
    </>
  ),
  subtitle = "Tu complemento para aprender inglés, desde A1 hasta C2. Avanza a tu ritmo, paso a paso.",
}: AuthShellProps) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-sky-soft px-4 py-10">
      <div className="grid w-full min-w-0 max-w-4xl overflow-hidden rounded-3xl shadow-2xl shadow-brand-900/20 md:grid-cols-2">
        {/* Panel de marca con los colores del Hero de la opción C (azul noche
            inmersivo). En móvil se muestra como franja SUPERIOR; en escritorio,
            como columna izquierda centrada verticalmente. */}
        <section className="relative flex flex-col overflow-hidden bg-[linear-gradient(120deg,#07122e_0%,#0b2d6b_45%,#1546a8_100%)] p-6 md:justify-center md:p-10">
          {/* Brillo celeste difuso, como el del Hero de la opción C */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.45),transparent_55%)]"
          />

          {/* Logo: en el flujo normal en móvil; absoluto arriba en escritorio. */}
          <div className="relative mb-5 md:absolute md:left-10 md:top-10 md:mb-0">
            <Logo dark />
          </div>

          <div className="relative">
            <h1 className="text-2xl font-bold leading-[1.15] text-white sm:text-3xl">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/80 md:mt-4">{subtitle}</p>
          </div>
        </section>

        {/* Panel del formulario */}
        <section className="min-w-0 bg-white p-5 sm:p-8 md:p-10">{children}</section>
      </div>
    </main>
  );
}
