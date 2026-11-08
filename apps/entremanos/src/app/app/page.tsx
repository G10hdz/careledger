'use client'

import { BankHome } from '@/components/BankViews'

export default function AppPage() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-[430px] bg-background">
      <header className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
        <a href="/" className="font-display text-lg font-bold">entremanos</a>
        <span className="text-sm text-on-surface-variant">Piloto Iztapalapa</span>
      </header>
      <main className="px-4 py-5">
        <BankHome />
      </main>
    </div>
  )
}
