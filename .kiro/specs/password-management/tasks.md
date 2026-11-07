# Implementation Plan: Password Management

## Overview

El plan amplía la autenticación existente de "English Assistant" con la gestión de contraseña y seguridad de cuenta, avanzando de abajo hacia arriba en dos frentes. En el **backend FastAPI** se añade la Marca_Invalidacion al modelo `User` (columna `tokens_valid_after` + script de migración ligero), el modelo `PasswordResetToken`, el claim `iat` y el hash del token en `security.py`, la comprobación de la marca en `get_current_user`, el Servicio_Correo abstracto con implementación de consola, el rate limiter en memoria, los esquemas Pydantic con la Regla_Fortaleza y los tres endpoints (`/auth/forgot-password`, `/auth/reset-password`, `/auth/change-password`). En el **frontend Next.js** se amplía la Capa_API con `requestPasswordReset`/`resetPassword`/`changePassword` (más timeout y comprobación de `NEXT_PUBLIC_API_URL`), se añaden helpers de validación (`passwordsMatch`, `isDifferentPassword`), la acción de cierre de sesión del Contexto_Auth, las páginas `/forgot-password` y `/reset-password`, la Pagina_CambioContrasena en la Zona_Autenticada y se cambia el enlace "¿Olvidaste tu contraseña?" del login. Cada paso se construye sobre el anterior y termina conectando componentes (páginas ↔ contexto ↔ Capa_API ↔ backend), sin dejar código huérfano.

Las pruebas basadas en propiedades (Hypothesis en backend, fast-check en frontend) implementan las 18 propiedades del diseño y se colocan junto al código que validan.

Lenguajes: **Python** (backend, pytest + Hypothesis) y **TypeScript** (frontend, Vitest + fast-check + @testing-library/react), según el diseño.

## Tasks

- [ ] 1. Ampliar `security.py` con `iat`, decodificación y hash del token
  - [ ] 1.1 Incluir `iat` en el token y devolverlo al decodificar
    - En `app/core/security.py`, hacer que `create_access_token` añada el claim `iat` (instante de emisión UTC) al payload junto a `sub` y `exp`
    - Definir `TokenData` (`sub: str`, `iat: datetime`) y hacer que `decode_access_token` devuelva `sub` + `iat` (o `None` si el token no es válido/está caducado), tratando los tokens sin `iat` como emitidos en el origen del tiempo
    - _Requirements: 5.4_
  - [ ] 1.2 Añadir `hash_reset_token`
    - Implementar `hash_reset_token(token) -> str` que devuelve el `sha256` en hexadecimal del Token_Restablecimiento (base para el almacenamiento seguro)
    - _Requirements: 2.2_
  - [ ]* 1.3 Escribir prueba de propiedad para la inclusión de `iat` y el corte de validez
    - **Feature: password-management, Property 16: Corte de validez del Token_Acceso por la Marca_Invalidacion**
    - Verificar que todo token emitido incluye `iat` y que `iat < tokens_valid_after` es la condición exacta de rechazo
    - Mínimo 100 iteraciones; reloj inyectado
    - **Validates: Requirements 4.10, 5.4, 5.5, 5.6**

- [ ] 2. Añadir la Marca_Invalidacion al modelo `User` y migrarla
  - [ ] 2.1 Añadir la columna `tokens_valid_after` al modelo `User`
    - En `app/models/user.py`, añadir `tokens_valid_after: Mapped[datetime | None]` (`DateTime`, `nullable=True`, `default=None`), documentando que `NULL` significa "sin invalidación"
    - _Requirements: 5.1, 5.2_
  - [ ] 2.2 Implementar el script de migración ligero e idempotente
    - Crear `app/db/migrate_password_security.py` con `migrate_password_security()` que use `inspect(connection)` para comprobar si la columna `tokens_valid_after` ya existe y, si no, ejecute `ALTER TABLE users ADD COLUMN tokens_valid_after DATETIME NULL` dentro de `engine.begin()` (transacción atómica)
    - No poblar datos: la columna nace `NULL`; no hacer nada si la tabla `users` no existe o la columna ya está presente
    - _Requirements: 5.1, 5.2_
  - [ ]* 2.3 Escribir prueba de integración del script de migración
    - Sembrar una BD sin la columna, ejecutar `migrate_password_security`, verificar que la columna queda añadida (nullable), que el conteo de filas se conserva y que una segunda ejecución no falla (idempotencia)
    - _Requirements: 5.1, 5.2_

- [ ] 3. Implementar el modelo `PasswordResetToken` y conectar su creación
  - [ ] 3.1 Definir el modelo `PasswordResetToken`
    - Crear `PasswordResetToken` en `app/models/` con `id`, `user_id` (FK a `users.id`), `token_hash` (`String(64)`, `unique`, `index`), `expires_at`, `used_at` (nullable) y `created_at`
    - Asegurar que `Base.metadata.create_all` crea la tabla `password_reset_tokens` al arrancar (importar el modelo donde corresponda)
    - _Requirements: 2.2_

- [ ] 4. Implementar los esquemas Pydantic de gestión de contraseña
  - [ ] 4.1 Crear los esquemas con la Regla_Fortaleza
    - En `app/schemas/`, implementar el validador reutilizable `validate_strength` (8–128 caracteres, ≥ 1 dígito, ≥ 1 mayúscula) y los esquemas `ForgotPasswordRequest` (con `email: EmailStr` normalizado a minúsculas), `ResetPasswordRequest` (`token`, `new_password` con `strength`), `ChangePasswordRequest` (`current_password`, `new_password` con `strength`) y `MessageResponse` (`message`)
    - _Requirements: 2.7, 3.9, 4.11_
  - [ ]* 4.2 Escribir prueba de propiedad para la Regla_Fortaleza en el backend
    - **Feature: password-management, Property 13 (parte Regla_Fortaleza): Rechazo de restablecimiento inválido con precedencia del token**
    - Verificar que `validate_strength`/los esquemas aceptan una contraseña si y solo si tiene 8–128 caracteres, ≥ 1 dígito y ≥ 1 mayúscula; probar fronteras 7/8/128/129
    - Mínimo 100 iteraciones
    - **Validates: Requirements 3.9, 4.11**

- [ ] 5. Implementar el Servicio_Correo abstracto y su implementación de consola
  - [ ] 5.1 Implementar `EmailService` y `ConsoleEmailService`
    - Crear `app/core/email.py` con el protocolo `EmailService` (`send_reset_link(email, link)`), la implementación `ConsoleEmailService` que registra el Enlace_Restablecimiento en la consola del servidor (desarrollo) y la dependencia `get_email_service()`
    - _Requirements: 2.3, 2.9_
  - [ ]* 5.2 Escribir prueba por ejemplo del Servicio_Correo en desarrollo
    - Verificar que `ConsoleEmailService.send_reset_link` registra el Enlace_Restablecimiento en consola y no envía ningún correo real
    - _Requirements: 2.9_

- [ ] 6. Implementar el rate limiter en memoria para la recuperación
  - [ ] 6.1 Implementar `SlidingWindowRateLimiter`
    - Crear `app/core/rate_limit.py` con `SlidingWindowRateLimiter` (ventana `WINDOW_SECONDS = 900`, `MAX_REQUESTS = 5`), el método `check(email, now) -> RateLimitResult` (descarta marcas antiguas, bloquea cuando se alcanzan 5 e informa `retry_after_seconds`) y la dependencia `get_rate_limiter()`
    - Usar el correo normalizado como clave y consultar el límite antes de comprobar la existencia del Usuario (respuesta indistinguible)
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [ ]* 6.2 Escribir prueba de propiedad para la ventana deslizante del rate limiting
    - **Feature: password-management, Property 18: Ventana deslizante del rate limiting**
    - Verificar que permite una solicitud si y solo si hay ≤ 5 en los 900 s previos, y que la rechazada informa `retry_after_seconds` sin generar token
    - Mínimo 100 iteraciones; reloj inyectado
    - **Validates: Requirements 7.1, 7.2, 7.3**

- [ ] 7. Implementar la comprobación de la Marca_Invalidacion en `get_current_user`
  - [ ] 7.1 Rechazar tokens emitidos antes de la Marca_Invalidacion
    - En `get_current_user`, tras decodificar el token y cargar el Usuario por `sub`, rechazar con 401 ("La sesión fue invalidada...") si `user.tokens_valid_after is not None and data.iat < user.tokens_valid_after`; aceptar en caso contrario
    - Mantener el comportamiento existente de `GET /auth/me`, `login` y `register`
    - _Requirements: 4.10, 5.5, 5.6_

- [ ] 8. Implementar el endpoint `POST /auth/forgot-password`
  - [ ] 8.1 Implementar la lógica de solicitud de recuperación
    - En `app/routers/auth.py`, implementar `forgot_password` con dependencias de `get_db`, `get_email_service` y `get_rate_limiter`: aplicar el rate limit (429 con tiempo de reintento si se excede); si el Usuario existe, invalidar sus tokens previos no usados/no caducados, generar un Token_Restablecimiento con `secrets.token_urlsafe(32)`, guardar solo `token_hash` (`hash_reset_token`) con `expires_at = now + 30 min` y llamar al Servicio_Correo con el Enlace_Restablecimiento
    - Responder SIEMPRE 200 con el mismo `MessageResponse`, capturando (sin exponer) cualquier fallo del Servicio_Correo
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.8, 2.9, 2.10, 7.3_
  - [ ]* 8.2 Escribir prueba de propiedad para la generación segura del token
    - **Feature: password-management, Property 7: Generación segura del Token_Restablecimiento**
    - Verificar ≥ 32 bytes de entropía, que solo se persiste `sha256(token)` (nunca el valor en claro) y `15 min ≤ expires_at − created_at ≤ 30 min`
    - Mínimo 100 iteraciones; reloj inyectado
    - **Validates: Requirements 2.1, 2.2, 2.4**
  - [ ]* 8.3 Escribir prueba de propiedad para la correspondencia del Enlace_Restablecimiento
    - **Feature: password-management, Property 8: El Enlace_Restablecimiento entregado corresponde al token almacenado**
    - Verificar que el enlace tiene la forma `{FRONTEND_URL}/reset-password?token=T` con `sha256(T) == token_hash` del registro
    - Mínimo 100 iteraciones
    - **Validates: Requirements 2.3**
  - [ ]* 8.4 Escribir prueba de propiedad para "como máximo un token válido por Usuario"
    - **Feature: password-management, Property 9: Como máximo un Token_Restablecimiento válido por Usuario**
    - Generar secuencias de N solicitudes para un mismo Usuario y contar los tokens válidos tras cada una (≤ 1)
    - Mínimo 100 iteraciones
    - **Validates: Requirements 2.6**
  - [ ]* 8.5 Escribir prueba de propiedad para la respuesta anti-enumeración
    - **Feature: password-management, Property 10: Respuesta de recuperación indistinguible y sin efectos para correo inexistente o fallo de correo**
    - Verificar el mismo código y cuerpo para correos existentes e inexistentes, y que no se crea token ni se expone el fallo del Servicio_Correo
    - Mínimo 100 iteraciones; espía del Servicio_Correo
    - **Validates: Requirements 2.5, 2.8, 2.10, 7.4**
  - [ ]* 8.6 Escribir prueba de propiedad para el rechazo de correo con formato inválido
    - **Feature: password-management, Property 11: Formato de correo inválido rechazado sin generar token**
    - Verificar respuesta 4xx sin crear ningún Token_Restablecimiento
    - Mínimo 100 iteraciones
    - **Validates: Requirements 2.7**
  - [ ]* 8.7 Escribir prueba de propiedad para la indistinguibilidad del rate limiting
    - **Feature: password-management, Property 10 (indistinguibilidad): Respuesta indistinguible frente a la existencia del correo**
    - Someter correos existente e inexistente a la misma secuencia y verificar que la respuesta 429 (código y cuerpo) es idéntica
    - Mínimo 100 iteraciones
    - **Validates: Requirements 7.4**

- [ ] 9. Implementar el endpoint `POST /auth/reset-password`
  - [ ] 9.1 Implementar la lógica de restablecimiento
    - Implementar `reset_password`: buscar el registro por `hash_reset_token(data.token)`; priorizar la validación del token (inexistente, caducado > 30 min o ya usado → 400 antes de validar la fortaleza); en éxito guardar `hashed_password = argon2(new_password)`, marcar `used_at = now`, fijar `tokens_valid_after = now` y responder 200, todo en una sola transacción (ROLLBACK ante fallo)
    - _Requirements: 3.7, 3.8, 3.10, 3.11, 5.1, 5.3_
  - [ ]* 9.2 Escribir prueba de propiedad para el restablecimiento exitoso de un solo uso
    - **Feature: password-management, Property 12: Restablecimiento exitoso con token de un solo uso**
    - Verificar 200 + hash Argon2 verificable con la nueva contraseña + `used_at` marcado en la primera petición, y 400 en toda petición posterior con el mismo token
    - Mínimo 100 iteraciones
    - **Validates: Requirements 3.7, 3.10**
  - [ ]* 9.3 Escribir prueba de propiedad para el round-trip de restablecimiento
    - **Feature: password-management, Property 12 (round-trip): login con nueva vs anterior**
    - Tras un reset exitoso, `POST /auth/login` con la nueva contraseña tiene éxito y con la anterior falla con 401
    - Mínimo 100 iteraciones
    - **Validates: Requirements 3.7**
  - [ ]* 9.4 Escribir prueba de propiedad para el rechazo con precedencia del token
    - **Feature: password-management, Property 13: Rechazo de restablecimiento inválido con precedencia del token**
    - Verificar 400 para token inválido/caducado/usado incluso con contraseña débil (prioridad del token), y 422 para token válido con contraseña que incumple la Regla_Fortaleza, sin modificar ninguna contraseña
    - Mínimo 100 iteraciones; reloj inyectado
    - **Validates: Requirements 3.8, 3.9, 3.11**

- [ ] 10. Implementar el endpoint `POST /auth/change-password`
  - [ ] 10.1 Implementar la lógica de cambio autenticado
    - Implementar `change_password` con `current_user = Depends(get_current_user)` (cubre 401 por token ausente/inválido/invalidado): verificar la contraseña actual (`verify_password`) → 400 si no coincide; validar que la nueva es distinta de la actual; en éxito guardar `hashed_password = argon2(new_password)`, fijar `tokens_valid_after = now` y responder 200, todo en una sola transacción (ROLLBACK ante fallo)
    - _Requirements: 4.7, 4.9, 4.10, 4.11, 5.2, 5.3_
  - [ ]* 10.2 Escribir prueba de propiedad para el cambio de contraseña exitoso
    - **Feature: password-management, Property 14: Cambio de contraseña exitoso**
    - Verificar 200 + hash Argon2 verificable con la nueva contraseña cuando la actual coincide y la nueva es válida y distinta
    - Mínimo 100 iteraciones
    - **Validates: Requirements 4.7**
  - [ ]* 10.3 Escribir prueba de propiedad para el rechazo de cambio inválido
    - **Feature: password-management, Property 15: Rechazo de cambio con contraseña actual incorrecta o nueva inválida**
    - Verificar 400 cuando la actual no coincide, y error (422 por fortaleza, 400 por igualdad) cuando la nueva incumple la Regla_Fortaleza o es igual a la actual, sin modificar la contraseña
    - Mínimo 100 iteraciones
    - **Validates: Requirements 4.9, 4.11, 4.4**
  - [ ]* 10.4 Escribir prueba de propiedad para la actualización y conservación de la Marca_Invalidacion
    - **Feature: password-management, Property 17: Actualización y conservación de la Marca_Invalidacion**
    - Verificar que `tokens_valid_after` se actualiza al instante de la operación si y solo si reset/change tiene éxito, y se conserva intacta ante cualquier fallo
    - Mínimo 100 iteraciones; reloj inyectado
    - **Validates: Requirements 5.1, 5.2, 5.3**

- [ ] 11. Checkpoint del backend
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Ampliar la Capa_API del frontend con la gestión de contraseña
  - [ ] 12.1 Añadir timeout y comprobación de `NEXT_PUBLIC_API_URL` al helper `request()`
    - En `src/lib/api.ts`, hacer que `request()` compruebe que la base (`NEXT_PUBLIC_API_URL`) no esté vacía antes de hacer `fetch`; si lo está, lanzar `ApiError("La URL base del backend no está configurada.", null)` sin emitir la petición
    - Añadir un timeout de 30 s con `AbortController`/`AbortSignal.timeout(30000)`, normalizando el fallo/timeout a `ApiError(mensaje, null)`
    - _Requirements: 6.5, 6.6, 6.9_
  - [ ] 12.2 Implementar `requestPasswordReset`, `resetPassword` y `changePassword`
    - En `src/lib/api.ts`, definir `ForgotPasswordInput`, `ResetPasswordInput`, `ChangePasswordInput` y `MessageResponse`, y exportar `requestPasswordReset({email})` (POST `/auth/forgot-password`), `resetPassword({token, new_password})` (POST `/auth/reset-password`) y `changePassword({current_password, new_password}, token)` (POST `/auth/change-password` con `Authorization: Bearer <token>`), reutilizando el helper `request()`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.7, 6.8_
  - [ ]* 12.3 Escribir prueba de propiedad para la fidelidad de la petición HTTP
    - **Feature: password-management, Property 4: Fidelidad de la petición HTTP de gestión de contraseña**
    - Con `fetch` mockeado, verificar URL (base + ruta), método POST, cuerpo JSON exacto y, en `changePassword`, la cabecera `Authorization: Bearer <token>`
    - Mínimo 100 iteraciones
    - **Validates: Requirements 1.5, 3.5, 4.6, 6.2, 6.3, 6.4, 6.5**
  - [ ]* 12.4 Escribir prueba de propiedad para la base no configurada
    - **Feature: password-management, Property 5: URL base no configurada bloquea la petición**
    - Con `NEXT_PUBLIC_API_URL` ausente o vacía, verificar que no se emite ninguna petición y que se devuelve el error de URL base no configurada
    - Mínimo 100 iteraciones
    - **Validates: Requirements 6.6**
  - [ ]* 12.5 Escribir prueba de propiedad para la propagación del error del backend
    - **Feature: password-management, Property 6: Propagación del error del backend**
    - Con respuestas de error con/sin `detail`, verificar que el `ApiError` contiene el `detail` cuando existe y un mensaje genérico cuando no
    - Mínimo 100 iteraciones
    - **Validates: Requirements 6.7, 6.8**
  - [ ]* 12.6 Escribir prueba por ejemplo de las exportaciones de la Capa_API
    - Verificar que `src/lib/api.ts` exporta `requestPasswordReset`, `resetPassword` y `changePassword`
    - _Requirements: 6.1_

- [ ] 13. Añadir los helpers de validación de contraseñas
  - [ ] 13.1 Implementar `passwordsMatch` e `isDifferentPassword`
    - En `src/lib/validation.ts`, añadir las funciones puras `passwordsMatch(a, b): boolean` (confirmación de contraseña) e `isDifferentPassword(current, next): boolean` (la nueva debe ser distinta de la actual), reutilizando `validatePassword`/`validateEmail` existentes
    - _Requirements: 3.4, 4.4, 4.5_
  - [ ]* 13.2 Escribir prueba de propiedad para la validación de correo en recuperación
    - **Feature: password-management, Property 1: Validación de formato de correo en recuperación**
    - Verificar que `validateEmail` marca error si y solo si el valor está vacío/solo espacios o no cumple el formato, bloqueando el envío
    - Mínimo 100 iteraciones
    - **Validates: Requirements 1.3, 1.4**
  - [ ]* 13.3 Escribir prueba de propiedad para la Regla_Fortaleza en el cliente
    - **Feature: password-management, Property 2: Regla_Fortaleza en el cliente**
    - Verificar que `validatePassword` devuelve error si y solo si la cadena incumple la Regla_Fortaleza (longitud 8–128, ≥ 1 dígito, ≥ 1 mayúscula)
    - Mínimo 100 iteraciones
    - **Validates: Requirements 3.3, 4.3**
  - [ ]* 13.4 Escribir prueba de propiedad para las reglas de pares de contraseñas
    - **Feature: password-management, Property 3: Reglas de pares de contraseñas (coincidencia y distinción)**
    - Verificar que `passwordsMatch` marca "no coinciden" si y solo si difieren, e `isDifferentPassword` marca "debe ser distinta" si y solo si son iguales
    - Mínimo 100 iteraciones
    - **Validates: Requirements 3.4, 4.4, 4.5**

- [ ] 14. Añadir la acción de cierre de sesión al Contexto_Auth
  - [ ] 14.1 Implementar `endSessionAfterPasswordChange`
    - En `src/context/AuthContext.tsx`, exponer `endSessionAfterPasswordChange()` que reutiliza `resetSession(false)` (llama a `clearToken()` y pone `status = "unauthenticated"`) para reflejar el cierre de sesión tras un cambio de contraseña exitoso
    - _Requirements: 6.10, 6.11_
  - [ ]* 14.2 Escribir prueba de propiedad para el cierre de sesión tras cambio
    - **Feature: password-management, Property 16 (cliente): Cierre de sesión tras cambio de contraseña**
    - Con un token arbitrario y mocks de storage, verificar que tras la confirmación el token se elimina de ambos almacenamientos y el estado pasa a no autenticado
    - Mínimo 100 iteraciones
    - **Validates: Requirements 6.10, 6.11**

- [ ] 15. Implementar la Pagina_Recuperacion (`/forgot-password`) y conectar el enlace del login
  - [ ] 15.1 Implementar `src/app/forgot-password/page.tsx`
    - Client component que reutiliza `AuthShell`, `FloatingField` y `ErrorBalloon`: campo Correo vacío (acepta hasta 254), botón de envío habilitado y enlace de regreso a `/login`
    - Validar el correo (en blur y en submit) con `validateEmail`, conservando el valor; al enviar un correo válido llamar a `requestPasswordReset()`, deshabilitar el botón y mostrar indicación de carga mientras la solicitud está en curso, y al éxito mostrar el mensaje indistinguible "si el correo está registrado..."
    - Ante fallo/timeout (`status null`) permanecer en `/forgot-password`, mostrar mensaje de reintento, conservar el correo y rehabilitar el botón; mapear 429 al mensaje de "demasiados intentos"
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_
  - [ ] 15.2 Cambiar el enlace "¿Olvidaste tu contraseña?" del login
    - En `src/app/login/page.tsx`, cambiar el enlace para navegar a `/forgot-password` en lugar de mostrar el aviso de funcionalidad no disponible
    - _Requirements: 1.2_
  - [ ]* 15.3 Escribir pruebas por ejemplo de la Pagina_Recuperacion y el enlace del login
    - Render con campo Correo vacío (máx. 254), botón habilitado y enlace a `/login` (1.1); navegación del enlace del login a `/forgot-password` con router mockeado (1.2); botón deshabilitado durante la solicitud (1.7); mensaje de reintento conservando el correo ante fallo de red (1.6)
    - _Requirements: 1.1, 1.2, 1.6, 1.7_

- [ ] 16. Implementar la Pagina_Restablecimiento (`/reset-password`)
  - [ ] 16.1 Implementar `src/app/reset-password/page.tsx`
    - Client component que lee `?token=` y reutiliza `AuthShell`, `FloatingField`, `ErrorBalloon` y `PasswordChecklist`: ante token ausente/ inválido (o respuesta 400) mostrar estado "enlace inválido o caducado" con acción para pedir uno nuevo, sin mostrar el campo Contraseña ni el botón
    - Con token presente, mostrar Contraseña nueva (toggle mostrar/ocultar) y confirmación; validar la Regla_Fortaleza (`validatePassword`) y la coincidencia (`passwordsMatch`) en blur/submit; al enviar valores válidos llamar a `resetPassword({token, new_password})`, deshabilitar el botón durante la solicitud y, al éxito, mostrar confirmación con enlace a `/login`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  - [ ]* 16.2 Escribir pruebas por ejemplo de la Pagina_Restablecimiento
    - Estado de enlace inválido sin campo ni botón y con acción para pedir uno nuevo (3.2); render válido con campos + toggle + botón (3.1); botón deshabilitado durante la solicitud (3.6)
    - _Requirements: 3.1, 3.2, 3.6_

- [ ] 17. Implementar la Pagina_CambioContrasena en la Zona_Autenticada
  - [ ] 17.1 Implementar la Pagina_CambioContrasena
    - Crear la vista de cambio de contraseña en la Zona_Autenticada (sección/ruta del dashboard) reutilizando `FloatingField`, `ErrorBalloon` y `PasswordChecklist`: campos Contraseña actual, Contraseña nueva y confirmación, y botón de envío
    - Validar en cliente (obligatorios, Regla_Fortaleza, nueva ≠ actual con `isDifferentPassword`, coincidencia con `passwordsMatch`); al enviar valores válidos llamar a `changePassword()` de la Capa_API con el Token_Acceso; al 200 mostrar la confirmación e invocar `endSessionAfterPasswordChange()` del Contexto_Auth; mapear 400 a "contraseña actual incorrecta" y 401 a sesión no válida (redirige a `/login`)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.8_
  - [ ]* 17.2 Escribir prueba de propiedad para las validaciones de cliente del cambio
    - **Feature: password-management, Property 11: Validaciones en cliente de la Pagina_CambioContrasena** (del primer bloque de propiedades; validaciones combinadas de los tres campos)
    - Verificar que el envío se permite si y solo si ningún campo está vacío, la nueva cumple la Regla_Fortaleza, la nueva es distinta de la actual y la confirmación coincide
    - Mínimo 100 iteraciones
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5**
  - [ ]* 17.3 Escribir pruebas por ejemplo del flujo y errores del cambio
    - Confirmación de éxito tras 200 con cierre de sesión por el Contexto_Auth (4.8); mapeo de 400 → "contraseña actual incorrecta" (4.9)
    - _Requirements: 4.8, 4.9_

- [ ] 18. Checkpoint final
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Las tareas marcadas con `*` son opcionales (pruebas) y pueden omitirse para un MVP más rápido.
- Cada tarea referencia cláusulas de requisitos específicas para trazabilidad.
- Las pruebas de propiedad implementan una única propiedad del diseño y se etiquetan con el formato **Feature: password-management, Property {número}: {texto}**; mínimo 100 iteraciones. Donde el tiempo interviene (caducidad, rate limiting, invalidación por `iat`) el reloj se inyecta.
- La numeración de las propiedades sigue el bloque final de "Correctness Properties" del diseño (Properties 1–18).
- Los checkpoints aseguran validación incremental antes de avanzar.
- `AGENTS.md` del frontend recuerda consultar `node_modules/next/dist/docs/` antes de usar APIs del App Router de Next.js 16.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "5.1", "6.1", "13.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "2.2", "3.1", "4.1", "5.2", "6.2", "7.1", "13.2", "13.3", "13.4", "14.1"] },
    { "id": 2, "tasks": ["2.3", "4.2", "8.1", "12.1", "14.2"] },
    { "id": 3, "tasks": ["8.2", "8.3", "8.4", "8.5", "8.6", "8.7", "9.1", "10.1", "12.2", "15.2"] },
    { "id": 4, "tasks": ["9.2", "9.3", "9.4", "10.2", "10.3", "10.4", "12.3", "12.4", "12.5", "12.6", "15.1", "16.1", "17.1"] },
    { "id": 5, "tasks": ["15.3", "16.2", "17.2", "17.3"] }
  ]
}
```
