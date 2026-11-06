type LogoProps = {
  /** true cuando va sobre un fondo oscuro (el logo se vuelve blanco) */
  dark?: boolean;
  /** clases extra opcionales para el contenedor */
  className?: string;
};

// Logo "English Assistant" dibujado en SVG (vectorial: nítido a cualquier tamaño).
export default function Logo({ dark = false, className = "" }: LogoProps) {
  const eColor = dark ? "#ffffff" : "#0f172a";
  // Azul de la marca (tomado de la imagen de referencia) para la letra A y la
  // palabra "Assistant" en la variante clara (sobre fondo blanco).
  const aColor = dark ? "rgba(255,255,255,0.85)" : "#1a4fb0";
  const txtTop = dark ? "text-white" : "text-slate-900";
  const txtBottom = dark ? "text-white/90" : "text-[#1a4fb0]";
  const divider = dark ? "bg-white/25" : "bg-black/10";

  return (
    <span className={`flex items-center ${className}`}>
      <svg
        width="44"
        height="29"
        viewBox="0 0 270 160"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="English Assistant"
      >
        <defs>
          <clipPath id="eaLogoClip">
            <rect x="0" y="0" width="270" height="112" />
          </clipPath>
        </defs>
        {/* Letra E */}
        <polygon points="0,0 128,0 109,28 0,28" fill={eColor} />
        <path
          d="M0,67 L103,67 L84,95 L28,95 L28,130 L128,130 L109,160 L0,160 Z"
          fill={eColor}
        />
        {/* Letra A */}
        <polygon points="165,0 200,0 265,160 230,160" fill={aColor} />
        <polygon
          points="165,0 200,0 118,160 83,160"
          fill={aColor}
          clipPath="url(#eaLogoClip)"
        />
      </svg>

      {/* Línea divisoria */}
      <span className={`mx-0.5 ml-1 h-7 w-px flex-shrink-0 ${divider}`} aria-hidden="true" />

      {/* Texto del logo */}
      <span className="ml-2.5 flex flex-col leading-tight">
        <span className={`text-sm font-semibold tracking-[0.2em] ${txtTop}`}>English</span>
        <span className={`text-sm font-bold tracking-wide ${txtBottom}`}>Assistant</span>
      </span>
    </span>
  );
}
