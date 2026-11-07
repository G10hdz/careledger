import type { ComercioStore, Liquidacion } from './types'
import { colaSync, marcarSincronizado } from './cobro'

export const SPEI_ETA_HORAS = 24

/** YYYY-MM-DD en hora local a partir de un ISO. */
export function dateKey(iso: string): string {
  const d = new Date(iso)
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

export function cobrosDelDia(store: ComercioStore, key: string) {
  return store.cobros.filter((c) => dateKey(c.capturedAt) === key)
}

/** Folios que ya entraron en alguna liquidación: nunca se liquidan dos veces. */
export function foliosLiquidados(store: ComercioStore): Set<string> {
  return new Set(store.liquidaciones.flatMap((l) => l.folios))
}

export type LiquidarResult =
  | { ok: true; liquidacion: Liquidacion }
  | { ok: false; reason: 'sin_comercio' | 'sin_cobros' }

/**
 * Batch de liquidación SPEI REQ-COM-004: agrupa los cobros del día que aún
 * no se liquidaron, transfiere el 100% (0% comisión) y programa la
 * transferencia a ≤24h. Un folio entra en una sola liquidación.
 */
export function liquidarDia(store: ComercioStore, now = new Date()): LiquidarResult {
  if (!store.comercio) return { ok: false, reason: 'sin_comercio' }
  const key = dateKey(now.toISOString())
  const yaLiquidados = foliosLiquidados(store)
  const pendientes = cobrosDelDia(store, key).filter((c) => !yaLiquidados.has(c.folio))
  if (pendientes.length === 0) return { ok: false, reason: 'sin_cobros' }

  const seq = store.liquidaciones.filter((l) => l.dateKey === key).length + 1
  const createdAt = now.toISOString()
  const eta = new Date(now.getTime() + SPEI_ETA_HORAS * 60 * 60 * 1000)

  const liquidacion: Liquidacion = {
    id: `LIQ-${key}-${seq}`,
    dateKey: key,
    folios: pendientes.map((c) => c.folio),
    amountMxn: pendientes.reduce((suma, c) => suma + c.mxn, 0),
    clabe: store.comercio.clabe,
    status: 'programada',
    createdAt,
    etaAt: eta.toISOString(),
  }
  store.liquidaciones.push(liquidacion)
  return { ok: true, liquidacion }
}

/** Acuse del banco (simulado): la transferencia programada se confirma. */
export function confirmarLiquidacion(
  store: ComercioStore,
  id: string,
  now = new Date(),
): boolean {
  const liquidacion = store.liquidaciones.find((l) => l.id === id)
  if (!liquidacion || liquidacion.status !== 'programada') return false
  liquidacion.status = 'confirmada'
  liquidacion.confirmedAt = now.toISOString()
  return true
}

export function liquidacionesPendientes(store: ComercioStore): Liquidacion[] {
  return store.liquidaciones.filter((l) => l.status === 'programada')
}

export function liquidacionesConfirmadas(store: ComercioStore): Liquidacion[] {
  return store.liquidaciones.filter((l) => l.status === 'confirmada')
}

/** Sync simulado del día: marca todos los cobros pendientes como confirmados. */
export function sincronizarTodo(store: ComercioStore): number {
  const pendientes = colaSync(store)
  for (const cobro of pendientes) marcarSincronizado(store, cobro.folio)
  return pendientes.length
}
