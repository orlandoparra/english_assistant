import { Check } from "lucide-react";
import { passwordRequirements } from "@/lib/validation";

type PasswordChecklistProps = {
  /** Contraseña escrita hasta el momento. */
  password: string;
};

/**
 * Checklist de requisitos de la contraseña, en vivo bajo el campo.
 *
 * Cada requisito (8 caracteres, 1 número, 1 mayúscula) se pinta en verde con una
 * marca cuando se cumple y en gris mientras falta. Usa las mismas reglas que
 * `validatePassword` (vía `passwordRequirements`). Se anuncia como una lista
 * accesible: además del color, cada requisito indica su estado con una marca y
 * con texto para lectores de pantalla.
 */
export default function PasswordChecklist({ password }: PasswordChecklistProps) {
  const met = passwordRequirements(password);
  const items: ReadonlyArray<{ label: string; ok: boolean }> = [
    { label: "8 caracteres", ok: met.length },
    { label: "1 número", ok: met.number },
    { label: "1 mayúscula", ok: met.uppercase },
  ];

  return (
    <ul
      aria-label="Requisitos de la contraseña"
      className="-mt-1 flex flex-wrap gap-x-4 gap-y-1 pl-4 text-xs font-semibold"
    >
      {items.map(({ label, ok }) => (
        <li
          key={label}
          className={`flex items-center gap-1 transition-colors ${
            ok ? "text-green-600" : "text-slate-400"
          }`}
        >
          <Check
            className={`h-3.5 w-3.5 ${ok ? "opacity-100" : "opacity-40"}`}
            aria-hidden="true"
          />
          {label}
          <span className="sr-only">{ok ? " (cumplido)" : " (pendiente)"}</span>
        </li>
      ))}
    </ul>
  );
}
