import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

import { resolveItemImageUrl } from "./storage";

export type SharedItem = Tables<"shared_wishlist_items">;

/** Elemento conjunto con la URL de su imagen ya resuelta. */
export type SharedItemWithImage = SharedItem & { imageUrl: string | null };

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

/** Lista conjunta con las imagenes resueltas. */
export async function listSharedItemsWithImages(): Promise<SharedItemWithImage[]> {
  const items = await listSharedItems();
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      imageUrl: await resolveItemImageUrl(item.image_path, item.image_url),
    })),
  );
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
