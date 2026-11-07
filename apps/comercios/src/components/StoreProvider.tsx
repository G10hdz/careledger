'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { ComercioStore } from '@/lib/types'
import { loadStore, saveStore } from '@/lib/store'
import { registrarComercio, type AfiliacionDatos, type AfiliacionResult } from '@/lib/afiliacion'

export interface StoreActions {
  registrar: (datos: AfiliacionDatos) => AfiliacionResult
}

interface StoreContextValue {
  /** null mientras se monta el cliente (evita desajuste de hidratación). */
  store: ComercioStore | null
  actions: StoreActions
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<ComercioStore | null>(null)

  useEffect(() => {
    setStore(loadStore())
  }, [])

  useEffect(() => {
    if (store) saveStore(store)
  }, [store])

  const registrar = useCallback(
    (datos: AfiliacionDatos): AfiliacionResult => {
      if (!store) return { ok: false, reason: 'documentos_faltantes' }
      const resultado = registrarComercio(store, datos)
      if (resultado.ok) setStore({ ...store })
      return resultado
    },
    [store],
  )

  const value = useMemo(() => ({ store, actions: { registrar } }), [store, registrar])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useComercioStore(): StoreContextValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useComercioStore debe usarse dentro de StoreProvider')
  return ctx
}
