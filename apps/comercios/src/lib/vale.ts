import type { Voucher } from '@careledger/domain'
import { pointsToMxn } from '@careledger/domain'
import { folioValido } from './folio'
import { stableStringify, verificarFirma, verificarFirmaEd25519 } from './firma'

/**
 * Contrato del vale entre la PWA (emisor) y el terminal (verificador).
 *
 * Esquema `ed25519` (v1) — lo que emite la PWA hoy en el QR:
 * ```
 * { folio, benefitId, points, mxn, issuedAt, validUntil, code, sig }
 * ```
 * - `sig` es Ed25519 (WebCrypto) en b64url sin padding sobre el payload
 *   canónico `stableStringify({benefitId, costPoints: points, folio,
 *   issuedAt, validUntil})` (claves ordenadas, JSON sin espacios, UTF-8).
 * - `mxn` es la paridad oficial (points × $10 MXN); el terminal la
 *   re-deriva y rechaza cualquier desajuste (vale alterado).
 * - El caregiverId NO viaja en el QR (REQ-PWA-011); por eso la PWA firma
 *   un payload compacto aparte de la firma de ledger.
 * - Verificación con la clave pública demo del llavero municipal embebida
 *   en firma.ts (LEDGER_PUBLIC_JWK_DEMO); en producción se reemplaza por
 *   el llavero real, sin cambio de formato.
 *
 * Esquema `hmac-dev` (legacy, prototipo temprano): el JSON del Voucher
 * completo con `ledgerSignature` hex-64 (HMAC-SHA256, clave simulada).
 * Se conserva para fixtures y demos locales previos.
 */
export interface ValeCompacto {
  folio: string
  benefitId: string
  /** puntos del beneficio (costPoints en la PWA) */
  points: number
  /** equivalente en pesos: pointsToMxn(points) */
  mxn: number
  issuedAt: string
  validUntil: string
  /** código manual de respaldo (12 dígitos) */
  code?: string
  /** firma Ed25519 b64url sin padding sobre el payload canónico */
  sig: string
}

export type VerificacionVale =
  | { ok: true }
  | { ok: false; reason: 'firma_invalida' | 'vencido' | 'aun_no_vigente' | 'usado' | 'folio_invalido' }

/** Payload canónico firmado por la PWA para el QR (sin caregiverId). */
export function payloadCanonicoCompacto(c: ValeCompacto): string {
  return stableStringify({
    benefitId: c.benefitId,
    costPoints: c.points,
    folio: c.folio,
    issuedAt: c.issuedAt,
    validUntil: c.validUntil,
  })
}

/** Voucher (tipo del dominio) derivado del vale compacto del QR. */
export function voucherDesdeCompacto(c: ValeCompacto): Voucher {
  return {
    folio: c.folio,
    benefitId: c.benefitId,
    caregiverId: '',
    issuedAt: c.issuedAt,
    validUntil: c.validUntil,
    status: 'activo',
    ledgerSignature: c.sig,
    manualCode: c.code ?? '',
  }
}

/**
 * Verificación local del vale REQ-COM-002: firma, vigencia y estado,
 * todo offline. No toca storage ni red: pura sobre los datos del vale.
 *
 * `compacto` presente → esquema ed25519 del QR de la PWA; ausente →
 * esquema hmac-dev del Voucher completo.
 */
export async function verificarVale(
  vale: Voucher,
  now = new Date(),
  compacto?: ValeCompacto,
): Promise<VerificacionVale> {
  if (!folioValido(vale.folio)) return { ok: false, reason: 'folio_invalido' }
  if (compacto) {
    if (!Number.isInteger(compacto.points) || compacto.points <= 0) {
      return { ok: false, reason: 'firma_invalida' }
    }
    if (compacto.mxn !== pointsToMxn(compacto.points)) {
      return { ok: false, reason: 'firma_invalida' }
    }
    const valida = await verificarFirmaEd25519(payloadCanonicoCompacto(compacto), compacto.sig)
    if (!valida) return { ok: false, reason: 'firma_invalida' }
  } else if (!verificarFirma(vale)) {
    return { ok: false, reason: 'firma_invalida' }
  }
  const t = now.getTime()
  if (t < new Date(vale.issuedAt).getTime()) return { ok: false, reason: 'aun_no_vigente' }
  if (t > new Date(vale.validUntil).getTime()) return { ok: false, reason: 'vencido' }
  if (vale.status !== 'activo') return { ok: false, reason: 'usado' }
  return { ok: true }
}
