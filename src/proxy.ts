import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { env } from "@/lib/env";
import { INVITE_CODE_PATTERN, PENDING_INVITE_COOKIE } from "@/lib/invite-cookie";

/** Rutas que exigen sesion. El resto decide cada pagina. */
const PRIVATE_PREFIXES = ["/dashboard", "/setup", "/wishlist", "/partner", "/shared", "/occasions", "/me"];

/**
 * Refresca el token de sesion de Supabase en cada navegacion y escribe las
 * cookies actualizadas en la respuesta. Sin esto, los Server Components ven
 * sesiones caducadas.
 *
 * (En Next 16 `middleware` pasa a llamarse `proxy` y corre en runtime nodejs.)
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        for (const [key, value] of Object.entries(headers)) {
          response.headers.set(key, value);
        }
      },
    },
  });

  // Importante: llamar siempre a getUser() para disparar el refresco.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = "";
    return NextResponse.redirect(login);
  }

  // Al abrir una invitacion sin sesion, guardamos el codigo para retomarla
  // despues de iniciar sesion o registrarse, sin pedirlo de nuevo.
  const inviteCode = pathname.startsWith("/join/") ? pathname.slice("/join/".length) : null;
  if (!user && inviteCode && INVITE_CODE_PATTERN.test(inviteCode)) {
    response.cookies.set(PENDING_INVITE_COOKIE, inviteCode, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60,
    });
  }

  return response;
}

export const config = {
  matcher: [
    // Todas las rutas salvo estaticos, imagenes optimizadas y assets de la PWA.
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
