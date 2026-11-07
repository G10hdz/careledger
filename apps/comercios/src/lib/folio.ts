/** Folio del vale: CV-AAAA-NNNN-MX (specs/03 REQ-BIL-005, specs/02 REQ-ORA-015). */

export const FOLIO_RE = /^CV-\d{4}-\d{4}-MX$/i

export function normalizarFolio(raw: string): string {
  return raw.trim().toUpperCase()
}

export function folioValido(raw: string): boolean {
  return FOLIO_RE.test(normalizarFolio(raw))
}

export interface FolioParseado {
  year: number
  seq: number
}

/** Devuelve año y secuencia, o null si el formato no coincide. */
export function parseFolio(raw: string): FolioParseado | null {
  const limpio = normalizarFolio(raw)
  const match = /^CV-(\d{4})-(\d{4})-MX$/.exec(limpio)
  if (!match) return null
  return { year: Number(match[1]), seq: Number(match[2]) }
}
