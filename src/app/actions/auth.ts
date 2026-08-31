"use server";

import { redirect } from "next/navigation";

import { landingAfterAuth } from "@/lib/auth";
import { friendlyAuthError } from "@/lib/errors";
import { siteOrigin } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error: string | null;
  /** Solo lo usa el registro cuando el proyecto exige confirmar el correo. */
  awaitingConfirmation?: boolean;
  email?: string;
};

const MIN_PASSWORD = 8;

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Escribe tu email y tu contraseña." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: friendlyAuthError(error?.message ?? "") };
  }

  redirect(await landingAfterAuth(data.user.id));
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const displayName = String(formData.get("display_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!displayName) return { error: "Dinos cómo te llamas." };
  if (displayName.length > 80) return { error: "Ese nombre es demasiado largo." };
  if (!email) return { error: "Escribe tu email." };
  if (password.length < MIN_PASSWORD) {
    return { error: `La contraseña necesita al menos ${MIN_PASSWORD} caracteres.` };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // El trigger handle_new_user lee display_name de aqui para crear el perfil.
      data: { display_name: displayName },
      emailRedirectTo: `${await siteOrigin()}/auth/callback`,
    },
  });

  if (error || !data.user) {
    return { error: friendlyAuthError(error?.message ?? "") };
  }

  // Sin sesion => el proyecto exige confirmar el correo antes de entrar.
  if (!data.session) {
    return { error: null, awaitingConfirmation: true, email };
  }

  redirect(await landingAfterAuth(data.user.id));
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
