import Hero from "@/components/Hero";
import MissionSection from "@/components/MissionSection";

export default function Home() {
  return (
    <>
      {/* Encabezado (hero) */}
      <Hero />

      {/* Sección: Misión / Bienvenida */}
      <MissionSection />
    </>
  );
}
