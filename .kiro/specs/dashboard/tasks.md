# Implementation Plan: Dashboard

## Overview

El plan implementa la Pagina_Dashboard de "English Assistant" como una ruta protegida del App Router de Next.js 16, consumiendo el `Contexto_Auth` ya existente sin tocar el backend. Se construye de abajo hacia arriba: primero los subcomponentes de presentación reutilizables (`SummaryCard`, `DashboardBar`), luego la página que los compone y añade la protección de ruta y el saludo personalizado, y finalmente se conecta todo. Las pruebas (opcionales, marcadas con `*`) son por ejemplo con Vitest + @testing-library/react, según el diseño.

Lenguaje: **TypeScript** (frontend). Toda la funcionalidad vive en `frontend/src`.

## Tasks

- [x] 1. Implementar los subcomponentes de presentación del dashboard
  - [x] 1.1 Implementar `SummaryCard`
    - Crear `src/components/dashboard/SummaryCard.tsx` con props `{ icon, title, value, caption? }`
    - Renderizar icono (lucide), título, valor destacado y leyenda opcional, usando la paleta de marca
    - _Requirements: 4.1, 5.1_
  - [x] 1.2 Implementar `DashboardBar`
    - Crear `src/components/dashboard/DashboardBar.tsx` (client component) con prop `{ onLogout }`
    - Mostrar el `Logo` y un botón "Cerrar sesión" que invoque `onLogout`
    - _Requirements: 2.1, 2.2, 5.1_

- [x] 2. Implementar la Pagina_Dashboard con protección de ruta
  - [x] 2.1 Crear `src/app/dashboard/page.tsx` con el control de estado de sesión
    - Client component que consume `useAuth()` (`user`, `status`, `logout`) y `useRouter()`
    - `useEffect` que redirige a `/login` con `router.replace()` cuando `status === "unauthenticated"`
    - Renderizar un indicador de carga mientras `status === "loading"` o `user === null`; nunca mostrar contenido protegido fuera de `authenticated`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 2.2 Componer el contenido del panel (saludo, barra y tarjetas)
    - Renderizar `DashboardBar` con `onLogout = () => { logout(); router.replace("/"); }`
    - Mostrar un saludo con `user.first_name`
    - Componer las tarjetas de resumen: Nivel actual (`user.english_level`), Progreso (marcador `0%`) y Actividad reciente (marcador), usando `SummaryCard`
    - Grid responsive: una columna en móvil, varias en escritorio (`grid-cols-1 md:grid-cols-3`)
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2, 5.3_

- [x] 3. Verificación
  - Ejecutar el lint/build del frontend y corregir cualquier error
  - Verificar manualmente (o mediante pruebas) el flujo login → `/dashboard` y logout → `/`

- [ ]* 4. Pruebas por ejemplo de la Pagina_Dashboard
  - [ ]* 4.1 Prueba de render autenticado
    - Con `status = "authenticated"` y un `user`, verificar que se muestra el saludo con `first_name`, el nivel y las tarjetas
    - _Requirements: 1.1, 3.1, 3.2, 4.1_
  - [ ]* 4.2 Prueba de redirección sin sesión
    - Con `status = "unauthenticated"`, verificar que se invoca `router.replace("/login")` y no se muestra contenido protegido
    - _Requirements: 1.2, 1.4_
  - [ ]* 4.3 Prueba de estado de carga
    - Con `status = "loading"`, verificar que se muestra el indicador de carga
    - _Requirements: 1.3_
  - [ ]* 4.4 Prueba de cierre de sesión
    - Pulsar "Cerrar sesión" invoca `logout()` y navega a `/`
    - _Requirements: 2.2_

## Notes

- Las tareas marcadas con `*` son opcionales (pruebas) y pueden omitirse para un MVP más rápido.
- El dashboard no realiza llamadas HTTP propias: reutiliza el `user` del `Contexto_Auth`, que ya está envuelto en `layout.tsx`.
- No se modifica el backend. Las tarjetas de progreso/actividad usan marcadores de posición hasta que existan endpoints de datos reales.
- `AGENTS.md` del frontend recuerda consultar `node_modules/next/dist/docs/` antes de usar APIs del App Router de Next.js 16.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2"] },
    { "id": 3, "tasks": ["3"] },
    { "id": 4, "tasks": ["4.1", "4.2", "4.3", "4.4"] }
  ]
}
```
