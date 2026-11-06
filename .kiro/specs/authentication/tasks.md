# Implementation Plan: Authentication

## Overview

El plan implementa la autenticación de "English Assistant" en dos frentes que avanzan en paralelo: el backend FastAPI (ampliación del modelo `User`, esquemas Pydantic, endpoints y migración de `full_name`) y el frontend Next.js (capa de API, almacenamiento de token, contexto de autenticación, subcomponentes y páginas `/login` y `/register`). Cada paso se construye sobre el anterior y termina conectando componentes (páginas ↔ contexto ↔ capa de API ↔ backend), sin dejar código huérfano. Las pruebas basadas en propiedades (fast-check en frontend, Hypothesis en backend) implementan las 14 propiedades del diseño y se colocan junto al código que validan.

Lenguajes: **Python** (backend, pytest + Hypothesis) y **TypeScript** (frontend, Vitest + fast-check + @testing-library/react), según el diseño.

## Tasks

- [ ] 1. Preparar infraestructura de pruebas y configuración base
  - [ ]* 1.1 Configurar el entorno de pruebas del backend
    - Añadir `pytest` y `hypothesis` a `backend/requirements.txt`
    - Crear `backend/tests/conftest.py` con un fixture de base de datos SQLite en memoria y un `TestClient` de FastAPI que sobreescriba la dependencia `get_db`
    - _Requirements: 9.2_
  - [ ]* 1.2 Configurar el entorno de pruebas del frontend
    - Añadir `vitest`, `fast-check`, `@testing-library/react`, `@testing-library/user-event`, `jsdom` a `frontend/package.json`
    - Crear configuración de Vitest (entorno `jsdom`) y un script de test con ejecución única (`--run`)
    - _Requirements: 4.1_

- [x] 2. Ampliar el modelo de usuario y esquemas del backend
  - [x] 2.1 Definir el enum `EnglishLevel` y actualizar el modelo `User`
    - Crear `EnglishLevel(str, enum.Enum)` con A1–C2 en `app/models/user.py`
    - Reemplazar `full_name` por `first_name` (`String(60)`), `last_name` (`String(60)`) y `english_level` (`SAEnum(EnglishLevel, native_enum=False)`), todos `nullable=False`
    - _Requirements: 9.1_
  - [x] 2.2 Actualizar los esquemas Pydantic
    - En `app/schemas/user.py`, actualizar `UserCreate` con `first_name`/`last_name` (`min_length=2, max_length=60`), `email`, `password` (`min_length=8, max_length=128`) y `english_level`
    - Actualizar `UserOut` para exponer `first_name`, `last_name` y `english_level` como campos separados
    - Reutilizar el enum `EnglishLevel` del modelo
    - _Requirements: 9.1, 9.5_

- [x] 3. Actualizar los endpoints de autenticación del backend
  - [x] 3.1 Actualizar el router `auth.py` para los nuevos campos
    - En `register`, construir el `User` con `first_name`, `last_name`, `english_level`; mantener el `409` con `detail = "Ya existe una cuenta con ese correo."` y la respuesta `201 UserOut`
    - Asegurar que `GET /auth/me` devuelve el `UserOut` ampliado (sin cambios de firma)
    - _Requirements: 9.2, 9.4, 9.5_
  - [ ]* 3.2 Escribir prueba de propiedad para el round-trip de registro y lectura de perfil
    - **Property 11: Round-trip de registro y lectura de perfil**
    - **Validates: Requirements 9.1, 9.2, 9.5**
  - [ ]* 3.3 Escribir prueba de propiedad para el rechazo de registros inválidos
    - **Property 12: Rechazo de registros inválidos sin persistencia**
    - **Validates: Requirements 9.3**
  - [ ]* 3.4 Escribir prueba de propiedad para la idempotencia frente a correo duplicado
    - **Property 13: Idempotencia frente a correo duplicado**
    - **Validates: Requirements 9.4**

- [x] 4. Implementar la migración de datos `full_name` → campos separados
  - [x] 4.1 Implementar la función pura `split_full_name`
    - Crear `split_full_name(full_name) -> (first, last)` siguiendo la regla del diseño (≥2 tokens, 1 token con respaldo, 0 tokens/vacío con valor de respaldo documentado)
    - _Requirements: 9.6_
  - [x] 4.2 Implementar el script de migración idempotente y transaccional
    - Crear `backend/app/db/migrate_user_names.py` que añada las columnas si no existen, convierta cada fila usando `split_full_name`, asigne `english_level` por defecto `"A1"` y no pierda filas
    - _Requirements: 9.6_
  - [ ]* 4.3 Escribir prueba de propiedad para la preservación del nombre en la migración
    - **Property 14: La migración preserva los datos del nombre**
    - **Validates: Requirements 9.6**
  - [ ]* 4.4 Escribir prueba de integración del script de migración
    - Sembrar una BD con filas `full_name` variadas, ejecutar el script y verificar que el conteo de filas se conserva y los campos quedan poblados
    - _Requirements: 9.6_

- [x] 5. Checkpoint del backend
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implementar la capa de API y el almacenamiento de token del frontend
  - [x] 6.1 Implementar la Capa_API en `src/lib/api.ts`
    - Definir tipos (`EnglishLevel`, `RegisterInput`, `LoginInput`, `UserOut`, `TokenResponse`), la clase `ApiError` y el helper interno `request()`
    - Exportar `register()` (POST `/auth/register`), `login()` (POST `/auth/login`) y `getMe(token)` (GET `/auth/me` con `Authorization: Bearer`), construyendo la URL desde `NEXT_PUBLIC_API_URL`
    - Normalizar errores: leer `detail` en respuestas de error y usar `status = null` cuando `fetch` lanza
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 7.3, 7.4_
  - [ ]* 6.2 Escribir prueba de propiedad para la fidelidad de la petición HTTP
    - **Property 6: Fidelidad de la petición HTTP**
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5**
  - [ ]* 6.3 Escribir prueba de propiedad para la propagación del mensaje de error del backend
    - **Property 7: Propagación del mensaje de error del backend**
    - **Validates: Requirements 4.6**
  - [ ]* 6.4 Escribir prueba de las exportaciones de la Capa_API
    - Verificar que `src/lib/api.ts` exporta `register`, `login` y `getMe`
    - _Requirements: 4.1_
  - [x] 6.5 Implementar el almacenamiento del token en `src/lib/tokenStorage.ts`
    - Implementar `saveToken(token, remember)` (local vs session, limpiando el opuesto), `readToken()` (local y luego session) y `clearToken()` (ambos)
    - _Requirements: 8.1, 8.2, 8.3, 8.7_
  - [ ]* 6.6 Escribir prueba de propiedad para la política de almacenamiento del token
    - **Property 9: La política de almacenamiento del token respeta "Recordarme"**
    - **Validates: Requirements 8.1, 8.2**
  - [ ]* 6.7 Escribir prueba de propiedad para la lectura prioritaria y limpieza del token
    - **Property 10: Lectura prioritaria y limpieza completa del token**
    - **Validates: Requirements 8.3, 8.7**

- [x] 7. Implementar las utilidades de validación de formularios del frontend
  - [x] 7.1 Implementar funciones puras de validación en `src/lib/validation.ts`
    - Implementar validación de formato de correo, longitud de contraseña (8–128), campos requeridos (vacío/solo espacios) y cálculo de porcentaje completado
    - Implementar la lógica de limpieza de error al revalidar un campo corregido
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_
  - [ ]* 7.2 Escribir prueba de propiedad para la validación de formato de correo
    - **Property 1: Validación de formato de correo**
    - **Validates: Requirements 3.1, 3.2**
  - [ ]* 7.3 Escribir prueba de propiedad para la validación de longitud de contraseña
    - **Property 2: Validación de longitud de contraseña**
    - **Validates: Requirements 3.3**
  - [ ]* 7.4 Escribir prueba de propiedad para los campos requeridos vacíos
    - **Property 3: Campos requeridos vacíos bloquean el envío**
    - **Validates: Requirements 3.4, 3.5**
  - [ ]* 7.5 Escribir prueba de propiedad para la limpieza de error al corregir
    - **Property 4: Corregir un campo elimina su error**
    - **Validates: Requirements 3.6**
  - [ ]* 7.6 Escribir prueba de propiedad para el porcentaje de completado
    - **Property 5: Porcentaje de completado**
    - **Validates: Requirements 3.7**

- [x] 8. Implementar el Contexto_Auth y conectarlo al layout
  - [x] 8.1 Implementar `AuthProvider` en `src/context/AuthContext.tsx`
    - Mantener `{ user, status, sessionExpired }` y exponer `login(input, remember)`, `register(input, remember)` y `logout()`
    - Al arrancar, leer el token con `readToken()` y, si existe, llamar a `getMe()`; ante `401` limpiar almacenamientos, poner estado `unauthenticated` y activar `sessionExpired`
    - En `register`, invocar `register()` y luego `login()` automáticamente; persistir el token con `saveToken()` según `remember`
    - _Requirements: 5.2, 5.3, 6.2, 8.3, 8.4, 8.5, 8.6, 8.7_
  - [x] 8.2 Insertar `AuthProvider` en `src/app/layout.tsx`
    - Envolver `{children}` con `AuthProvider` para compartir el estado de sesión en toda la app
    - _Requirements: 8.3_
  - [ ]* 8.3 Escribir prueba de sesión expirada
    - `getMe()` con `401` limpia el token, pone estado no autenticado y activa el aviso de sesión expirada
    - _Requirements: 8.4_

- [x] 9. Implementar los subcomponentes de UI de autenticación
  - [x] 9.1 Implementar `AuthLayout` y `BrandPanel`
    - Crear `src/components/auth/AuthLayout.tsx` (layout de dos columnas) y `BrandPanel.tsx` (panel de marca con `Logo` y paleta de `globals.css`)
    - _Requirements: 1.1, 2.1_
  - [x] 9.2 Implementar `FormField`, `PasswordField`, `LevelSelect` y `CompletionMeter`
    - `FormField` (label + input + error), `PasswordField` (toggle mostrar/ocultar), `LevelSelect` (opciones A1–C2), `CompletionMeter` (porcentaje completado usando `src/lib/validation.ts`)
    - _Requirements: 1.2, 1.3, 1.4, 2.2_
  - [ ]* 9.3 Escribir prueba de render y toggle de los subcomponentes
    - Verificar que `LevelSelect` renderiza exactamente 6 opciones A1–C2 y que `PasswordField` alterna texto visible/oculto
    - _Requirements: 1.2, 1.3, 2.2_

- [x] 10. Implementar la página de registro y conectarla
  - [x] 10.1 Implementar `src/app/register/page.tsx`
    - Client component con `AuthLayout`/`BrandPanel`, campos Nombre, Apellido, Correo, Contraseña (`PasswordField`), `LevelSelect`, `CompletionMeter`, botón "CREAR CUENTA" y enlace a `/login`
    - Validar en cliente con `src/lib/validation.ts` (en blur y en submit), limpiar errores al corregir y actualizar el porcentaje al cambiar campos
    - Al enviar datos válidos, llamar a `register()` del `Contexto_Auth`, deshabilitar el botón mientras la solicitud está en curso y navegar a `/dashboard` tras el éxito
    - Mapear errores del backend: `409` → "Ya existe una cuenta con ese correo"; `status null` → mensaje de conexión
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 3.1, 3.3, 3.4, 3.6, 3.7, 5.1, 5.2, 5.3, 5.4, 7.1, 7.3_
  - [ ]* 10.2 Escribir prueba de propiedad para la invocación de la API al enviar el registro
    - **Property 8: El envío del formulario invoca la API con los datos del formulario**
    - **Validates: Requirements 5.1, 6.1**
  - [ ]* 10.3 Escribir pruebas por ejemplo del flujo y errores del registro
    - Flujo registro→login→navegación a `/dashboard`, botón deshabilitado durante la solicitud, navegación del enlace a `/login`, y mapeo de mensajes `409`/conexión
    - _Requirements: 1.5, 1.6, 5.2, 5.3, 5.4, 7.1, 7.3_

- [x] 11. Implementar la página de inicio de sesión y conectarla
  - [x] 11.1 Implementar `src/app/login/page.tsx`
    - Client component con `AuthLayout`/`BrandPanel`, campos Correo y Contraseña (`PasswordField`), checkbox "Recordarme", enlace "¿Olvidaste tu contraseña?", botón "INICIAR SESIÓN", enlace "Volver al inicio" (`/`) y enlace a `/register`
    - Validar en cliente (correo y obligatoriedad), limpiar errores al corregir; al enviar datos válidos llamar a `login()` del `Contexto_Auth` con el valor de "Recordarme", deshabilitar el botón mientras la solicitud está en curso y navegar a `/dashboard` tras el éxito
    - Mapear errores del backend: `401` → "Correo o contraseña incorrectos"; `status null` → mensaje de conexión
    - Al activar "¿Olvidaste tu contraseña?", indicar que la funcionalidad aún no está disponible
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.2, 3.5, 3.6, 6.1, 6.2, 6.3, 7.2, 7.4, 10.1, 10.2_
  - [ ]* 11.2 Escribir pruebas por ejemplo del flujo y errores del login
    - Flujo login→persistir token→navegación, botón deshabilitado durante la solicitud, navegación de los enlaces (`/`, `/register`), mapeo de mensajes `401`/conexión y aviso de "contraseña" fuera de alcance
    - _Requirements: 2.3, 2.4, 2.5, 6.2, 6.3, 7.2, 7.4, 10.1, 10.2_

- [x] 12. Checkpoint final
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Las tareas marcadas con `*` son opcionales (pruebas) y pueden omitirse para un MVP más rápido.
- Cada tarea referencia cláusulas de requisitos específicas para trazabilidad.
- Las pruebas de propiedad implementan una única propiedad del diseño y se etiquetan con el formato **Feature: authentication, Property {número}: {texto}**; mínimo 100 iteraciones.
- Los checkpoints aseguran validación incremental antes de avanzar.
- `AGENTS.md` del frontend recuerda consultar `node_modules/next/dist/docs/` antes de usar APIs del App Router de Next.js 16.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "2.1", "4.1", "6.1", "7.1", "9.1"] },
    { "id": 1, "tasks": ["2.2", "4.2", "6.2", "6.3", "6.4", "6.5", "7.2", "7.3", "7.4", "7.5", "7.6", "9.2"] },
    { "id": 2, "tasks": ["3.1", "4.3", "4.4", "6.6", "6.7", "8.1", "9.3"] },
    { "id": 3, "tasks": ["3.2", "3.3", "3.4", "8.2", "8.3", "10.1", "11.1"] },
    { "id": 4, "tasks": ["10.2", "10.3", "11.2"] }
  ]
}
```
