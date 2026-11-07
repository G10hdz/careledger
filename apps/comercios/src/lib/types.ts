/** EntreManos — tipos del territorio comercios. specs/05. */

export interface Comercio {
  nombre: string
  /** CLABE de 18 dígitos donde se deposita la liquidación SPEI. */
  clabe: string
  /** Solo se guarda el nombre del archivo: nunca se sube la foto (privacidad). */
  idOficialName: string
  domicilioName: string
  afiliadoAt: string
  estado: 'afiliado'
  /** Folio del distintivo, p.ej. CS-2026-0001-MX. */
  placaFolio: string
}

export interface CobroRecord {
  folio: string
  benefitId: string
  points: number
  /** Equivalente en pesos: pointsToMxn(points), paridad 1 pt = $10 MXN. */
  mxn: number
  capturedAt: string
  /** false = pendiente en la cola de sync; true = confirmado al ledger. */
  synced: boolean
}

export type LiquidationStatus = 'programada' | 'confirmada'

export interface Liquidacion {
  /** LIQ-YYYY-MM-DD-<seq> */
  id: string
  /** Día de los cobros que agrupa, YYYY-MM-DD. */
  dateKey: string
  folios: string[]
  /** Suma exacta de los cobros del día. 0% comisión: amountMxn = Σ mxn. */
  amountMxn: number
  clabe: string
  status: LiquidationStatus
  createdAt: string
  /** Promesa REQ-COM-004: transferencia ≤24h desde la programación. */
  etaAt: string
  confirmedAt?: string
}

/** Estado local del terminal (offline-first, persiste en localStorage). */
export interface ComercioStore {
  comercio: Comercio | null
  cobros: CobroRecord[]
  liquidaciones: Liquidacion[]
}

export type CobroRejectReason =
  | 'folio_invalido'
  | 'vale_no_encontrado'
  | 'firma_invalida'
  | 'vale_vencido'
  | 'vale_aun_no_vigente'
  | 'vale_ya_usado_en_ledger'
  | 'ya_cobrado'
  | 'codigo_manual_invalido'
  | 'beneficio_desconocido'

export type CobroResult =
  | { ok: true; cobro: CobroRecord; mxn: number; points: number }
  | { ok: false; reason: CobroRejectReason; folio: string }
