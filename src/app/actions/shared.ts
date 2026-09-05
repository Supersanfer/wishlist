"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCoupleState, requirePairedUser } from "@/lib/auth";
import { friendlyWishError } from "@/lib/errors";
import type { ActionState } from "@/lib/form-state";
import { resolveItemImage } from "@/lib/item-image-action";
import { logSupabaseError } from "@/lib/log";
import { createClient } from "@/lib/supabase/server";
import { sharedImagePath } from "@/lib/storage-paths";
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
  const coupleId = state.coupleId;
  if (!coupleId) return { error: "Todavia no tienes pareja." };

  const resolved = await resolveItemImage(
    formData,
    null,
    (filename) => sharedImagePath(coupleId, crypto.randomUUID(), filename),
  );

  if ("error" in resolved) return { error: resolved.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("shared_wishlist_items")
    .insert({
      ...parsed.fields,
      image_path: resolved.image_path,
      couple_id: coupleId,
      created_by: user.id,
    });

  if (error) {
    logSupabaseError("createSharedItem", error);
    return { error: friendlyWishError(error.message) };
  }

  await resolved.cleanup();

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
  const user = await requirePairedUser();
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) return { error: "Ese elemento no existe." };

  const parsed = parseItemForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const state = await getCoupleState(user.id);
  const coupleId = state.coupleId;
  if (!coupleId) return { error: "Todavia no tienes pareja." };

  const supabase = await createClient();

  // Leer la imagen actual. RLS limita a la pareja del usuario.
  const { data: current, error: fetchError } = await supabase
    .from("shared_wishlist_items")
    .select("image_path")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    logSupabaseError("updateSharedItem:fetch", fetchError);
    return { error: friendlyWishError(fetchError.message) };
  }
  if (!current) return { error: "No hemos encontrado ese elemento." };

  const resolved = await resolveItemImage(
    formData,
    current.image_path,
    (filename) => sharedImagePath(coupleId, id, filename),
  );

  if ("error" in resolved) return { error: resolved.error };

  const { data, error } = await supabase
    .from("shared_wishlist_items")
    .update({ ...parsed.fields, image_path: resolved.image_path })
    .eq("id", id)
    .select("id");

  if (error) {
    logSupabaseError("updateSharedItem", error);
    return { error: friendlyWishError(error.message) };
  }
  if (!data || data.length === 0) return { error: "No hemos encontrado ese elemento." };

  await resolved.cleanup();

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
    .select("id, image_path");

  if (error) {
    logSupabaseError("deleteSharedItem", error);
    return { error: friendlyWishError(error.message) };
  }
  if (!data || data.length === 0) return { error: "No hemos encontrado ese elemento." };

  const imagePath = data[0].image_path;
  if (imagePath) await supabase.storage.from("wishlist-images").remove([imagePath]);

  revalidatePath("/shared");
  redirect("/shared?eliminado=1");
}
