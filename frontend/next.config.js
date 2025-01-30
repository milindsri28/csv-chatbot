/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This will suppress the warning about Grammarly attributes
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
}

module.exports = nextConfig
