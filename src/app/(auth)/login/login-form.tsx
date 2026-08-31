"use client";

import { useActionState } from "react";

import { signIn, type AuthState } from "@/app/actions/auth";
import { Alert, Field, SubmitButton } from "@/components/ui";

const initial: AuthState = { error: null };

export function LoginForm() {
  const [state, formAction] = useActionState(signIn, initial);

  return (
    <form action={formAction} className="space-y-4">
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="tu@email.com"
        required
      />
      <Field
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      {state.error ? <Alert>{state.error}</Alert> : null}
      <SubmitButton pendingLabel="Entrando…">Entrar</SubmitButton>
    </form>
  );
}
