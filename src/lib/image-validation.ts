/**
 * Validacion de imagenes subidas desde el dispositivo.
 *
 * Se aplica en el cliente para dar feedback inmediato y en el servidor para
 * no confiar en lo que llega del navegador.
 */

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export type ImageValidationError =
  | "missing"
  | "too-large"
  | "invalid-type";

export type ImageValidationResult =
  | { ok: true; file: File }
  | { ok: false; error: ImageValidationError };

/**
 * Comprueba tipo y tamano. No lee el contenido: eso lo hace Supabase al
 * recibir el archivo.
 */
export function validateImageFile(file: File | null | undefined): ImageValidationResult {
  if (!file || file.size === 0) {
    return { ok: false, error: "missing" };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { ok: false, error: "too-large" };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type as AllowedImageType)) {
    return { ok: false, error: "invalid-type" };
  }

  return { ok: true, file };
}

export function friendlyImageValidationError(error: ImageValidationError): string {
  switch (error) {
    case "too-large":
      return "La imagen pesa demasiado. El limite es 5 MB.";
    case "invalid-type":
      return "Formato no valido. Usa JPG, PNG o WebP.";
    case "missing":
      return "No se ha seleccionado ninguna imagen.";
  }
}

/** Extrae la extension de un nombre de archivo, sin el punto y en minusculas. */
export function imageExtension(filename: string): string | null {
  const match = filename.trim().toLowerCase().match(/\.(jpg|jpeg|png|webp)$/);
  if (!match) return null;
  return match[1] === "jpg" ? "jpeg" : match[1];
}

/** Genera un nombre de archivo aleatorio conservando la extension. */
export function generateImageFilename(originalName: string): string | null {
  const ext = imageExtension(originalName);
  if (!ext) return null;
  const id = crypto.randomUUID();
  return `${id}.${ext}`;
}
