import type { EnglishLevel } from "@/lib/api";

/**
 * Opciones de Nivel_Ingles en orden ascendente (A1 -> C2) con una descripción
 * corta del Marco Común Europeo para orientar a la persona usuaria.
 *
 * Las consume `FloatingSelect` en la página de registro.
 *
 * Requirements: 1.2
 */
export const LEVEL_OPTIONS: ReadonlyArray<{ value: EnglishLevel; label: string }> = [
  { value: "A1", label: "A1 · Principiante" },
  { value: "A2", label: "A2 · Básico" },
  { value: "B1", label: "B1 · Intermedio" },
  { value: "B2", label: "B2 · Intermedio alto" },
  { value: "C1", label: "C1 · Avanzado" },
  { value: "C2", label: "C2 · Dominio" },
];
