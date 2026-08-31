"use client";

import { useEffect } from "react";

import { Alert } from "@/components/ui";

/**
 * Aviso tras una acción. Limpia su propio parámetro de la URL para que no
 * reaparezca al recargar ni viaje si se comparte el enlace.
 */
export function Flash({ message }: { message: string }) {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.search) {
      window.history.replaceState(null, "", url.pathname);
    }
  }, []);

  return <Alert tone="success">{message}</Alert>;
}
