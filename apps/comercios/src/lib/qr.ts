import type { Voucher } from '@careledger/domain'
import { folioValido } from './folio'

export interface QrDecodificado {
  folio: string
  manualCode?: string
  /** Vale completo embebido en el QR (la cuidadora puede mostrarlo offline). */
  voucher?: Voucher
}

function esVoucher(v: unknown): v is Voucher {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return (
    typeof o.folio === 'string' &&
    typeof o.benefitId === 'string' &&
    typeof o.issuedAt === 'string' &&
    typeof o.validUntil === 'string' &&
    typeof o.ledgerSignature === 'string' &&
    typeof o.manualCode === 'string' &&
    typeof o.status === 'string'
  )
}

/**
 * Decodifica el contenido de un QR de vale:
 * - JSON con el vale completo (verificación de firma offline)
 * - JSON { folio, manualCode }
 * - texto plano con el folio CV-AAAA-NNNN-MX
 * - prefijo careledger://vale/<folio>
 * Devuelve null si nada es reconocible.
 */
export function decodificarQr(raw: string): QrDecodificado | null {
  const limpio = raw.trim()
  if (!limpio) return null

  const json = parseJsonSeguro(limpio)
  if (json !== undefined) {
    if (esVoucher(json)) {
      return { folio: json.folio, manualCode: json.manualCode, voucher: json }
    }
    if (typeof json === 'object' && json !== null) {
      const o = json as Record<string, unknown>
      if (typeof o.folio === 'string' && folioValido(o.folio)) {
        return typeof o.manualCode === 'string'
          ? { folio: o.folio, manualCode: o.manualCode }
          : { folio: o.folio }
      }
    }
    return null
  }

  const texto = limpio.startsWith('careledger://vale/')
    ? limpio.slice('careledger://vale/'.length)
    : limpio
  return folioValido(texto) ? { folio: texto.toUpperCase().trim() } : null
}

function parseJsonSeguro(raw: string): unknown {
  if (!raw.startsWith('{')) return undefined
  try {
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}
