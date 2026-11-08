import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Se sirve en entremanos-mx.vercel.app/gobierno vía rewrite de la landing.
  basePath: '/gobierno',
  transpilePackages: ['@careledger/domain'],
}

export default nextConfig
