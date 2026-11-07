import type { Metadata, Viewport } from 'next'
import { Atkinson_Hyperlegible_Next, Plus_Jakarta_Sans } from 'next/font/google'
import { StoreProvider } from '@/components/StoreProvider'
import { AppShell } from '@/components/AppShell'
import './globals.css'

const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const body = Atkinson_Hyperlegible_Next({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Comercios · CareLedger',
  description:
    'Terminal de cobro para comercios solidarios: vales de Puntos Cívicos y liquidación SPEI sin comisión.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#00685f',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-dvh">
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  )
}
