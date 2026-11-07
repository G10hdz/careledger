import type { AttestationStatus, CareSession, VoucherStatus, Wallet } from '@careledger/domain'
import Dexie, { type Table } from 'dexie'
import type { CourseLine } from './courses'
import type { Lang } from './langs'

export interface DeviceProfile {
  id: 'local'
  caregiverId: string
  nodeId: string
  nodeName: string
  lang: Lang
  publicJwk: JsonWebKey
  privateJwk: JsonWebKey
  accreditationFolio?: string
}

export interface LocalAttestation {
  sessionId: string
  status: AttestationStatus
  signatures: Partial<Record<'cuidadora' | 'beneficiario' | 'veedor', string>>
  publicKeys: Partial<Record<'cuidadora' | 'beneficiario' | 'veedor', JsonWebKey>>
  canonical: string
  canonicalHash: string
  semanticHash: string
  expiresAt: string
  syncState: 'pending' | 'synced'
  veedorId: string
  createdAt: string
  oracleDueAt: string
  kind: 'cuidado' | 'autocuidado'
  minutes: number
  needsAudit: boolean
  folio?: string
  motivo?: 'plazo' | 'firma'
  points?: number
  socialValueUsd?: number
}

export interface LedgerEntry {
  id: string
  payloadHash: string
  sessionId: string
  points: number
  debitAccount: 'fondo-municipal'
  creditAccount: string
  createdAt: string
}

export interface StoredVoucher {
  folio: string
  benefitId: string
  benefitName: string
  caregiverId: string
  issuedAt: string
  validUntil: string
  status: VoucherStatus
  ledgerSignature: string
  manualCode: string
  costPoints: number
  payloadHash: string
  /**
   * Firma del vale compacto que viaja en el QR (sin caregiverId ni
   * benefitName: privacidad REQ-PWA-011). Ed25519 sobre el payload
   * canónico {benefitId, costPoints, folio, issuedAt, validUntil}.
   */
  qrSignature: string
}

export interface CourseProgress {
  courseId: string
  completedModuleIds: string[]
  quizPassed?: boolean
}

export interface Certificate {
  folio: string
  courseId: string
  courseName: string
  caregiverId: string
  issuedAt: string
  payloadHash: string
  line: CourseLine
  points: number
}

export interface MetaRow {
  key: string
  value: number
}

export class CareDB extends Dexie {
  profile!: Table<DeviceProfile, string>
  sessions!: Table<CareSession, string>
  attestations!: Table<LocalAttestation, string>
  ledger!: Table<LedgerEntry, string>
  wallet!: Table<Wallet, string>
  vouchers!: Table<StoredVoucher, string>
  progress!: Table<CourseProgress, string>
  certificates!: Table<Certificate, string>
  meta!: Table<MetaRow, string>

  constructor(name: string) {
    super(name)
    this.version(1).stores({
      profile: 'id',
      sessions: 'id, kind, occurredAt',
      attestations: 'sessionId, status, syncState, semanticHash',
      ledger: 'id, payloadHash, sessionId',
      wallet: 'caregiverId',
      vouchers: 'folio, status, caregiverId',
      progress: 'courseId',
      certificates: 'folio, courseId',
      meta: 'key',
    })
  }
}

