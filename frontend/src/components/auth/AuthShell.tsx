import type { ReactNode } from "react";
import Logo from "@/components/Logo";

type AuthShellProps = {
  /** Contenido de la tarjeta de formulario (panel derecho). */
  children: ReactNode;
};

/**
 * AuthShell: tarjeta compacta centrada para las páginas de autenticación.
 *
 * La tarjeta NO cubre toda la página: flota centrada vertical y horizontalmente
 * sobre un fondo claro. Dentro agrupa dos mitades:
 *  - Izquierda (oculta en móvil): panel de marca con el mismo degradado del Hero
 *    de la página principal (azul profundo -> azul brillante -> rojo), logo,
 *    titular de marca y pie.
 *  - Derecha: la tarjeta blanca del formulario (`children`).
 *
 * Los colores replican los del Hero (`src/components/Hero.tsx`) para mantener la
 * coherencia visual con la página principal.
 */
export default function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-sky-soft px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl shadow-2xl shadow-brand-900/20 md:grid-cols-2">
        {/* Panel de marca con el degradado del Hero (oculto en móvil) */}
        <section className="relative hidden overflow-hidden bg-[linear-gradient(150deg,#0b2d6b_0%,#1d6fd6_55%,#ef2b2b_130%)] p-10 md:flex md:flex-col md:justify-center">
          {/* Brillo radial blanco en la esquina superior, como en el Hero */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_55%)]"
          />

          <div className="absolute left-10 top-10">
            <Logo dark />
          </div>

          <div className="relative">
            <h1 className="text-3xl font-bold leading-[1.15] text-white">
              Continúa tu camino hacia la <span className="text-white">fluidez</span>.
            </h1>
            <p className="mt-4 text-sm leading-6 text-white/80">
              Tu complemento para aprender inglés, desde A1 hasta C2. Avanza a
              tu ritmo, paso a paso.
            </p>
          </div>

        </section>

        {/* Panel del formulario */}
        <section className="bg-white p-8 sm:p-10">{children}</section>
      </div>
    </main>
  );
}
