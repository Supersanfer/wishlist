"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { friendlyWishError } from "@/lib/errors";
import type { ActionState } from "@/lib/form-state";
import { createClient } from "@/lib/supabase/server";
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
  const { error } = await supabase
    .from("wishlist_items")
    .insert({ ...parsed.fields, owner_id: user.id });

  if (error) return { error: friendlyWishError(error.message) };

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
  // El filtro por owner_id es claridad, no seguridad: quien manda la peticion
  // es quien elige el `where`. Lo que impide tocar un deseo ajeno es la politica
  // wishlist_items_update_self, que ademas veta cambiar owner_id en su CHECK.
  const { data, error } = await supabase
    .from("wishlist_items")
    .update(parsed.fields)
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id");

  if (error) return { error: friendlyWishError(error.message) };
  // RLS no da error al filtrar filas: simplemente no actualiza ninguna.
  if (!data || data.length === 0) {
    return { error: "No hemos encontrado ese deseo, o ya no es tuyo." };
  }

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
  const { data, error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id");

  if (error) return { error: friendlyWishError(error.message) };
  if (!data || data.length === 0) {
    return { error: "No hemos encontrado ese deseo, o ya no es tuyo." };
  }

  revalidatePath("/wishlist");
  redirect("/wishlist?eliminado=1");
}
