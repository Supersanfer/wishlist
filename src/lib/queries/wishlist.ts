import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type WishlistItem = Tables<"wishlist_items">;
export type Occasion = Tables<"occasions">;

/** Un deseo con el nombre de su ocasion ya resuelto, listo para pintar. */
export type WishWithOccasion = WishlistItem & { occasionName: string | null };

/**
 * Deseos propios, de mas a menos prioritario y, a igualdad, los mas recientes
 * primero. El enum wish_priority esta declarado low < medium < high, asi que
 * ordenar descendente pone `high` arriba.
 *
 * RLS ya limita la tabla a mis deseos y a los de mi pareja; el filtro por
 * owner_id es el que hace que esta consulta sea "mi lista" y no las dos.
 */
export async function listOwnWishes(ownerId: string): Promise<WishWithOccasion[]> {
  const supabase = await createClient();

  const [wishes, occasions] = await Promise.all([
    supabase
      .from("wishlist_items")
      .select("*")
      .eq("owner_id", ownerId)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false }),
    listOwnOccasions(ownerId),
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

export async function listOwnOccasions(ownerId: string): Promise<Occasion[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("occasions")
    .select("*")
    .eq("owner_id", ownerId)
    .order("occasion_date", { ascending: true });
  return data ?? [];
}
