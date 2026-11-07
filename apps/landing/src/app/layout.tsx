import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const jakarta = localFont({
  src: './fonts/plus-jakarta-sans-latin.woff2',
  weight: '400 800',
  style: 'normal',
  variable: '--font-jakarta',
  display: 'optional',
  preload: true,
})

const atkinson = localFont({
  src: './fonts/atkinson-hyperlegible-next-latin.woff2',
  weight: '400 700',
  style: 'normal',
  variable: '--font-atkinson',
  display: 'optional',
  preload: true,
})

export const metadata: Metadata = {
  title: {
    default: 'Cuando cuidas, te descuidas · El tiempo de cuidado se convierte en Puntos Cívicos',
    template: '%s · Cuando cuidas, te descuidas',
  },
  description:
    'Cuando cuidas, te descuidas certifica las horas de cuidado no remunerado y las convierte en Puntos Cívicos canjeables por luz, transporte y horas de relevo. Infraestructura cívica, no caridad.',
  applicationName: 'Cuando cuidas, te descuidas',
  authors: [{ name: 'Cuando cuidas, te descuidas' }],
  creator: 'Cuando cuidas, te descuidas',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    siteName: 'Cuando cuidas, te descuidas',
    title: 'Cuando cuidas, te descuidas · El tiempo de cuidado se convierte en Puntos Cívicos',
    description:
      'Horas de cuidado certificadas, Puntos Cívicos y beneficios reales: luz, transporte y relevo. Conoce la ruta del tiempo.',
  },
}

export const viewport: Viewport = {
  themeColor: '#00685f',
  colorScheme: 'light',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX" className={`${jakarta.variable} ${atkinson.variable}`}>
      <body className="bg-surface font-body text-on-surface antialiased">
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  )
}
