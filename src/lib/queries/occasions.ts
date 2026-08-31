import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type Occasion = Tables<"occasions">;

/**
 * Ocasiones de una persona, por fecha. Vale para las propias y para las de la
 * pareja: RLS permite leer ambas porque son el contexto de los regalos.
 */
export async function listOccasionsOf(ownerId: string): Promise<Occasion[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("occasions")
    .select("*")
    .eq("owner_id", ownerId)
    .order("occasion_date", { ascending: true });
  return data ?? [];
}

/** Una ocasion propia, o null si no existe o no es mia. */
export async function getOwnOccasion(
  ownerId: string,
  id: string,
): Promise<Occasion | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("occasions")
    .select("*")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .maybeSingle();
  return data ?? null;
}
