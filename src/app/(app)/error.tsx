"use client";

import { AppPage, EmptyState } from "@/components/page-shell";
import { Button } from "@/components/ui";

/** Última red: nunca se enseña el error técnico, sólo la salida. */
export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <AppPage>
      <EmptyState
        icon={<span className="text-lg">·</span>}
        title="No hemos podido cargar esto"
        message="Puede ser la conexión. Vuelve a intentarlo en un momento."
        action={<Button onClick={reset}>Reintentar</Button>}
      />
    </AppPage>
  );
}
