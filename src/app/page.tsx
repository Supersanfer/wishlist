import { redirect } from "next/navigation";

import { getUser, landingAfterAuth } from "@/lib/auth";

export default async function HomePage() {
  const user = await getUser();
  if (!user) redirect("/login");
  redirect(await landingAfterAuth(user.id));
}
