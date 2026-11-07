import type { Voucher } from '@careledger/domain'
import { pointsToMxn } from '@careledger/domain'
import type { CobroRecord, CobroRejectReason, CobroResult, ComercioStore } from './types'
import { normalizarFolio } from './folio'
import { verificarVale } from './vale'
import { benefitPoints } from './catalogo'

export interface CobroInput {
  voucher: Voucher
  /** Código manual tecleado junto al folio; si viene en el QR ya está en el vale. */
  manualCode?: string
  now?: Date
}

/**
 * Cobro de un vale REQ-COM-002/003/007. Puro y determinístico: la
 * idempotencia es local (mismo folio dos veces = rechazo), funciona
 * 100% offline y el cobro entra a la cola de sync como `synced: false`.
 */
export function cobrarVale(store: ComercioStore, input: CobroInput): CobroResult {
  const { voucher } = input
  const folio = normalizarFolio(voucher.folio)

  const yaCobrado = store.cobros.some((c) => c.folio === folio)
  if (yaCobrado) return { ok: false, reason: 'ya_cobrado', folio }

  const verificacion = verificarVale(voucher, input.now)
  if (!verificacion.ok) {
    let reason: CobroRejectReason
    switch (verificacion.reason) {
      case 'usado':
        reason = 'vale_ya_usado_en_ledger'
        break
      case 'vencido':
        reason = 'vale_vencido'
        break
      case 'aun_no_vigente':
        reason = 'vale_aun_no_vigente'
        break
      default:
        reason = verificacion.reason
    }
    return { ok: false, reason, folio }
  }

  if (input.manualCode !== undefined && input.manualCode !== voucher.manualCode) {
    return { ok: false, reason: 'codigo_manual_invalido', folio }
  }

  const points = benefitPoints(voucher.benefitId)
  if (points === null) return { ok: false, reason: 'beneficio_desconocido', folio }

  const cobro: CobroRecord = {
    folio,
    benefitId: voucher.benefitId,
    points,
    mxn: pointsToMxn(points),
    capturedAt: (input.now ?? new Date()).toISOString(),
    synced: false,
  }
  store.cobros.push(cobro)
  return { ok: true, cobro, mxn: cobro.mxn, points }
}

/** Cola de sync: cobros que aún no se confirman al ledger central. */
export function colaSync(store: ComercioStore): CobroRecord[] {
  return store.cobros.filter((c) => !c.synced)
}

/** Marca el folio como confirmado al ledger (sync simulado). */
export function marcarSincronizado(store: ComercioStore, folio: string): void {
  for (const cobro of store.cobros) {
    if (cobro.folio === folio) cobro.synced = true
  }
}
