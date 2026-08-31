import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type SharedItem = Tables<"shared_wishlist_items">;

/**
 * Lista conjunta de la pareja, de mas reciente a mas antigua.
 * RLS ya la limita a la pareja del usuario.
 */
export async function listSharedItems(): Promise<SharedItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("shared_wishlist_items")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

/** Un elemento de la lista conjunta, o null si no es de mi pareja. */
export async function getSharedItem(id: string): Promise<SharedItem | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("shared_wishlist_items")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ?? null;
}
