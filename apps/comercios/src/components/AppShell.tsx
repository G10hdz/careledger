'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

const RUTAS = [
  { href: '/', label: 'Cobrar' },
  { href: '/historial', label: 'Historial' },
  { href: '/afiliacion', label: 'Afiliación' },
  { href: '/distintivo', label: 'Mi placa' },
] as const

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[640px] flex-col">
      <header className="sticky top-0 z-10 border-b border-outline-variant bg-surface-container-lowest/95 backdrop-blur">
        <div className="flex items-center justify-between px-gutter py-sm">
          <div className="flex flex-col">
            <span className="font-display text-label-lg font-semibold text-on-surface">
              Cuando cuidas, te descuidas Comercios
            </span>
            <span className="text-label-sm text-on-surface-variant">
              Terminal de cobro y liquidación
            </span>
          </div>
          <span className="inline-flex items-center gap-xs rounded-full bg-secondary-fixed px-sm py-xs text-label-sm text-on-secondary-fixed-variant">
            Offline listo
          </span>
        </div>
      </header>

      <main className="flex-1 px-gutter pb-[88px] pt-md">{children}</main>

      <nav className="sticky bottom-0 border-t border-outline-variant bg-surface-container-lowest">
        <div className="grid grid-cols-4" aria-label="Navegación principal">
          {RUTAS.map((ruta) => {
            const activa = pathname === ruta.href
            return (
              <Link
                key={ruta.href}
                href={ruta.href}
                aria-current={activa ? 'page' : undefined}
                className={`flex min-h-[56px] items-center justify-center px-sm py-xs text-label-md font-semibold ${
                  activa ? 'text-primary' : 'text-on-surface-variant'
                }`}
              >
                {ruta.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
