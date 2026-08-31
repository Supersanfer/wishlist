"use client";

import { AppPage, EmptyState } from "@/components/page-shell";
import { TagHeartIcon } from "@/components/icons";
import { Button } from "@/components/ui";

/** Última red: nunca se enseña el error técnico, sólo la salida. */
export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <AppPage>
      <EmptyState
        icon={<TagHeartIcon size={22} />}
        title="No hemos podido cargar esto"
        message="Puede ser la conexión. Vuelve a intentarlo en un momento."
        action={<Button onClick={reset}>Reintentar</Button>}
      />
    </AppPage>
  );
}
