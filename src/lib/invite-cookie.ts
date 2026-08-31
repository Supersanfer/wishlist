/**
 * Cookie donde el proxy guarda el codigo de una invitacion abierta sin sesion,
 * para retomarla despues de iniciar sesion o registrarse.
 *
 * Vive en su propio modulo para que `proxy.ts` no tenga que importar la capa
 * de servidor de Supabase solo por una constante.
 */
export const PENDING_INVITE_COOKIE = "wishlist_pending_invite";

export const INVITE_CODE_PATTERN = /^[0-9a-f]{32}$/;
