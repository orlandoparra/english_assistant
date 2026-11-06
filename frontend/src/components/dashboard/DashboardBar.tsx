"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import Logo from "@/components/Logo";

/**
 * Barra_Dashboard: barra superior del área autenticada.
 *
 * Muestra el logo de "English Assistant" y un botón para cerrar sesión.
 * Es independiente del `Navbar` público porque el contexto y las acciones de
 * un usuario autenticado son distintos a los de un visitante.
 */
export interface DashboardBarProps {
  /** Acción a ejecutar al pulsar "Cerrar sesión". */
  onLogout: () => void;
}

export default function DashboardBar({ onLogout }: DashboardBarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/dashboard" aria-label="English Assistant - Panel">
          <Logo />
        </Link>

        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-accent-500 hover:text-accent-500"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
