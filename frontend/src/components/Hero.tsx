import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  Globe,
  Headphones,
  MessageCircle,
  TrendingUp,
  Trophy,
} from "lucide-react";
import Navbar from "@/components/Navbar";

/**
 * Hero: encabezado principal de la home (hero oscuro inmersivo). Fondo azul
 * noche con degradados y curvas de luz, badge superior, titular enorme con una
 * palabra destacada en degradado celeste, botón primario "Comenzar Ahora", una
 * fila de 4 features con iconos y un badge flotante "De A1 a C2". Usa la imagen
 * existente y la paleta de marca.
 */

// Cada área con su color (como en la referencia) y una sombra proyectada que da
// sensación de volumen "3D".
const features = [
  { icon: Headphones, label: "Práctica de listening", color: "#38bdf8" },
  { icon: MessageCircle, label: "Confianza al hablar", color: "#3b82f6" },
  { icon: GraduationCap, label: "Gramática fácil", color: "#60a5fa" },
  { icon: Trophy, label: "Sigue tu progreso", color: "#f5b301" },
];

export default function Hero() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 pt-6 sm:px-6 lg:px-7">
      {/* ---- Barra de navegación tipo "píldora" (sticky: se queda fija arriba
          al hacer scroll). Mismo ancho que el hero. ---- */}
      <div className="sticky top-3 z-50 overflow-hidden rounded-full border border-white/10 bg-[#0a1a3f]/95 shadow-lg shadow-brand-900/30 backdrop-blur-md">
        <div className="relative px-4">
          <Navbar />
        </div>
      </div>

      {/* ---- Hero dentro de una tarjeta con esquinas muy amplias ----
          Mismo ancho que la navbar y que el bloque de la opción A. */}
      <section className="relative mt-4 overflow-hidden rounded-[2.5rem] bg-[#0a1a3f] shadow-2xl shadow-brand-900/20">
        {/* Degradado base azul noche */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,#07122e_0%,#0b2d6b_45%,#1546a8_100%)]"
        />
        {/* Brillo celeste difuso a la derecha (donde está la persona) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_78%_40%,rgba(59,130,246,0.45),transparent_60%)]"
        />
      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-6 pb-8 pt-8 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:pb-10 md:pt-10">
        {/* ---- Columna de texto ----
             `min-w-0` + la columna con minmax(0,..) evitan que la imagen de la
             derecha comprima este bloque y parta el título en más líneas. */}
        <div className="min-w-0 text-center md:text-left">
          {/* Badge superior: borde con DEGRADADO (aguamarina -> azul oscuro).
              Se logra con un contenedor degradado + padding de 1px que actúa
              como borde, y el contenido dentro sobre fondo oscuro. */}
          <span className="inline-block rounded-full bg-[linear-gradient(120deg,#2dd4bf_0%,#1d6fd6_50%,#0b2d6b_100%)] p-px">
            <span className="relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[#0a1a3f] px-4 py-2 text-sm font-semibold text-white">
              {/* Brillo celeste al inicio, donde está el globo (idioma / mundo). */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-sky-400/25 blur-lg"
              />
              <Globe
                className="relative h-4 w-4 text-sky-300 [filter:drop-shadow(0_0_4px_rgba(56,189,248,0.6))]"
                aria-hidden="true"
              />
              <span className="relative">Learn English. Go Further.</span>
            </span>
          </span>

          {/* Titular */}
          <h1 className="mt-6 font-[family-name:var(--font-poppins)] text-4xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Domina el Inglés,
            <br />
            <span className="inline-block bg-[linear-gradient(90deg,#7dd3fc,#38bdf8_50%,#2563eb)] bg-clip-text pr-2 italic text-transparent [-webkit-box-decoration-break:clone]">
              Abre tu{" "}
              <span className="relative inline-block">
                Mundo
                {/* Trazo de pincelada bajo "Mundo": fino en los extremos y más
                    grueso al centro, con brillo celeste. */}
                <svg
                  className="pointer-events-none absolute -bottom-4 left-0 w-full"
                  height="18"
                  viewBox="0 0 200 18"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  {/* Pincelada rellena: borde superior e inferior ligeramente
                      distintos para que el centro sea más grueso que los extremos. */}
                  <path
                    d="M3 12 C55 5, 150 4, 197 9 C150 9, 55 11, 3 12 Z"
                    fill="#38bdf8"
                    style={{ filter: "drop-shadow(0 0 6px rgba(56,189,248,0.7))" }}
                  />
                </svg>
              </span>
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-white md:mx-0">
            Aprende de forma interactiva, práctica y divertida. Mejora tu
            listening, speaking y confianza.
          </p>

          {/* Botones */}
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row md:justify-start">
            <Link
              href="/register"
              className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[linear-gradient(180deg,#ffffff_0%,#eef5ff_55%,#d7e8ff_100%)] px-7 py-3.5 text-sm font-bold text-brand-700 shadow-lg shadow-sky-900/40 ring-1 ring-inset ring-brand-700/15 transition-all hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
            >
              Comenzar Ahora
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[linear-gradient(180deg,#1d6fd6_0%,#154fb0_55%,#0b3aa0_100%)]">
                <ArrowRight className="h-4 w-4 text-white" aria-hidden="true" />
              </span>
            </Link>
          </div>

          {/* Áreas de aprendizaje dentro de un único panel translúcido, con los
              iconos a color (efecto 3D) y separadores verticales entre ellas. */}
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:p-5">
            <ul className="grid grid-cols-2 gap-y-6 sm:grid-cols-4 sm:gap-y-0">
              {features.map(({ icon: Icon, label, color }, i) => (
                <li
                  key={label}
                  className={`flex flex-col items-center gap-2 px-2 text-center sm:px-4 ${
                    i > 0 ? "sm:border-l-2 sm:border-white/20" : ""
                  }`}
                >
                  <Icon
                    className="h-8 w-8"
                    style={{
                      color,
                      strokeWidth: 2.2,
                      filter: `drop-shadow(0 3px 5px rgba(0,0,0,0.5)) drop-shadow(0 0 10px ${color}66)`,
                    }}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-medium leading-tight text-sky-100">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ---- Columna visual ----
             En escritorio se eleva con un margen negativo para que la imagen
             quede un poco más alta que el título del lado izquierdo.
             `overflow-visible` permite que la imagen crezca más allá del ancho
             de su columna del grid sin quedar recortada. */}
        <div className="relative overflow-visible md:-mt-12">
          {/*
            IMPORTANTE: la imagen vive en la columna derecha del grid (0.9fr).
            Con `w-full` nunca superaría el ancho de esa columna, por eso antes
            "no crecía". Para agrandarla de verdad usamos un ANCHO FIJO en rem
            (`w-[34rem]`, etc.) que puede exceder la columna; el contenedor tiene
            `overflow-visible`, así la imagen desborda hacia la izquierda sin
            recortarse. Para hacerla más grande/pequeña, cambia SOLO el `w-[..]`.
          */}
          {/*
            La imagen trae su propio fondo; su borde IZQUIERDO crea una línea
            que parte el hero. Para unificarla aplicamos una máscara de
            desvanecido (`mask-image`): el lado izquierdo se vuelve transparente
            de forma gradual y se funde con el fondo del hero. Se duplica con
            prefijo -webkit- para compatibilidad.
          */}
          <Image
            src="/images/hero-student.png"
            alt="Estudiante sonriendo con audífonos"
            width={1454}
            height={1082}
            priority
            sizes="(min-width: 768px) 55vw, 100vw"
            className="relative z-10 ml-auto h-auto w-[150%] max-w-none translate-x-[-3rem] sm:w-[125%] sm:translate-x-[-2rem] md:ml-auto md:mr-0 md:w-[43rem] md:translate-x-[-5rem] [mask-composite:intersect] [-webkit-mask-composite:source-in] [mask-image:linear-gradient(to_right,transparent_0%,#000_26%),linear-gradient(to_bottom,transparent_0%,#000_14%,#000_86%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,#000_26%),linear-gradient(to_bottom,transparent_0%,#000_14%,#000_86%,transparent_100%)]"
          />

          {/* Texto manuscrito decorativo (fuente Caveat, inclinado en diagonal
              como en la referencia). */}
          <div className="absolute right-[-0.25rem] top-[22%] z-20 block rotate-[-8deg] sm:right-6 sm:top-[18%] md:right-[-3rem] md:top-1/4">
            <p className="text-right font-[family-name:var(--font-caveat)] text-lg font-semibold leading-[0.9] text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)] sm:text-xl lg:text-2xl">
              Your
              <br />
              English
              <br />
              Journey
              <br />
              Starts Here
            </p>
            {/* Subrayado curvo a mano alzada bajo "Starts Here". En móvil es
                corto (desde la "S"); en escritorio se alarga y se alinea a la
                derecha para abarcar "Starts Here" completo. */}
            <svg
              className="mt-1 block h-3 w-16 md:ml-auto md:w-24"
              viewBox="0 0 140 20"
              fill="none"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M4 14 C40 4, 100 4, 136 10"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.3))" }}
              />
            </svg>
          </div>

          {/* Badge flotante: de A1 a C2 */}
          <div className="absolute bottom-[-1rem] right-2 z-20 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 shadow-xl backdrop-blur-md sm:bottom-6 sm:right-4 sm:px-4 sm:py-3 md:bottom-8 md:right-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/30 text-sky-200">
              <TrendingUp className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold text-white">De A1 a C2</p>
              <p className="text-xs text-sky-100/70">Todos los niveles, una plataforma</p>
            </div>
          </div>
        </div>
      </div>

      </section>
      <div className="h-6" aria-hidden="true" />
    </div>
  );
}
