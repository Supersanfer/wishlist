"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePairedUser } from "@/lib/auth";
import { friendlyWishError } from "@/lib/errors";
import type { ActionState } from "@/lib/form-state";
import { logSupabaseError } from "@/lib/log";
import { parseOccasionForm } from "@/lib/occasion-input";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Las paginas que dependen de las ocasiones: la lista y los formularios de deseo. */
function revalidateOccasions(): void {
  revalidatePath("/occasions");
  revalidatePath("/wishlist");
}

export async function createOccasion(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requirePairedUser();
  const parsed = parseOccasionForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("occasions")
    .insert({ ...parsed.fields, owner_id: user.id });

  if (error) {
    logSupabaseError("createOccasion", error);
    return { error: friendlyWishError(error.message) };
  }

  revalidateOccasions();
  redirect("/occasions?creado=1");
}

export async function updateOccasion(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requirePairedUser();
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) return { error: "Esa ocasión no existe." };

  const parsed = parseOccasionForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("occasions")
    .update(parsed.fields)
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id");

  if (error) {
    logSupabaseError("updateOccasion", error);
    return { error: friendlyWishError(error.message) };
  }
  if (!data || data.length === 0) return { error: "No hemos encontrado esa ocasión." };

  revalidateOccasions();
  redirect("/occasions?guardado=1");
}

/**
 * Borrar una ocasion no borra sus deseos: la FK compuesta esta declarada
 * `on delete set null (occasion_id)`, asi que solo se quedan sin ocasion.
 */
export async function deleteOccasion(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requirePairedUser();
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) return { error: "Esa ocasión no existe." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("occasions")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id");

  if (error) {
    logSupabaseError("deleteOccasion", error);
    return { error: friendlyWishError(error.message) };
  }
  if (!data || data.length === 0) return { error: "No hemos encontrado esa ocasión." };

  revalidateOccasions();
  redirect("/occasions?eliminado=1");
}
