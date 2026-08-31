"use client";

import { useActionState } from "react";

import { signUp, type AuthState } from "@/app/actions/auth";
import { Alert, Field, SubmitButton } from "@/components/ui";

const initial: AuthState = { error: null };

export function RegisterForm() {
  const [state, formAction] = useActionState(signUp, initial);

  if (state.awaitingConfirmation) {
    return (
      <div className="space-y-4 rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-3xl">📬</p>
        <h2 className="text-lg font-semibold">Confirma tu correo</h2>
        <p className="text-sm text-muted">
          Te hemos enviado un enlace a <span className="text-foreground">{state.email}</span>.
          Ábrelo desde este mismo dispositivo para terminar de crear tu cuenta.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <Field
        label="Nombre"
        name="display_name"
        autoComplete="name"
        placeholder="Anguita"
        maxLength={80}
        required
      />
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
        autoComplete="new-password"
        minLength={8}
        hint="Al menos 8 caracteres."
        required
      />
      {state.error ? <Alert>{state.error}</Alert> : null}
      <SubmitButton pendingLabel="Creando cuenta…">Crear cuenta</SubmitButton>
    </form>
  );
}
