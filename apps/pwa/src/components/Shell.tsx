'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { LANGS, type Lang } from '@/lib/langs'
import { useCare } from './Provider'

function IconHeart() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.8C19 15.6 12 20 12 20z" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function IconLeaf() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 19c8 0 14-8 14-14-6 0-14 6-14 14z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 16c2-2 4-5 6-8" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function IconCard() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function IconBook() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H20v16H7.5A2.5 2.5 0 0 0 5 21.5z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

const TABS = [
  { href: '/', label: 'tabRegister' as const, icon: IconHeart },
  { href: '/impacto', label: 'tabImpact' as const, icon: IconLeaf },
  { href: '/billetera', label: 'tabWallet' as const, icon: IconCard },
  { href: '/formacion', label: 'tabTraining' as const, icon: IconBook },
]

export function Shell({ children }: { children: ReactNode }) {
  const { snap, t, setLang, lang, error } = useCare()
  const pathname = usePathname()
  const pending = snap?.pendingSync ?? 0
  const [online, setOnline] = useState(true)
  const syncText = pending > 0 ? (pending === 1 ? t('pendingOne') : t('pendingMany', { n: pending })) : t('synced')

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine)
    sync()
    window.addEventListener('online', sync)
    window.addEventListener('offline', sync)
    if ('serviceWorker' in navigator) void navigator.serviceWorker.register('/sw.js')
    return () => {
      window.removeEventListener('online', sync)
      window.removeEventListener('offline', sync)
    }
  }, [])

  return (
    <div className="phone mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-background">
      <header className="no-print sticky top-0 z-20 border-b border-outline-variant bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold text-on-surface">EntreManos</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-on-surface" data-testid="status-node">
              <span className="inline-block size-2.5 rounded-full bg-primary" aria-hidden="true" />
              <span>
                {t('nodeActive')}: {snap?.nodeName ?? '…'}
              </span>
            </p>
          </div>
          <p className="text-right text-sm font-semibold text-secondary" data-testid="status-sync" aria-live="polite">
            {syncText}
            {!online ? <span className="mt-1 block font-normal text-on-surface-variant">{t('offline')}</span> : null}
          </p>
        </div>
        <div className="mt-3 flex items-center gap-2" role="radiogroup" aria-label={t('language')}>
          <span className="font-display text-sm font-semibold text-on-surface">{t('language')}</span>
          {LANGS.map((code) => (
            <button
              key={code}
              type="button"
              role="radio"
              aria-checked={lang === code}
              data-testid={`lang-${code}`}
              className={
                lang === code
                  ? 'press min-h-12 min-w-12 rounded-full bg-primary px-3 font-display text-sm font-semibold text-on-primary'
                  : 'press min-h-12 min-w-12 rounded-full bg-surface-container px-3 font-display text-sm font-semibold text-on-surface'
              }
              onClick={() => void setLang(code as Lang)}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      </header>
      <main className="flex-1 px-4 pb-28 pt-4">
        {error ? <p className="text-base text-error">{t('saveError')}</p> : null}
        {!snap && !error ? <p className="text-base text-on-surface-variant">{t('loading')}</p> : children}
      </main>
      <nav className="no-print fixed bottom-0 z-20 mx-auto flex w-full max-w-[430px] border-t border-outline-variant bg-background" aria-label="EntreManos">
        {TABS.map((tab) => {
          const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={
                active
                  ? 'flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-sm font-semibold text-primary'
                  : 'flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-sm font-semibold text-on-surface-variant'
              }
            >
              <Icon />
              {t(tab.label)}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
