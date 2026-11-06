import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HelpButton from "@/components/HelpButton";
import { AuthProvider } from "@/context/AuthContext";

// Montserrat es la tipografía que se ve en el diseño de referencia.
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "English Assistant | Aprende inglés a tu ritmo",
  description:
    "Plataforma para aprender inglés con lecciones interactivas, práctica diaria y seguimiento de tu progreso.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${montserrat.variable} h-full antialiased`}>
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
