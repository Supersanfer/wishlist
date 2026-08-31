"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { INVITE_CODE_PATTERN, PENDING_INVITE_COOKIE } from "@/lib/invite-cookie";
import { friendlyCoupleError } from "@/lib/errors";
import type { ActionState } from "@/lib/form-state";
import { createClient } from "@/lib/supabase/server";

/**
 * Crea la pareja y deja lista su primera invitacion. Las dos operaciones viven
 * en Postgres (create_couple / create_couple_invitation), que es donde se valida
 * que el usuario no pertenezca ya a otra pareja.
 */
export async function createCouple(): Promise<ActionState> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("create_couple");
  if (error) return { error: friendlyCoupleError(error.message) };

  const { error: inviteError } = await supabase.rpc("create_couple_invitation");
  if (inviteError) return { error: friendlyCoupleError(inviteError.message) };

  revalidatePath("/setup");
  return { error: null };
}

/** Genera una invitacion nueva; la anterior pendiente queda revocada. */
export async function regenerateInvitation(): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_couple_invitation");
  if (error) return { error: friendlyCoupleError(error.message) };

  revalidatePath("/setup");
  return { error: null };
}

/** Canjea una invitacion. El codigo puede venir de un formulario o del enlace. */
export async function joinCouple(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const code = String(formData.get("code") ?? "")
    .trim()
    .toLowerCase();

  if (!INVITE_CODE_PATTERN.test(code)) {
    return { error: "Ese código de invitación no tiene el formato correcto." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("redeem_couple_invitation", { p_code: code });
  if (error) return { error: friendlyCoupleError(error.message) };

  const cookieStore = await cookies();
  cookieStore.delete(PENDING_INVITE_COOKIE);

  redirect("/wishlist");
}
