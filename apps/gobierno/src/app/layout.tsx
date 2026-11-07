import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'Impacto público | Cuando cuidas, te descuidas', description: 'Panel de impacto y retorno social de la inversión.' }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>
}
