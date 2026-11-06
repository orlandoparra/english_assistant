"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import Logo from "@/components/Logo";

// Secciones del menú principal
const links = [
  { href: "#cursos", label: "Cursos" },
  { href: "#metodo", label: "Método" },
  { href: "#precios", label: "Precios" },
  { href: "#nosotros", label: "Sobre nosotros" },
];

export default function Navbar() {
  // Controla si el menú móvil está abierto o cerrado
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" aria-label="English Assistant - Inicio">
          <Logo />
        </Link>

        {/* Enlaces del centro: solo en pantallas medianas y grandes */}
        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-8 text-sm font-medium text-slate-700">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="transition-colors hover:text-brand-700">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Acciones de la derecha */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-slate-100 sm:inline-flex"
          >
            Iniciar sesión
            <ArrowRight className="h-4 w-4 text-brand-700" aria-hidden="true" />
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-900"
          >
            Empieza ahora
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>

          {/* Botón de menú: solo en móvil */}
          <button
            type="button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="text-brand-900 md:hidden"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Menú desplegable en móvil */}
      {open && (
        <nav aria-label="Principal móvil" className="border-t border-slate-200 bg-white md:hidden">
          <ul className="mx-auto max-w-6xl px-6 py-2">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-slate-100 py-3 text-sm font-medium text-slate-700"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block py-3 text-sm font-medium text-slate-700 sm:hidden"
              >
                Iniciar sesión
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
