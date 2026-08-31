"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCoupleState, requirePairedUser } from "@/lib/auth";
import { friendlyWishError } from "@/lib/errors";
import type { ActionState } from "@/lib/form-state";
import { logSupabaseError } from "@/lib/log";
import { createClient } from "@/lib/supabase/server";
import { parseItemForm } from "@/lib/wish-input";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createSharedItem(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requirePairedUser();
  const parsed = parseItemForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const state = await getCoupleState(user.id);
  if (!state.coupleId) return { error: "Todavía no tienes pareja." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("shared_wishlist_items")
    .insert({ ...parsed.fields, couple_id: state.coupleId, created_by: user.id });

  if (error) {
    logSupabaseError("createSharedItem", error);
    return { error: friendlyWishError(error.message) };
  }

  revalidatePath("/shared");
  redirect("/shared?creado=1");
}

/**
 * En la lista conjunta no hay propietario: cualquiera de los dos edita o borra.
 * El alcance lo pone la politica RLS por couple_id, no el usuario que lo creo.
 */
export async function updateSharedItem(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePairedUser();
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) return { error: "Ese elemento no existe." };

  const parsed = parseItemForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shared_wishlist_items")
    .update(parsed.fields)
    .eq("id", id)
    .select("id");

  if (error) {
    logSupabaseError("updateSharedItem", error);
    return { error: friendlyWishError(error.message) };
  }
  if (!data || data.length === 0) return { error: "No hemos encontrado ese elemento." };

  revalidatePath("/shared");
  redirect("/shared?guardado=1");
}

export async function deleteSharedItem(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePairedUser();
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) return { error: "Ese elemento no existe." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shared_wishlist_items")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    logSupabaseError("deleteSharedItem", error);
    return { error: friendlyWishError(error.message) };
  }
  if (!data || data.length === 0) return { error: "No hemos encontrado ese elemento." };

  revalidatePath("/shared");
  redirect("/shared?eliminado=1");
}
