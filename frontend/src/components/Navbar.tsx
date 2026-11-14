import Link from "next/link";
import {
  CircleHelp,
  Home,
  Layers,
  Mail,
  SignalHigh,
  Sparkles,
  Sun,
  User,
} from "lucide-react";
import Logo from "@/components/Logo";

/**
 * Navbar: barra de navegación oscura de la plataforma (usada en el hero de la
 * home). Logo a la izquierda, items centrales con icono (Inicio, ¿Por qué
 * nosotros?, Niveles, 4 Elementos, Preguntas, Contacto) y a la derecha un botón
 * de tema (sol) y el botón "Login".
 */

const items = [
  { icon: Home, label: "Inicio", href: "/", active: true },
  { icon: Sparkles, label: "¿Por qué nosotros?", href: "#nosotros" },
  { icon: SignalHigh, label: "Niveles", href: "#niveles" },
  { icon: Layers, label: "4 Elementos", href: "#elementos" },
  { icon: CircleHelp, label: "Preguntas", href: "#preguntas" },
  { icon: Mail, label: "Contacto", href: "#contacto" },
];

// Efecto "3D" para los iconos de línea: relleno suave, trazo más grueso y una
// sombra proyectada (drop-shadow) que da sensación de volumen.
const icon3d =
  "h-[18px] w-[18px] [stroke-width:2.4] [filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.45))]";

export default function Navbar() {
  return (
    <nav className="relative z-10 flex items-center justify-between gap-4 px-6 py-2.5">
      {/* Logo: se reutiliza el componente compartido en su variante oscura,
          para que las proporciones de "English/Assistant" sean idénticas a las
          de la navbar de la opción A. */}
      <Link href="/" aria-label="English Assistant - Inicio">
        <Logo dark />
      </Link>

      {/* Items (alineados hacia la derecha, junto a las acciones) */}
      <ul className="ml-auto hidden items-center gap-1 lg:flex">
        {items.map(({ icon: Icon, label, href, active }) => (
          <li key={label}>
            <a
              href={href}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
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
            </a>
          </li>
        ))}
      </ul>

      {/* Acciones de la derecha */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          aria-label="Cambiar tema"
          className="hidden h-8 w-8 items-center justify-center rounded-full text-sky-100/80 transition-colors hover:bg-white/10 hover:text-white sm:flex"
        >
          <Sun className="h-5 w-5" aria-hidden="true" />
        </button>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(180deg,#0b3aa0_0%,#1d6fd6_55%,#3b9bff_100%)] px-5 py-1.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/40 ring-1 ring-inset ring-white/25 transition-transform hover:-translate-y-0.5"
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
