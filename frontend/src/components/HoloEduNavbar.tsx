import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  CircleHelp,
  Headphones,
  Home,
  Sun,
  User,
  Users,
} from "lucide-react";
import Logo from "@/components/Logo";

/**
 * HoloEduNavbar: barra de navegación oscura para el hero de la Opción C.
 *
 * Recrea la referencia: logo "English Assistant" a la izquierda, items con
 * icono (Home activo, Courses con flecha, Practice, Progress, Community, Help),
 * y a la derecha un botón de tema (sol), "Login" y "Get Started". Es específica
 * de este hero oscuro; la navbar global clara no se toca.
 */

const items = [
  { icon: Home, label: "Inicio", active: true },
  { icon: BookOpen, label: "Cursos", dropdown: true },
  { icon: Headphones, label: "Práctica" },
  { icon: BarChart3, label: "Progreso" },
  { icon: Users, label: "Comunidad" },
  { icon: CircleHelp, label: "Ayuda" },
];

// Efecto "3D" para los iconos de línea: relleno suave, trazo más grueso y una
// sombra proyectada (drop-shadow) que da sensación de volumen.
const icon3d =
  "h-[18px] w-[18px] [stroke-width:2.4] [filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.45))]";

export default function HoloEduNavbar() {
  return (
    <nav className="relative z-10 flex items-center justify-between gap-4 px-6 py-4">
      {/* Logo: se reutiliza el componente compartido en su variante oscura,
          para que las proporciones de "English/Assistant" sean idénticas a las
          de la navbar de la opción A. */}
      <Link href="/" aria-label="English Assistant - Inicio">
        <Logo dark />
      </Link>

      {/* Items centrales (solo en pantallas grandes) */}
      <ul className="hidden items-center gap-1 lg:flex">
        {items.map(({ icon: Icon, label, active, dropdown }) => (
          <li key={label}>
            <a
              href="#"
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-[linear-gradient(180deg,#0b3aa0_0%,#1d6fd6_55%,#3b9bff_100%)] text-white shadow-lg shadow-sky-500/40 ring-1 ring-inset ring-white/20"
                  : "text-sky-100/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon
                className={`${icon3d} ${active ? "text-white" : "text-sky-300"}`}
                aria-hidden="true"
              />
              {label}
              {dropdown && <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />}
            </a>
          </li>
        ))}
      </ul>

      {/* Acciones de la derecha */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          aria-label="Cambiar tema"
          className="hidden h-9 w-9 items-center justify-center rounded-full text-sky-100/80 transition-colors hover:bg-white/10 hover:text-white sm:flex"
        >
          <Sun className="h-5 w-5" aria-hidden="true" />
        </button>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(180deg,#0b3aa0_0%,#1d6fd6_55%,#3b9bff_100%)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/40 ring-1 ring-inset ring-white/25 transition-transform hover:-translate-y-0.5"
        >
          <User
            className="h-4 w-4"
            style={{ strokeWidth: 2.6, filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.5))" }}
            aria-hidden="true"
          />
          Login
        </Link>
      </div>
    </nav>
  );
}
