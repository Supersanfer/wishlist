import Link from "next/link";

import { buttonClass } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="px-gutter mx-auto flex w-full max-w-[26rem] flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
      <h1 className="font-display display-sm">Aquí no hay nada</h1>
      <p className="max-w-[28ch] text-sm text-muted">
        Puede que se haya borrado, o que el enlace esté incompleto.
      </p>
      <div className="mt-2 w-full max-w-56">
        <Link href="/" className={buttonClass("secondary")}>
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
