import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type Profile = Tables<"profiles">;

/** Perfil por id. RLS solo devuelve el propio y el de la pareja. */
export async function getProfile(id: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}

/** Nombre para mostrar, con un respaldo neutro si el perfil no esta disponible. */
export function displayNameOf(profile: Profile | null, fallback = "tu pareja"): string {
  return profile?.display_name ?? fallback;
}
