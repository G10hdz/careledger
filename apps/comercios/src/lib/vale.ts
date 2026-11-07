import type { Voucher } from '@careledger/domain'
import { folioValido } from './folio'
import { verificarFirma } from './firma'

export type VerificacionVale =
  | { ok: true }
  | { ok: false; reason: 'firma_invalida' | 'vencido' | 'aun_no_vigente' | 'usado' | 'folio_invalido' }

/**
 * Verificación local del vale REQ-COM-002: firma, vigencia y estado,
 * todo offline. No toca storage ni red: pura sobre los datos del vale.
 */
export function verificarVale(vale: Voucher, now = new Date()): VerificacionVale {
  if (!folioValido(vale.folio)) return { ok: false, reason: 'folio_invalido' }
  if (!verificarFirma(vale)) return { ok: false, reason: 'firma_invalida' }
  const t = now.getTime()
  if (t < new Date(vale.issuedAt).getTime()) return { ok: false, reason: 'aun_no_vigente' }
  if (t > new Date(vale.validUntil).getTime()) return { ok: false, reason: 'vencido' }
  if (vale.status !== 'activo') return { ok: false, reason: 'usado' }
  return { ok: true }
}
