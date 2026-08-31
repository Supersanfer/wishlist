export type FlashParams = { [key: string]: string | string[] | undefined };

/** Traduce un `?creado=1` de la URL al aviso que toca mostrar. */
export function flashMessage(
  params: FlashParams,
  table: Record<string, string>,
): string | null {
  for (const [key, message] of Object.entries(table)) {
    if (params[key] === "1") return message;
  }
  return null;
}
