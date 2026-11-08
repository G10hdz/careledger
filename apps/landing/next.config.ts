import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@careledger/domain'],
  // En el dominio de EntreManos la raíz es la página estática de Hora por Hora.
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/',
          has: [{ type: 'host', value: 'entremanos-mx.vercel.app' }],
          destination: '/hora-por-hora/index.html',
        },
      ],
      afterFiles: [],
      fallback: [],
    }
  },
}

export default nextConfig
