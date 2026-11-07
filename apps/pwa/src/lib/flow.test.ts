import { COURSE_POINTS, coursePoints, type CareSession } from '@careledger/domain'
import { describe, expect, it } from 'vitest'
import { createCareApp, isFolio, type CareApp, type CareAppOptions, type CareDraft } from './app'
import { sha256Hex, stableStringify } from './codec'
import { ORACLE_DELAY_MS } from './config'
import { COURSES, courseById, coursesFor } from './courses'
import { allCopy } from './copy'
import { certificatePdf, pdfIncludes, receiptPdf, voucherQrText } from './documents'
import { createDeviceKeys } from './keys'
import { createSimulatedOracle } from './oracle'
import { assertCanonical, canonicalFromSession, publicSyncRecord } from './payload'
import { QUIZZES, gradeQuiz } from './quizzes'
import { REGISTER_STEPS, canSign, initialWizard, wizard } from './wizard'

function harness(extra: CareAppOptions = {}) {
  let current = new Date('2026-11-07T15:00:00.000Z')
  const care = createCareApp({
    sleep: async () => {},
    ...extra,
    dbName: extra.dbName ?? `t-${crypto.randomUUID()}`,
    now: extra.now ?? (() => current),
  })
  return {
    care,
    advance(ms: number) {
      current = new Date(current.getTime() + ms)
    },
  }
}

async function finishCourse(care: CareApp, courseId: string) {
  const course = courseById(courseId)
  if (!course) throw new Error(courseId)
  for (const module of course.modules) await care.completeModule(courseId, module.id)
  const quiz = QUIZZES[courseId]
  if (!quiz) throw new Error(courseId)
  return care.submitQuiz(
    courseId,
    quiz.map((question) => question.correct),
  )
}

function cuidado(occurredAt: string, minutes = 210): CareDraft {
  return {
    kind: 'cuidado',
    category: 'familiar_dependiente',
    supportTypes: ['alimentacion_aseo', 'otro'],
    minutes,
    occurredAt,
  }
}

describe('registro en 3 pasos', () => {
  it('no pasa de 3 pantallas y firma solo con tiempo y apoyo', () => {
    expect(REGISTER_STEPS).toHaveLength(3)
    let state = initialWizard('cuidado')
    state = wizard(state, { type: 'pick-category', category: 'vecino_adulto_mayor' })
    expect(state.step).toBe(2)
    state = wizard(state, { type: 'next' })
    expect(state.step).toBe(2)
    state = wizard(state, { type: 'toggle-support', support: 'guardia_nocturna' })
    state = wizard(state, { type: 'set-minutes', minutes: 210 })
    state = wizard(state, { type: 'next' })
    expect(state.step).toBe(3)
    expect(canSign(state)).toBe(true)
    state = wizard(state, { type: 'next' })
    expect(state.step).toBe(3)
  })

  it('el autocuidado usa el mismo recorrido sin tipos de apoyo', () => {
    let state = initialWizard('autocuidado')
    state = wizard(state, { type: 'pick-self', selfCareType: 'hidratacion_descanso' })
    state = wizard(state, { type: 'next' })
    expect(state.step).toBe(3)
    expect(canSign(state)).toBe(true)
  })
})

describe('flujo crítico', () => {
  it('firma, espera el sello de 10 s y acredita 35 puntos una sola vez', async () => {
    let waited = -1
    const start = new Date('2026-11-07T15:00:00.000Z')
    const oracle = createSimulatedOracle({
      now: () => start.getTime(),
      sleep: async (ms) => {
        waited = ms
      },
    })
    await oracle.requestCosigners({
      sessionId: 'sesion-1',
      canonical: '{"kind":"cuidado"}',
      nodeId: 'nodo-roma-condesa',
      dueAt: new Date(start.getTime() + ORACLE_DELAY_MS).toISOString(),
    })
    expect(waited).toBe(ORACLE_DELAY_MS)

    const { care } = harness()
    const draft = cuidado('2026-11-07T15:00:00.000Z')
    const first = await care.submit(draft)
    const second = await care.submit(draft)
    expect(second.sessionId).toBe(first.sessionId)
    await first.done
    const snap = await care.snapshot()
    expect(snap.attestations).toHaveLength(1)
    expect(snap.attestations[0]?.status).toBe('validada')
    expect(snap.attestations[0]?.points).toBe(35)
    expect(snap.attestations[0]?.socialValueUsd).toBe(120)
    expect(snap.wallet.points).toBe(35)
    expect(snap.wallet.mxn).toBe(350)
    expect(isFolio(snap.attestations[0]?.folio ?? '')).toBe(true)
    expect(snap.attestations[0]?.signatures).toEqual({ cuidadora: true, beneficiario: true, veedor: true })
    const pdf = receiptPdf(snap.attestations[0]!, snap.nodeName)
    expect(pdfIncludes(pdf, snap.attestations[0]!.folio!)).toBe(true)
    expect(pdfIncludes(pdf, 'Puntos Civicos')).toBe(true)
    expect(pdfIncludes(pdf, '$CARE')).toBe(false)
    await care.close()
  })

  it('el payload no lleva nombres, diagnósticos, fotos ni GPS', async () => {
    const session = {
      id: 's',
      caregiverId: 'c',
      nodeId: 'nodo-roma-condesa',
      kind: 'cuidado',
      category: 'familiar_dependiente',
      supportTypes: ['otro'],
      minutes: 60,
      occurredAt: '2026-11-07T15:00:00.000Z',
      createdOffline: true,
      nombre: 'Elena',
      diagnostico: 'secreto',
      foto: 'img',
      lat: 19.4,
      paciente: 'nadie',
    } as CareSession
    const json = canonicalFromSession(session)
    expect(json).not.toContain('Elena')
    expect(json).not.toContain('secreto')
    expect(json).not.toContain('paciente')
    expect(json).not.toContain('lat')
    assertCanonical(json)
    expect(() => assertCanonical(JSON.stringify({ kind: 'cuidado', nombre: 'a' }))).toThrow()

    const keys = await createDeviceKeys()
    const body = publicSyncRecord({
      canonical: json,
      signatures: { cuidadora: 'abc' },
      publicKeys: { cuidadora: keys.publicJwk },
      status: 'pendiente',
    })
    expect(JSON.stringify(body)).not.toContain(String(keys.privateJwk.d))
  })

  it('sin red deja el registro pendiente y al volver lo suelta', async () => {
    const { care } = harness({ online: false })
    const { done } = await care.submit(cuidado('2026-11-07T15:00:00.000Z', 60))
    await done
    expect((await care.snapshot()).pendingSync).toBe(1)
    care.setOnline(true)
    expect((await care.snapshot()).pendingSync).toBe(0)
    await care.close()
  })

  it('a las 72 h sin firmas rechaza y no emite puntos', async () => {
    const { care, advance } = harness({ sleep: () => new Promise(() => {}) })
    await care.submit(cuidado('2026-11-07T15:00:00.000Z', 60))
    advance(73 * 60 * 60 * 1000)
    const snap = await care.snapshot()
    expect(snap.attestations[0]?.status).toBe('rechazada')
    expect(snap.attestations[0]?.motivo).toBe('plazo')
    expect(snap.wallet.points).toBe(0)
    await care.close()
  })

  it('el autocuidado respeta el tope semanal', async () => {
    const { care } = harness()
    const first = await care.submit({
      kind: 'autocuidado',
      selfCareType: 'tiempo_libre',
      minutes: 60,
      occurredAt: '2026-11-07T15:00:00.000Z',
    })
    await first.done
    const second = await care.submit({
      kind: 'autocuidado',
      selfCareType: 'red_de_apoyo',
      minutes: 60,
      occurredAt: '2026-11-07T18:00:00.000Z',
    })
    await second.done
    const snap = await care.snapshot()
    expect(snap.wallet.points).toBe(10)
    expect(snap.attestations.map((item) => item.points).sort((a, b) => (a ?? 0) - (b ?? 0))).toEqual([0, 10])
    await care.close()
  })

  it('canjea en una sola operación y devuelve los puntos si el vale vence', async () => {
    const { care, advance } = harness()
    const { done } = await care.submit(cuidado('2026-11-07T15:00:00.000Z'))
    await done
    const voucher = await care.redeem('metro-semanal')
    expect(isFolio(voucher.folio)).toBe(true)
    expect(voucher.costPoints).toBe(30)
    expect(voucher.manualCode).toHaveLength(12)
    expect(Date.parse(voucher.validUntil) - Date.parse(voucher.issuedAt)).toBe(30 * 24 * 60 * 60 * 1000)
    const qr = JSON.parse(voucherQrText(voucher)) as Record<string, unknown>
    expect(voucherQrText(voucher)).not.toContain('caregiver')
    expect(qr).toMatchObject({
      folio: voucher.folio,
      benefitId: 'metro-semanal',
      points: 30,
      mxn: 300,
      issuedAt: voucher.issuedAt,
      validUntil: voucher.validUntil,
      code: voucher.manualCode,
    })
    expect(typeof qr.sig).toBe('string')
    expect(qr.sig).toHaveLength(86)
    let snap = await care.snapshot()
    expect(snap.wallet.points).toBe(5)
    advance(31 * 24 * 60 * 60 * 1000)
    snap = await care.snapshot()
    expect(snap.wallet.points).toBe(35)
    expect(snap.vouchers[0]?.status).toBe('vencido')
    await care.close()
  })

  it('si el vale falla a mitad, el saldo no se mueve', async () => {
    const { care } = harness({
      onBeforeVoucher() {
        throw new Error('mitad')
      },
    })
    const { done } = await care.submit(cuidado('2026-11-07T15:00:00.000Z'))
    await done
    await expect(care.redeem('metro-semanal')).rejects.toThrow('mitad')
    const snap = await care.snapshot()
    expect(snap.wallet.points).toBe(35)
    expect(snap.vouchers).toHaveLength(0)
    await care.close()
  })

  it('marca la sexta terna repetida para auditoría', async () => {
    const { care } = harness({ veedores: ['solo'] })
    for (let i = 0; i < 6; i += 1) {
      const { done } = await care.submit(cuidado(`2026-11-07T15:0${i}:00.000Z`, 60 + i * 5))
      await done
    }
    const snap = await care.snapshot()
    const flagged = snap.attestations.filter((item) => item.needsAudit)
    expect(flagged.length).toBeGreaterThan(0)
    expect(snap.attestations.some((item) => !item.needsAudit)).toBe(true)
    await care.close()
  })
})

describe('formación', () => {
  it('lista las dos líneas, el nivel y algo que cabe en 20 minutos', () => {
    const titles = COURSES.map((course) => course.title.es).join(' | ')
    expect(titles).toContain('Movilización')
    expect(titles).toContain('Signos vitales')
    expect(titles).toContain('Medicación')
    expect(titles).toContain('teléfono')
    expect(titles).toContain('Trámites')
    expect(titles).toContain('infancias')
    expect(titles).toContain('baño')
    expect(titles).toContain('Jerga')
    expect(new Set(COURSES.map((course) => course.line))).toEqual(new Set(['tecnica', 'digital']))
    expect(COURSES.every((course) => course.level && course.minutes > 0 && course.modules.length > 0)).toBe(true)
    expect(coursesFor(20).every((course) => course.minutes <= 20)).toBe(true)
    expect(coursesFor(20).some((course) => course.id === 'medicacion')).toBe(false)
    for (const course of COURSES) {
      const quiz = QUIZZES[course.id]
      expect(quiz?.length).toBeGreaterThan(0)
      expect(gradeQuiz(course.id, quiz?.map((question) => question.correct) ?? [])).toBe(true)
      expect(gradeQuiz(course.id, (quiz ?? []).map(() => 99))).toBe(false)
    }
    for (const id of Object.keys(COURSE_POINTS)) {
      expect(courseById(id)?.id).toBe(id)
      expect(coursePoints(id)).toBeGreaterThan(0)
    }
  })

  it('guarda el progreso offline, emite folio y acredita solo con técnica', async () => {
    const dbName = `t-${crypto.randomUUID()}`
    const first = harness({ dbName })
    await first.care.completeModule('signos', 'sig-1')
    let snap = await first.care.snapshot()
    expect(snap.courses.find((course) => course.id === 'signos')?.completed).toBe(1)
    expect(snap.accreditation.status).toBe('en_proceso')
    await first.care.close()

    const second = harness({ dbName })
    await second.care.completeModule('signos', 'sig-1')
    await second.care.completeModule('signos', 'sig-2')
    snap = await second.care.snapshot()
    expect(snap.certificates.find((item) => item.courseId === 'signos')).toBeUndefined()
    expect(snap.courses.find((item) => item.id === 'signos')?.quizPassed).toBe(false)
    const missed = await second.care.submitQuiz('signos', [99, 99])
    expect(missed.correct).toBe(false)
    expect(missed.certificate).toBeNull()
    const issued = await second.care.submitQuiz(
      'signos',
      (QUIZZES.signos ?? []).map((question) => question.correct),
    )
    expect(issued.points).toBe(0)
    snap = await second.care.snapshot()
    const cert = snap.certificates.find((item) => item.courseId === 'signos')
    expect(cert).toBeTruthy()
    expect(isFolio(cert?.folio ?? '')).toBe(true)
    expect(snap.accreditation).toEqual({ status: 'acreditada', id: cert?.folio })
    expect(await second.care.profileFolio()).toBe(cert?.folio)
    const again = await second.care.submitQuiz(
      'signos',
      (QUIZZES.signos ?? []).map((question) => question.correct),
    )
    expect(again.certificate?.folio).toBe(cert?.folio)
    expect(again.points).toBe(0)
    expect((await second.care.snapshot()).certificates.filter((item) => item.courseId === 'signos')).toHaveLength(1)
    expect((await second.care.snapshot()).wallet.points).toBe(0)
    const pdf = certificatePdf(cert!)
    expect(pdfIncludes(pdf, cert!.folio)).toBe(true)
    expect(pdfIncludes(pdf, 'Signos vitales')).toBe(true)
    const hash = await sha256Hex(
      stableStringify({
        courseId: 'signos',
        courseName: 'Signos vitales',
        folio: cert!.folio,
        issuedAt: cert!.issuedAt,
      }),
    )
    expect(hash).toBe(cert!.payloadHash)
    await second.care.close()

    const digital = harness()
    await finishCourse(digital.care, 'telefono')
    const after = await digital.care.snapshot()
    expect(after.certificates).toHaveLength(1)
    expect(after.accreditation.status).toBe('en_proceso')
    expect(after.wallet.points).toBe(0)
    await digital.care.close()
  })

  it('emite puntos con el certificado y respeta el tope del mes', async () => {
    const { care, advance } = harness()
    const aseo = await finishCourse(care, 'aseo-bano-paciente-1')
    expect(aseo.points).toBe(25)
    expect(isFolio(aseo.certificate?.folio ?? '')).toBe(true)
    let snap = await care.snapshot()
    expect(snap.wallet.points).toBe(25)
    expect(snap.wallet.monthPoints).toBe(25)
    expect(snap.accreditation.status).toBe('acreditada')

    const infancias = await finishCourse(care, 'cuidado-infancias-1')
    expect(infancias.points).toBe(20)
    const digital = await finishCourse(care, 'alfabetizacion-digital-1')
    expect(digital.points).toBe(15)
    snap = await care.snapshot()
    expect(snap.wallet.points).toBe(60)

    const capped = await finishCourse(care, 'jerga-del-sector-1')
    expect(capped.certificate).toBeTruthy()
    expect(capped.points).toBe(0)
    snap = await care.snapshot()
    expect(snap.wallet.points).toBe(60)
    expect(snap.certificates.filter((item) => item.courseId === 'jerga-del-sector-1')).toHaveLength(1)

    advance(30 * 24 * 60 * 60 * 1000)
    const again = await finishCourse(care, 'jerga-del-sector-1')
    expect(again.points).toBe(0)
    expect((await care.snapshot()).wallet.points).toBe(60)
    await care.close()

    const nextMonth = harness()
    await finishCourse(nextMonth.care, 'aseo-bano-paciente-1')
    nextMonth.advance(30 * 24 * 60 * 60 * 1000)
    const reset = await finishCourse(nextMonth.care, 'cuidado-infancias-1')
    expect(reset.points).toBe(20)
    expect((await nextMonth.care.snapshot()).wallet.points).toBe(45)
    await nextMonth.care.close()
  })

  it('si el abono del curso falla, no queda certificado ni saldo', async () => {
    const { care } = harness({
      onBeforeCourseCredit() {
        throw new Error('mitad')
      },
    })
    await expect(finishCourse(care, 'aseo-bano-paciente-1')).rejects.toThrow('mitad')
    const snap = await care.snapshot()
    expect(snap.wallet.points).toBe(0)
    expect(snap.certificates).toHaveLength(0)
    expect(snap.courses.find((item) => item.id === 'aseo-bano-paciente-1')?.quizPassed).toBe(false)
    await care.close()
  })
})

describe('copy ciudadano', () => {
  it('no dice $CARE ni token', () => {
    const blob = JSON.stringify(allCopy()) + JSON.stringify(COURSES)
    expect(blob).not.toMatch(/\$CARE/i)
    expect(blob).not.toMatch(/token/i)
    expect(blob).toContain('Puntos Cívicos')
  })
})
