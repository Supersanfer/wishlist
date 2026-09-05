"use server";

import { createClient } from "@/lib/supabase/server";

const BUCKET = "wishlist-images";

/**
 * Sube un archivo al bucket privado. La ruta debe cumplir las politicas RLS
 * del bucket para el usuario autenticado.
 */
export async function uploadImage(
  path: string,
  file: File,
): Promise<{ path: string } | { error: string }> {
  const supabase = await createClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return { error: friendlyStorageError(error.message) };
  }

  return { path };
}

/**
 * Borra un objeto del bucket. Devuelve ok aunque no exista, para no dejar
 * fallos transitorios bloqueando una operacion del usuario.
 */
export async function deleteImage(path: string | null): Promise<void> {
  if (!path) return;
  const supabase = await createClient();
  await supabase.storage.from(BUCKET).remove([path]);
}

function friendlyStorageError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("payload too large") || lower.includes("size")) {
    return "La imagen pesa demasiado. El limite es 5 MB.";
  }
  if (lower.includes("mime type") || lower.includes("content type")) {
    return "Formato no valido. Usa JPG, PNG o WebP.";
  }
  if (lower.includes("row-level security") || lower.includes("policy")) {
    return "No tienes permiso para subir esa imagen.";
  }
  return "No se ha podido guardar la imagen. Vuelve a intentarlo.";
}
