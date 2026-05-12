import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** Allow next/image for Supabase Storage public URLs (project-specific hostname). */
function supabaseStorageRemotePatterns(): NonNullable<
  NextConfig["images"]
>["remotePatterns"] {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) {
    return [];
  }
  try {
    const url = new URL(raw);
    const protocol = url.protocol === "https:" ? "https" : "http";
    return [
      {
        protocol,
        hostname: url.hostname,
        ...(url.port ? { port: url.port } : {}),
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return [];
  }
}

// `serverActions.bodySizeLimit` is supported at runtime; some `NextConfig` type versions omit it.
const nextConfig = {
  // Avoid picking a parent-folder package-lock as the monorepo root on CI (e.g. Vercel).
  outputFileTracingRoot: projectRoot,
  images: {
    remotePatterns: supabaseStorageRemotePatterns(),
  },
  // Default limit (~1mb) rejects typical PNG/JPEG uploads from admin forms.
  serverActions: {
    bodySizeLimit: "10mb",
  },
} satisfies NextConfig & {
  serverActions?: { bodySizeLimit?: string };
};

export default nextConfig;
