import type { Metadata } from "next";
import { Montserrat, Caveat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
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

export const metadata: Metadata = {
  title: "English Assistant | Aprende inglés a tu ritmo",
  description:
    "Plataforma para aprender inglés con lecciones interactivas, práctica diaria y seguimiento de tu progreso.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${montserrat.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/*
          AuthProvider (client component) envuelve toda la app para compartir
          el estado de sesión con cualquier página o componente que lo consuma.
        */}
        <AuthProvider>
          {/* Navbar y Footer quedan fijos; solo cambia {children} entre páginas */}
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <HelpButton />
        </AuthProvider>
      </body>
    </html>
  );
}
