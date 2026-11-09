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
import HoloEduNavbar from "@/components/HoloEduNavbar";

/**
 * HeroHoloEdu: Opción C, recreación del diseño de referencia (hero oscuro
 * inmersivo). Fondo azul noche con degradados y curvas de luz, badge superior,
 * titular enorme con una palabra destacada en degradado celeste, botón
 * primario "Comenzar Ahora", una fila de 4 features con iconos y un badge
 * flotante "De A1 a C2". Usa la imagen existente y la paleta de marca.
 */

// Cada área con su color (como en la referencia) y una sombra proyectada que da
// sensación de volumen "3D".
const features = [
  { icon: Headphones, label: "Práctica de listening", color: "#38bdf8" },
  { icon: MessageCircle, label: "Confianza al hablar", color: "#3b82f6" },
  { icon: GraduationCap, label: "Gramática fácil", color: "#60a5fa" },
  { icon: Trophy, label: "Sigue tu progreso", color: "#f5b301" },
];

export default function HeroHoloEdu() {
  return (
    <section className="relative overflow-hidden bg-[#0a1a3f]">
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
      {/* Curva de luz decorativa */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-1/4 h-[480px] w-[480px] rounded-full border border-sky-400/20 blur-[2px]"
      />

      {/* Barra de navegación propia del hero oscuro */}
      <div className="relative mx-auto max-w-6xl">
        <HoloEduNavbar />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-6 pb-14 pt-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:pb-20 md:pt-8">
        {/* ---- Columna de texto ----
             `min-w-0` + la columna con minmax(0,..) evitan que la imagen de la
             derecha comprima este bloque y parta el título en más líneas. */}
        <div className="min-w-0 text-center md:text-left">
          {/* Badge superior */}
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
            <Globe className="h-4 w-4 text-sky-300" aria-hidden="true" />
            Learn English. Go Further.
          </span>

          {/* Titular */}
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-6xl">
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
          {/* Anillo de luz detrás de la persona */}
          <div
            aria-hidden="true"
            className="absolute inset-0 m-auto h-72 w-72 rounded-full bg-sky-400/20 blur-3xl sm:h-96 sm:w-96"
          />
          {/*
            IMPORTANTE: la imagen vive en la columna derecha del grid (0.9fr).
            Con `w-full` nunca superaría el ancho de esa columna, por eso antes
            "no crecía". Para agrandarla de verdad usamos un ANCHO FIJO en rem
            (`w-[34rem]`, etc.) que puede exceder la columna; el contenedor tiene
            `overflow-visible`, así la imagen desborda hacia la izquierda sin
            recortarse. Para hacerla más grande/pequeña, cambia SOLO el `w-[..]`.
          */}
          <Image
            src="/images/hero-student-nobg.png"
            alt="Estudiante sonriendo con audífonos"
            width={564}
            height={443}
            priority
            sizes="(min-width: 768px) 55vw, 100vw"
            className="relative z-10 mx-auto h-auto w-[22rem] max-w-none sm:w-[30rem] md:ml-auto md:mr-0 md:w-[38rem]"
          />

          {/* Texto manuscrito decorativo */}
          <p className="absolute right-2 top-2 hidden text-right font-serif text-sm italic leading-tight text-sky-200/80 sm:block">
            Your
            <br />
            English
            <br />
            Journey
            <br />
            Starts Here
          </p>

          {/* Badge flotante: de A1 a C2 */}
          <div className="absolute -bottom-2 right-0 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-md">
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

      {/* Ondas inferiores sutiles: curvas suaves y de poca amplitud que bajan a
          blanco, como un cierre discreto. */}
      <div aria-hidden="true" className="relative mt-6 h-16 w-full sm:h-20">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
        >
          {/* Capa 1: azul brillante muy translúcido, ondulación leve */}
          <path
            d="M0,52 C360,78 720,34 1080,52 C1260,61 1380,52 1440,50 L1440,90 L0,90 Z"
            fill="#3b82f6"
            fillOpacity="0.4"
          />
          {/* Capa 2: azul medio translúcido, ligero desfase */}
          <path
            d="M0,64 C380,44 760,80 1120,62 C1280,54 1380,64 1440,62 L1440,90 L0,90 Z"
            fill="#1d6fd6"
            fillOpacity="0.55"
          />
          {/* Capa 3: blanco (base de la siguiente sección) */}
          <path
            d="M0,74 C400,60 820,84 1160,74 C1300,70 1380,76 1440,74 L1440,90 L0,90 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    </section>
  );
}
