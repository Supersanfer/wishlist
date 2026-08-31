"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { GiftIcon, PersonIcon, TagHeartIcon, TogetherIcon } from "@/components/icons";

const DESTINATIONS = [
  { href: "/wishlist", label: "Mi lista", Icon: GiftIcon },
  { href: "/partner", label: "Su lista", Icon: TagHeartIcon },
  { href: "/shared", label: "Juntos", Icon: TogetherIcon },
  { href: "/me", label: "Yo", Icon: PersonIcon },
] as const;

/** Rutas de formulario: allí la barra sólo roba viewport al teclado. */
function isFormRoute(pathname: string): boolean {
  return pathname.endsWith("/new") || pathname.endsWith("/edit");
}

export function BottomNav() {
  const pathname = usePathname();

  if (isFormRoute(pathname)) return null;

  return (
    <nav
      aria-label="Secciones"
      // Sólida a propósito: el desenfoque de cristal es el tic visual que se
      // pretende evitar, y aquí sólo restaría legibilidad al contenido.
      className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[26rem] border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] sm:rounded-t-md sm:border-x"
    >
      <ul className="mx-auto flex max-w-[26rem]">
        {DESTINATIONS.map(({ href, label, Icon }) => {
          // Las ocasiones se gestionan desde el perfil: mantienen "Yo" activo
          // para que la barra nunca aparezca sin ninguna sección marcada.
          const active =
            pathname === href ||
            pathname.startsWith(`${href}/`) ||
            (href === "/me" && pathname.startsWith("/occasions"));

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-[var(--nav-height)] flex-col items-center justify-center gap-1 transition-colors duration-150 ${
                  active ? "text-accent" : "text-muted"
                }`}
              >
                <span
                  className={`flex size-7 items-center justify-center rounded-sm transition-colors duration-150 ${
                    active ? "bg-accent-soft" : ""
                  }`}
                >
                  <Icon size={21} />
                </span>
                <span className={`text-[0.6875rem] ${active ? "font-semibold" : "font-medium"}`}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
