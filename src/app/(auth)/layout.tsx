import { redirect } from "next/navigation";

import { destinationFor, getCoupleState, getUser } from "@/lib/auth";

/** Quien ya tiene sesion no deberia ver login ni registro. */
export default async function AuthLayout({ children }: LayoutProps<"/">) {
  const user = await getUser();
  if (user) redirect(destinationFor(await getCoupleState(user.id)));

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 px-6 py-12">
      {children}
    </main>
  );
}
