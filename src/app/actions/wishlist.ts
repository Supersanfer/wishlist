"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { friendlyWishError } from "@/lib/errors";
import type { ActionState } from "@/lib/form-state";
import { resolveItemImage } from "@/lib/item-image-action";
import { logSupabaseError } from "@/lib/log";
import { createClient } from "@/lib/supabase/server";
import { wishlistImagePath } from "@/lib/storage-paths";
import { parseWishForm } from "@/lib/wish-input";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createWish(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = parseWishForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();

  // Se necesita la pareja para construir la ruta de Storage. Si no tiene pareja,
  // el deseo personal no se puede crear de todos modos, pero aqui se devuelve
  // un error claro antes de tocar Storage.
  const { data: membership, error: membershipError } = await supabase
    .from("couple_members")
    .select("couple_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError || !membership) {
    return { error: "Todavia no tienes pareja." };
  }

  const resolved = await resolveItemImage(
    formData,
    null,
    (filename) => wishlistImagePath(membership.couple_id, user.id, crypto.randomUUID(), filename),
  );

  if ("error" in resolved) return { error: resolved.error };

  const { error } = await supabase
    .from("wishlist_items")
    .insert({ ...parsed.fields, image_path: resolved.image_path, owner_id: user.id });

  if (error) {
    logSupabaseError("createWish", error);
    return { error: friendlyWishError(error.message) };
  }

  await resolved.cleanup();

  revalidatePath("/wishlist");
  redirect("/wishlist?creado=1");
}

export async function updateWish(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) return { error: "Ese deseo no existe." };

  const parsed = parseWishForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();

  // Leer el deseo actual para saber su imagen. RLS garantiza que solo puede
  // leer lo suyo.
  const { data: current, error: fetchError } = await supabase
    .from("wishlist_items")
    .select("image_path")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (fetchError) {
    logSupabaseError("updateWish:fetch", fetchError);
    return { error: friendlyWishError(fetchError.message) };
  }
  if (!current) return { error: "No hemos encontrado ese deseo, o ya no es tuyo." };

  const { data: membership, error: membershipError } = await supabase
    .from("couple_members")
    .select("couple_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError || !membership) {
    return { error: "No se ha podido verificar tu pareja." };
  }

  const resolved = await resolveItemImage(
    formData,
    current.image_path,
    (filename) => wishlistImagePath(membership.couple_id, user.id, id, filename),
  );

  if ("error" in resolved) return { error: resolved.error };

  const { data, error } = await supabase
    .from("wishlist_items")
    .update({ ...parsed.fields, image_path: resolved.image_path })
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id");

  if (error) {
    logSupabaseError("updateWish", error);
    return { error: friendlyWishError(error.message) };
  }
  if (!data || data.length === 0) {
    return { error: "No hemos encontrado ese deseo, o ya no es tuyo." };
  }

  await resolved.cleanup();

  revalidatePath("/wishlist");
  redirect("/wishlist?guardado=1");
}

export async function deleteWish(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) return { error: "Ese deseo no existe." };

  const supabase = await createClient();

  // Seleccionar tambien la imagen para poder borrarla de Storage.
  const { data, error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id, image_path");

  if (error) {
    logSupabaseError("deleteWish", error);
    return { error: friendlyWishError(error.message) };
  }
  if (!data || data.length === 0) {
    return { error: "No hemos encontrado ese deseo, o ya no es tuyo." };
  }

  const imagePath = data[0].image_path;
  if (imagePath) await supabase.storage.from("wishlist-images").remove([imagePath]);

  revalidatePath("/wishlist");
  redirect("/wishlist?eliminado=1");
}
