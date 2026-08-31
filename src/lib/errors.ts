/**
 * Traduccion de errores a mensajes para personas.
 *
 * Regla: nunca devolver el texto crudo de Supabase ni de Postgres, ni sus
 * codigos internos. Lo que no este mapeado cae en un mensaje generico.
 */

/** Forma comun de AuthError y PostgrestError, que es lo unico que necesitamos. */
export type SupabaseErrorLike = {
  code?: string | null;
  status?: number;
  message?: string;
};

const GENERIC = "Algo ha salido mal. Vuelve a intentarlo en un momento.";

function match(message: string, table: Array<[string, string]>): string {
  const lower = message.toLowerCase();
  for (const [needle, friendly] of table) {
    if (lower.includes(needle)) return friendly;
  }
  return GENERIC;
}

/**
 * Mensajes por codigo de error de Supabase Auth. Los codigos son estables; el
 * texto de `message` es libre y puede cambiar sin aviso, asi que esta tabla
 * manda sobre la de mensajes.
 */
const AUTH_CODE_MESSAGES: Record<string, string> = {
  invalid_credentials: "Email o contraseña incorrectos.",
  email_not_confirmed: "Todavía no has confirmado tu correo. Revisa tu bandeja de entrada.",
  user_already_exists: "Ya existe una cuenta con ese email. Inicia sesión.",
  email_exists: "Ya existe una cuenta con ese email. Inicia sesión.",
  user_not_found: "Email o contraseña incorrectos.",
  user_banned: "Esta cuenta no está disponible.",
  email_address_invalid: "Ese email no parece válido.",
  email_address_not_authorized: "No podemos enviar correo a esa dirección.",
  validation_failed: "Revisa los datos: algo no es válido.",
  weak_password: "Elige una contraseña más segura.",
  same_password: "La nueva contraseña tiene que ser distinta de la actual.",
  signup_disabled: "El registro está desactivado en este momento.",
  email_provider_disabled: "El acceso con email está desactivado en este momento.",
  // No es culpa de quien se registra: es la cuota de envio de correo del
  // proyecto, compartida por todos. El mensaje no debe sugerir lo contrario.
  over_email_send_rate_limit:
    "No hemos podido enviar el correo de confirmación ahora mismo. Inténtalo dentro de un rato.",
  over_request_rate_limit: "Demasiadas peticiones. Espera un momento y vuelve a probar.",
};

/**
 * Traduce un error de Supabase Auth. Prioriza `code`; si no lo trae (errores de
 * red de la propia libreria), cae en unas pocas coincidencias por mensaje, y de
 * ahi al generico.
 */
export function friendlyAuthError(error: SupabaseErrorLike | null): string {
  if (!error) return GENERIC;

  if (error.code) {
    const byCode = AUTH_CODE_MESSAGES[error.code];
    if (byCode) return byCode;
  }

  return match(error.message ?? "", [
    ["fetch failed", "No hemos podido conectar. Comprueba tu conexión."],
    ["failed to fetch", "No hemos podido conectar. Comprueba tu conexión."],
    ["network", "No hemos podido conectar. Comprueba tu conexión."],
    ["timeout", "La conexión ha tardado demasiado. Vuelve a intentarlo."],
  ]);
}

export function friendlyCoupleError(message: string): string {
  return match(message, [
    ["ya perteneces a una pareja", "Ya formas parte de una pareja. Solo puedes estar en una."],
    ["invitacion no valida", "Esta invitación no es válida, ya se ha usado o ha caducado."],
    ["ya esta completa", "Esa pareja ya tiene sus dos miembros."],
    ["no perteneces a ninguna pareja", "Primero tienes que crear tu pareja."],
    ["autenticacion requerida", "Tu sesión ha caducado. Vuelve a entrar."],
    ["duplicate key", "Esa invitación ya se ha utilizado."],
    ["fetch failed", "No hemos podido conectar. Comprueba tu conexión."],
    ["network", "No hemos podido conectar. Comprueba tu conexión."],
  ]);
}

export function friendlyWishError(message: string): string {
  return match(message, [
    // FK compuesta (occasion_id, owner_id) -> occasions(id, owner_id).
    ["wishlist_items_occasion_same_owner", "Esa ocasión no es tuya."],
    ["violates foreign key", "Esa ocasión ya no existe."],
    ["violates row-level security", "No puedes modificar ese deseo."],
    ["wishlist_items_title_check", "El nombre del deseo no es válido."],
    ["price_cents", "Ese precio no es válido."],
    ["currency", "Esa moneda no es válida."],
    ["violates check constraint", "Algún dato del deseo no es válido."],
    ["fetch failed", "No hemos podido conectar. Comprueba tu conexión."],
    ["network", "No hemos podido conectar. Comprueba tu conexión."],
  ]);
}

export { GENERIC as genericError };
