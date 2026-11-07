import Hero from "@/components/Hero";
import HeroHoloEdu from "@/components/HeroHoloEdu";
import MissionSection from "@/components/MissionSection";

export default function Home() {
  return (
    <>
      {/* ---- Comparativa temporal de encabezados ---- */}
      {/* Opción A: Hero actual */}
      <p className="mx-auto max-w-6xl px-6 pt-6 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Opción A · encabezado actual
      </p>
      <Hero />

      <div className="mx-auto my-4 max-w-6xl px-6">
        <hr className="border-slate-200" />
      </div>

      {/* Opción C: estilo HoloEdu (hero oscuro inmersivo, con su navbar) */}
      <p className="mx-auto max-w-6xl px-6 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Opción C · estilo oscuro inmersivo
      </p>
      <HeroHoloEdu />

      {/* Primera sección: Misión / Bienvenida */}
      <MissionSection />
    </>
  );
}
