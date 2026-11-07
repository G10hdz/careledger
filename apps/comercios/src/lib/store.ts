import type { ComercioStore } from './types'

/** Persistencia local del terminal. Offline-first: nada sale del dispositivo
 *  hasta que la cola de sync se confirma. */

export const STORAGE_KEY = 'careledger:comercios:v1'

export function emptyStore(): ComercioStore {
  return { comercio: null, cobros: [], liquidaciones: [] }
}

/** Tolerante a datos corruptos o de versiones viejas: nunca revienta. */
export function parseStore(raw: unknown): ComercioStore {
  if (typeof raw !== 'object' || raw === null) return emptyStore()
  const obj = raw as Record<string, unknown>
  return {
    comercio: isComercio(obj.comercio) ? obj.comercio : null,
    cobros: Array.isArray(obj.cobros) ? obj.cobros : [],
    liquidaciones: Array.isArray(obj.liquidaciones) ? obj.liquidaciones : [],
  }
}

function isComercio(v: unknown): v is ComercioStore['comercio'] {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return (
    typeof o.nombre === 'string' &&
    typeof o.clabe === 'string' &&
    typeof o.placaFolio === 'string' &&
    o.estado === 'afiliado'
  )
}

export function loadStore(): ComercioStore {
  if (typeof window === 'undefined') return emptyStore()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? parseStore(JSON.parse(raw)) : emptyStore()
  } catch {
    return emptyStore()
  }
}

export function saveStore(store: ComercioStore): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}
