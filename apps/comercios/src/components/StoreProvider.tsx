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
import { cobrarVale, marcarSincronizado, type CobroInput } from '@/lib/cobro'
import type { CobroResult } from '@/lib/types'

export interface StoreActions {
  registrar: (datos: AfiliacionDatos) => AfiliacionResult
  cobrar: (input: CobroInput) => CobroResult
  sincronizar: () => void
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

  const cobrar = useCallback(
    (input: CobroInput): CobroResult => {
      if (!store) return { ok: false, reason: 'folio_invalido', folio: '' }
      const resultado = cobrarVale(store, input)
      if (resultado.ok) setStore({ ...store })
      return resultado
    },
    [store],
  )

  const sincronizar = useCallback(() => {
    if (!store) return
    for (const cobro of store.cobros) marcarSincronizado(store, cobro.folio)
    setStore({ ...store })
  }, [store])

  const value = useMemo(
    () => ({ store, actions: { registrar, cobrar, sincronizar } }),
    [store, registrar, cobrar, sincronizar],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useComercioStore(): StoreContextValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useComercioStore debe usarse dentro de StoreProvider')
  return ctx
}
