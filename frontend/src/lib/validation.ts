/**
 * Funciones puras de validación de formularios de autenticación.
 *
 * Centraliza la lógica de validación en cliente usada por la Pagina_Registro y
 * la Pagina_Login. Todas las funciones son puras (sin efectos secundarios) para
 * poder verificarlas con pruebas basadas en propiedades (fast-check).
 *
 * Cubre:
 *  - Validación de formato de correo electrónico (Requirements 3.1, 3.2).
 *  - Validación de longitud de contraseña, 8–128 caracteres (Requirement 3.3).
 *  - Campos requeridos vacíos o solo espacios (Requirements 3.4, 3.5).
 *  - Limpieza de error al revalidar un campo corregido (Requirement 3.6).
 *  - Cálculo del porcentaje completado del formulario (Requirement 3.7).
 */

/** Límites de longitud de contraseña según el diseño. */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

/** Mensajes de error de validación en cliente. */
export const VALIDATION_MESSAGES = {
  emailInvalid: "Ingresa un correo válido.",
  passwordLength: `Usa entre ${PASSWORD_MIN_LENGTH} y ${PASSWORD_MAX_LENGTH} caracteres.`,
  passwordNumber: "Incluye al menos 1 número.",
  passwordUppercase: "Incluye al menos 1 mayúscula.",
  required: "Por favor, diligencia este campo.",
  selectRequired: "Por favor, selecciona un elemento de la lista.",
} as const;

/**
 * Expresión regular de formato de correo electrónico.
 *
 * Requiere una parte local no vacía sin espacios ni `@`, un `@`, un dominio con
 * al menos un punto y un TLD de 2 o más letras. Es intencionadamente estricta
 * para rechazar casos como "sin-arroba", "sin@dominio" o "a@b" (sin TLD).
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Indica si una cadena está "vacía" a efectos de campos requeridos: cadena vacía
 * o compuesta únicamente por espacios en blanco.
 */
export function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

/**
 * Valida el formato de un correo electrónico.
 *
 * @returns `true` si el valor cumple el formato de correo, `false` en caso contrario.
 *
 * Validates: Requirements 3.1, 3.2
 */
export function isValidEmail(value: string): boolean {
  // Dos puntos seguidos nunca son válidos en un correo (p. ej. "a@b..com").
  return EMAIL_REGEX.test(value) && !value.includes("..");
}

/**
 * Devuelve el mensaje de error para el campo Correo electrónico, o `null` si es válido.
 *
 * Un correo vacío/solo espacios se trata como campo obligatorio; un correo con
 * formato incorrecto devuelve el mensaje de formato inválido.
 *
 * Validates: Requirements 3.1, 3.2
 */
export function validateEmail(value: string): string | null {
  if (isBlank(value)) {
    return VALIDATION_MESSAGES.required;
  }
  if (isValidEmail(value)) {
    return null;
  }

  // Mensajes específicos según lo que falte, para guiar al usuario mientras
  // corrige. La regla de validez sigue siendo `isValidEmail`; esto solo elige
  // el texto del error. Se revisa de izquierda a derecha: espacios, '@',
  // dominio (gmail, hotmail...), punto y extensión (.com, .co, .es...).
  if (/\s/.test(value)) {
    return "El correo no puede tener espacios.";
  }

  const email = value;
  const atCount = email.split("@").length - 1;
  if (atCount > 1) {
    return "Solo puede haber un '@'.";
  }

  const atIndex = email.indexOf("@");
  if (atIndex === -1) {
    return `Falta el '@' en el correo: ${email}@`;
  }
  if (atIndex === 0) {
    return "Falta el texto antes del '@'.";
  }
  if (atIndex === email.length - 1) {
    return "Falta el dominio después del '@'.";
  }

  // Dominio: lo que sigue al '@' (por ejemplo "gmail.com").
  const domain = email.slice(atIndex + 1);
  if (domain.startsWith(".")) {
    return "Falta el dominio antes del '.'.";
  }
  if (!domain.includes(".")) {
    return "Después del dominio falta el '.' y la extensión, por ejemplo .com";
  }
  if (domain.endsWith(".")) {
    return "Falta la extensión, por ejemplo .com";
  }

  if (email.includes("..")) {
    return "No puede haber dos puntos seguidos.";
  }

  // Extensión: lo que sigue al último punto. Debe tener al menos 2 caracteres.
  const extension = domain.slice(domain.lastIndexOf(".") + 1);
  if (extension.length < 2) {
    return "La extensión debe tener al menos 2 letras.";
  }

  // Red de seguridad: no debería alcanzarse porque los casos anteriores cubren
  // todo lo que rechaza `isValidEmail`.
  return VALIDATION_MESSAGES.emailInvalid;
}

/**
 * Valida la longitud de una contraseña.
 *
 * @returns `true` si la longitud está en el rango [8, 128], `false` en caso contrario.
 *
 * Validates: Requirements 3.3
 */
export function isValidPasswordLength(value: string): boolean {
  return value.length >= PASSWORD_MIN_LENGTH && value.length <= PASSWORD_MAX_LENGTH;
}

/**
 * Devuelve el mensaje de error para el campo Contraseña, o `null` si es válido.
 *
 * Una contraseña vacía se trata como campo obligatorio; una contraseña fuera del
 * rango [8, 128] devuelve el mensaje de longitud.
 *
 * Validates: Requirements 3.3, 3.5
 */
export function validatePassword(value: string): string | null {
  if (value.length === 0) {
    return VALIDATION_MESSAGES.required;
  }
  if (!isValidPasswordLength(value)) {
    return VALIDATION_MESSAGES.passwordLength;
  }
  // Longitud correcta: se indica el primer requisito pendiente.
  if (!/\d/.test(value)) {
    return VALIDATION_MESSAGES.passwordNumber;
  }
  if (!/\p{Lu}/u.test(value)) {
    return VALIDATION_MESSAGES.passwordUppercase;
  }
  return null;
}

/** Estado de cada requisito de la contraseña de registro (checklist en vivo). */
export interface PasswordRequirements {
  /** Entre 8 y 128 caracteres. */
  length: boolean;
  /** Al menos un número. */
  number: boolean;
  /** Al menos una letra mayúscula. */
  uppercase: boolean;
}

/**
 * Evalúa qué requisitos cumple una contraseña. Alimenta el checklist que se
 * muestra bajo el campo en el registro y comparte las reglas con
 * `validatePassword`.
 */
export function passwordRequirements(value: string): PasswordRequirements {
  return {
    length: isValidPasswordLength(value),
    number: /\d/.test(value),
    uppercase: /\p{Lu}/u.test(value),
  };
}

/**
 * Valida un campo requerido genérico (Nombre, Apellido, Nivel_Ingles, etc.).
 *
 * @returns el mensaje de obligatoriedad si el valor está vacío o es solo espacios,
 *          o `null` si contiene algún carácter no en blanco.
 *
 * Validates: Requirements 3.4, 3.5
 */
export function validateRequired(value: string): string | null {
  return isBlank(value) ? VALIDATION_MESSAGES.required : null;
}

/** Nombre de cada campo requerido del formulario de registro. */
export type RegisterFieldName =
  | "first_name"
  | "last_name"
  | "email"
  | "password"
  | "english_level";

/** Nombre de cada campo requerido del formulario de login. */
export type LoginFieldName = "email" | "password";

/**
 * Mapa de errores por campo. Una clave ausente (o con valor `null`) significa que
 * el campo no tiene error.
 */
export type FieldErrors<K extends string> = Partial<Record<K, string>>;

/** Valores de los campos del formulario de registro. */
export interface RegisterFormValues {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  english_level: string;
}

/** Valores de los campos del formulario de login. */
export interface LoginFormValues {
  email: string;
  password: string;
}

/**
 * Lista ordenada de campos requeridos del formulario de registro. Se usa también
 * para el cálculo del porcentaje completado (Requirement 3.7).
 */
export const REGISTER_REQUIRED_FIELDS: readonly RegisterFieldName[] = [
  "first_name",
  "last_name",
  "email",
  "password",
  "english_level",
];

/** Lista ordenada de campos requeridos del formulario de login. */
export const LOGIN_REQUIRED_FIELDS: readonly LoginFieldName[] = ["email", "password"];

/**
 * Valida un único campo de registro y devuelve su mensaje de error o `null`.
 *
 * Aplica la regla específica de cada campo: formato para `email`, longitud para
 * `password` y obligatoriedad para el resto.
 *
 * Validates: Requirements 3.1, 3.3, 3.4
 */
export function validateRegisterField(
  field: RegisterFieldName,
  value: string,
): string | null {
  switch (field) {
    case "email":
      return validateEmail(value);
    case "password":
      return validatePassword(value);
    case "first_name":
    case "last_name":
      return validateRequired(value);
    case "english_level":
      // Es un selector: sin opción elegida se pide seleccionar de la lista.
      return isBlank(value) ? VALIDATION_MESSAGES.selectRequired : null;
    default: {
      // Exhaustividad: si se añade un campo nuevo, TypeScript avisará aquí.
      const _exhaustive: never = field;
      return _exhaustive;
    }
  }
}

/**
 * Valida un único campo de login y devuelve su mensaje de error o `null`.
 *
 * Validates: Requirements 3.2, 3.5
 */
export function validateLoginField(field: LoginFieldName, value: string): string | null {
  switch (field) {
    case "email":
      return validateEmail(value);
    case "password":
      // En login no se valida el rango de longitud, solo la obligatoriedad.
      return validateRequired(value);
    default: {
      const _exhaustive: never = field;
      return _exhaustive;
    }
  }
}

/**
 * Valida todos los campos del formulario de registro.
 *
 * Devuelve un mapa con un mensaje de error por cada campo inválido. El formulario
 * puede enviarse si y solo si el mapa resultante está vacío.
 *
 * Validates: Requirements 3.1, 3.3, 3.4
 */
export function validateRegisterForm(
  values: RegisterFormValues,
): FieldErrors<RegisterFieldName> {
  const errors: FieldErrors<RegisterFieldName> = {};
  for (const field of REGISTER_REQUIRED_FIELDS) {
    const error = validateRegisterField(field, values[field]);
    if (error !== null) {
      errors[field] = error;
    }
  }
  return errors;
}

/**
 * Valida todos los campos del formulario de login.
 *
 * Validates: Requirements 3.2, 3.5
 */
export function validateLoginForm(values: LoginFormValues): FieldErrors<LoginFieldName> {
  const errors: FieldErrors<LoginFieldName> = {};
  for (const field of LOGIN_REQUIRED_FIELDS) {
    const error = validateLoginField(field, values[field]);
    if (error !== null) {
      errors[field] = error;
    }
  }
  return errors;
}

/**
 * Indica si un mapa de errores permite enviar el formulario (no hay errores).
 */
export function canSubmit<K extends string>(errors: FieldErrors<K>): boolean {
  return Object.values(errors).every((message) => message == null);
}

/**
 * Revalida un campo corregido y devuelve el mapa de errores actualizado.
 *
 * Si el nuevo valor del campo es válido, su error se elimina del mapa; si sigue
 * siendo inválido, se actualiza con el mensaje correspondiente. No muta el mapa
 * de entrada (devuelve una copia nueva).
 *
 * Validates: Requirements 3.6
 */
export function revalidateRegisterField(
  errors: FieldErrors<RegisterFieldName>,
  field: RegisterFieldName,
  value: string,
): FieldErrors<RegisterFieldName> {
  return applyFieldValidation(errors, field, validateRegisterField(field, value));
}

/**
 * Revalida un campo corregido del formulario de login.
 *
 * Validates: Requirements 3.6
 */
export function revalidateLoginField(
  errors: FieldErrors<LoginFieldName>,
  field: LoginFieldName,
  value: string,
): FieldErrors<LoginFieldName> {
  return applyFieldValidation(errors, field, validateLoginField(field, value));
}

/**
 * Aplica el resultado de validar un campo a una copia del mapa de errores:
 * elimina la clave si el campo es válido (`null`) o la fija al mensaje de error.
 */
function applyFieldValidation<K extends string>(
  errors: FieldErrors<K>,
  field: K,
  error: string | null,
): FieldErrors<K> {
  const next: FieldErrors<K> = { ...errors };
  if (error === null) {
    delete next[field];
  } else {
    next[field] = error;
  }
  return next;
}

/**
 * Calcula el porcentaje de campos requeridos del registro con un valor no vacío.
 *
 * El resultado es `(campos no vacíos / total de campos requeridos) * 100`, un
 * número entre 0 y 100. Un campo se considera completado si no está vacío ni es
 * solo espacios en blanco.
 *
 * Validates: Requirements 3.7
 */
export function completionPercentage(values: RegisterFormValues): number {
  const total = REGISTER_REQUIRED_FIELDS.length;
  if (total === 0) {
    return 100;
  }
  const filled = REGISTER_REQUIRED_FIELDS.filter(
    (field) => !isBlank(values[field]),
  ).length;
  return (filled / total) * 100;
}
