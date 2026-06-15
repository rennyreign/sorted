/** @type {import('next').NextConfig} */

// API routes are operator/dashboard tooling — they run locally only.
// Static export (Hostinger) does not support server-side routes.
// In CI (NEXT_BUILD_STATIC=true), we skip output: export incompatibility
// by using the standard Next.js server build, then exporting manually.
// In local dev, output is unset so API routes work normally.
const isStaticBuild = process.env.NEXT_BUILD_STATIC === "true"

const nextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  ...(isStaticBuild ? { output: "export" } : {}),
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
