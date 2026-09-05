import { Constants } from "@/types/database";
import type { Enums } from "@/types/database";
import { normalizeHttpUrl } from "@/lib/url";

export type WishPriority = Enums<"wish_priority">;

export const PRIORITIES: readonly WishPriority[] = Constants.public.Enums.wish_priority;

export const PRIORITY_LABEL: Record<WishPriority, string> = {
  low: "Estaría bien",
  medium: "Me gusta",
  high: "Me encanta",
};

export const CURRENCIES = ["EUR", "USD", "GBP"] as const;

/** Campos que comparten la wishlist personal y la conjunta. */
export type ItemFields = {
  title: string;
  description: string | null;
  url: string | null;
  image_url: string | null;
  image_path: string | null;
  price_cents: number | null;
  currency: string;
};

/** Campos de un deseo personal: los comunes mas prioridad y ocasion. */
export type WishFields = ItemFields & {
  priority: WishPriority;
  occasion_id: string | null;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function field(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

/**
 * Acepta el precio tal y como se escribe en español: "199,00", "1.299,50",
 * "199 €" o "199.5". Se queda con el ultimo separador como decimal.
 */
function parsePrice(raw: string): { cents: number | null } | { error: string } {
  const cleaned = raw.replace(/[^\d.,-]/g, "");
  if (!cleaned) return { cents: null };

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  const decimalAt = Math.max(lastComma, lastDot);

  const normalised =
    decimalAt === -1
      ? cleaned.replace(/[.,]/g, "")
      : `${cleaned.slice(0, decimalAt).replace(/[.,]/g, "")}.${cleaned.slice(decimalAt + 1)}`;

  const value = Number(normalised);
  if (!Number.isFinite(value)) return { error: "Ese precio no es un número." };
  if (value < 0) return { error: "El precio no puede ser negativo." };

  const cents = Math.round(value * 100);
  if (cents > 2_000_000_000) return { error: "Ese precio es demasiado alto." };
  return { cents };
}

/**
 * Valida y normaliza los campos comunes en el servidor. No se apoya en la
 * validacion del navegador: los mismos limites que el esquema (longitudes,
 * precio no negativo, esquema http/https) se comprueban aqui, y Postgres los
 * vuelve a comprobar con sus CHECK.
 */
export function parseItemForm(formData: FormData): { fields: ItemFields } | { error: string } {
  const title = field(formData, "title");
  if (!title) return { error: "Necesita un nombre." };
  if (title.length > 200) return { error: "El nombre es demasiado largo (máximo 200)." };

  const description = field(formData, "description");
  if (description.length > 2000) {
    return { error: "La descripción es demasiado larga (máximo 2000)." };
  }

  const url = normalizeHttpUrl(field(formData, "url"));
  if ("error" in url) return { error: url.error };

  const imageUrl = normalizeHttpUrl(field(formData, "image_url"));
  if ("error" in imageUrl) {
    return { error: "Esa URL de imagen no es válida. Debe empezar por http:// o https://" };
  }

  const price = parsePrice(field(formData, "price"));
  if ("error" in price) return { error: price.error };

  const currency = field(formData, "currency").toUpperCase() || "EUR";
  if (!/^[A-Z]{3}$/.test(currency)) return { error: "Esa moneda no es válida." };

  return {
    fields: {
      title,
      description: description || null,
      url: url.url,
      image_url: imageUrl.url,
      image_path: null,
      price_cents: price.cents,
      currency,
    },
  };
}

/**
 * Valida el formulario de un deseo personal. Añade prioridad y ocasion a los
 * campos comunes.
 *
 * La pertenencia de la ocasion NO se valida aqui: la garantiza la clave foranea
 * compuesta (occasion_id, owner_id) -> occasions(id, owner_id).
 */
export function parseWishForm(formData: FormData): { fields: WishFields } | { error: string } {
  const common = parseItemForm(formData);
  if ("error" in common) return common;

  const priority = field(formData, "priority") as WishPriority;
  if (!PRIORITIES.includes(priority)) return { error: "Esa prioridad no es válida." };

  const rawOccasion = field(formData, "occasion_id");
  if (rawOccasion && !UUID.test(rawOccasion)) return { error: "Esa ocasión no es válida." };

  return { fields: { ...common.fields, priority, occasion_id: rawOccasion || null } };
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
