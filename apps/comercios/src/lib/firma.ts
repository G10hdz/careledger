import type { Voucher } from '@careledger/domain'
import { hex, hmacSha256, utf8 } from './sha256'

/**
 * Firma del ledger, verificable OFFLINE en la terminal (REQ-COM-002).
 *
 * Dos esquemas conviven en el prototipo:
 * - `hmac-dev`: HMAC-SHA256 con clave simulada embebida (fixtures locales).
 * - `ed25519`: Ed25519 (WebCrypto) tal como firma la PWA; la terminal
 *   verifica con la clave pública del llavero municipal distribuida en la
 *   app. El despliegue real reemplaza la clave demo por el llavero real
 *   sin cambiar esta interfaz.
 */
export const LEDGER_KEY_MOCK = 'careledger:ledger:prototipo:v1'

/**
 * Clave pública DEMO del "llavero municipal" (par generado con el código
 * real de la PWA, apps/pwa/src/lib/keys.ts). Es la contraparte pública de
 * apps/pwa/fixtures/demoLedger.ts. No es un secreto: en producción se
 * sustituye por el llavero municipal distribuido fuera de banda.
 */
export const LEDGER_PUBLIC_JWK_DEMO: JsonWebKey = {
  kty: 'OKP',
  crv: 'Ed25519',
  x: '7BGxaJvxMCV6V6lGospqiUKRT8rqR2dulyQzuLrPQ78',
}

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

/**
 * Serialización canónica del contrato de vale (idéntica a la de la PWA,
 * apps/pwa/src/lib/codec.ts): claves ordenadas, arrays ordenados,
 * JSON.stringify sin espacios. Cualquier diferencia rompe la firma.
 */
export function stableStringify(value: Record<string, unknown>): string {
  const sorted: Record<string, unknown> = {}
  for (const key of Object.keys(value).sort()) {
    const item = value[key]
    sorted[key] = Array.isArray(item) ? [...item].sort() : item
  }
  return JSON.stringify(sorted)
}

/** b64url sin padding → bytes (inverso del bytesToB64Url de la PWA). */
export function b64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const b64 = value.replaceAll('-', '+').replaceAll('_', '/')
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4))
  const binary = atob(b64 + pad)
  const bytes = new Uint8Array(new ArrayBuffer(binary.length))
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

/**
 * Verificación Ed25519 (WebCrypto) contra la clave pública del llavero
 * municipal. La firma es b64url sin padding sobre `texto` en UTF-8.
 */
export async function verificarFirmaEd25519(
  texto: string,
  firma: string,
  publicJwk: JsonWebKey = LEDGER_PUBLIC_JWK_DEMO,
): Promise<boolean> {
  if (!/^[A-Za-z0-9_-]{86}$/.test(firma)) return false
  try {
    const key = await crypto.subtle.importKey('jwk', publicJwk, { name: 'Ed25519' }, false, ['verify'])
    return await crypto.subtle.verify({ name: 'Ed25519' }, key, b64UrlToBytes(firma), utf8(texto))
  } catch {
    return false
  }
}

/** Vale firmado con los campos dados. Los fixtures usan esto, no firmas fijas. */
export function firmarVale(v: Omit<Voucher, 'ledgerSignature'>): Voucher {
  const vale = { ...v } as Voucher
  vale.ledgerSignature = calcularFirma(vale)
  return vale
}
