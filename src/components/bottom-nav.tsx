"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const DESTINATIONS = [
  { href: "/wishlist", label: "Mi lista", icon: "🎁" },
  { href: "/partner", label: "Su lista", icon: "💝" },
  { href: "/shared", label: "Juntos", icon: "✨" },
  { href: "/me", label: "Yo", icon: "🙂" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto flex max-w-md">
        {DESTINATIONS.map((destination) => {
          const active =
            pathname === destination.href || pathname.startsWith(`${destination.href}/`);

          return (
            <li key={destination.href} className="flex-1">
              <Link
                href={destination.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-[var(--nav-height)] flex-col items-center justify-center gap-0.5 text-xs transition ${
                  active ? "text-accent" : "text-muted"
                }`}
              >
                <span aria-hidden className={`text-lg transition ${active ? "" : "opacity-70"}`}>
                  {destination.icon}
                </span>
                <span className={active ? "font-medium" : undefined}>{destination.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
