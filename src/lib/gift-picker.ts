import type { WishPriority } from "@/lib/wish-input";

/**
 * "Elige por mí": lógica pura de selección de un regalo entre los deseos de la
 * pareja. Sin IA y sin estado en servidor —sólo un sorteo ponderado sobre los
 * deseos que el usuario YA puede ver en /partner—. Al ser pura y con el
 * generador aleatorio inyectable, se prueba de forma determinista.
 */

export type Budget = "any" | "under-30" | "mid" | "over-75";

/** Opciones de presupuesto, en orden de aparición. "Me da igual" es el defecto. */
export const BUDGETS: readonly { value: Budget; label: string }[] = [
  { value: "any", label: "Me da igual" },
  { value: "under-30", label: "Menos de 30 €" },
  { value: "mid", label: "30–75 €" },
  { value: "over-75", label: "Más de 75 €" },
];

/**
 * Peso por prioridad: un deseo de prioridad alta sale más veces que uno medio,
 * y éste más que uno bajo, pero ninguno queda excluido. No se muestra al usuario.
 */
export const PRIORITY_WEIGHT: Record<WishPriority, number> = {
  high: 5,
  medium: 3,
  low: 1,
};

const UNDER_CENTS = 3000; // 30,00 €
const OVER_CENTS = 7500; // 75,00 €

/** Datos mínimos que la selección necesita de cada deseo. */
export type GiftCandidate = {
  id: string;
  priority: WishPriority;
  price_cents: number | null;
};

export type PickResult<T> =
  | { status: "empty" } // no hay ningún deseo disponible
  | { status: "no-match" } // hay deseos, pero ninguno en el presupuesto elegido
  | { status: "picked"; item: T };

/**
 * ¿Encaja el precio en el presupuesto elegido? El precio nunca excluye en
 * "Me da igual". Un deseo sin precio no puede garantizarse dentro de un rango
 * concreto, así que sólo entra en "Me da igual".
 */
export function matchesBudget(priceCents: number | null, budget: Budget): boolean {
  if (budget === "any") return true;
  if (priceCents == null) return false;
  if (budget === "under-30") return priceCents < UNDER_CENTS;
  if (budget === "mid") return priceCents >= UNDER_CENTS && priceCents <= OVER_CENTS;
  return priceCents > OVER_CENTS; // over-75
}

/**
 * Quita del conjunto los deseos que el usuario ya ha reservado o comprado (los
 * que aparecen en SUS propias reservas). No consulta reservas ajenas: `reservedIds`
 * sale de `myActiveReservationsByWish()`, que RLS limita a `reserver_id = auth.uid()`.
 */
export function availableGifts<T extends { id: string }>(
  wishes: readonly T[],
  reservedIds: ReadonlySet<string>,
): T[] {
  return wishes.filter((wish) => !reservedIds.has(wish.id));
}

/** Selección aleatoria ponderada por prioridad. */
function weightedPick<T extends GiftCandidate>(items: readonly T[], random: () => number): T {
  const total = items.reduce((sum, item) => sum + PRIORITY_WEIGHT[item.priority], 0);
  let threshold = random() * total;
  for (const item of items) {
    threshold -= PRIORITY_WEIGHT[item.priority];
    if (threshold < 0) return item;
  }
  // Sólo alcanzable por redondeo de coma flotante cuando random() ≈ 1.
  return items[items.length - 1];
}

/**
 * Elige un regalo entre `items` (los deseos disponibles), respetando presupuesto
 * y evitando repetir de inmediato el último resultado si hay alternativas.
 *
 * `random` se inyecta para poder probar el reparto sin depender del azar.
 */
export function selectGift<T extends GiftCandidate>(
  items: readonly T[],
  options: { budget: Budget; excludeId?: string | null } = { budget: "any" },
  random: () => number = Math.random,
): PickResult<T> {
  if (items.length === 0) return { status: "empty" };

  const inBudget = items.filter((item) => matchesBudget(item.price_cents, options.budget));
  if (inBudget.length === 0) return { status: "no-match" };

  // Evita repetir el último resultado, pero sólo si queda alguna alternativa:
  // con un único candidato, siempre se devuelve ese.
  const pool =
    options.excludeId && inBudget.length > 1
      ? inBudget.filter((item) => item.id !== options.excludeId)
      : inBudget;

  return { status: "picked", item: weightedPick(pool, random) };
}
