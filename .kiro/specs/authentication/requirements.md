# Requirements Document

## Introduction

Esta funcionalidad agrega las páginas de autenticación (registro e inicio de sesión) a la plataforma de aprendizaje de inglés "English Assistant". Hoy el frontend (Next.js 16, App Router, React 19, Tailwind CSS v4) solo tiene la página de inicio; no existen las rutas `/login` ni `/register`, aunque ya hay maquetas visuales de ambas pantallas coherentes con la marca. El backend (FastAPI, SQLAlchemy 2.0, JWT HS256, hashing Argon2) ya expone `POST /auth/register`, `POST /auth/login` y `GET /auth/me`.

El alcance cubre:

- Dos páginas separadas (`/login` y `/register`) con layout de dos columnas: panel de marca a la izquierda y tarjeta de formulario a la derecha, usando la paleta de marca (azul profundo, aguamarina, rojo).
- Ampliación del backend para capturar y persistir nombre y apellido por separado y el nivel de inglés (A1–C2), reemplazando el campo único `full_name`.
- Una capa de API centralizada en el frontend (`src/lib`) con funciones `register()`, `login()` y `getMe()`, apuntando a la URL base definida en `NEXT_PUBLIC_API_URL`.
- Gestión del token JWT en el cliente mediante `localStorage` y un contexto de autenticación de React, con el checkbox "Recordarme" controlando la persistencia del token.
- Validaciones de formulario en el cliente y presentación clara de los errores devueltos por el backend.
- Redirecciones tras registro e inicio de sesión exitosos.

Fuera de alcance (mejoras futuras, anotadas para claridad):

- Recuperación de contraseña ("¿Olvidaste tu contraseña?"): el enlace se muestra pero la funcionalidad completa queda fuera de alcance.
- Migración del almacenamiento del token a cookie `httpOnly`.

## Glossary

- **Pagina_Registro**: Página del frontend servida en la ruta `/register` que permite crear una cuenta nueva.
- **Pagina_Login**: Página del frontend servida en la ruta `/login` que permite iniciar sesión.
- **Capa_API**: Módulo del frontend ubicado en `src/lib` que centraliza las llamadas HTTP al backend (`register()`, `login()`, `getMe()`).
- **Contexto_Auth**: Proveedor de contexto de React que mantiene el estado de autenticación (token y usuario actual) en el cliente.
- **Backend_Auth**: Conjunto de endpoints de FastAPI bajo el prefijo `/auth` (`/register`, `/login`, `/me`).
- **Token_Acceso**: Token JWT firmado (HS256) emitido por Backend_Auth al iniciar sesión, con caducidad de 30 minutos.
- **Nivel_Ingles**: Nivel del Marco Común Europeo seleccionable por la persona usuaria, con valores permitidos A1, A2, B1, B2, C1 y C2.
- **Usuario**: Persona que utiliza la plataforma y posee o crea una cuenta.
- **NEXT_PUBLIC_API_URL**: Variable de entorno del frontend que contiene la URL base del backend.
- **Zona_Autenticada**: Área de la aplicación accesible solo tras iniciar sesión, cuyo destino inicial es la ruta `/dashboard`.

## Requirements

### Requirement 1: Página de registro

**User Story:** Como persona visitante, quiero crear una cuenta desde una página de registro, para poder empezar a usar la plataforma de aprendizaje de inglés.

#### Acceptance Criteria

1. WHEN una persona usuaria navega a la ruta `/register`, THE Pagina_Registro SHALL mostrar un layout de dos columnas con un panel de marca "English Assistant" a la izquierda y una tarjeta de formulario a la derecha.
2. THE Pagina_Registro SHALL mostrar los campos Nombre, Apellido, Correo electrónico, Contraseña y un selector Nivel_Ingles con las opciones A1, A2, B1, B2, C1 y C2.
3. THE Pagina_Registro SHALL mostrar un control para alternar entre texto visible y texto oculto en el campo Contraseña.
4. THE Pagina_Registro SHALL mostrar un indicador de porcentaje completado del formulario.
5. THE Pagina_Registro SHALL mostrar un botón "CREAR CUENTA" y un enlace hacia la ruta `/login` con el texto "¿Ya tienes una cuenta? Iniciar sesión".
6. WHEN una persona usuaria activa el enlace "Iniciar sesión", THE Pagina_Registro SHALL navegar a la ruta `/login`.

### Requirement 2: Página de inicio de sesión

**User Story:** Como persona usuaria registrada, quiero iniciar sesión desde una página de login, para poder acceder a mi contenido de aprendizaje.

#### Acceptance Criteria

1. WHEN una persona usuaria navega a la ruta `/login`, THE Pagina_Login SHALL mostrar un layout de dos columnas con un panel de marca a la izquierda y una tarjeta de formulario a la derecha.
2. THE Pagina_Login SHALL mostrar los campos Correo electrónico y Contraseña, un control para alternar entre texto visible y oculto en el campo Contraseña, un checkbox "Recordarme" y un enlace "¿Olvidaste tu contraseña?".
3. THE Pagina_Login SHALL mostrar un botón "INICIAR SESIÓN", un enlace "Volver al inicio" y un enlace hacia la ruta `/register` con el texto "¿No tienes una cuenta? Crear cuenta".
4. WHEN una persona usuaria activa el enlace "Volver al inicio", THE Pagina_Login SHALL navegar a la ruta `/`.
5. WHEN una persona usuaria activa el enlace "Crear cuenta", THE Pagina_Login SHALL navegar a la ruta `/register`.

### Requirement 3: Validación de formularios en el cliente

**User Story:** Como persona usuaria, quiero recibir avisos inmediatos cuando los datos del formulario sean incorrectos, para poder corregirlos antes de enviar la solicitud.

#### Acceptance Criteria

1. IF el campo Correo electrónico contiene un valor que no cumple el formato de correo electrónico al enviar el formulario o al perder el foco el campo, THEN THE Pagina_Registro SHALL mostrar en el campo Correo electrónico un mensaje de error que indique que el formato de correo electrónico no es válido y SHALL impedir el envío de la solicitud.
2. IF el campo Correo electrónico contiene un valor que no cumple el formato de correo electrónico al enviar el formulario o al perder el foco el campo, THEN THE Pagina_Login SHALL mostrar en el campo Correo electrónico un mensaje de error que indique que el formato de correo electrónico no es válido y SHALL impedir el envío de la solicitud.
3. IF el campo Contraseña contiene menos de 8 caracteres o más de 128 caracteres al enviar el formulario o al perder el foco el campo, THEN THE Pagina_Registro SHALL mostrar en el campo Contraseña un mensaje de error que indique que la contraseña debe tener entre 8 y 128 caracteres y SHALL impedir el envío de la solicitud.
4. IF cualquier campo requerido (Nombre, Apellido, Correo electrónico, Contraseña, Nivel_Ingles) está vacío al enviar el formulario, THEN THE Pagina_Registro SHALL mostrar en cada campo vacío un mensaje de error que indique que el campo es obligatorio y SHALL impedir el envío de la solicitud.
5. IF el campo Correo electrónico o el campo Contraseña están vacíos al enviar el formulario, THEN THE Pagina_Login SHALL mostrar en cada campo vacío un mensaje de error que indique que el campo es obligatorio y SHALL impedir el envío de la solicitud.
6. WHEN una persona usuaria corrige un campo que tenía un mensaje de error y su valor pasa a ser válido, THE Pagina_Registro y THE Pagina_Login SHALL eliminar el mensaje de error asociado a ese campo.
7. WHEN el valor de cualquiera de los campos Nombre, Apellido, Correo electrónico, Contraseña o Nivel_Ingles cambia, THE Pagina_Registro SHALL actualizar el indicador de porcentaje completado al porcentaje de campos requeridos con un valor no vacío.

### Requirement 4: Capa de API centralizada en el frontend

**User Story:** Como persona desarrolladora, quiero una capa de API centralizada, para que todas las llamadas de autenticación compartan la misma configuración y manejo de errores.

#### Acceptance Criteria

1. THE Capa_API SHALL exponer las funciones `register()`, `login()` y `getMe()` desde el directorio `src/lib`.
2. THE Capa_API SHALL construir la URL de cada petición a partir del valor de NEXT_PUBLIC_API_URL.
3. WHEN la función `register()` es invocada, THE Capa_API SHALL enviar una petición `POST` a `/auth/register` con un cuerpo JSON que contiene nombre, apellido, correo electrónico, contraseña y Nivel_Ingles.
4. WHEN la función `login()` es invocada, THE Capa_API SHALL enviar una petición `POST` a `/auth/login` con un cuerpo JSON que contiene correo electrónico y contraseña.
5. WHEN la función `getMe()` es invocada, THE Capa_API SHALL enviar una petición `GET` a `/auth/me` incluyendo el Token_Acceso en la cabecera `Authorization` con el esquema `Bearer`.
6. IF una respuesta del Backend_Auth tiene un código de estado de error, THEN THE Capa_API SHALL devolver el mensaje de error incluido en el campo `detail` de la respuesta.

### Requirement 5: Flujo de registro exitoso

**User Story:** Como persona visitante, quiero que mi cuenta quede creada y mi sesión iniciada tras el registro, para empezar a usar la plataforma sin pasos adicionales.

#### Acceptance Criteria

1. WHEN una persona usuaria envía el formulario de registro con datos válidos, THE Pagina_Registro SHALL invocar la función `register()` de la Capa_API con los datos del formulario.
2. WHEN la función `register()` devuelve una respuesta exitosa, THE Pagina_Registro SHALL invocar la función `login()` con el correo electrónico y la contraseña recién registrados.
3. WHEN el inicio de sesión posterior al registro es exitoso, THE Contexto_Auth SHALL almacenar el Token_Acceso y THE Pagina_Registro SHALL navegar a la Zona_Autenticada.
4. WHILE una solicitud de registro está en curso, THE Pagina_Registro SHALL deshabilitar el botón "CREAR CUENTA".

### Requirement 6: Flujo de inicio de sesión exitoso

**User Story:** Como persona usuaria registrada, quiero que al iniciar sesión se me lleve a mi área autenticada, para continuar mi aprendizaje.

#### Acceptance Criteria

1. WHEN una persona usuaria envía el formulario de login con datos válidos, THE Pagina_Login SHALL invocar la función `login()` de la Capa_API con el correo electrónico y la contraseña.
2. WHEN la función `login()` devuelve una respuesta exitosa, THE Contexto_Auth SHALL almacenar el Token_Acceso y THE Pagina_Login SHALL navegar a la Zona_Autenticada.
3. WHILE una solicitud de inicio de sesión está en curso, THE Pagina_Login SHALL deshabilitar el botón "INICIAR SESIÓN".

### Requirement 7: Manejo de errores del backend

**User Story:** Como persona usuaria, quiero mensajes de error claros cuando el servidor rechaza mi solicitud, para entender qué ocurrió y cómo corregirlo.

#### Acceptance Criteria

1. IF el Backend_Auth responde con el código 409 durante el registro, THEN THE Pagina_Registro SHALL mostrar el mensaje "Ya existe una cuenta con ese correo".
2. IF el Backend_Auth responde con el código 401 durante el inicio de sesión, THEN THE Pagina_Login SHALL mostrar el mensaje "Correo o contraseña incorrectos".
3. IF la Capa_API no logra establecer comunicación con el Backend_Auth, THEN THE Pagina_Registro SHALL mostrar un mensaje de error de conexión.
4. IF la Capa_API no logra establecer comunicación con el Backend_Auth, THEN THE Pagina_Login SHALL mostrar un mensaje de error de conexión.

### Requirement 8: Gestión del token y persistencia de sesión

**User Story:** Como persona usuaria, quiero que mi sesión se recuerde según mi preferencia, para no tener que iniciar sesión en cada visita cuando así lo elijo.

#### Acceptance Criteria

1. WHERE el checkbox "Recordarme" está activado cuando el Contexto_Auth recibe un Token_Acceso, THE Contexto_Auth SHALL almacenar el Token_Acceso en `localStorage`.
2. WHERE el checkbox "Recordarme" está desactivado cuando el Contexto_Auth recibe un Token_Acceso, THE Contexto_Auth SHALL almacenar el Token_Acceso en `sessionStorage`.
3. WHEN la aplicación se inicia, THE Contexto_Auth SHALL leer el Token_Acceso desde `localStorage` y, si no existe en `localStorage`, desde `sessionStorage`, y, si existe un Token_Acceso, SHALL invocar la función `getMe()` para recuperar al Usuario actual.
4. IF la función `getMe()` falla porque el Token_Acceso ha caducado (transcurridos 30 minutos desde su emisión) o es inválido, THEN THE Contexto_Auth SHALL eliminar el Token_Acceso de `localStorage` y `sessionStorage`, SHALL restablecer el estado de autenticación a no autenticado y SHALL presentar una indicación de sesión expirada.
5. WHERE el checkbox "Recordarme" está activado durante el inicio de sesión, THE Contexto_Auth SHALL conservar el Token_Acceso en `localStorage` de forma que persista tras cerrarse la pestaña y el navegador.
6. WHERE el checkbox "Recordarme" está desactivado durante el inicio de sesión, THE Contexto_Auth SHALL conservar el Token_Acceso en `sessionStorage` de forma que se elimine al cerrarse la pestaña o el navegador.
7. WHEN una persona usuaria cierra sesión, THE Contexto_Auth SHALL eliminar el Token_Acceso tanto de `localStorage` como de `sessionStorage` y SHALL restablecer el estado de autenticación a no autenticado.

### Requirement 9: Ampliación del modelo de usuario en el backend

**User Story:** Como persona desarrolladora, quiero que el backend persista nombre, apellido y nivel de inglés por separado, para que los datos de registro de la nueva interfaz queden almacenados correctamente.

#### Acceptance Criteria

1. THE Backend_Auth SHALL persistir el nombre, el apellido y el Nivel_Ingles de cada Usuario como campos separados y obligatorios, reemplazando el campo único `full_name`, donde el nombre y el apellido tienen una longitud mínima de 2 caracteres y máxima de 60 caracteres cada uno, y el Nivel_Ingles pertenece al conjunto {A1, A2, B1, B2, C1, C2}.
2. WHEN se recibe una petición `POST /auth/register` con nombre (2 a 60 caracteres), apellido (2 a 60 caracteres), correo electrónico con formato válido, contraseña (8 a 128 caracteres) y Nivel_Ingles válido, THE Backend_Auth SHALL crear un Usuario con esos datos y SHALL responder con el código 201.
3. IF una petición `POST /auth/register` omite el nombre, el apellido, el correo electrónico, la contraseña o el Nivel_Ingles, o incluye un nombre o apellido con menos de 2 o más de 60 caracteres, o un Nivel_Ingles que no pertenece al conjunto {A1, A2, B1, B2, C1, C2}, THEN THE Backend_Auth SHALL rechazar la petición con un código de error de validación, SHALL incluir una indicación de error que señale el campo inválido, y SHALL no crear ningún Usuario ni modificar datos existentes.
4. IF una petición `POST /auth/register` incluye un correo electrónico ya registrado, THEN THE Backend_Auth SHALL responder con el código 409, SHALL incluir una indicación de error de correo duplicado, y SHALL no crear un Usuario duplicado ni modificar el Usuario existente.
5. WHEN se recibe una petición `GET /auth/me` autenticada, THE Backend_Auth SHALL incluir en la respuesta el nombre, el apellido y el Nivel_Ingles del Usuario autenticado como campos separados.
6. WHERE existan Usuarios almacenados con el campo `full_name` previo a la migración, THE Backend_Auth SHALL conservar sus datos convirtiéndolos a los campos separados de nombre y apellido sin pérdida de registros existentes.

### Requirement 10: Alcance de recuperación de contraseña y mejoras futuras

**User Story:** Como persona usuaria, quiero ver una opción de recuperación de contraseña, para saber que existe aunque todavía no esté disponible.

#### Acceptance Criteria

1. THE Pagina_Login SHALL mostrar el enlace "¿Olvidaste tu contraseña?".
2. WHERE la recuperación de contraseña está fuera del alcance de esta versión, THE Pagina_Login SHALL indicar a la persona usuaria que la funcionalidad aún no está disponible al activar el enlace "¿Olvidaste tu contraseña?".

## Notas de mejoras futuras

- **Cookie httpOnly**: En esta versión el Token_Acceso se guarda en `localStorage` con un contexto de React. Migrar a cookie `httpOnly` para mayor seguridad queda como mejora futura.
- **Recuperación de contraseña**: El flujo completo de restablecimiento de contraseña (solicitud, correo, token de un solo uso) queda fuera del alcance de esta versión.
