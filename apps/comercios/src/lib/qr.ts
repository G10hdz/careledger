import type { Voucher } from '@careledger/domain'
import { folioValido } from './folio'
import { voucherDesdeCompacto, type ValeCompacto } from './vale'

export interface QrDecodificado {
  folio: string
  manualCode?: string
  /** Vale completo embebido en el QR (la cuidadora puede mostrarlo offline). */
  voucher?: Voucher
  /** Vale compacto firmado Ed25519 emitido por la PWA (contrato v1). */
  compacto?: ValeCompacto
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

function esValeCompacto(v: unknown): v is ValeCompacto {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return (
    typeof o.folio === 'string' &&
    typeof o.benefitId === 'string' &&
    typeof o.points === 'number' &&
    typeof o.mxn === 'number' &&
    typeof o.issuedAt === 'string' &&
    typeof o.validUntil === 'string' &&
    typeof o.sig === 'string' &&
    (o.code === undefined || typeof o.code === 'string')
  )
}

/**
 * Decodifica el contenido de un QR de vale:
 * - JSON vale compacto ed25519 de la PWA {folio, benefitId, points, mxn, issuedAt, validUntil, code?, sig}
 * - JSON con el vale completo (esquema hmac-dev)
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
    if (esValeCompacto(json)) {
      const voucher = voucherDesdeCompacto(json)
      const resultado: QrDecodificado = { folio: voucher.folio, voucher, compacto: json }
      if (voucher.manualCode) resultado.manualCode = voucher.manualCode
      return resultado
    }
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
