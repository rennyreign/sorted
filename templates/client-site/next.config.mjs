const basePath = process.env.PREVIEW_BASE_PATH || ""

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  output: "export",
  trailingSlash: true,
  // Set PREVIEW_BASE_PATH (e.g. /preview/<slug>) when building for the
  // Hostinger preview path so routes and assets resolve under the subdir.
  basePath,
  assetPrefix: basePath || undefined,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
