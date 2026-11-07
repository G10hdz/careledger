import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@careledger/domain'],
}

export default nextConfig
