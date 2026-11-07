export function stableStringify(value: Record<string, unknown>): string {
  const sorted: Record<string, unknown> = {}
  for (const key of Object.keys(value).sort()) {
    const item = value[key]
    sorted[key] = Array.isArray(item) ? [...item].sort() : item
  }
  return JSON.stringify(sorted)
}

export function bytesToB64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let raw = ''
  for (const byte of bytes) raw += String.fromCharCode(byte)
  return btoa(raw).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

export function b64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/')
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
  const binary = atob(padded + pad)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

/** Código numérico de respaldo, por si el QR no se lee en la taquilla. */
export function manualCode(hash: string): string {
  const slice = hash.replace(/[^0-9a-f]/gi, '').slice(0, 15) || '0'
  const digits = BigInt(`0x${slice}`).toString(10).padStart(12, '0')
  return digits.slice(0, 12)
}

export function weekStartUtc(date: Date): number {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = start.getUTCDay() || 7
  start.setUTCDate(start.getUTCDate() - day + 1)
  return start.getTime()
}

export function addDaysUtc(iso: string, days: number): string {
  const date = new Date(iso)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString()
}
