# Requirements Document

## Introduction

Esta funcionalidad añade la gestión de contraseña y la seguridad de cuenta a la plataforma "English Assistant", ampliando la autenticación ya existente (FastAPI + SQLAlchemy 2.0 sobre SQLite, hashing Argon2 con passlib, JWT HS256 de 30 minutos cuyo subject es el correo del Usuario; frontend Next.js 16 con App Router, React 19 y Tailwind CSS v4).

Hoy la plataforma permite registrarse e iniciar sesión, pero el enlace "¿Olvidaste tu contraseña?" de la Pagina_Login solo muestra un aviso de que la funcionalidad no está disponible, no existe forma de cambiar la contraseña estando autenticado, y los Token_Acceso emitidos no pueden revocarse antes de su caducidad natural de 30 minutos.

El alcance cubre tres capacidades:

- **Recuperación de contraseña por correo**: una persona usuaria que olvidó su contraseña introduce su correo; el backend genera un token de restablecimiento de un solo uso y caducidad corta (entre 15 y 30 minutos), lo almacena de forma segura (hash del token, no en texto plano) y envía un enlace de restablecimiento. Al abrir el enlace, la persona usuaria define una contraseña nueva que cumple las mismas reglas de fortaleza del registro (mínimo 8 caracteres, al menos 1 número y al menos 1 letra mayúscula). El token de restablecimiento se invalida tras un único uso. La respuesta a la solicitud de recuperación no revela si el correo existe, para evitar la enumeración de usuarios.
- **Cambio de contraseña autenticado**: una persona usuaria con sesión iniciada, desde su perfil, introduce su contraseña actual y la contraseña nueva; el backend verifica la contraseña actual antes de guardar el nuevo hash.
- **Respuesta a cuenta comprometida**: al restablecer o cambiar la contraseña, se invalidan todos los Token_Acceso emitidos con anterioridad, de modo que cualquier sesión activa de un atacante quede expulsada. Como hoy el sistema no dispone de lista de revocación, el mecanismo se basa en una marca temporal de invalidación por Usuario que inutiliza todo Token_Acceso emitido antes de ese instante.

### Decisión sobre el envío de correo

El envío de correo se diseña detrás de un servicio abstracto (Servicio_Correo). En el entorno de desarrollo, el enlace de restablecimiento se registra en la consola del servidor y no se envía ningún correo real. La integración con un proveedor real (por ejemplo SendGrid, Resend o SMTP) es un punto de integración futuro; aun así, el flujo completo de recuperación queda especificado en este documento.

### Fuera de alcance (mejoras futuras, anotadas para claridad)

- **Integración con un proveedor de correo real**: la implementación concreta de un proveedor (SendGrid, Resend, SMTP) queda fuera del alcance de esta versión. En desarrollo, el enlace se registra en consola a través del Servicio_Correo.
- **Migración del almacenamiento del Token_Acceso a cookie `httpOnly`**: se mantiene la política actual de `localStorage`/`sessionStorage` definida en el spec de autenticación.
- **Autenticación multifactor (MFA)** y notificaciones de "tu contraseña ha cambiado" por correo.
- **Lista de revocación de tokens (denylist) por identificador de token (jti)**: el mecanismo de esta versión usa una marca temporal de invalidación por Usuario, no una denylist individual de tokens.

## Glossary

- **Usuario**: Persona que utiliza la plataforma y posee una cuenta. (Término heredado del spec de autenticación.)
- **Backend_Auth**: Conjunto de endpoints de FastAPI bajo el prefijo `/auth`. (Término heredado del spec de autenticación, ampliado en este spec con los endpoints de gestión de contraseña.)
- **Capa_API**: Módulo del frontend ubicado en `src/lib` que centraliza las llamadas HTTP al backend. (Término heredado del spec de autenticación, ampliado con las funciones de gestión de contraseña.)
- **Contexto_Auth**: Proveedor de contexto de React que mantiene el estado de autenticación (Token_Acceso y Usuario actual) en el cliente. (Término heredado del spec de autenticación.)
- **Token_Acceso**: Token JWT firmado (HS256) emitido por Backend_Auth al iniciar sesión, con caducidad de 30 minutos y subject igual al correo del Usuario. (Término heredado del spec de autenticación.)
- **Zona_Autenticada**: Área de la aplicación accesible solo tras iniciar sesión, cuyo destino inicial es la ruta `/dashboard`. (Término heredado del spec de autenticación.)
- **Nivel_Ingles**: Nivel del Marco Común Europeo del Usuario (A1–C2). (Término heredado del spec de autenticación.)
- **NEXT_PUBLIC_API_URL**: Variable de entorno del frontend que contiene la URL base del backend. (Término heredado del spec de autenticación.)
- **Regla_Fortaleza**: Conjunto de reglas de validez de una contraseña: longitud mínima de 8 caracteres y máxima de 128 caracteres, al menos un carácter numérico y al menos una letra mayúscula.
- **Token_Restablecimiento**: Valor secreto de un solo uso generado por Backend_Auth para autorizar el restablecimiento de la contraseña de un Usuario, con caducidad corta de entre 15 y 30 minutos, cuyo hash se almacena en la base de datos (el valor en texto plano solo viaja dentro del Enlace_Restablecimiento).
- **Enlace_Restablecimiento**: URL del frontend que incorpora el Token_Restablecimiento en texto plano y conduce a la Pagina_Restablecimiento.
- **Pagina_Recuperacion**: Página del frontend servida en la ruta `/forgot-password` donde el Usuario introduce su correo para solicitar la recuperación.
- **Pagina_Restablecimiento**: Página del frontend servida en la ruta `/reset-password` donde el Usuario define su contraseña nueva usando el Token_Restablecimiento del Enlace_Restablecimiento.
- **Pagina_CambioContrasena**: Vista del perfil en la Zona_Autenticada donde el Usuario autenticado cambia su contraseña proporcionando la contraseña actual y la nueva.
- **Servicio_Correo**: Servicio abstracto del backend responsable de entregar el Enlace_Restablecimiento; en desarrollo registra el Enlace_Restablecimiento en la consola del servidor en lugar de enviar un correo real.
- **Marca_Invalidacion**: Marca temporal asociada a cada Usuario que indica el instante a partir del cual los Token_Acceso son válidos; todo Token_Acceso emitido antes de la Marca_Invalidacion se considera inválido.

## Requirements

### Requirement 1: Solicitud de recuperación de contraseña

**User Story:** Como persona usuaria que olvidó su contraseña, quiero solicitar un enlace de recuperación introduciendo mi correo, para poder recuperar el acceso a mi cuenta.

#### Acceptance Criteria

1. WHEN una persona usuaria navega a la ruta `/forgot-password`, THE Pagina_Recuperacion SHALL mostrar un campo Correo electrónico vacío que acepte hasta 254 caracteres, un botón de envío habilitado y un enlace de regreso a la ruta `/login`.
2. WHEN una persona usuaria activa el enlace "¿Olvidaste tu contraseña?" en la Pagina_Login, THE Pagina_Login SHALL navegar a la ruta `/forgot-password`.
3. IF el campo Correo electrónico contiene un valor que no cumple el formato de correo electrónico (una parte local sin espacios ni "@", un único "@", un dominio con al menos un punto, una extensión de al menos 2 caracteres y sin dos puntos seguidos) al enviar el formulario o al perder el foco el campo, THEN THE Pagina_Recuperacion SHALL mostrar en el campo Correo electrónico un mensaje de error que indique que el formato de correo electrónico no es válido, SHALL impedir el envío de la solicitud y SHALL conservar el valor escrito en el campo.
4. IF el campo Correo electrónico está vacío o contiene solo espacios en blanco al enviar el formulario o al perder el foco el campo, THEN THE Pagina_Recuperacion SHALL mostrar en el campo Correo electrónico un mensaje de error que indique que el campo es obligatorio y SHALL impedir el envío de la solicitud.
5. WHEN una persona usuaria envía la Pagina_Recuperacion con un correo electrónico con formato válido, THE Pagina_Recuperacion SHALL invocar la función de recuperación de la Capa_API con el correo electrónico y, al recibir una respuesta satisfactoria, SHALL mostrar un mensaje de confirmación que indique que, si el correo está registrado, se enviará un enlace de recuperación; el mensaje y el comportamiento visible SHALL ser idénticos con independencia de si el correo corresponde a un Usuario existente.
6. IF la invocación de la función de recuperación de la Capa_API falla o no responde en 30 segundos, THEN THE Pagina_Recuperacion SHALL permanecer en la ruta `/forgot-password`, SHALL mostrar un mensaje de error que indique que no se pudo procesar la solicitud y que se puede reintentar, SHALL conservar el correo electrónico escrito en el campo y SHALL habilitar de nuevo el botón de envío.
7. WHILE una solicitud de recuperación está en curso, THE Pagina_Recuperacion SHALL deshabilitar el botón de envío e SHALL impedir envíos adicionales hasta que la solicitud finalice con respuesta satisfactoria, error o tiempo de espera agotado.
8. WHILE una solicitud de recuperación está en curso, THE Pagina_Recuperacion SHALL mostrar una indicación visible de que la solicitud se está procesando.

### Requirement 2: Generación y almacenamiento seguro del token de restablecimiento

**User Story:** Como responsable de la plataforma, quiero que los tokens de restablecimiento sean de un solo uso, de caducidad corta y almacenados de forma segura, para que un token filtrado tenga un impacto mínimo.

#### Acceptance Criteria

1. WHEN Backend_Auth recibe una petición `POST /auth/forgot-password` cuyo correo electrónico corresponde a un Usuario existente, THE Backend_Auth SHALL generar un Token_Restablecimiento aleatorio con al menos 32 bytes de entropía obtenidos de un generador criptográficamente seguro.
2. WHEN Backend_Auth genera un Token_Restablecimiento para un Usuario existente, THE Backend_Auth SHALL almacenar únicamente el hash del Token_Restablecimiento junto con su instante de caducidad y el identificador del Usuario, sin almacenar en ningún momento el Token_Restablecimiento en texto plano.
3. WHEN Backend_Auth genera y almacena un Token_Restablecimiento para un Usuario existente, THE Backend_Auth SHALL invocar al Servicio_Correo con el Enlace_Restablecimiento que incorpora el Token_Restablecimiento en texto plano.
4. THE Backend_Auth SHALL asignar a cada Token_Restablecimiento un instante de caducidad situado entre 15 y 30 minutos después de su generación.
5. IF Backend_Auth recibe una petición `POST /auth/forgot-password` cuyo correo electrónico no corresponde a ningún Usuario existente, THEN THE Backend_Auth SHALL responder con el código 200 y el mismo cuerpo de respuesta que para un correo existente, y SHALL no generar ningún Token_Restablecimiento ni invocar al Servicio_Correo.
6. WHEN Backend_Auth genera un Token_Restablecimiento nuevo para un Usuario, THE Backend_Auth SHALL invalidar cualquier Token_Restablecimiento anterior no usado y no caducado del mismo Usuario, de modo que como máximo exista 1 Token_Restablecimiento válido por Usuario.
7. IF Backend_Auth recibe una petición `POST /auth/forgot-password` cuyo correo electrónico tiene un formato inválido, THEN THE Backend_Auth SHALL rechazar la petición con un código de error 4xx y un cuerpo que indica que el formato del correo electrónico no es válido, sin generar ningún Token_Restablecimiento.
8. THE Backend_Auth SHALL responder a toda petición `POST /auth/forgot-password` con un correo electrónico de formato válido con el código 200 y un cuerpo de respuesta idéntico con independencia de si el correo electrónico corresponde a un Usuario existente.
9. WHERE el entorno de ejecución es de desarrollo, THE Servicio_Correo SHALL registrar el Enlace_Restablecimiento en la consola del servidor en lugar de enviar un correo electrónico real.
10. IF la entrega del Servicio_Correo falla, THEN THE Backend_Auth SHALL responder igualmente con el código 200 y el mismo cuerpo de respuesta, sin revelar el fallo al solicitante.

### Requirement 3: Restablecimiento de la contraseña mediante el token

**User Story:** Como persona usuaria con un enlace de recuperación, quiero definir una contraseña nueva desde ese enlace, para recuperar el acceso a mi cuenta.

#### Acceptance Criteria

1. WHEN una persona usuaria abre un Enlace_Restablecimiento cuyo Token_Restablecimiento tiene un hash que coincide con un registro no caducado y no usado, THE Pagina_Restablecimiento SHALL mostrar un campo Contraseña nueva, un campo de confirmación de la contraseña nueva, un control para alternar entre texto visible y oculto en el campo Contraseña nueva, y un botón de envío.
2. IF una persona usuaria abre un Enlace_Restablecimiento cuyo Token_Restablecimiento no coincide con ningún registro, o cuyo registro está caducado o ya usado, THEN THE Pagina_Restablecimiento SHALL mostrar una indicación de enlace inválido o caducado, SHALL no mostrar el campo Contraseña nueva ni el botón de envío, y SHALL ofrecer una acción para solicitar un nuevo enlace de recuperación.
3. IF el campo Contraseña nueva contiene un valor que incumple la Regla_Fortaleza (menos de 8 caracteres, más de 128 caracteres, ningún dígito o ninguna letra mayúscula) al enviar el formulario o al perder el foco el campo, THEN THE Pagina_Restablecimiento SHALL mostrar en el campo Contraseña nueva un mensaje de error que indique la regla incumplida y SHALL impedir el envío de la solicitud.
4. IF el valor del campo de confirmación de la contraseña nueva difiere del valor del campo Contraseña nueva al enviar el formulario, THEN THE Pagina_Restablecimiento SHALL mostrar un mensaje de error que indique que las contraseñas no coinciden y SHALL impedir el envío de la solicitud.
5. WHEN una persona usuaria envía la Pagina_Restablecimiento con una contraseña nueva que cumple la Regla_Fortaleza (entre 8 y 128 caracteres, al menos un dígito y al menos una letra mayúscula) y coincide con su confirmación, THE Pagina_Restablecimiento SHALL invocar la función de restablecimiento de la Capa_API con el Token_Restablecimiento y la contraseña nueva.
6. WHILE una solicitud de restablecimiento iniciada desde la Pagina_Restablecimiento está en curso, THE Pagina_Restablecimiento SHALL deshabilitar el botón de envío.
7. WHEN Backend_Auth recibe una petición `POST /auth/reset-password` con un Token_Restablecimiento cuyo hash coincide con un registro cuya antigüedad desde su emisión no supera los 30 minutos y que no ha sido usado, y una contraseña nueva que cumple la Regla_Fortaleza, THE Backend_Auth SHALL guardar el hash Argon2 de la contraseña nueva para el Usuario asociado, SHALL marcar ese Token_Restablecimiento como usado y SHALL responder con el código 200.
8. IF Backend_Auth recibe una petición `POST /auth/reset-password` con un Token_Restablecimiento cuyo hash no coincide con ningún registro, o cuyo registro tiene una antigüedad desde su emisión superior a 30 minutos, o que ya fue usado, THEN THE Backend_Auth SHALL responder con el código 400, SHALL incluir una indicación de token inválido o caducado, y SHALL no modificar la contraseña de ningún Usuario.
9. IF Backend_Auth recibe una petición `POST /auth/reset-password` con una contraseña nueva que incumple la Regla_Fortaleza (menos de 8 caracteres, más de 128 caracteres, ningún dígito o ninguna letra mayúscula), THEN THE Backend_Auth SHALL responder con un código de error de validación, SHALL incluir una indicación del campo inválido y SHALL no modificar la contraseña de ningún Usuario.
10. WHEN un Token_Restablecimiento ha sido usado una vez en una petición `POST /auth/reset-password` exitosa, THE Backend_Auth SHALL rechazar cualquier petición `POST /auth/reset-password` posterior que presente ese mismo Token_Restablecimiento con el código 400.
11. IF Backend_Auth recibe una petición `POST /auth/reset-password` cuyo Token_Restablecimiento es inválido, caducado o ya usado y cuya contraseña nueva incumple la Regla_Fortaleza de forma simultánea, THEN THE Backend_Auth SHALL priorizar la validación del Token_Restablecimiento respondiendo con el código 400 y una indicación de token inválido o caducado, y SHALL no modificar la contraseña de ningún Usuario.

### Requirement 4: Cambio de contraseña autenticado

**User Story:** Como persona usuaria con sesión iniciada, quiero cambiar mi contraseña desde mi perfil proporcionando la contraseña actual, para mantener la seguridad de mi cuenta sin salir de la aplicación.

#### Acceptance Criteria

1. WHILE una persona usuaria está en la Zona_Autenticada, THE Pagina_CambioContrasena SHALL mostrar un campo Contraseña actual, un campo Contraseña nueva, un campo de confirmación de la contraseña nueva y un botón de envío.
2. IF al enviar el formulario el campo Contraseña actual, el campo Contraseña nueva o el campo de confirmación de la contraseña nueva está vacío, THEN THE Pagina_CambioContrasena SHALL mostrar en cada campo vacío un mensaje de error que indique que el campo es obligatorio y SHALL impedir el envío de la solicitud.
3. IF el campo Contraseña nueva contiene un valor que no cumple la Regla_Fortaleza al enviar el formulario o al perder el foco el campo, THEN THE Pagina_CambioContrasena SHALL mostrar en el campo Contraseña nueva un mensaje de error que indique la regla incumplida y SHALL impedir el envío de la solicitud.
4. IF el valor del campo Contraseña nueva es igual al valor del campo Contraseña actual al enviar el formulario, THEN THE Pagina_CambioContrasena SHALL mostrar en el campo Contraseña nueva un mensaje de error que indique que la contraseña nueva debe ser distinta de la actual y SHALL impedir el envío de la solicitud.
5. IF el valor del campo de confirmación de la contraseña nueva difiere del valor del campo Contraseña nueva al enviar el formulario, THEN THE Pagina_CambioContrasena SHALL mostrar un mensaje de error que indique que las contraseñas no coinciden y SHALL impedir el envío de la solicitud.
6. WHEN una persona usuaria envía la Pagina_CambioContrasena con los campos válidos, THE Pagina_CambioContrasena SHALL invocar la función de cambio de contraseña de la Capa_API con la contraseña actual, la contraseña nueva y el Token_Acceso en la cabecera `Authorization` con el esquema `Bearer`.
7. WHEN Backend_Auth recibe una petición `POST /auth/change-password` autenticada con un Token_Acceso válido, una contraseña actual que coincide con el hash almacenado del Usuario, una contraseña nueva distinta de la actual y que cumple la Regla_Fortaleza, THE Backend_Auth SHALL guardar el hash Argon2 de la contraseña nueva y SHALL responder con el código 200.
8. WHEN Backend_Auth responde con el código 200 a una petición `POST /auth/change-password`, THE Pagina_CambioContrasena SHALL mostrar un mensaje de confirmación que indique que la contraseña se cambió correctamente.
9. IF Backend_Auth recibe una petición `POST /auth/change-password` cuya contraseña actual no coincide con el hash almacenado del Usuario, THEN THE Backend_Auth SHALL responder con el código 400, SHALL incluir una indicación de contraseña actual incorrecta y SHALL no modificar la contraseña del Usuario.
10. IF Backend_Auth recibe una petición `POST /auth/change-password` sin un Token_Acceso válido, THEN THE Backend_Auth SHALL responder con el código 401 y SHALL no modificar la contraseña de ningún Usuario.
11. IF Backend_Auth recibe una petición `POST /auth/change-password` con una contraseña nueva que no cumple la Regla_Fortaleza, donde la Regla_Fortaleza exige una longitud de 8 a 128 caracteres, al menos 1 número y al menos 1 letra mayúscula, THEN THE Backend_Auth SHALL responder con un código de error de validación, SHALL incluir una indicación del campo inválido y SHALL no modificar la contraseña del Usuario.

### Requirement 5: Invalidación de sesiones activas tras cambiar la contraseña

**User Story:** Como persona usuaria cuya cuenta pudo ser comprometida, quiero que al cambiar o restablecer mi contraseña se cierren todas las sesiones anteriores, para expulsar a cualquier atacante que tuviera un token activo.

#### Acceptance Criteria

1. WHEN Backend_Auth completa con éxito una petición `POST /auth/reset-password` para un Usuario, THE Backend_Auth SHALL actualizar la Marca_Invalidacion de ese Usuario al instante de la operación, expresado con precisión de milisegundos.
2. WHEN Backend_Auth completa con éxito una petición `POST /auth/change-password` para un Usuario, THE Backend_Auth SHALL actualizar la Marca_Invalidacion de ese Usuario al instante de la operación, expresado con precisión de milisegundos.
3. IF una petición `POST /auth/reset-password` o `POST /auth/change-password` para un Usuario no se completa con éxito, THEN THE Backend_Auth SHALL conservar sin cambios la Marca_Invalidacion previa de ese Usuario.
4. THE Backend_Auth SHALL incluir en cada Token_Acceso emitido el instante de emisión del Token_Acceso con precisión de milisegundos.
5. IF Backend_Auth recibe una petición autenticada cuyo Token_Acceso tiene un instante de emisión estrictamente anterior a la Marca_Invalidacion del Usuario asociado, THEN THE Backend_Auth SHALL rechazar la operación solicitada sin modificar ningún dato del Usuario, SHALL responder con el código 401 y SHALL incluir una indicación de error que señale que el Token_Acceso fue invalidado.
6. WHEN Backend_Auth recibe una petición autenticada cuyo Token_Acceso tiene un instante de emisión igual o posterior a la Marca_Invalidacion del Usuario asociado y cuyo instante de caducidad del Token_Acceso es posterior al instante actual, THE Backend_Auth SHALL aceptar el Token_Acceso como válido y SHALL procesar la operación solicitada.

### Requirement 6: Capa de API y experiencia de cliente para la gestión de contraseña

**User Story:** Como persona desarrolladora, quiero funciones de gestión de contraseña centralizadas en la Capa_API, para que las páginas de recuperación, restablecimiento y cambio compartan configuración y manejo de errores.

#### Acceptance Criteria

1. THE Capa_API SHALL exponer las funciones `requestPasswordReset()`, `resetPassword()` y `changePassword()` desde el directorio `src/lib`.
2. WHEN la función `requestPasswordReset()` es invocada, THE Capa_API SHALL enviar una petición `POST` a `/auth/forgot-password` con un cuerpo JSON que contiene el correo electrónico.
3. WHEN la función `resetPassword()` es invocada, THE Capa_API SHALL enviar una petición `POST` a `/auth/reset-password` con un cuerpo JSON que contiene el Token_Restablecimiento y la contraseña nueva.
4. WHEN la función `changePassword()` es invocada, THE Capa_API SHALL enviar una petición `POST` a `/auth/change-password` con un cuerpo JSON que contiene la contraseña actual y la contraseña nueva, incluyendo el Token_Acceso en la cabecera `Authorization` con el esquema `Bearer`.
5. WHEN la Capa_API construye la URL de una petición de gestión de contraseña, THE Capa_API SHALL anteponer el valor de NEXT_PUBLIC_API_URL a la ruta del endpoint.
6. IF NEXT_PUBLIC_API_URL no está definida o tiene un valor vacío al invocar cualquier función de gestión de contraseña, THEN THE Capa_API SHALL rechazar la invocación sin enviar la petición HTTP y SHALL devolver un mensaje de error que indique que la URL base del backend no está configurada.
7. IF una respuesta del Backend_Auth a una petición de gestión de contraseña tiene un código de estado de error y su cuerpo incluye el campo `detail`, THEN THE Capa_API SHALL devolver el mensaje de error contenido en el campo `detail`.
8. IF una respuesta del Backend_Auth a una petición de gestión de contraseña tiene un código de estado de error y su cuerpo no incluye el campo `detail`, THEN THE Capa_API SHALL devolver un mensaje de error genérico que indique que la operación no pudo completarse.
9. IF una petición de gestión de contraseña no recibe respuesta del Backend_Auth dentro de 30 segundos o la conexión de red falla, THEN THE Capa_API SHALL interrumpir la petición y SHALL devolver un mensaje de error que indique que el backend no está disponible.
10. WHEN el Contexto_Auth recibe confirmación de un cambio de contraseña exitoso a través de la Pagina_CambioContrasena, THE Contexto_Auth SHALL eliminar el Token_Acceso del almacenamiento del cliente.
11. WHEN el Contexto_Auth recibe confirmación de un cambio de contraseña exitoso a través de la Pagina_CambioContrasena, THE Contexto_Auth SHALL restablecer el estado de autenticación a no autenticado.

### Requirement 7: Rate limiting de solicitudes de recuperación

**User Story:** Como responsable de la plataforma, quiero limitar la frecuencia de solicitudes de recuperación, para reducir el abuso y los intentos de enumeración o de inundación de correos.

#### Acceptance Criteria

1. THE Backend_Auth SHALL aplicar una ventana deslizante de 15 minutos por cada dirección de correo electrónico, contabilizando todas las peticiones `POST /auth/forgot-password` recibidas para ese correo dentro de los 900 segundos previos a cada nueva petición.
2. WHILE el número de peticiones `POST /auth/forgot-password` asociadas a un mismo correo electrónico dentro de la ventana deslizante de 15 minutos es menor o igual a 5, THE Backend_Auth SHALL procesar la petición con normalidad y SHALL generar como máximo un Token_Restablecimiento por petición procesada.
3. IF Backend_Auth recibe una petición `POST /auth/forgot-password` asociada a un correo electrónico que ya acumula 5 peticiones dentro de la ventana deslizante de 15 minutos, THEN THE Backend_Auth SHALL rechazar la petición excedente con el código de estado 429, SHALL no generar ningún Token_Restablecimiento adicional para esa petición y SHALL incluir una indicación del tiempo de reintento en segundos tras el cual el correo volverá a estar por debajo del límite.
4. THE Backend_Auth SHALL mantener la respuesta de rate limiting indistinguible entre correos electrónicos existentes e inexistentes, devolviendo el mismo código de estado, el mismo cuerpo de respuesta y un tiempo de respuesta cuya diferencia no permita a un Usuario inferir si un correo corresponde a un Usuario existente.

## Notas de mejoras futuras

- **Proveedor de correo real**: la integración con SendGrid, Resend o SMTP se implementará sustituyendo la implementación de desarrollo del Servicio_Correo que hoy registra el Enlace_Restablecimiento en consola.
- **Notificación de cambio de contraseña**: enviar un correo informativo cuando la contraseña cambia queda como mejora futura.
- **Cookie `httpOnly` y denylist de tokens por `jti`**: endurecer el almacenamiento del Token_Acceso y adoptar una lista de revocación por identificador de token son mejoras futuras; esta versión invalida sesiones mediante la Marca_Invalidacion temporal por Usuario.
- **Autenticación multifactor (MFA)**: fuera del alcance de esta versión.
