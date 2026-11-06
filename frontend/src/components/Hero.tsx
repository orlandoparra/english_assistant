import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 pt-6 pb-6 lg:px-7">
      {/* Tarjeta con degradado azul -> aguamarina -> rojo.
          En móvil el degradado va de arriba hacia abajo; en escritorio, de izquierda a derecha. */}
      <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(180deg,#0b2d6b_0%,#1d6fd6_50%,#ef2b2b_100%)] md:rounded-[2rem] md:bg-[linear-gradient(120deg,#0b2d6b_0%,#1d6fd6_48%,#ef2b2b_100%)]">
        {/* Brillo de luz suave en la esquina superior, para dar profundidad */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_55%)]"
        />
        <div className="relative grid items-center md:min-h-[420px] md:grid-cols-[1.4fr_1fr]">
          {/* Texto */}
          <div className="px-6 pb-10 pt-2 text-center sm:px-8 sm:pb-12 sm:pt-3 md:px-16 md:pb-16 md:pt-4 md:text-left">
            <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl md:whitespace-nowrap lg:text-5xl">
              Da el paso. Domina el inglés.
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-white sm:text-base md:mx-0">
              Tu complemento educativo para aprender inglés con un método claro,
              flexible y profesional. Avanza a tu ritmo, desde cero hasta la
              fluidez total.
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center md:mt-10 md:justify-start md:gap-8">
              <Link
                href="/register"
                className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-slate-100"
              >
                Empieza ahora
                <ArrowRight className="h-4 w-4 text-brand-700" aria-hidden="true" />
              </Link>
              <a
                href="#cursos"
                className="text-sm font-semibold text-white hover:underline"
              >
                Conoce nuestros cursos
              </a>
            </div>
          </div>

          {/* Imagen: visible en todos los tamaños.
              En móvil tiene una altura fija; en escritorio llena su columna. */}
          <div className="relative h-64 w-full sm:h-80 md:h-full md:min-h-[420px] md:translate-y-4 md:pt-40">
            <Image
              src="/images/hero-student.png"
              alt="Estudiante sonriendo con una laptop"
              fill
              priority
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-contain object-bottom"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
