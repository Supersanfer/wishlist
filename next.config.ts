import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fija la raíz del proyecto: si no, Turbopack sube hasta el home del usuario
  // buscando un lockfile.
  turbopack: { root: path.resolve(__dirname) },
};

export default nextConfig;
