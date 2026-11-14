import type { Metadata } from "next";
import { Montserrat, Caveat, Poppins, Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import HelpButton from "@/components/HelpButton";
import { AuthProvider } from "@/context/AuthContext";

// Montserrat: tipografía base del cuerpo.
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

// Caveat: tipografía manuscrita para detalles decorativos (p. ej. el texto
// "Your English Journey Starts Here" del hero).
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

// Poppins: tipografía para títulos (clase utilitaria `font-display`). En
// evaluación para comparar con Montserrat.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

// Inter: sans-serif humanista para títulos de sección (p. ej. el de la Misión).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "English Assistant | Aprende inglés a tu ritmo",
  description:
    "Plataforma para aprender inglés con lecciones interactivas, práctica diaria y seguimiento de tu progreso.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${montserrat.variable} ${caveat.variable} ${poppins.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/*
          AuthProvider (client component) envuelve toda la app para compartir
          el estado de sesión con cualquier página o componente que lo consuma.
        */}
        <AuthProvider>
          {/*
            Cada página aporta su propia barra: la home usa la navbar del hero;
            el dashboard, DashboardBar; login/registro, el panel de AuthShell.
            El Footer y el botón de ayuda sí son globales.
          */}
          <main className="flex-1">{children}</main>
          <Footer />
          <HelpButton />
        </AuthProvider>
      </body>
    </html>
  );
}
