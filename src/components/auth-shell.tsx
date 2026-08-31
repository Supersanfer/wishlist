import type { ReactNode } from "react";

/** Marco de las pantallas sin sesión: login, registro, emparejamiento e invitación. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="px-gutter mx-auto flex w-full max-w-[23rem] flex-1 flex-col justify-center gap-8 py-12">
      {children}
    </main>
  );
}
