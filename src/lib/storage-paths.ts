/**
 * Rutas de objetos en el bucket de Storage. Funciones puras, sin lado servidor.
 */

export function wishlistImagePath(
  coupleId: string,
  ownerId: string,
  itemId: string,
  filename: string,
): string {
  return `wishlist/${coupleId}/${ownerId}/${itemId}/${filename}`;
}

export function sharedImagePath(
  coupleId: string,
  itemId: string,
  filename: string,
): string {
  return `shared/${coupleId}/${itemId}/${filename}`;
}
