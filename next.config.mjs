/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",

  // SEO / performance niceties
  poweredByHeader: false,
  compress: true,

  // Prisma (and other native/CJS server deps) must not be bundled by Turbopack
  serverExternalPackages: ["@prisma/client", "prisma", "bcryptjs", "jsonwebtoken", "mysql2"],

  // allow the sandbox preview host to load dev assets
  allowedDevOrigins: ["localhost", "space-z.ai", "*.space-z.ai"],

  // turbopack.root removed — it pointed to a non-existent path
  // (/home/z/my-project/yourhentaitv) and crashed the Vercel build,
  // which is why /ott/* returned 404 (Vercel kept serving the old build).

  images: {
    unoptimized: true,
    qualities: [20, 75, 100],
    remotePatterns: [
      { protocol: "https", hostname: "animeidhentai.com" },
      { protocol: "https", hostname: "www.animeidhentai.com" },
    ],
  },
};

export default nextConfig;
