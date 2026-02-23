import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `http://localhost:${process.env.PORT || 3007}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
