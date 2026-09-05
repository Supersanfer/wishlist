import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fija la raiz del proyecto: si no, Turbopack sube hasta el home del usuario
  // buscando un lockfile.
  turbopack: { root: path.resolve(__dirname) },

  // Las imagenes de deseos pueden llegar hasta 5 MB.
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
