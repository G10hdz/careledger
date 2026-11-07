import type { Metadata, Viewport } from 'next'
import { Atkinson_Hyperlegible, Plus_Jakarta_Sans } from 'next/font/google'
import { CareProvider } from '@/components/Provider'
import { Shell } from '@/components/Shell'
import './globals.css'

const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-plus',
  display: 'swap',
})

const body = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-atkinson',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'EntreManos',
  description: 'Registra tu cuidado y recibe Puntos Cívicos.',
  applicationName: 'EntreManos',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'EntreManos', statusBarStyle: 'default' },
  icons: { icon: '/icons/icon-192.png', apple: '/icons/icon-192.png' },
}

export const viewport: Viewport = {
  themeColor: '#00685f',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body>
        <CareProvider>
          <Shell>{children}</Shell>
        </CareProvider>
      </body>
    </html>
  )
}
