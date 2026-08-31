/**
 * Traduccion de errores a mensajes para personas.
 *
 * Regla: nunca devolver el texto crudo de Supabase ni de Postgres. Lo que no
 * este mapeado cae en un mensaje generico.
 */

const GENERIC = "Algo ha salido mal. Vuelve a intentarlo en un momento.";

function match(message: string, table: Array<[string, string]>): string {
  const lower = message.toLowerCase();
  for (const [needle, friendly] of table) {
    if (lower.includes(needle)) return friendly;
  }
  return GENERIC;
}

export function friendlyAuthError(message: string): string {
  return match(message, [
    ["invalid login credentials", "Email o contraseña incorrectos."],
    ["email not confirmed", "Todavía no has confirmado tu correo. Revisa tu bandeja de entrada."],
    ["user already registered", "Ya existe una cuenta con ese email. Inicia sesión."],
    ["already been registered", "Ya existe una cuenta con ese email. Inicia sesión."],
    ["password should be", "La contraseña es demasiado corta."],
    ["weak password", "Elige una contraseña más segura."],
    ["unable to validate email", "Ese email no parece válido."],
    ["invalid email", "Ese email no parece válido."],
    ["rate limit", "Demasiados intentos. Espera un minuto y vuelve a probar."],
    ["for security purposes", "Demasiados intentos. Espera un minuto y vuelve a probar."],
    ["signups not allowed", "El registro está desactivado en este momento."],
    ["fetch failed", "No hemos podido conectar. Comprueba tu conexión."],
    ["network", "No hemos podido conectar. Comprueba tu conexión."],
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

export { GENERIC as genericError };
