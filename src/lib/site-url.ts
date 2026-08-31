import { headers } from "next/headers";

/** Origen real de la peticion (funciona igual en local y detrás del proxy de Vercel). */
export async function siteOrigin(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}
