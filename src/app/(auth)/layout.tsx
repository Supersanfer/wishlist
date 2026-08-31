import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth-shell";
import { destinationFor, getCoupleState, getUser } from "@/lib/auth";

/** Quien ya tiene sesion no deberia ver login ni registro. */
export default async function AuthLayout({ children }: LayoutProps<"/">) {
  const user = await getUser();
  if (user) redirect(destinationFor(await getCoupleState(user.id)));

  return (
    <AuthShell>{children}</AuthShell>
  );
}
