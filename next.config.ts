import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Avoid picking a parent-folder package-lock as the monorepo root on CI (e.g. Vercel).
  outputFileTracingRoot: projectRoot,
};

export default nextConfig;
