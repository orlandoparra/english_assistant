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
             Tipografía Inter y color azul marino (como la imagen de referencia). */}
          <p className="w-fit font-[family-name:var(--font-inter)] text-base font-bold tracking-[0.18em] text-[#2b5c93]">
            Nuestra Misión
          </p>

          <h2 className="mt-2 font-[family-name:var(--font-inter)] text-3xl font-bold leading-tight text-slate-600 sm:text-4xl">
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
        <div className="relative order-2 overflow-hidden rounded-3xl bg-[linear-gradient(120deg,#f7f1f1_0%,#f6e4e4_60%,#efc9c9_100%)] shadow-sm md:order-first md:row-span-2">
          <div className="relative h-[22rem] w-full sm:h-[450px]">
            <Image
              src="/images/mision.png"
              alt="Estudiante de English Assistant con un libro"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-contain object-bottom"
              priority
            />
          </div>
        </div>

        {/* 3. Cuerpo: párrafos + botón (móvil: order-3) */}
        <div className="order-3 md:order-none md:self-start">
          <div className="space-y-4 text-pretty text-base leading-7 text-slate-900">
            <p>
              Somos un complemento para tu formación: un apoyo para estudiantes
              de universidades e&nbsp;institutos que quieren reforzar su inglés
              con&nbsp;un&nbsp;método práctico y personalizado, adaptado a tu
              ritmo.
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
            className="mt-8 inline-flex w-[94%] items-center justify-center gap-3 rounded-full bg-[linear-gradient(180deg,#1d6fd6_0%,#154fb0_55%,#0b3aa0_100%)] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-700/30 ring-1 ring-inset ring-white/20 transition-all hover:-translate-y-0.5 hover:shadow-xl sm:w-auto sm:justify-start"
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
