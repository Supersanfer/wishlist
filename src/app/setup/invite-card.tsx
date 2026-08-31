"use client";

import { useState, useTransition } from "react";

import { regenerateInvitation } from "@/app/actions/couple";
import { Alert, Button, TextButton } from "@/components/ui";

export function InviteCard({ code, link }: { code: string | null; link: string | null }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Tu navegador no nos deja copiar. Selecciona el enlace a mano.");
    }
  }

  function regenerate() {
    setError(null);
    startTransition(async () => {
      const result = await regenerateInvitation();
      setError(result.error);
    });
  }

  if (!code || !link) {
    return (
      <div className="space-y-4">
        <Alert tone="info">
          No hay ninguna invitación activa ahora mismo. Genera una nueva para compartirla.
        </Alert>
        <Button onClick={regenerate} disabled={pending}>
          {pending ? "Generando…" : "Generar invitación"}
        </Button>
        {error ? <Alert>{error}</Alert> : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4 rounded-md border border-border bg-surface p-5">
        <div>
          <h2 className="font-display display-sm">Invita a tu pareja</h2>
          <p className="mt-1 text-sm text-muted">
            Compártele el enlace. Solo sirve una vez y caduca en 7 días.
          </p>
        </div>

        <p className="rounded-sm bg-surface-sunken px-3 py-2.5 font-mono text-xs break-all text-muted select-all">
          {link}
        </p>

        <Button onClick={copy}>{copied ? "Enlace copiado" : "Copiar enlace"}</Button>

        <div>
          <p className="text-sm font-medium">O dile este código:</p>
          <p className="mt-1 font-mono text-sm break-all select-all">{code}</p>
        </div>
      </div>

      {error ? <Alert>{error}</Alert> : null}

      <TextButton
        className="w-full disabled:opacity-50"
        onClick={regenerate}
        disabled={pending}
      >
        {pending ? "Generando…" : "Generar un código nuevo"}
      </TextButton>
    </div>
  );
}
