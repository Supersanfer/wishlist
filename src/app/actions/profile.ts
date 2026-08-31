"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { friendlyWishError } from "@/lib/errors";
import type { ActionState } from "@/lib/form-state";
import { logSupabaseError } from "@/lib/log";
import { createClient } from "@/lib/supabase/server";

/**
 * Sólo el nombre visible es editable. El email vive en `auth.users`, fuera de
 * esta tabla, y el `id` lo fija el WITH CHECK de la política `profiles_update_self`.
 */
export async function updateProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const displayName = String(formData.get("display_name") ?? "").trim();
  if (!displayName) return { error: "Dinos cómo te llamas." };
  if (displayName.length > 80) return { error: "Ese nombre es demasiado largo (máximo 80)." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", user.id)
    .select("id");

  if (error) {
    logSupabaseError("updateProfile", error);
    return { error: friendlyWishError(error.message) };
  }
  if (!data || data.length === 0) return { error: "No hemos podido guardar el cambio." };

  revalidatePath("/me");
  revalidatePath("/partner");
  return { error: null };
}
