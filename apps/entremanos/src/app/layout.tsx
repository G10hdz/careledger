import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EntreManos · Banco de tiempo de cuidados',
  description: 'Una hora de cuidado, una hora de vuelta. Sin dinero de por medio.',
  applicationName: 'EntreManos',
}

export const viewport: Viewport = {
  themeColor: '#374b42',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
