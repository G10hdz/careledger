import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@careledger/domain'],
  // En el dominio de EntreManos la raíz es la landing EntreManos del banco de tiempo.
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/',
          has: [{ type: 'host', value: 'entremanos-mx.vercel.app' }],
          destination: '/cuidared/index.html',
        },
      ],
      afterFiles: [],
      fallback: [],
    }
  },
}

export default nextConfig
