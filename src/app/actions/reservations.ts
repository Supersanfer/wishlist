"use server";

import { revalidatePath } from "next/cache";

import { getCoupleState, requirePairedUser } from "@/lib/auth";
import { friendlyReservationError } from "@/lib/errors";
import type { ActionState } from "@/lib/form-state";
import { logSupabaseError } from "@/lib/log";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function idFrom(formData: FormData, name: string): string | null {
  const value = String(formData.get(name) ?? "");
  return UUID.test(value) ? value : null;
}

/**
 * Reserva un deseo de la pareja.
 *
 * `item_owner_id` NO viene del formulario: se toma de la pareja del usuario. Asi
 * un formulario manipulado no puede apuntar a un deseo de otra persona, y la
 * clave foranea compuesta (wishlist_item_id, item_owner_id) obliga ademas a que
 * el deseo pertenezca de verdad a esa pareja.
 */
export async function reserveWish(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requirePairedUser();
  const wishId = idFrom(formData, "wish_id");
  if (!wishId) return { error: "Ese deseo no existe." };

  const state = await getCoupleState(user.id);
  if (!state.partnerId) return { error: "Todavía no tienes pareja." };

  const supabase = await createClient();
  const { error } = await supabase.from("gift_reservations").insert({
    wishlist_item_id: wishId,
    item_owner_id: state.partnerId,
    reserver_id: user.id,
  });

  if (error) {
    logSupabaseError("reserveWish", error);
    return { error: friendlyReservationError(error.message) };
  }

  revalidatePath("/partner");
  return { error: null };
}

/** Cancela una reserva propia y libera el deseo para volver a reservarlo. */
export async function cancelReservation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requirePairedUser();
  const reservationId = idFrom(formData, "reservation_id");
  if (!reservationId) return { error: "Esa reserva no existe." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gift_reservations")
    .update({ cancelled_at: new Date().toISOString() })
    .eq("id", reservationId)
    .eq("reserver_id", user.id)
    .select("id");

  if (error) {
    logSupabaseError("cancelReservation", error);
    return { error: friendlyReservationError(error.message) };
  }
  if (!data || data.length === 0) return { error: "Esa reserva ya no existe." };

  revalidatePath("/partner");
  return { error: null };
}

/** Marca una reserva propia como comprada, sin liberar el deseo. */
export async function markReservationPurchased(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requirePairedUser();
  const reservationId = idFrom(formData, "reservation_id");
  if (!reservationId) return { error: "Esa reserva no existe." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gift_reservations")
    // El CHECK del esquema exige que status y purchased_at vayan juntos.
    .update({ status: "purchased", purchased_at: new Date().toISOString() })
    .eq("id", reservationId)
    .eq("reserver_id", user.id)
    .is("cancelled_at", null)
    .select("id");

  if (error) {
    logSupabaseError("markReservationPurchased", error);
    return { error: friendlyReservationError(error.message) };
  }
  if (!data || data.length === 0) return { error: "Esa reserva ya no está activa." };

  revalidatePath("/partner");
  return { error: null };
}
