import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * MissionSection: sección "Misión / Bienvenida".
 *
 * Escritorio (md+): dos columnas. La imagen ocupa la columna izquierda (ambas
 * filas con `md:row-span-2`); a la derecha, el encabezado arriba y los párrafos
 * + botón abajo.
 *
 * Móvil: una sola columna apilada. El orden visual se controla con utilidades
 * `order-*` (sin duplicar contenido) para que quede:
 *   Título  ->  Imagen  ->  Párrafos  ->  Botón
 * En `md:` se restablece el orden al flujo natural del grid.
 */
export default function MissionSection() {
  return (
    <section id="nosotros" className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      <div className="grid items-center gap-x-10 gap-y-6 md:grid-cols-2 md:gap-y-8">
        {/* 1. Encabezado: antetítulo + título (móvil: order-1) */}
        <div className="order-1 md:order-none md:self-end">
          {/* Antetítulo (eyebrow): identifica la sección como la misión.
             Degradado de azul oscuro a aguamarina aplicado al texto. */}
          <p className="w-fit bg-[linear-gradient(90deg,#0a2540_0%,#1565a6_50%,#2dd4bf_100%)] bg-clip-text text-sm font-bold uppercase tracking-[0.18em] text-transparent">
            Nuestra misión
          </p>

          <h2 className="mt-2 text-3xl font-bold leading-tight text-brand-900 sm:text-4xl">
            Bienvenido a English Assistant
          </h2>
        </div>

        {/*
          2. Imagen (móvil: order-2). En escritorio ocupa la columna izquierda a
          lo alto de ambas filas (`md:row-span-2`).
          Cuadro completo: la figura queda contenida dentro del marco
          (`overflow-hidden`). El fondo replica el de la imagen de referencia:
          un degradado muy suave de blanco a rojo pálido hacia la derecha.
        */}
        <div className="relative order-2 overflow-hidden rounded-3xl bg-[linear-gradient(120deg,#ffffff_0%,#fdf4f4_60%,#f9dede_100%)] shadow-sm md:order-first md:row-span-2">
          <div className="relative h-80 w-full sm:h-[420px]">
            <Image
              src="/images/mision.png"
              alt="Estudiante de English Assistant con un libro"
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-contain object-bottom"
              priority
            />
          </div>
        </div>

        {/* 3. Cuerpo: párrafos + botón (móvil: order-3) */}
        <div className="order-3 md:order-none md:self-start">
          <div className="space-y-4 text-base leading-7 text-slate-900">
            <p>
              Somos un complemento para tu formación: un apoyo para estudiantes
              de universidades e institutos que quieren reforzar su inglés con un
              método práctico y personalizado, adaptado a tu ritmo.
            </p>
            <p>
              Diseñamos una ruta clara de A1 a C2 que integra vocabulario,
              gramática, pronunciación y comprensión, para que avances paso a
              paso y a tu propio ritmo.
            </p>
            <p>
              Porque dominar el inglés abre nuevas oportunidades académicas y
              profesionales. Ese impacto es lo que nos mueve.
            </p>
          </div>

          <Link
            href="#cursos"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-[linear-gradient(180deg,#0b3aa0_0%,#1d6fd6_55%,#3b9bff_100%)] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/30 ring-1 ring-inset ring-white/20 transition-all hover:-translate-y-0.5 hover:shadow-xl"
          >
            Conoce nuestros cursos
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
