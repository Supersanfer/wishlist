export function Brand({ subtitle }: { subtitle: string }) {
  return (
    <header className="space-y-2">
      <h1 className="font-display text-[2.125rem] leading-10">Wishlist</h1>
      <p className="text-muted">{subtitle}</p>
    </header>
  );
}
