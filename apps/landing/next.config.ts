import type { NextConfig } from 'next'

const GOBIERNO_ORIGIN = 'https://entremanos-gobierno.vercel.app'

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
      // El panel de gobierno es otro proyecto de Vercel (entremanos-gobierno)
      // con basePath /gobierno; aquí solo se le pasa el tráfico.
      afterFiles: [
        { source: '/gobierno', destination: `${GOBIERNO_ORIGIN}/gobierno` },
        { source: '/gobierno/:path+', destination: `${GOBIERNO_ORIGIN}/gobierno/:path+` },
      ],
      fallback: [],
    }
  },
}

export default nextConfig
