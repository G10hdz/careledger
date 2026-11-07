'use client'

import { createCareApp, type CareApp } from './app'
import { ORACLE_DELAY_MS } from './config'

let app: CareApp | null = null

function delayMs(): number {
  if (typeof window === 'undefined') return ORACLE_DELAY_MS
  const raw = window.sessionStorage.getItem('careledger-oracle-ms')
  const parsed = raw ? Number(raw) : ORACLE_DELAY_MS
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > ORACLE_DELAY_MS) return ORACLE_DELAY_MS
  return parsed
}

export function careApp(): CareApp {
  if (!app) app = createCareApp({ delayMs: delayMs() })
  return app
}
