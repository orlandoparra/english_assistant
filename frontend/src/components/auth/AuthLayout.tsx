import type { ReactNode } from "react";
import BrandPanel from "@/components/auth/BrandPanel";

type AuthLayoutProps = {
  /** Contenido de la columna derecha (tarjeta de formulario) */
  children: ReactNode;
  /** Título opcional para el panel de marca */
  brandTitle?: string;
  /** Subtítulo opcional para el panel de marca */
  brandSubtitle?: string;
};

/**
 * Layout de dos columnas para las páginas de autenticación.
 * Izquierda: panel de marca (BrandPanel), visible desde el breakpoint lg.
 * Derecha: tarjeta de formulario (children).
 *
 * En pantallas pequeñas el panel de marca se oculta y el formulario ocupa
 * todo el ancho, centrado sobre un fondo suave (sky-soft).
 */
export default function AuthLayout({
  children,
  brandTitle,
  brandSubtitle,
}: AuthLayoutProps) {
  return (
    <main className="grid min-h-screen bg-sky-soft lg:grid-cols-[1.1fr_1fr]">
      <BrandPanel title={brandTitle} subtitle={brandSubtitle} />

      {/* Columna del formulario */}
      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-brand-900/5 sm:p-10">
          {children}
        </div>
      </section>
    </main>
  );
}
