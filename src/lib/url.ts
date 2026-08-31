/**
 * Utilidades de URL, centralizadas para que la validación y la forma en que se
 * pinta un enlace vivan en un único sitio. Sólo se admiten http/https: cualquier
 * otro esquema (`javascript:`, `data:`, `file:`…) se rechaza tanto al guardar
 * como al renderizar, en defensa por capas.
 */

/**
 * Normaliza una URL http/https, o devuelve el motivo por el que no vale.
 * Es la puerta de entrada del servidor: los mismos límites que el esquema
 * (esquema http/https) se comprueban aquí, y Postgres los revalida con su CHECK.
 */
export function normalizeHttpUrl(raw: string): { url: string | null } | { error: string } {
  if (!raw) return { url: null };
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { error: "Ese enlace no es válido. Debe empezar por http:// o https://" };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { error: "Ese enlace no es válido. Debe empezar por http:// o https://" };
  }
  return { url: parsed.toString() };
}

/**
 * Devuelve la URL sólo si es un enlace http/https seguro para navegar; si no,
 * `undefined`. Se usa al pintar: aunque lo guardado ya esté validado, un `href`
 * nunca debe poder llevar un esquema peligroso.
 */
export function safeExternalHref(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const result = normalizeHttpUrl(url);
  return "url" in result && result.url ? result.url : undefined;
}

/** El dominio dice más que la URL entera y no rompe el ancho de la línea. */
export function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
