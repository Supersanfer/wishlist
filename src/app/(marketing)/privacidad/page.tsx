import Link from "next/link";

export const metadata = {
  title: "Privacidad",
  description: "Qué datos guarda Wishlist, dónde y quién puede verlos.",
};

const SECTIONS = [
  {
    title: "Qué se guarda",
    body: "Tu email y una contraseña cifrada, que gestiona Supabase Auth. El nombre que elijas mostrar. Y lo que escribas: deseos, listas y ocasiones. Nada más. No hay analítica, ni cookies de seguimiento, ni terceros.",
  },
  {
    title: "Quién puede verlo",
    body: "Tú y la persona con la que te emparejes. Nadie más, tampoco otras parejas. No es una promesa de la interfaz: cada tabla tiene políticas de acceso a nivel de base de datos que se comprueban en cada consulta.",
  },
  {
    title: "Las reservas de regalos",
    body: "Cuando reservas un regalo, quien recibe no puede descubrirlo por ninguna vía: ni consultando, ni contando, ni por un mensaje de error. La base de datos simplemente no le devuelve esas filas.",
  },
  {
    title: "Dónde vive",
    body: "En Supabase (PostgreSQL, servidores en la Unión Europea) y desplegado en Vercel. Las cookies que se usan son las de la sesión: sin ellas no se puede iniciar sesión.",
  },
  {
    title: "Borrar tus datos",
    body: "Escribe a quien administra la instancia y se elimina tu cuenta. Al borrarla desaparecen en cascada tus deseos, tus ocasiones y tus reservas.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="px-gutter mx-auto flex w-full max-w-[34rem] flex-1 flex-col gap-8 py-14">
      <header className="space-y-3">
        <h1 className="font-display display-md">Privacidad</h1>
        <p className="text-muted">
          Wishlist es una aplicación para dos personas. Esto es todo lo que hace con vuestros datos.
        </p>
      </header>

      <div className="space-y-7">
        {SECTIONS.map((section) => (
          <section key={section.title} className="space-y-1.5">
            <h2 className="font-display display-sm">{section.title}</h2>
            <p className="leading-relaxed text-muted">{section.body}</p>
          </section>
        ))}
      </div>

      <footer className="border-t border-border pt-6 text-sm">
        <Link href="/" className="text-muted underline underline-offset-4">
          Volver al inicio
        </Link>
      </footer>
    </main>
  );
}
