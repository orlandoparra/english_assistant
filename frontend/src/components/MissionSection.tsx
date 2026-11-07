import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * MissionSection: sección "Misión / Bienvenida".
 *
 * Dos columnas: imagen a la izquierda (dentro de una tarjeta con esquinas
 * redondeadas) y, a la derecha, el título y los párrafos de la misión con un
 * botón de acción. Inspirada en la referencia del Centro Colombo Americano.
 */
export default function MissionSection() {
  return (
    <section id="nosotros" className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      <div className="grid items-center gap-10 md:grid-cols-2">
        {/* Imagen */}
        <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#f0f7ff,#fdeeee)] shadow-sm">
          <div className="relative h-80 w-full sm:h-[420px]">
            <Image
              src="/images/mision.png"
              alt="Estudiante de English Assistant con un libro"
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-contain object-bottom"
            />
          </div>
        </div>

        {/* Texto */}
        <div>
          <h2 className="text-3xl font-bold leading-tight text-brand-900 sm:text-4xl">
            Bienvenido a English Assistant
          </h2>

          <div className="mt-6 space-y-4 text-base leading-7 text-slate-900">
            <p>
              Nuestra misión es acompañar a cada estudiante como un complemento
              en su educación y en su camino hacia la fluidez, ofreciendo un
              método práctico y personalizado que se adapta a su ritmo de vida y
              elimina la barrera del idioma.
            </p>
            <p>
              Queremos que dominar el inglés deje de ser una meta lejana: por eso
              construimos una ruta clara de A1 a C2 que integra vocabulario,
              gramática, pronunciación y comprensión, paso a paso y sin presión
              de certificación.
            </p>
            <p>
              Creemos que cada persona que aprende inglés abre nuevas
              oportunidades académicas y profesionales. Ese impacto es lo que nos
              mueve.
            </p>
          </div>

          <Link
            href="#cursos"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-600"
          >
            Conoce nuestros cursos
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
