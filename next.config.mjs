/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  output: "export",
  trailingSlash: true,
  basePath: process.env.NODE_ENV === "production" ? "/sorted" : "",
  images: {
    unoptimized: true,
  },
}

export default nextConfig
