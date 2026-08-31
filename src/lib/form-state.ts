/**
 * Estado compartido por los formularios que usan useActionState.
 *
 * Vive fuera de los ficheros "use server" a proposito: esos solo pueden exportar
 * funciones async, asi que una constante como `initialActionState` rompe el build.
 */
export type ActionState = { error: string | null };

export const initialActionState: ActionState = { error: null };
