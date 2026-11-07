import {
  BENEFITS,
  VOUCHER_VALIDITY_DAYS,
  applyCourseCap,
  applySelfCareCap,
  clinicalSavingsUsd,
  computePoints,
  coursePoints,
  folioFor,
  isConsensusComplete,
  pointsToMxn,
  type BeneficiaryCategory,
  type CareSession,
  type SelfCareType,
  type SupportType,
} from '@careledger/domain'
import Dexie from 'dexie'
import { addDaysUtc, manualCode, sha256Hex, stableStringify, weekStartUtc } from './codec'
import {
  ATTESTATION_TTL_MS,
  COLLUSION_REPEAT_LIMIT,
  ISSUER,
  MAX_MINUTES,
  MIN_MINUTES,
  NODE_ID,
  NODE_NAME,
  ORACLE_DELAY_MS,
  VEEDORES,
} from './config'
import { courseById, COURSES, type CourseLine } from './courses'
import {
  CareDB,
  type Certificate,
  type CourseProgress,
  type DeviceProfile,
  type LocalAttestation,
  type StoredVoucher,
} from './db'
import { createDeviceKeys, signText, verifyText } from './keys'
import type { Lang } from './langs'
import { assignVeedor, createSimulatedOracle, type ExternalSignatures } from './oracle'
import { gradeQuiz } from './quizzes'
import { assertCanonical, canonicalFromSession, semanticHashInput } from './payload'

export class CareError extends Error {
  constructor(public code: 'saldo' | 'minutos' | 'apoyo' | 'beneficio' | 'modulo') {
    super(code)
  }
}

export type CareDraft =
  | {
      kind: 'cuidado'
      category: BeneficiaryCategory
      supportTypes: SupportType[]
      minutes: number
      occurredAt: string
    }
  | {
      kind: 'autocuidado'
      selfCareType: SelfCareType
      minutes: number
      occurredAt: string
    }

export interface AttestationView {
  sessionId: string
  kind: 'cuidado' | 'autocuidado'
  status: LocalAttestation['status']
  minutes: number
  points: number | null
  folio: string | null
  motivo: 'plazo' | 'firma' | null
  socialValueUsd: number | null
  occurredAt: string
  category: BeneficiaryCategory | null
  selfCareType: SelfCareType | null
  supportTypes: SupportType[]
  needsAudit: boolean
  syncState: 'pending' | 'synced'
  signatures: { cuidadora: boolean; beneficiario: boolean; veedor: boolean }
  canonicalHash: string
  createdAt: string
  veedorId: string
}

export interface CourseView {
  id: string
  completed: number
  total: number
  completedModuleIds: string[]
  quizPassed: boolean
  certificateFolio: string | null
}

export interface CertificateView {
  folio: string
  courseId: string
  courseName: string
  issuedAt: string
  line: CourseLine
  payloadHash: string
  points: number
}

export interface Snapshot {
  caregiverId: string
  nodeId: string
  nodeName: string
  lang: Lang
  pendingSync: number
  selfCareWeekPoints: number
  wallet: { points: number; mxn: number; monthPoints: number; hours: number }
  attestations: AttestationView[]
  vouchers: StoredVoucher[]
  courses: CourseView[]
  certificates: CertificateView[]
  accreditation: { status: 'en_proceso' | 'acreditada'; id?: string }
  issuer: string
}

export interface CareAppOptions {
  dbName?: string
  now?: () => Date
  sleep?: (ms: number) => Promise<void>
  online?: boolean
  delayMs?: number
  veedores?: readonly string[]
  onBeforeVoucher?: () => void
  onBeforeCourseCredit?: () => void
}

export function pointsPreview(
  kind: CareDraft['kind'],
  minutes: number,
  weekPoints: number,
): { raw: number; awarded: number } {
  const raw = computePoints({ minutes })
  const awarded = kind === 'autocuidado' ? applySelfCareCap(raw, weekPoints) : raw
  return { raw, awarded }
}

const FOLIO_RE = /^CV-\d{4}-\d{4}-MX$/
export function isFolio(value: string): boolean {
  return FOLIO_RE.test(value)
}

export function createCareApp(opts: CareAppOptions = {}) {
  const db = new CareDB(opts.dbName ?? 'careledger')
  const now = () => (opts.now ? opts.now() : new Date())
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)))
  let isOnline = opts.online ?? (typeof navigator === 'undefined' ? true : navigator.onLine)
  const delayMs = opts.delayMs ?? ORACLE_DELAY_MS
  const veedores = opts.veedores ?? VEEDORES
  const oracle = createSimulatedOracle({ now: () => now().getTime(), sleep, veedores })
  const jobs = new Map<string, Promise<void>>()

  async function ensureDevice(): Promise<DeviceProfile> {
    const existing = await db.profile.get('local')
    if (existing) {
      if (!(await db.wallet.get(existing.caregiverId))) {
        await db.wallet.add({ caregiverId: existing.caregiverId, pointsBalance: 0, tipsBalanceMxn: 0 })
      }
      return existing
    }
    const keys = await createDeviceKeys()
    const profile: DeviceProfile = {
      id: 'local',
      caregiverId: crypto.randomUUID(),
      nodeId: NODE_ID,
      nodeName: NODE_NAME,
      lang: 'es',
      publicJwk: keys.publicJwk,
      privateJwk: keys.privateJwk,
    }
    await db.profile.add(profile)
    await db.wallet.add({ caregiverId: profile.caregiverId, pointsBalance: 0, tipsBalanceMxn: 0 })
    return profile
  }

  async function nextFolio(): Promise<string> {
    const row = await db.meta.get('folioSeq')
    const seq = (row?.value ?? 0) + 1
    await db.meta.put({ key: 'folioSeq', value: seq })
    return folioFor(seq, now().getUTCFullYear())
  }

  function courseTables() {
    return [db.progress, db.certificates, db.meta, db.profile, db.wallet, db.ledger] as const
  }

  async function issueCourse(course: NonNullable<ReturnType<typeof courseById>>, profile: DeviceProfile): Promise<Certificate | null> {
    const progress = await db.progress.get(course.id)
    if (!progress?.quizPassed) return null
    if (!course.modules.every((item) => progress.completedModuleIds.includes(item.id))) return null
    const existing = await db.certificates.where('courseId').equals(course.id).first()
    if (existing) return existing
    const issuedAt = now().toISOString()
    const folio = await nextFolio()
    const courseName = course.title.es
    const payloadHash = await Dexie.waitFor(
      sha256Hex(stableStringify({ courseId: course.id, courseName, folio, issuedAt })),
    )
    const month = issuedAt.slice(0, 7)
    const prior = await db.ledger.toArray()
    const already = prior
      .filter((row) => row.sessionId.startsWith('curso:') && row.createdAt.slice(0, 7) === month)
      .reduce((sum, row) => sum + row.points, 0)
    const awarded = applyCourseCap(coursePoints(course.id), already)
    const created: Certificate = {
      folio,
      courseId: course.id,
      courseName,
      caregiverId: profile.caregiverId,
      issuedAt,
      payloadHash,
      line: course.line,
      points: awarded,
    }
    await db.certificates.add(created)
    if (awarded > 0) {
      opts.onBeforeCourseCredit?.()
      const wallet = await db.wallet.get(profile.caregiverId)
      if (!wallet) throw new CareError('modulo')
      await db.ledger.add({
        id: crypto.randomUUID(),
        payloadHash,
        sessionId: `curso:${course.id}`,
        points: awarded,
        debitAccount: 'fondo-municipal',
        creditAccount: profile.caregiverId,
        createdAt: issuedAt,
      })
      await db.wallet.put({ ...wallet, pointsBalance: wallet.pointsBalance + awarded })
    }
    if (course.line === 'tecnica') {
      const fresh = await db.profile.get('local')
      if (fresh && !fresh.accreditationFolio) await db.profile.put({ ...fresh, accreditationFolio: folio })
    }
    return created
  }

  async function flush(): Promise<void> {
    if (!isOnline) return
    await db.attestations.where('syncState').equals('pending').modify({ syncState: 'synced' })
  }

  async function selfCareWeekPoints(at: Date): Promise<number> {
    const start = weekStartUtc(at)
    const rows = await db.attestations.filter((row) => row.kind === 'autocuidado' && row.status === 'validada').toArray()
    let sum = 0
    for (const row of rows) {
      const session = await db.sessions.get(row.sessionId)
      const when = Date.parse(session?.occurredAt ?? row.createdAt)
      if (when >= start) sum += row.points ?? 0
    }
    return sum
  }

  async function expireAttestations(): Promise<void> {
    const clock = now().getTime()
    const rows = await db.attestations.where('status').equals('pendiente').toArray()
    for (const row of rows) {
      if (Date.parse(row.expiresAt) > clock) continue
      await db.attestations.update(row.sessionId, {
        status: 'rechazada',
        motivo: 'plazo',
        syncState: 'pending',
      })
    }
  }

  async function expireVouchers(): Promise<void> {
    const clock = now().getTime()
    await db.transaction('rw', [db.vouchers, db.wallet], async () => {
      const rows = await db.vouchers.where('status').equals('activo').toArray()
      for (const voucher of rows) {
        if (Date.parse(voucher.validUntil) > clock) continue
        const wallet = await db.wallet.get(voucher.caregiverId)
        if (!wallet) continue
        await db.vouchers.update(voucher.folio, { status: 'vencido' })
        await db.wallet.put({ ...wallet, pointsBalance: wallet.pointsBalance + voucher.costPoints })
      }
    })
  }

  async function applyExternal(sessionId: string, external: ExternalSignatures): Promise<void> {
    const row = await db.attestations.get(sessionId)
    const session = await db.sessions.get(sessionId)
    const profile = await db.profile.get('local')
    const cuidadora = row?.signatures.cuidadora
    if (!row || !session || !profile || !cuidadora || row.status !== 'pendiente') return
    if (Date.parse(row.expiresAt) <= now().getTime()) {
      await db.attestations.update(sessionId, { status: 'rechazada', motivo: 'plazo', syncState: 'pending' })
      return
    }
    const [okCare, okBenef, okVeedor] = await Promise.all([
      verifyText(profile.publicJwk, row.canonical, cuidadora),
      verifyText(external.beneficiario.publicJwk, row.canonical, external.beneficiario.signature),
      verifyText(external.veedor.publicJwk, row.canonical, external.veedor.signature),
    ])
    if (!okCare || !okBenef || !okVeedor) {
      await db.attestations.update(sessionId, { motivo: 'firma', syncState: 'pending' })
      return
    }
    const signatures = {
      cuidadora,
      beneficiario: external.beneficiario.signature,
      veedor: external.veedor.signature,
    }
    if (!isConsensusComplete(signatures)) return

    await db.transaction('rw', [db.attestations, db.sessions, db.ledger, db.wallet, db.meta], async () => {
      const current = await db.attestations.get(sessionId)
      if (!current || current.status !== 'pendiente') return
      const alreadyLedger = await db.ledger.where('payloadHash').equals(current.semanticHash).first()
      const raw = computePoints({ minutes: session.minutes })
      const points =
        session.kind === 'autocuidado' ? applySelfCareCap(raw, await selfCareWeekPoints(new Date(session.occurredAt))) : raw
      const wallet = await db.wallet.get(profile.caregiverId)
      if (!wallet) return
      if (!alreadyLedger && points > 0) {
        await db.ledger.add({
          id: crypto.randomUUID(),
          payloadHash: current.semanticHash,
          sessionId,
          points,
          debitAccount: 'fondo-municipal',
          creditAccount: profile.caregiverId,
          createdAt: now().toISOString(),
        })
        await db.wallet.put({ ...wallet, pointsBalance: wallet.pointsBalance + points })
      }
      const validated = await db.attestations.filter((item) => item.status === 'validada').toArray()
      let prior = 0
      for (const item of validated) {
        if (item.veedorId !== external.veedor.veedorId) continue
        const other = await db.sessions.get(item.sessionId)
        if (!other) continue
        if (other.kind === session.kind && other.category === session.category && other.selfCareType === session.selfCareType) {
          prior += 1
        }
      }
      const folio = current.folio ?? (await nextFolio())
      const patch: Partial<LocalAttestation> = {
        status: 'validada',
        signatures,
        publicKeys: {
          cuidadora: profile.publicJwk,
          beneficiario: external.beneficiario.publicJwk,
          veedor: external.veedor.publicJwk,
        },
        veedorId: external.veedor.veedorId,
        points,
        needsAudit: prior >= COLLUSION_REPEAT_LIMIT,
        folio,
        syncState: 'pending',
      }
      if (session.kind === 'cuidado') patch.socialValueUsd = Math.round(clinicalSavingsUsd(session.minutes / 60))
      await db.attestations.update(sessionId, patch)
    })
    await flush()
  }

  function startOracle(row: LocalAttestation): Promise<void> {
    const running = jobs.get(row.sessionId)
    if (running) return running
    if (row.status !== 'pendiente') return Promise.resolve()
    const job = oracle
      .requestCosigners({
        sessionId: row.sessionId,
        canonical: row.canonical,
        nodeId: NODE_ID,
        dueAt: row.oracleDueAt,
      })
      .then((external) => applyExternal(row.sessionId, external))
      .finally(() => {
        jobs.delete(row.sessionId)
      })
    jobs.set(row.sessionId, job)
    return job
  }

  async function resume(): Promise<void> {
    const rows = await db.attestations.where('status').equals('pendiente').toArray()
    for (const row of rows) {
      if (Date.parse(row.expiresAt) <= now().getTime()) continue
      startOracle(row)
    }
  }

  async function readSnapshot(): Promise<Snapshot> {
    const profile = await ensureDevice()
    const wallet = await db.wallet.get(profile.caregiverId)
    const attestations = await db.attestations.toArray()
    const sessions = await db.sessions.toArray()
    const sessionById = new Map(sessions.map((session) => [session.id, session]))
    const month = now().toISOString().slice(0, 7)
    let monthPoints = 0
    let recognizedMinutes = 0
    const views: AttestationView[] = []
    for (const row of attestations) {
      const session = sessionById.get(row.sessionId)
      if (row.status === 'validada') {
        recognizedMinutes += row.minutes
        if (row.createdAt.slice(0, 7) === month) monthPoints += row.points ?? 0
      }
      views.push({
        sessionId: row.sessionId,
        kind: row.kind,
        status: row.status,
        minutes: row.minutes,
        points: row.points ?? null,
        folio: row.folio ?? null,
        motivo: row.motivo ?? null,
        socialValueUsd: row.socialValueUsd ?? null,
        occurredAt: session?.occurredAt ?? row.createdAt,
        category: session?.category ?? null,
        selfCareType: session?.selfCareType ?? null,
        supportTypes: session?.supportTypes ?? [],
        needsAudit: row.needsAudit,
        syncState: row.syncState,
        signatures: {
          cuidadora: Boolean(row.signatures.cuidadora),
          beneficiario: Boolean(row.signatures.beneficiario),
          veedor: Boolean(row.signatures.veedor),
        },
        canonicalHash: row.canonicalHash,
        createdAt: row.createdAt,
        veedorId: row.veedorId,
      })
    }
    views.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const vouchers = (await db.vouchers.toArray()).sort((a, b) => b.issuedAt.localeCompare(a.issuedAt))
    const progress = await db.progress.toArray()
    const certificates = (await db.certificates.toArray()).sort((a, b) => a.issuedAt.localeCompare(b.issuedAt))
    const tecnica = certificates.filter((item) => item.line === 'tecnica')
    const first = tecnica[0]
    const courses = COURSES.map((course) => {
      const row = progress.find((item) => item.courseId === course.id)
      const certificate = certificates.find((item) => item.courseId === course.id)
      return {
        id: course.id,
        completed: row?.completedModuleIds.length ?? 0,
        total: course.modules.length,
        completedModuleIds: row?.completedModuleIds ?? [],
        quizPassed: row?.quizPassed ?? false,
        certificateFolio: certificate?.folio ?? null,
      }
    })
    for (const cert of certificates) {
      if (cert.issuedAt.slice(0, 7) === month) monthPoints += cert.points
    }
    return {
      caregiverId: profile.caregiverId,
      nodeId: profile.nodeId,
      nodeName: profile.nodeName,
      lang: profile.lang,
      pendingSync: attestations.filter((row) => row.syncState === 'pending').length,
      selfCareWeekPoints: await selfCareWeekPoints(now()),
      wallet: {
        points: wallet?.pointsBalance ?? 0,
        mxn: pointsToMxn(wallet?.pointsBalance ?? 0),
        monthPoints,
        hours: Math.round((recognizedMinutes / 60) * 10) / 10,
      },
      attestations: views,
      vouchers,
      courses,
      certificates: certificates.map((item) => ({
        folio: item.folio,
        courseId: item.courseId,
        courseName: item.courseName,
        issuedAt: item.issuedAt,
        line: item.line,
        payloadHash: item.payloadHash,
        points: item.points,
      })),
      accreditation: first ? { status: 'acreditada', id: first.folio } : { status: 'en_proceso' },
      issuer: ISSUER,
    }
  }

  async function maintain(): Promise<Snapshot> {
    await ensureDevice()
    await expireAttestations()
    await expireVouchers()
    await flush()
    return readSnapshot()
  }

  return {
    async ready(): Promise<Snapshot> {
      await ensureDevice()
      await expireAttestations()
      await resume()
      await expireVouchers()
      await flush()
      return readSnapshot()
    },

    snapshot: maintain,

    setOnline(value: boolean) {
      isOnline = value
    },

    async setLang(lang: Lang): Promise<void> {
      const profile = await ensureDevice()
      await db.profile.put({ ...profile, lang })
    },

    async submit(draft: CareDraft): Promise<{ sessionId: string; done: Promise<void> }> {
      if (draft.minutes < MIN_MINUTES || draft.minutes > MAX_MINUTES) throw new CareError('minutos')
      if (draft.kind === 'cuidado' && draft.supportTypes.length === 0) throw new CareError('apoyo')
      const profile = await ensureDevice()
      const id = crypto.randomUUID()
      const session: CareSession = {
        id,
        caregiverId: profile.caregiverId,
        nodeId: profile.nodeId,
        kind: draft.kind,
        supportTypes: draft.kind === 'cuidado' ? [...draft.supportTypes].sort() : [],
        minutes: draft.minutes,
        occurredAt: draft.occurredAt,
        createdOffline: !isOnline,
        ...(draft.kind === 'cuidado' ? { category: draft.category } : { selfCareType: draft.selfCareType }),
      }
      const semanticHash = await sha256Hex(semanticHashInput(session))
      const existing = await db.attestations.where('semanticHash').equals(semanticHash).first()
      if (existing) return { sessionId: existing.sessionId, done: jobs.get(existing.sessionId) ?? Promise.resolve() }

      const canonical = canonicalFromSession(session)
      assertCanonical(canonical)
      const canonicalHash = await sha256Hex(canonical)
      const signature = await signText(profile.privateJwk, canonical)
      const createdAt = now().toISOString()
      const attestation: LocalAttestation = {
        sessionId: id,
        status: 'pendiente',
        signatures: { cuidadora: signature },
        publicKeys: { cuidadora: profile.publicJwk },
        canonical,
        canonicalHash,
        semanticHash,
        expiresAt: new Date(now().getTime() + ATTESTATION_TTL_MS).toISOString(),
        syncState: 'pending',
        veedorId: assignVeedor(id, veedores),
        createdAt,
        oracleDueAt: new Date(now().getTime() + delayMs).toISOString(),
        kind: draft.kind,
        minutes: draft.minutes,
        needsAudit: false,
      }
      await db.sessions.add(session)
      await db.attestations.add(attestation)
      const done = startOracle(attestation)
      await flush()
      return { sessionId: id, done }
    },

    async redeem(benefitId: string): Promise<StoredVoucher> {
      const benefit = BENEFITS.find((item) => item.id === benefitId)
      if (!benefit) throw new CareError('beneficio')
      const profile = await ensureDevice()
      let created: StoredVoucher | null = null
      await db.transaction('rw', [db.wallet, db.vouchers, db.meta], async () => {
        const wallet = await db.wallet.get(profile.caregiverId)
        if (!wallet || wallet.pointsBalance < benefit.costPoints) throw new CareError('saldo')
        const issuedAt = now().toISOString()
        const folio = await nextFolio()
        const validUntil = addDaysUtc(issuedAt, VOUCHER_VALIDITY_DAYS)
        const payload = stableStringify({
          benefitId: benefit.id,
          caregiverId: profile.caregiverId,
          costPoints: benefit.costPoints,
          folio,
          issuedAt,
          validUntil,
        })
        const payloadHash = await Dexie.waitFor(sha256Hex(payload))
        const ledgerSignature = await Dexie.waitFor(signText(profile.privateJwk, payload))
        const voucher: StoredVoucher = {
          folio,
          benefitId: benefit.id,
          benefitName: benefit.name,
          caregiverId: profile.caregiverId,
          issuedAt,
          validUntil,
          status: 'activo',
          ledgerSignature,
          manualCode: manualCode(payloadHash),
          costPoints: benefit.costPoints,
          payloadHash,
        }
        await db.wallet.put({ ...wallet, pointsBalance: wallet.pointsBalance - benefit.costPoints })
        opts.onBeforeVoucher?.()
        await db.vouchers.add(voucher)
        created = voucher
      })
      if (!created) throw new CareError('beneficio')
      return created
    },

    async completeModule(courseId: string, moduleId: string): Promise<Certificate | null> {
      const course = courseById(courseId)
      if (!course || !course.modules.some((item) => item.id === moduleId)) throw new CareError('modulo')
      const profile = await ensureDevice()
      let certificate: Certificate | null = null
      await db.transaction('rw', courseTables(), async () => {
        const current = (await db.progress.get(courseId)) ?? { courseId, completedModuleIds: [] as string[] }
        const completedModuleIds = current.completedModuleIds.includes(moduleId)
          ? current.completedModuleIds
          : [...current.completedModuleIds, moduleId]
        const next: CourseProgress = { courseId, completedModuleIds }
        if (current.quizPassed) next.quizPassed = true
        await db.progress.put(next)
        certificate = await issueCourse(course, profile)
      })
      return certificate
    },

    async submitQuiz(
      courseId: string,
      answers: readonly number[],
    ): Promise<{ correct: boolean; certificate: Certificate | null; points: number }> {
      const course = courseById(courseId)
      if (!course) throw new CareError('modulo')
      if (!gradeQuiz(courseId, answers)) return { correct: false, certificate: null, points: 0 }
      const profile = await ensureDevice()
      let certificate: Certificate | null = null
      let points = 0
      await db.transaction('rw', courseTables(), async () => {
        const current = (await db.progress.get(courseId)) ?? { courseId, completedModuleIds: [] as string[] }
        await db.progress.put({ ...current, quizPassed: true })
        const issued = await issueCourse(course, profile)
        certificate = issued
        points = issued?.points ?? 0
      })
      return { correct: true, certificate, points }
    },

    async profileFolio(): Promise<string | null> {
      const profile = await db.profile.get('local')
      return profile?.accreditationFolio ?? null
    },

    close() {
      return db.close()
    },
  }
}

export type CareApp = ReturnType<typeof createCareApp>
