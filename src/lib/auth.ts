import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { INVITE_CODE_PATTERN, PENDING_INVITE_COOKIE } from "@/lib/invite-cookie";
import { createClient } from "@/lib/supabase/server";

export type CoupleState = {
  coupleId: string | null;
  partnerId: string | null;
  /** true solo cuando la pareja tiene ya sus dos miembros. */
  isComplete: boolean;
};

export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  // getUser() valida el JWT contra Supabase; getSession() no lo hace.
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Estado de emparejamiento leido de la base de datos. RLS limita couple_members
 * a la pareja propia, asi que no hace falta filtrar por usuario aqui.
 */
export async function getCoupleState(userId: string): Promise<CoupleState> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("couple_members")
    .select("couple_id, user_id");

  if (error || !data || data.length === 0) {
    return { coupleId: null, partnerId: null, isComplete: false };
  }

  const partner = data.find((member) => member.user_id !== userId);
  return {
    coupleId: data[0].couple_id,
    partnerId: partner?.user_id ?? null,
    isComplete: partner !== undefined,
  };
}

/** Usuario autenticado y con pareja completa. Puerta de las pantallas de la app. */
export async function requirePairedUser(): Promise<User> {
  const user = await requireUser();
  const state = await getCoupleState(user.id);
  if (!state.isComplete) redirect("/setup");
  return user;
}

/** Destino segun el estado del usuario: pareja completa -> dashboard, si no -> setup. */
export function destinationFor(state: CoupleState): "/dashboard" | "/setup" {
  return state.isComplete ? "/dashboard" : "/setup";
}

/**
 * Adonde ir tras autenticarse: a la invitacion pendiente si la hay, y si no al
 * destino que corresponda al estado de emparejamiento.
 */
export async function landingAfterAuth(userId: string): Promise<string> {
  const cookieStore = await cookies();
  const pending = cookieStore.get(PENDING_INVITE_COOKIE)?.value;
  if (pending && INVITE_CODE_PATTERN.test(pending)) return `/join/${pending}`;
  return destinationFor(await getCoupleState(userId));
}
