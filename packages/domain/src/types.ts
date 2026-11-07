/** Cuando cuidas, te descuidas — tipos del dominio cívico. specs/00 y 02. */

export type BeneficiaryCategory =
  | 'familiar_dependiente'
  | 'vecino_adulto_mayor'
  | 'infancias_comunitarias'

export type SupportType =
  | 'acompanamiento_medico'
  | 'alimentacion_aseo'
  | 'estimulacion_cognitiva'
  | 'guardia_nocturna'
  | 'otro'

/** Autocuidado: la cuidadora se cuida a sí misma. specs/01 REQ-PWA-007. */
export type SelfCareType = 'tiempo_libre' | 'hidratacion_descanso' | 'red_de_apoyo'

export type AttestationStatus = 'pendiente' | 'validada' | 'rechazada' | 'expirada'

export interface LoadProfile {
  /** 0–5: aseo del paciente, movilización, fuerza bruta */
  fisica: number
  /** 0–5: demencia, enfermedad terminal, manejo de crisis */
  cognitiva: number
  /** 0–5: medicamentos complejos, traslados, burocracia */
  logistica: number
}

export interface CareSession {
  id: string
  caregiverId: string
  nodeId: string
  kind: 'cuidado' | 'autocuidado'
  category?: BeneficiaryCategory
  selfCareType?: SelfCareType
  supportTypes: SupportType[]
  /** minutos de jornada */
  minutes: number
  loadProfile?: LoadProfile
  occurredAt: string
  createdOffline: boolean
}

export interface Attestation {
  sessionId: string
  status: AttestationStatus
  signatures: Partial<Record<'cuidadora' | 'beneficiario' | 'veedor', string>>
  /** folio una vez validada, p.ej. CV-2025-0042-MX */
  folio?: string
  expiresAt: string
}

export type VoucherStatus = 'activo' | 'usado' | 'vencido'

export interface Benefit {
  id: string
  name: string
  description: string
  category: 'hogar' | 'movilidad' | 'autocuidado' | 'canasta'
  tag?: string
  costPoints: number
}

export interface Voucher {
  folio: string
  benefitId: string
  caregiverId: string
  issuedAt: string
  /** vigencia: issuedAt + 30 días naturales */
  validUntil: string
  status: VoucherStatus
  ledgerSignature: string
  manualCode: string
}

export interface Wallet {
  caregiverId: string
  /** puntos ganados por cuidado/autocuidado */
  pointsBalance: number
  /** saldo fondeado por propinas familiares (MXN) */
  tipsBalanceMxn: number
}
