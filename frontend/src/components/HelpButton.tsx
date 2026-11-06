import { CircleHelp } from "lucide-react";

// Botón flotante de ayuda, fijo en la esquina inferior derecha.
export default function HelpButton() {
  return (
    <button
      type="button"
      aria-label="Ayuda"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-white text-brand-500 shadow-xl ring-1 ring-slate-200 transition-transform hover:scale-105"
    >
      <CircleHelp className="h-8 w-8" />
    </button>
  );
}
