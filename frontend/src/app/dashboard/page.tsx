"use client";

/**
 * Pagina_Dashboard: panel principal de la Zona_Autenticada.
 *
 * Es una ruta protegida en el cliente: deriva su render del `status` del
 * Contexto_Auth.
 *  - `loading`        -> indicador de carga (cubre la rehidratación del token).
 *  - `unauthenticated`-> redirige a `/login` (nunca muestra contenido protegido).
 *  - `authenticated`  -> muestra barra, saludo y tarjetas de resumen.
 *
 * No realiza llamadas HTTP propias: reutiliza el `user` ya rehidratado por el
 * Contexto_Auth. Las tarjetas de progreso/actividad usan marcadores de posición
 * hasta que existan endpoints de datos reales.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Activity, GraduationCap, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import DashboardBar from "@/components/dashboard/DashboardBar";
import SummaryCard from "@/components/dashboard/SummaryCard";

// Marcadores de posición: se sustituirán por datos reales del backend cuando
// existan endpoints de progreso y actividad.
const PLACEHOLDER_PROGRESS = "0%";
const PLACEHOLDER_ACTIVITY = "Sin actividad";

/** Indicador de carga centrado, mostrado mientras no hay sesión resuelta. */
function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sky-soft">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <span
          className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand-500"
          aria-hidden="true"
        />
        <p className="text-sm">Cargando tu panel…</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, status, logout } = useAuth();
  const router = useRouter();

  // Protección de ruta: sin sesión -> a /login. Observa el `status` para cubrir
  // tanto el arranque como la transición loading -> unauthenticated.
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // Nunca mostramos contenido protegido fuera de `authenticated`.
  if (status !== "authenticated" || !user) {
    return <DashboardLoading />;
  }

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-sky-soft">
      <DashboardBar onLogout={handleLogout} />

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Saludo personalizado */}
        <section className="mb-8">
          <h1 className="text-2xl font-bold text-brand-900 sm:text-3xl">
            ¡Hola, {user.first_name}!
          </h1>
          <p className="mt-1 text-slate-600">
            Bienvenido de nuevo a tu panel de aprendizaje.
          </p>
        </section>

        {/* Tarjetas de resumen: una columna en móvil, tres en escritorio */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <SummaryCard
            icon={GraduationCap}
            title="Nivel actual"
            value={user.english_level}
            caption="Marco Común Europeo (MCER)"
          />

          <SummaryCard
            icon={TrendingUp}
            title="Progreso"
            value={PLACEHOLDER_PROGRESS}
            caption="Aún no has comenzado"
          >
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuenow={0}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full w-0 rounded-full bg-brand-500" />
            </div>
          </SummaryCard>

          <SummaryCard
            icon={Activity}
            title="Actividad reciente"
            value={PLACEHOLDER_ACTIVITY}
            caption="Tus próximas lecciones aparecerán aquí"
          />
        </section>
      </main>
    </div>
  );
}
