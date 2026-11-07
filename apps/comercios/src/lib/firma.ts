import type { Voucher } from '@careledger/domain'
import { hex, hmacSha256, utf8 } from './sha256'

/**
 * Firma del ledger, verificable OFFLINE en la terminal (REQ-COM-002).
 *
 * Prototipo: HMAC-SHA256 con clave pública simulada embebida en la app.
 * El despliegue real la reemplaza por Ed25519 con el llavero municipal
 * distribuido en la app, sin cambiar esta interfaz: una firma se calcula
 * y se verifica contra los mismos campos canónicos del vale.
 */
export const LEDGER_KEY_MOCK = 'careledger:ledger:prototipo:v1'

export function firmaCanonica(v: Voucher): string {
  return [v.folio, v.benefitId, v.issuedAt, v.validUntil, v.manualCode].join('|')
}

export function calcularFirma(v: Voucher, key = LEDGER_KEY_MOCK): string {
  return hex(hmacSha256(utf8(key), utf8(firmaCanonica(v))))
}

export function verificarFirma(v: Voucher, key = LEDGER_KEY_MOCK): boolean {
  if (!/^[0-9a-f]{64}$/.test(v.ledgerSignature)) return false
  return v.ledgerSignature === calcularFirma(v, key)
}

/** Vale firmado con los campos dados. Los fixtures usan esto, no firmas fijas. */
export function firmarVale(v: Omit<Voucher, 'ledgerSignature'>): Voucher {
  const vale = { ...v } as Voucher
  vale.ledgerSignature = calcularFirma(vale)
  return vale
}
