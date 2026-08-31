import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <p aria-hidden className="text-4xl">
        🧭
      </p>
      <h1 className="text-xl font-semibold">Aquí no hay nada</h1>
      <p className="text-sm text-muted">Puede que se haya borrado o que el enlace esté mal.</p>
      <Link
        href="/"
        className="flex h-12 items-center justify-center rounded-2xl border border-border px-6 font-medium"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
