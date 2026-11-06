"use client";

import { useState, useSyncExternalStore } from "react";
import { ChevronDown, Mail, MapPin, Phone } from "lucide-react";
import Logo from "@/components/Logo";

const contactItems = [
  { icon: Phone, text: "+34 912 345 678" },
  { icon: Mail, text: "info@englishassistant.com" },
  { icon: MapPin, text: "Calle Educación 123, Madrid, España" },
];

const usefulLinks = ["Inicio", "Sobre Nosotros", "Cursos", "Niveles", "Preguntas Frecuentes"];
const legalLinks = ["Términos de Uso", "Política de Privacidad", "Política de Cookies"];

// Secciones que se vuelven acordeones en móvil
const mobileSections = [
  { id: "contacto", title: "Contacto", items: contactItems.map((c) => c.text) },
  { id: "enlaces", title: "Enlaces Útiles", items: usefulLinks },
  { id: "legal", title: "Legal", items: legalLinks },
];

export default function Footer() {
  // Controla qué acordeón está abierto en móvil (null = todos cerrados)
  const [openId, setOpenId] = useState<string | null>(null);

  // El año solo se muestra una vez montado en el cliente, para evitar el
  // desajuste de hidratación al usar new Date() directamente en el render.
  // `useSyncExternalStore` es la API de React para distinguir servidor de
  // cliente: devuelve el snapshot del servidor (false) durante el render y la
  // hidratación, y el del cliente (true) tras montar, sin llamar a setState
  // dentro de un efecto (evita renders en cascada).
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const year = mounted ? new Date().getFullYear() : null;

  return (
    <footer id="contacto" className="bg-slate-900 px-8 pt-8 text-slate-400">
      {/* ----- Versión escritorio: 4 columnas ----- */}
      <div className="mx-auto hidden max-w-5xl gap-10 pb-10 md:grid md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        {/* Columna 1: logo + descripción */}
        <div>
          <Logo dark className="mb-4" />
          <p className="mb-5 text-sm leading-relaxed">
            Transformando vidas a través de la educación de idiomas de calidad.
          </p>
        </div>

        {/* Columna 2: contacto */}
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-wide text-white">
            Contacto
          </h4>
          <ul className="flex flex-col gap-3.5 text-sm">
            {contactItems.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2.5">
                <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Columna 3: enlaces útiles */}
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-wide text-white">
            Enlaces Útiles
          </h4>
          <ul className="flex flex-col gap-2.5 text-sm">
            {usefulLinks.map((text) => (
              <li key={text}>
                <a href="#" className="transition-colors hover:text-white">
                  {text}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna 4: legal */}
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-wide text-white">Legal</h4>
          <ul className="flex flex-col gap-2.5 text-sm">
            {legalLinks.map((text) => (
              <li key={text}>
                <a href="#" className="transition-colors hover:text-white">
                  {text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ----- Versión móvil: acordeones ----- */}
      <div className="mx-auto max-w-xl pb-5 md:hidden">
        {mobileSections.map((section) => (
          <div key={section.id} className="border-b border-white/10">
            <button
              type="button"
              onClick={() => setOpenId(openId === section.id ? null : section.id)}
              aria-expanded={openId === section.id}
              className="flex w-full items-center justify-between py-4"
            >
              <span className="text-base font-bold text-white">{section.title}</span>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${
                  openId === section.id ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>
            {openId === section.id && (
              <ul className="flex flex-col gap-2 pb-4 text-sm">
                {section.items.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            )}
          </div>
        ))}

        <div className="mt-7 border-t border-white/10 pt-5">
          <Logo dark className="mb-3.5" />
          <p className="text-sm leading-relaxed">
            Transformando vidas a través de la educación de idiomas de calidad.
          </p>
        </div>
      </div>

      {/* ----- Barra de copyright ----- */}
      <div className="border-t border-white/10 py-5 text-center">
        <p className="text-xs">
          © {year ?? ""} Orlando Parra Vargas. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
