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
import { cobrarVale, type CobroInput } from '@/lib/cobro'
import { confirmarLiquidacion, liquidarDia, sincronizarTodo, type LiquidarResult } from '@/lib/liquidacion'
import type { CobroResult } from '@/lib/types'

export interface StoreActions {
  registrar: (datos: AfiliacionDatos) => AfiliacionResult
  cobrar: (input: CobroInput) => Promise<CobroResult>
  sincronizar: () => void
  liquidar: () => LiquidarResult
  confirmarLiquidacion: (id: string) => boolean
}

interface StoreContextValue {
  /** null mientras se monta el cliente (evita desajuste de hidratación). */
  store: ComercioStore | null
  actions: StoreActions
}

const StoreContext = createContext<StoreContextValue | null>(null)

/** Resultado de liquidar el día. Tipo re-exportado para la UI. */
export type { LiquidarResult }

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
    async (input: CobroInput): Promise<CobroResult> => {
      if (!store) return { ok: false, reason: 'folio_invalido', folio: '' }
      const resultado = await cobrarVale(store, input)
      if (resultado.ok) setStore({ ...store })
      return resultado
    },
    [store],
  )

  const sincronizar = useCallback(() => {
    if (!store) return
    sincronizarTodo(store)
    setStore({ ...store })
  }, [store])

  const liquidar = useCallback((): LiquidarResult => {
    if (!store) return { ok: false, reason: 'sin_comercio' }
    const resultado = liquidarDia(store)
    if (resultado.ok) setStore({ ...store })
    return resultado
  }, [store])

  const confirmar = useCallback(
    (id: string): boolean => {
      if (!store) return false
      const confirmada = confirmarLiquidacion(store, id)
      if (confirmada) setStore({ ...store })
      return confirmada
    },
    [store],
  )

  const value = useMemo(
    () => ({
      store,
      actions: { registrar, cobrar, sincronizar, liquidar, confirmarLiquidacion: confirmar },
    }),
    [store, registrar, cobrar, sincronizar, liquidar, confirmar],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useComercioStore(): StoreContextValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useComercioStore debe usarse dentro de StoreProvider')
  return ctx
}
