type ErrorBalloonProps = {
  /** Mensaje de error a mostrar. */
  message: string;
};

/**
 * Globo de error flotante que aparece bajo un campo de formulario.
 *
 * Se posiciona de forma absoluta respecto al contenedor `relative` del campo, así
 * no desplaza el layout. Entra con una animación suave y se anuncia a lectores de
 * pantalla con `role="alert"`. Lo comparten `FloatingField` y `FloatingSelect`.
 */
export default function ErrorBalloon({ message }: ErrorBalloonProps) {
  return (
    <div
      role="alert"
      className="animate-error-pop absolute left-6 top-full z-20 mt-2 flex w-fit max-w-[18rem] items-center gap-2 rounded-lg border border-slate-400 bg-white py-1.5 pl-1.5 pr-3 shadow-xl shadow-slate-900/25"
    >
      {/* Flechita del globo apuntando al campo */}
      <span
        aria-hidden="true"
        className="absolute -top-1.5 left-5 h-3 w-3 rotate-45 border-l border-t border-slate-400 bg-white"
      />
      <span
        aria-hidden="true"
        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-orange-500 text-xs font-bold text-white"
      >
        !
      </span>
      <span className="text-xs font-medium text-slate-800">{message}</span>
    </div>
  );
}
