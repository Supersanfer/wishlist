"use client";

import { useEffect } from "react";

/** Registra el service worker. Sólo en producción para no interferir en dev. */
export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Un fallo al registrar el SW no debe romper la app.
    });
  }, []);

  return null;
}
