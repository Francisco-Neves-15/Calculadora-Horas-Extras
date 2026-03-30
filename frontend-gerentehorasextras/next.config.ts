import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    resolveAlias: {
      "@": "./src",
      "@vars": "./src/styles/_variables.scss",
      "@mixins": "./src/styles/_mixins.scss",
    },
  },
  sassOptions: {
    includePaths: [path.join(process.cwd(), "src")],
  },
};

export default nextConfig;
