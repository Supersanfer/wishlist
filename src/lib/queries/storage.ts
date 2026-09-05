import { createClient } from "@/lib/supabase/server";

const BUCKET = "wishlist-images";

/**
 * Resuelve la URL final de una imagen: si hay ruta de Storage, genera una URL
 * firmada; si no, devuelve la URL externa (que ya fue validada al guardar).
 */
export async function resolveItemImageUrl(
  imagePath: string | null | undefined,
  imageUrl: string | null | undefined,
  expiresInSeconds = 3600,
): Promise<string | null> {
  if (imagePath) {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(imagePath, expiresInSeconds);
    if (error || !data) return null;
    return data.signedUrl;
  }
  return imageUrl ?? null;
}
