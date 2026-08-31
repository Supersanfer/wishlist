"use client";

import { AppPage, EmptyState } from "@/components/page-shell";
import { Button } from "@/components/ui";

/** Ultima red de la app: nunca se muestra el error tecnico a la persona. */
export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <AppPage>
      <EmptyState
        icon="😕"
        message="No hemos podido cargar esta pantalla. Vuelve a intentarlo."
        action={
          <div className="w-48">
            <Button onClick={reset}>Reintentar</Button>
          </div>
        }
      />
    </AppPage>
  );
}
