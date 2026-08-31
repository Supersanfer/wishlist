"use client";

import { useState, useTransition } from "react";

import { createCouple } from "@/app/actions/couple";
import { Alert, Button } from "@/components/ui";

export function CreateCoupleCard() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onCreate() {
    setError(null);
    startTransition(async () => {
      const result = await createCouple();
      setError(result.error);
    });
  }

  return (
    <div className="space-y-4">
      <Button onClick={onCreate} disabled={pending}>
        {pending ? "Creando…" : "Crear pareja"}
      </Button>
      {error ? <Alert>{error}</Alert> : null}
    </div>
  );
}
