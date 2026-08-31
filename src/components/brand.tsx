export function Brand({ subtitle }: { subtitle: string }) {
  return (
    <header className="space-y-2">
      <p className="text-3xl">❤️</p>
      <h1 className="text-2xl font-semibold tracking-tight">Wishlist</h1>
      <p className="text-sm text-muted">{subtitle}</p>
    </header>
  );
}
