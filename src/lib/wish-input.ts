import { Constants } from "@/types/database";
import type { Enums } from "@/types/database";

export type WishPriority = Enums<"wish_priority">;

export const PRIORITIES: readonly WishPriority[] = Constants.public.Enums.wish_priority;

export const PRIORITY_LABEL: Record<WishPriority, string> = {
  low: "Estaría bien",
  medium: "Me gusta",
  high: "Me encanta",
};

export const CURRENCIES = ["EUR", "USD", "GBP"] as const;

/** Campos normalizados, listos para insertar o actualizar. */
export type WishFields = {
  title: string;
  description: string | null;
  url: string | null;
  price_cents: number | null;
  currency: string;
  priority: WishPriority;
  occasion_id: string | null;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function field(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

/**
 * Valida y normaliza el formulario en el servidor. No se apoya en la validacion
 * del navegador: los mismos limites que el esquema (longitudes, precio no
 * negativo, esquema http/https) se comprueban aqui, y Postgres los vuelve a
 * comprobar con sus CHECK.
 *
 * La pertenencia de la ocasion NO se valida aqui: la garantiza la clave foranea
 * compuesta (occasion_id, owner_id) -> occasions(id, owner_id).
 */
export function parseWishForm(formData: FormData): { fields: WishFields } | { error: string } {
  const title = field(formData, "title");
  if (!title) return { error: "El deseo necesita un nombre." };
  if (title.length > 200) return { error: "El nombre es demasiado largo (máximo 200)." };

  const rawDescription = field(formData, "description");
  if (rawDescription.length > 2000) {
    return { error: "La descripción es demasiado larga (máximo 2000)." };
  }

  const rawUrl = field(formData, "url");
  let url: string | null = null;
  if (rawUrl) {
    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      return { error: "Ese enlace no es válido. Debe empezar por http:// o https://" };
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { error: "Ese enlace no es válido. Debe empezar por http:// o https://" };
    }
    url = parsed.toString();
  }

  const rawPrice = field(formData, "price").replace(",", ".");
  let priceCents: number | null = null;
  if (rawPrice) {
    const value = Number(rawPrice);
    if (!Number.isFinite(value)) return { error: "Ese precio no es un número." };
    if (value < 0) return { error: "El precio no puede ser negativo." };
    priceCents = Math.round(value * 100);
    if (priceCents > 2_000_000_000) return { error: "Ese precio es demasiado alto." };
  }

  const currency = field(formData, "currency").toUpperCase() || "EUR";
  if (!/^[A-Z]{3}$/.test(currency)) return { error: "Esa moneda no es válida." };

  const priority = field(formData, "priority") as WishPriority;
  if (!PRIORITIES.includes(priority)) return { error: "Esa prioridad no es válida." };

  const rawOccasion = field(formData, "occasion_id");
  if (rawOccasion && !UUID.test(rawOccasion)) return { error: "Esa ocasión no es válida." };

  return {
    fields: {
      title,
      description: rawDescription || null,
      url,
      price_cents: priceCents,
      currency,
      priority,
      occasion_id: rawOccasion || null,
    },
  };
}

/** Formatea un precio guardado en centimos. */
export function formatPrice(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(cents / 100);
  } catch {
    // Moneda desconocida para Intl: mejor algo legible que una excepcion.
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}
