export const metadata = { title: "Sin conexión" };

export default function OfflinePage() {
  return (
    <main className="px-gutter mx-auto flex w-full max-w-[26rem] flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
      <h1 className="font-display text-2xl">Sin conexión</h1>
      <p className="max-w-[28ch] text-sm text-muted">
        Tu wishlist vive en la nube. Vuelve a intentarlo cuando tengas red.
      </p>
    </main>
  );
}
