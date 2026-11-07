import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = { title: 'Servicios de cuidado | EntreManos', description: 'Encuentra servicios de cuidado cerca de ti.' }
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><body>{children}</body></html> }
