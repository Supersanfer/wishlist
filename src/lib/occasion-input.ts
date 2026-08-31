export type OccasionFields = { name: string; occasion_date: string };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Valida nombre y fecha con los mismos limites que el esquema. */
export function parseOccasionForm(
  formData: FormData,
): { fields: OccasionFields } | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "La ocasión necesita un nombre." };
  if (name.length > 80) return { error: "Ese nombre es demasiado largo (máximo 80)." };

  const date = String(formData.get("occasion_date") ?? "").trim();
  if (!ISO_DATE.test(date)) return { error: "Elige una fecha válida." };
  // Descarta fechas imposibles como 2026-02-31, que el regex si acepta.
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    return { error: "Elige una fecha válida." };
  }

  return { fields: { name, occasion_date: date } };
}

/**
 * Formatea una fecha `date` de Postgres. Se fuerza UTC porque la columna no
 * lleva zona horaria y convertirla a local puede desplazarla un dia.
 */
export function formatOccasionDate(date: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
