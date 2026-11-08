import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@careledger/domain'],
  async rewrites() {
    return { beforeFiles: [{ source: '/', destination: '/landing.html' }], afterFiles: [], fallback: [] }
  },
}

export default nextConfig
