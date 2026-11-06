# Requirements Document

## Introduction

Esta funcionalidad agrega el panel principal (`/dashboard`) a la plataforma de aprendizaje de inglés "English Assistant". Hoy las páginas de autenticación (`/login` y `/register`) redirigen a `/dashboard` tras un inicio de sesión o registro exitoso, pero esa ruta todavía no existe. El objetivo es cerrar el flujo de autenticación con una Zona_Autenticada funcional: una página protegida que solo es accesible con sesión activa, da la bienvenida a la persona usuaria y presenta un resumen de su cuenta y progreso.

El frontend usa Next.js 16 (App Router), React 19 y Tailwind CSS v4. El estado de sesión ya está disponible a través del `Contexto_Auth` (`src/context/AuthContext.tsx`), que expone `{ user, status, sessionExpired }` y la acción `logout()`. El backend (FastAPI) ya expone `GET /auth/me`, que devuelve `first_name`, `last_name`, `email`, `english_level` y `created_at`.

El alcance cubre:

- Una página protegida servida en la ruta `/dashboard`, coherente con la paleta de marca (azul profundo, aguamarina, rojo).
- Protección de ruta basada en el `Contexto_Auth`: redirección a `/login` cuando no hay sesión, y estado de carga mientras la sesión se rehidrata.
- Una barra superior del área autenticada con el logo y un botón para cerrar sesión.
- Un saludo personalizado con el nombre de la persona usuaria y la presentación de su nivel de inglés.
- Tarjetas de resumen (progreso, nivel actual, actividad reciente) con datos de marcador de posición, listas para conectar datos reales en el futuro.
- Diseño responsive.

Fuera de alcance (mejoras futuras, anotadas para claridad):

- Datos reales de progreso, lecciones o estadísticas provenientes del backend: las tarjetas muestran marcadores de posición.
- Edición de perfil del usuario.
- Protección de ruta en el servidor (middleware/SSR): la protección se realiza en el cliente a través del `Contexto_Auth`.

## Glossary

- **Pagina_Dashboard**: Página del frontend servida en la ruta `/dashboard` que muestra el panel principal de la persona usuaria autenticada.
- **Contexto_Auth**: Proveedor de contexto de React (`src/context/AuthContext.tsx`) que mantiene el estado de sesión (`user`, `status`, `sessionExpired`) y expone `login`, `register` y `logout`.
- **Zona_Autenticada**: Área de la aplicación accesible solo tras iniciar sesión, cuyo destino inicial es la ruta `/dashboard`.
- **Barra_Dashboard**: Barra superior de la Pagina_Dashboard con el logo de "English Assistant" y el control para cerrar sesión.
- **Nivel_Ingles**: Nivel del Marco Común Europeo del usuario, con valores A1, A2, B1, B2, C1 o C2.
- **Usuario**: Persona autenticada que posee una cuenta y utiliza la plataforma.
- **Estado_Sesion**: Valor `status` del Contexto_Auth, que puede ser `loading`, `authenticated` o `unauthenticated`.

## Requirements

### Requirement 1: Protección de la ruta del dashboard

**User Story:** Como persona usuaria, quiero que el panel solo sea accesible cuando tengo sesión iniciada, para que mi contenido quede protegido.

#### Acceptance Criteria

1. WHEN una persona usuaria navega a `/dashboard` y el Estado_Sesion es `authenticated`, THE Pagina_Dashboard SHALL mostrar el contenido del panel.
2. WHEN una persona usuaria navega a `/dashboard` y el Estado_Sesion es `unauthenticated`, THE Pagina_Dashboard SHALL redirigir a la ruta `/login`.
3. WHILE el Estado_Sesion es `loading`, THE Pagina_Dashboard SHALL mostrar un indicador de carga en lugar del contenido del panel.
4. WHEN el Estado_Sesion pasa de `loading` a `unauthenticated` (p. ej. token caducado durante la rehidratación), THE Pagina_Dashboard SHALL redirigir a la ruta `/login`.

### Requirement 2: Barra superior del área autenticada

**User Story:** Como persona usuaria autenticada, quiero una barra superior con el logo y la opción de cerrar sesión, para poder orientarme y salir de mi cuenta.

#### Acceptance Criteria

1. THE Barra_Dashboard SHALL mostrar el logo de "English Assistant" y un botón "Cerrar sesión".
2. WHEN una persona usuaria activa el botón "Cerrar sesión", THE Pagina_Dashboard SHALL invocar `logout()` del Contexto_Auth y navegar a la ruta `/`.

### Requirement 3: Saludo personalizado y nivel

**User Story:** Como persona usuaria autenticada, quiero ver un saludo con mi nombre y mi nivel de inglés, para sentir que el panel es mío y saber en qué nivel estoy.

#### Acceptance Criteria

1. WHEN el Estado_Sesion es `authenticated`, THE Pagina_Dashboard SHALL mostrar un saludo que incluya el `first_name` del Usuario.
2. THE Pagina_Dashboard SHALL mostrar el Nivel_Ingles actual del Usuario.

### Requirement 4: Tarjetas de resumen

**User Story:** Como persona usuaria autenticada, quiero ver un resumen de mi progreso y actividad, para tener una visión general de mi avance.

#### Acceptance Criteria

1. THE Pagina_Dashboard SHALL mostrar un conjunto de tarjetas de resumen que incluya, como mínimo, el Nivel_Ingles actual y un indicador de progreso.
2. WHERE aún no existen datos reales de progreso, THE Pagina_Dashboard SHALL mostrar valores de marcador de posición en las tarjetas de resumen.

### Requirement 5: Diseño responsive y coherente con la marca

**User Story:** Como persona usuaria, quiero que el panel se vea bien en móvil y escritorio y sea coherente con la marca, para tener una experiencia cuidada.

#### Acceptance Criteria

1. THE Pagina_Dashboard SHALL usar la paleta de marca definida en `globals.css` (variables `brand`, `accent`, `sky-soft`).
2. WHEN la Pagina_Dashboard se muestra en una pantalla estrecha (móvil), THE Pagina_Dashboard SHALL apilar las tarjetas de resumen en una sola columna.
3. WHEN la Pagina_Dashboard se muestra en una pantalla ancha (escritorio), THE Pagina_Dashboard SHALL distribuir las tarjetas de resumen en varias columnas.
