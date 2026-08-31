import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { buttonClass } from "@/components/ui";
import { getUser, landingAfterAuth } from "@/lib/auth";

export const metadata: Metadata = {
  title: { absolute: "Wishlist · Una lista privada para dos" },
  description:
    "Apunta lo que te hace ilusión, mira lo que le hace ilusión a tu pareja y reserva su regalo sin que se entere. El secreto lo garantiza la base de datos, no la interfaz.",
};

const STEPS = [
  {
    title: "Apuntas lo que te apetece",
    body: "Un nombre basta. Si quieres, precio, enlace y para qué ocasión lo pides.",
  },
  {
    title: "Veis vuestras listas",
    body: "La suya y la tuya, cada una en su sitio. Nadie edita la del otro.",
  },
  {
    title: "Reservas su regalo en secreto",
    body: "Marcas lo que vas a comprarle y en su lista no cambia nada: ni marcas, ni contadores, ni errores que lo delaten.",
  },
];

export default async function LandingPage() {
  const user = await getUser();
  if (user) redirect(await landingAfterAuth(user.id));

  return (
    <main className="px-gutter mx-auto flex w-full max-w-[30rem] flex-1 flex-col justify-center gap-12 py-16">
      <header className="space-y-4">
        <h1 className="font-display display-lg">Wishlist</h1>
        <p className="max-w-[30ch] text-lg leading-relaxed text-muted">
          Una lista privada para dos. Para dejar de acertar por casualidad.
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/register" className={buttonClass("primary", "lg")}>
          Crear cuenta
        </Link>
        <Link href="/login" className={buttonClass("secondary", "lg")}>
          Ya tengo cuenta
        </Link>
      </div>

      <section className="space-y-7 border-t border-border pt-10">
        <h2 className="eyebrow text-muted">Cómo funciona</h2>

        <ol className="space-y-7">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span aria-hidden className="tabular w-6 shrink-0 pt-0.5 text-sm text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="space-y-1">
                <h3 className="font-display display-sm">{step.title}</h3>
                <p className="text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-6 text-sm text-muted">
        <Link href="/privacidad" className="underline underline-offset-4">
          Privacidad
        </Link>
        <a
          href="https://github.com/Supersanfer/wishlist"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          Código en GitHub
        </a>
      </footer>
    </main>
  );
}
