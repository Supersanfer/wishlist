"use server";

import {
  friendlyImageValidationError,
  generateImageFilename,
  validateImageFile,
} from "@/lib/image-validation";
import { deleteImage, uploadImage } from "@/lib/storage";

export type ResolvedImagePath = {
  image_path: string | null;
  /** Llamar tras confirmar que la fila se guardo correctamente. */
  cleanup: () => Promise<void>;
};

/**
 * Decide que hacer con la imagen de un deseo tras enviar el formulario.
 *
 * Orden de prioridad:
 *   1. El usuario ha marcado "quitar imagen": se borra la anterior.
 *   2. Hay un archivo nuevo valido: se sube y se borra la anterior.
 *   3. No hay cambios: se conserva la ruta anterior.
 */
export async function resolveItemImage(
  formData: FormData,
  existingImagePath: string | null,
  buildPath: (filename: string) => string,
): Promise<ResolvedImagePath | { error: string }> {
  const remove = String(formData.get("remove_image") ?? "").trim() === "1";
  const file = formData.get("image");

  if (remove) {
    return {
      image_path: null,
      cleanup: async () => {
        if (existingImagePath) await deleteImage(existingImagePath);
      },
    };
  }

  if (!file || !(file instanceof File) || file.size === 0) {
    return {
      image_path: existingImagePath,
      cleanup: async () => {},
    };
  }

  const validation = validateImageFile(file);
  if (!validation.ok) {
    return { error: friendlyImageValidationError(validation.error) };
  }

  const filename = generateImageFilename(validation.file.name);
  if (!filename) {
    return { error: "Nombre de imagen no valido." };
  }

  const path = buildPath(filename);
  const result = await uploadImage(path, validation.file);

  if ("error" in result) {
    return { error: result.error };
  }

  return {
    image_path: result.path,
    cleanup: async () => {
      if (existingImagePath) await deleteImage(existingImagePath);
    },
  };
}
