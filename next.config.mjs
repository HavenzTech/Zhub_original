/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build validation now enabled - TypeScript and ESLint errors will cause build failures
  images: {
    unoptimized: true,
  },
}

export default nextConfig
