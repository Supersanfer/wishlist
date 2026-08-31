import type { SupabaseErrorLike } from "@/lib/errors";

/** Sustituye cualquier email por un marcador: los logs no deben llevar PII. */
function redact(message: string): string {
  return message.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "<email>");
}

/**
 * Registra un error de Supabase en el log del servidor (Vercel) antes de que se
 * traduzca a un mensaje para la persona usuaria.
 *
 * Solo se emite lo necesario para diagnosticar: operacion, codigo, status y
 * mensaje con los emails ocultos. Nunca contraseñas, cookies, tokens ni claves.
 */
export function logSupabaseError(operation: string, error: SupabaseErrorLike | null): void {
  console.error(
    `[supabase] ${operation}`,
    JSON.stringify({
      code: error?.code ?? null,
      status: error?.status ?? null,
      message: error?.message ? redact(error.message) : null,
    }),
  );
}
