import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@careledger/domain'],
  // La historia del pitch es el banco de tiempo EntreManos. Puntos Cívicos
  // queda en /puntos-civicos como visión.
  async redirects() {
    return [{ source: '/', destination: '/cuidared', permanent: false }]
  },
}

export default nextConfig
