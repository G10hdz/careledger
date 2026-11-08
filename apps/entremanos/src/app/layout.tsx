import type { Metadata, Viewport } from 'next'
import { Atkinson_Hyperlegible, Plus_Jakarta_Sans } from 'next/font/google'
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
  title: 'EntreManos · Banco de tiempo de cuidados',
  description: 'Una hora de cuidado, una hora de vuelta. Sin dinero de por medio.',
  applicationName: 'EntreManos',
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
      <body>{children}</body>
    </html>
  )
}
