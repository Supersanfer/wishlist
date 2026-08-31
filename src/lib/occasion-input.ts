export type OccasionFields = { name: string; occasion_date: string };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Valida nombre y fecha con los mismos límites que el esquema. */
export function parseOccasionForm(
  formData: FormData,
): { fields: OccasionFields } | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "La ocasión necesita un nombre." };
  if (name.length > 80) return { error: "Ese nombre es demasiado largo (máximo 80)." };

  const date = String(formData.get("occasion_date") ?? "").trim();
  if (!ISO_DATE.test(date)) return { error: "Elige una fecha válida." };
  // Descarta fechas imposibles como 2026-02-31, que el regex sí acepta.
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    return { error: "Elige una fecha válida." };
  }

  return { fields: { name, occasion_date: date } };
}

/**
 * Días hasta la próxima vez que caiga la fecha.
 *
 * Las ocasiones se tratan como anuales (cumpleaños, Navidad, aniversario): lo
 * que importa no es el año en que se apuntó, sino cuándo toca la siguiente. Todo
 * en UTC, porque la columna es `date` y convertir a local desplazaría un día.
 */
export function daysUntil(occasionDate: string, today = new Date()): number {
  const [, month, day] = occasionDate.split("-").map(Number);
  const todayUtc = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );

  let next = Date.UTC(today.getUTCFullYear(), month - 1, day);
  if (next < todayUtc) next = Date.UTC(today.getUTCFullYear() + 1, month - 1, day);

  return Math.round((next - todayUtc) / 86_400_000);
}

/** "5 de agosto", sin año: la ocasión se repite. */
export function formatOccasionDate(date: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

/** Lo único accionable de una ocasión: cuánto queda. */
export function countdownLabel(days: number): string {
  if (days === 0) return "hoy";
  if (days === 1) return "mañana";
  if (days < 30) return `en ${days} días`;
  if (days < 60) return "en un mes";
  return `en ${Math.round(days / 30)} meses`;
}
