'use client'

import { BankHome } from '@/components/BankViews'

export default function AppPage() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-10 border-b border-outline-variant bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <a href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight" aria-label="EntreManos, inicio">
            <span className="grid -rotate-12 grid-cols-[repeat(2,8px)] gap-[3px]" aria-hidden="true">
              <i className="h-3 w-2 rounded-full bg-primary" />
              <i className="h-3 w-2 rounded-full bg-[#829773]" />
              <i className="h-3 w-2 rounded-full bg-[#829773]" />
              <i className="h-3 w-2 rounded-full bg-primary" />
            </span>
            entremanos
          </a>
          <nav className="flex items-center gap-5 text-sm" aria-label="Principal">
            <a href="/#como" className="hidden sm:inline">Cómo funciona</a>
            <a href="/#reglas" className="hidden sm:inline">Reglas</a>
            <a href="/" className="rounded-full border border-primary px-4 py-2 font-semibold">Inicio</a>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
        <BankHome />
      </main>
    </div>
  )
}
