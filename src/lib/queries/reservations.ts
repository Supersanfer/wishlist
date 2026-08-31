import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type Reservation = Tables<"gift_reservations">;

/**
 * Reservas activas hechas por el usuario actual, indexadas por deseo.
 *
 * RLS solo devuelve las de `reserver_id = auth.uid()`, asi que esta consulta es
 * literalmente invisible para el dueño de los deseos: le devolveria cero filas.
 */
export async function myActiveReservationsByWish(): Promise<Map<string, Reservation>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("gift_reservations")
    .select("*")
    .is("cancelled_at", null);

  return new Map((data ?? []).map((reservation) => [reservation.wishlist_item_id, reservation]));
}
