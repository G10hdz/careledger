'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Snapshot } from '@/lib/app'
import { translate, type CopyKey } from '@/lib/copy'
import type { Lang } from '@/lib/langs'
import { careApp } from '@/lib/singleton'

interface CareContextValue {
  snap: Snapshot | null
  lang: Lang
  error: boolean
  t: (key: CopyKey, vars?: Record<string, string | number>) => string
  setLang: (lang: Lang) => Promise<void>
  refresh: () => Promise<void>
}

const CareContext = createContext<CareContextValue | null>(null)

export function useCare(): CareContextValue {
  const value = useContext(CareContext)
  if (!value) throw new Error('CareProvider')
  return value
}

export function CareProvider({ children }: { children: ReactNode }) {
  const [snap, setSnap] = useState<Snapshot | null>(null)
  const [error, setError] = useState(false)

  const refresh = useCallback(async () => {
    const next = await careApp().snapshot()
    setSnap(next)
    setError(false)
  }, [])

  useEffect(() => {
    const app = careApp()
    let alive = true
    const pull = (task: () => Promise<Snapshot>) => {
      task()
        .then((next) => {
          if (!alive) return
          setSnap(next)
          setError(false)
        })
        .catch(() => {
          if (alive) setError(true)
        })
    }
    pull(() => app.ready())
    const timer = window.setInterval(() => pull(() => app.snapshot()), 1000)
    const onNetwork = () => {
      app.setOnline(navigator.onLine)
      pull(() => app.snapshot())
    }
    window.addEventListener('online', onNetwork)
    window.addEventListener('offline', onNetwork)
    return () => {
      alive = false
      window.clearInterval(timer)
      window.removeEventListener('online', onNetwork)
      window.removeEventListener('offline', onNetwork)
    }
  }, [])

  useEffect(() => {
    if (!snap) return
    document.documentElement.lang = snap.lang === 'nah' ? 'nah' : snap.lang
  }, [snap])

  const lang = snap?.lang ?? 'es'
  const t = useCallback((key: CopyKey, vars?: Record<string, string | number>) => translate(lang, key, vars), [lang])

  const setLang = useCallback(async (next: Lang) => {
    await careApp().setLang(next)
    await refresh()
  }, [refresh])

  const value = useMemo(() => ({ snap, lang, error, t, setLang, refresh }), [snap, lang, error, t, setLang, refresh])

  return <CareContext.Provider value={value}>{children}</CareContext.Provider>
}
