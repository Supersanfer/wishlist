import type { Metadata, Viewport } from "next";
import { Fraunces, Geist } from "next/font/google";

import { RegisterSW } from "@/components/register-sw";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wishlist-seven-zeta.vercel.app";

export const metadata: Metadata = {
  // Necesario para que las URL de compartir se resuelvan absolutas.
  metadataBase: new URL(SITE_URL),
  title: { default: "Wishlist", template: "%s · Wishlist" },
  description:
    "Una lista privada para dos: apunta lo que te hace ilusión y reserva su regalo sin que se entere.",
  manifest: "/manifest.webmanifest",
  applicationName: "Wishlist",
  appleWebApp: {
    capable: true,
    title: "Wishlist",
    // Translúcida para que el fondo del papel suba hasta el notch. Con "default"
    // el inset superior es 0 y la franja blanca corta el diseño.
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    // iOS no lee el manifest para el icono de la pantalla de inicio.
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: "Wishlist",
    title: "Wishlist",
    description: "Una lista privada para dos. Reserva su regalo sin que se entere.",
    locale: "es_ES",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Wishlist" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wishlist",
    description: "Una lista privada para dos. Reserva su regalo sin que se entere.",
    images: ["/og.png"],
  },
  formatDetection: { telephone: false, date: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Con el teclado abierto, el viewport se encoge en lugar de que la barra fija
  // se monte encima del campo enfocado.
  interactiveWidget: "resizes-content",
  // Deben coincidir con --background de globals.css, o se ve una costura
  // entre la barra de estado y la página.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7f1" },
    { media: "(prefers-color-scheme: dark)", color: "#131110" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geist.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
