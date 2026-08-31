import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

import { listOccasionsOf } from "./occasions";

export type WishlistItem = Tables<"wishlist_items">;

/** Un deseo con el nombre de su ocasion ya resuelto, listo para pintar. */
export type WishWithOccasion = WishlistItem & { occasionName: string | null };

/**
 * Deseos de una persona, de mas a menos prioritario y, a igualdad, los mas
 * recientes primero. El enum wish_priority esta declarado low < medium < high,
 * asi que ordenar descendente pone `high` arriba.
 *
 * Sirve tanto para la lista propia como para la de la pareja: RLS limita la
 * tabla a esas dos personas, y `ownerId` elige de cual de las dos se trata.
 */
export async function listWishesOf(ownerId: string): Promise<WishWithOccasion[]> {
  const supabase = await createClient();

  const [wishes, occasions] = await Promise.all([
    supabase
      .from("wishlist_items")
      .select("*")
      .eq("owner_id", ownerId)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false }),
    listOccasionsOf(ownerId),
  ]);

  if (wishes.error || !wishes.data) return [];

  const names = new Map(occasions.map((occasion) => [occasion.id, occasion.name]));
  return wishes.data.map((wish) => ({
    ...wish,
    occasionName: wish.occasion_id ? (names.get(wish.occasion_id) ?? null) : null,
  }));
}

/** Un deseo propio, o null si no existe o no es mio (RLS decide). */
export async function getOwnWish(
  ownerId: string,
  id: string,
): Promise<WishlistItem | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("wishlist_items")
    .select("*")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .maybeSingle();
  return data ?? null;
}
