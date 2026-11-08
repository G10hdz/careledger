import { describe, expect, it } from 'vitest'
import type { CareSession } from '@careledger/domain'
import { createCareApp, isFolio, pointsPreview, type CareAppOptions, type CareDraft } from './app'
import { addDaysUtc, b64UrlToBytes, bytesToB64Url, manualCode, sha256Hex, weekStartUtc } from './codec'
import { ATTESTATION_TTL_MS } from './config'
import { voucherQrText } from './documents'
import { formatCode, formatDuration } from './format'
import { createDeviceKeys, signText, verifyText } from './keys'
import { DEMO_LEDGER_PRIVATE_JWK, DEMO_LEDGER_PUBLIC_JWK } from '../../fixtures/demoLedger'
import { assignVeedor, createSimulatedOracle } from './oracle'
import { assertCanonical, canonicalFromSession, semanticHashInput } from './payload'
import { gradeQuiz, QUIZZES } from './quizzes'
import { canContinue, canSign, initialWizard, wizard, type WizardState } from './wizard'

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

function cuidado(occurredAt: string, minutes = 210): CareDraft {
  return {
    kind: 'cuidado',
    category: 'familiar_dependiente',
    supportTypes: ['alimentacion_aseo'],
    minutes,
    occurredAt,
  }
}

describe('wizard: estados que la UI puede producir por accidente', () => {
  it('minutos NaN nunca habilitan continuar ni firmar', () => {
    const enPaso2: WizardState = { ...initialWizard('cuidado'), step: 2, minutes: NaN, supportTypes: ['otro'] }
    expect(canContinue(enPaso2)).toBe(false)
    const enPaso3: WizardState = { ...enPaso2, step: 3 }
    expect(canSign(enPaso3)).toBe(false)
  })

  it('minutos por debajo del mínimo tampoco habilitan', () => {
    const state: WizardState = { ...initialWizard('cuidado'), step: 2, minutes: 3, supportTypes: ['otro'] }
    expect(canContinue(state)).toBe(false)
  })

  it('back en el paso 1 y next en el paso 3 no mueven el estado', () => {
    const paso1 = initialWizard('cuidado')
    expect(wizard(paso1, { type: 'back' })).toBe(paso1)
    const paso3: WizardState = { ...paso1, step: 3, minutes: 60, category: 'familiar_dependiente', supportTypes: ['otro'] }
    expect(wizard(paso3, { type: 'next' })).toBe(paso3)
  })

  it('elegir dos veces el mismo apoyo lo quita', () => {
    let state: WizardState = { ...initialWizard('cuidado'), step: 2 }
    state = wizard(state, { type: 'toggle-support', support: 'otro' })
    state = wizard(state, { type: 'toggle-support', support: 'otro' })
    expect(state.supportTypes).toEqual([])
    expect(canContinue(state)).toBe(false)
  })
})

describe('codec: fechas en los bordes del calendario', () => {
  it('weekStartUtc: el domingo pertenece a la semana que empezó el lunes anterior', () => {
    const lunes2 = Date.UTC(2026, 10, 2)
    expect(weekStartUtc(new Date('2026-11-08T15:00:00Z'))).toBe(lunes2) // domingo
    expect(weekStartUtc(new Date('2026-11-02T09:00:00Z'))).toBe(lunes2) // lunes
    expect(weekStartUtc(new Date('2026-11-07T23:59:00Z'))).toBe(lunes2) // sábado
    expect(weekStartUtc(new Date('2026-11-09T00:01:00Z'))).toBe(Date.UTC(2026, 10, 9))
  })

  it('addDaysUtc cruza el año: vale emitido el 20 de diciembre vence en enero', () => {
    expect(addDaysUtc('2026-12-20T10:00:00.000Z', 30)).toBe('2027-01-19T10:00:00.000Z')
    expect(addDaysUtc('2026-01-05T10:00:00.000Z', -10)).toBe('2025-12-26T10:00:00.000Z')
  })
})

describe('codec: b64url y código manual', () => {
  it('el ida y vuelta conserva los bytes en cualquier longitud', () => {
    for (const bytes of [[0], [1, 2], [1, 2, 3], [1, 2, 3, 4], new Array(64).fill(255)]) {
      const arr = new Uint8Array(bytes)
      expect([...b64UrlToBytes(bytesToB64Url(arr.buffer as ArrayBuffer))]).toEqual([...arr])
    }
  })

  it('manualCode: determinístico, 12 dígitos, y hash sin hex cae a ceros', async () => {
    const hash = await sha256Hex('vale-de-prueba')
    expect(manualCode(hash)).toMatch(/^\d{12}$/)
    expect(manualCode(hash)).toBe(manualCode(hash))
    expect(manualCode('zzzz')).toBe('000000000000')
  })
})

describe('llaves Ed25519: la firma amarra el texto exacto', () => {
  it('firma 86 caracteres b64url y no verifica sobre texto alterado', async () => {
    const keys = await createDeviceKeys()
    const sig = await signText(keys.privateKey, 'hola')
    expect(sig).toMatch(/^[A-Za-z0-9_-]{86}$/)
    expect(await verifyText(keys.publicJwk, 'hola', sig)).toBe(true)
    expect(await verifyText(keys.publicJwk, 'holb', sig)).toBe(false)
  })

  it('la llave privada del dispositivo no se puede exportar', async () => {
    const keys = await createDeviceKeys()
    await expect(crypto.subtle.exportKey('jwk', keys.privateKey)).rejects.toThrow()
  })

  it('signText sigue aceptando JWK para la llave demo del ledger', async () => {
    const sig = await signText(DEMO_LEDGER_PRIVATE_JWK, 'payload')
    expect(await verifyText(DEMO_LEDGER_PUBLIC_JWK, 'payload', sig)).toBe(true)
    expect(await verifyText(DEMO_LEDGER_PUBLIC_JWK, 'otro', sig)).toBe(false)
  })
})

describe('payload: contrato de privacidad en los bordes', () => {
  const sesion = (extra: Partial<CareSession>): CareSession => ({
    id: 's1',
    caregiverId: 'c1',
    nodeId: 'nodo-roma-condesa',
    kind: 'autocuidado',
    selfCareType: 'tiempo_libre',
    supportTypes: [],
    minutes: 60,
    occurredAt: '2026-11-07T15:00:00.000Z',
    createdOffline: true,
    ...extra,
  })

  it('un autocuidado con supportTypes inyectados no los filtra al canónico', () => {
    const json = canonicalFromSession(sesion({ supportTypes: ['otro'] }))
    expect(JSON.parse(json)).toEqual({
      kind: 'autocuidado',
      minutes: 60,
      nodeId: 'nodo-roma-condesa',
      occurredAt: '2026-11-07T15:00:00.000Z',
      selfCareType: 'tiempo_libre',
      sessionId: 's1',
    })
    assertCanonical(json)
  })

  it('assertCanonical rechaza arreglos, escalares y campos fuera del contrato', () => {
    for (const malo of ['[]', '"texto"', '123', '{"kind":"cuidado","gps":1}', '{"kind":"cuidado","nombre":"Elena"}']) {
      expect(() => assertCanonical(malo)).toThrow()
    }
  })

  it('el hash semántico amarra a la cuidadora; el canónico no', async () => {
    const misma = sesion({})
    const otraCuidadora = sesion({ caregiverId: 'c2' })
    expect(canonicalFromSession(misma)).toBe(canonicalFromSession(otraCuidadora))
    expect(await sha256Hex(semanticHashInput(misma))).not.toBe(await sha256Hex(semanticHashInput(otraCuidadora)))
  })
})

describe('oráculo: bordes de asignación y espera', () => {
  it('assignVeedor es determinístico y sin veedores lanza error', () => {
    expect(assignVeedor('sesion-x')).toBe(assignVeedor('sesion-x'))
    expect(() => assignVeedor('sesion-x', [])).toThrow('sin veedores')
  })

  it('un sello vencido no produce espera negativa', async () => {
    let waited = -1
    const oracle = createSimulatedOracle({
      now: () => Date.parse('2026-11-07T15:00:00.000Z'),
      sleep: async (ms) => {
        waited = ms
      },
    })
    const firmas = await oracle.requestCosigners({
      sessionId: 'sesion-x',
      canonical: '{"kind":"cuidado"}',
      nodeId: 'nodo-roma-condesa',
      dueAt: '2026-11-07T14:00:00.000Z', // hace una hora
    })
    expect(waited).toBe(0)
    expect(await verifyText(firmas.veedor.publicJwk, '{"kind":"cuidado"}', firmas.veedor.signature)).toBe(true)
  })
})

describe('submit: validaciones en la puerta', () => {
  it('minutos por debajo y por encima del rango se rechazan con código claro', async () => {
    const { care } = harness()
    await expect(care.submit(cuidado('2026-11-07T15:00:00.000Z', 4))).rejects.toMatchObject({ code: 'minutos' })
    await expect(care.submit(cuidado('2026-11-07T15:00:00.000Z', 1441))).rejects.toMatchObject({ code: 'minutos' })
    await care.close()
  })

  it('los extremos del rango sí pasan (5 y 1440 minutos)', async () => {
    const { care } = harness()
    const { done } = await care.submit(cuidado('2026-11-07T15:00:00.000Z', 5))
    await done
    await care.close()

    const { care: care2 } = harness()
    const { done: done2 } = await care2.submit(cuidado('2026-11-07T15:00:00.000Z', 1440))
    await done2
    const snap = await care2.snapshot()
    expect(snap.attestations[0]?.status).toBe('validada')
    await care2.close()
  })

  it('cuidado sin tipos de apoyo se rechaza', async () => {
    const { care } = harness()
    await expect(
      care.submit({ kind: 'cuidado', category: 'familiar_dependiente', supportTypes: [], minutes: 60, occurredAt: '2026-11-07T15:00:00.000Z' }),
    ).rejects.toMatchObject({ code: 'apoyo' })
    await care.close()
  })

  it('dedup es por contenido: misma jornada con otra hora es otra sesión', async () => {
    const { care } = harness()
    const a = await care.submit(cuidado('2026-11-07T15:00:00.000Z', 60))
    const b = await care.submit(cuidado('2026-11-07T16:00:00.000Z', 60))
    await Promise.all([a.done, b.done])
    expect(b.sessionId).not.toBe(a.sessionId)
    expect((await care.snapshot()).attestations).toHaveLength(2)
    await care.close()
  })
})

describe('billetera: canje en los bordes del saldo', () => {
  it('beneficio inexistente y saldo insuficiente se rechazan sin mutar nada', async () => {
    const { care } = harness()
    await expect(care.redeem('no-existe')).rejects.toMatchObject({ code: 'beneficio' })
    await expect(care.redeem('metro-semanal')).rejects.toMatchObject({ code: 'saldo' })
    const snap = await care.snapshot()
    expect(snap.wallet.points).toBe(0)
    expect(snap.vouchers).toHaveLength(0)
    await care.close()
  })

  it('dos canjes agotan el saldo exacto y emiten folios distintos', async () => {
    const { care } = harness()
    const { done } = await care.submit(cuidado('2026-11-07T15:00:00.000Z', 420)) // 70 pts
    await done
    const metro = await care.redeem('metro-semanal') // 30
    const relevo = await care.redeem('relevo-3h') // 40
    const snap = await care.snapshot()

    expect(snap.wallet.points).toBe(0)
    expect(snap.vouchers).toHaveLength(2)
    expect(metro.folio).not.toBe(relevo.folio)
    // El contador de folios es compartido: vales y atestaciones nunca colisionan.
    const folios = [metro.folio, relevo.folio, ...snap.attestations.map((a) => a.folio ?? '')]
    expect(new Set(folios).size).toBe(folios.length)
    for (const f of folios) expect(isFolio(f)).toBe(true)
    await care.close()
  })

  it('isFolio de la PWA es estricta: el folio en minúsculas no pasa', () => {
    expect(isFolio('CV-2026-0001-MX')).toBe(true)
    expect(isFolio('cv-2026-0001-mx')).toBe(false)
  })
})

describe('tope de autocuidado: cuenta la semana de la jornada, no la de hoy', () => {
  it('una jornada fechada la semana pasada no consume el tope de esta semana', async () => {
    const { care } = harness() // hoy = 2026-11-07, semana desde el lunes 2
    const vieja = await care.submit({
      kind: 'autocuidado',
      selfCareType: 'tiempo_libre',
      minutes: 60,
      occurredAt: '2026-10-30T15:00:00.000Z',
    })
    await vieja.done
    const nueva = await care.submit({
      kind: 'autocuidado',
      selfCareType: 'red_de_apoyo',
      minutes: 60,
      occurredAt: '2026-11-07T15:00:00.000Z',
    })
    await nueva.done

    const snap = await care.snapshot()
    // Si el cap contara por createdAt, la segunda ganaría 0: gana 10 porque
    // su semana es la del 2 de noviembre y la otra jornada es de la semana del 26 de octubre.
    expect(snap.wallet.points).toBe(20)
    await care.close()
  })
})

describe('rechazo por plazo y por firma', () => {
  it('la atestación sigue pendiente un segundo antes de las 72 h y expira al cruzar el plazo', async () => {
    const { care, advance } = harness({ sleep: () => new Promise(() => {}) })
    await care.submit(cuidado('2026-11-07T15:00:00.000Z', 60))
    advance(ATTESTATION_TTL_MS - 1000)
    let snap = await care.snapshot()
    expect(snap.attestations[0]?.status).toBe('pendiente')
    advance(1001)
    snap = await care.snapshot()
    expect(snap.attestations[0]?.status).toBe('rechazada')
    expect(snap.attestations[0]?.motivo).toBe('plazo')
    await care.close()
  })
})

describe('formación: bordes de orden y entrada', () => {
  it('quiz aprobado antes de los módulos no emite nada; al completar llega el certificado', async () => {
    const { care } = harness()
    const quiz = QUIZZES.signos ?? []
    const primero = await care.submitQuiz('signos', quiz.map((q) => q.correct))
    expect(primero.correct).toBe(true)
    expect(primero.certificate).toBeNull()

    expect(await care.completeModule('signos', 'sig-1')).toBeNull()
    const cert = await care.completeModule('signos', 'sig-2')
    expect(cert?.courseId).toBe('signos')
    expect(isFolio(cert?.folio ?? '')).toBe(true)
    await care.close()
  })

  it('módulo o curso inexistente se rechaza con código claro', async () => {
    const { care } = harness()
    await expect(care.completeModule('no-existe', 'x')).rejects.toMatchObject({ code: 'modulo' })
    await expect(care.completeModule('signos', 'modulo-inexistente')).rejects.toMatchObject({ code: 'modulo' })
    await care.close()
  })

  it('gradeQuiz en los bordes: curso inexistente, pocas respuestas, todas mal', () => {
    expect(gradeQuiz('no-existe', [0])).toBe(false)
    expect(gradeQuiz('signos', [1])).toBe(false)
    expect(gradeQuiz('signos', [99, 99])).toBe(false)
  })
})

describe('pointsPreview: lo que ve la cuidadora antes de firmar', () => {
  it('cuidado no descuenta del tope de autocuidado', () => {
    expect(pointsPreview('cuidado', 60, 999)).toEqual({ raw: 10, awarded: 10 })
  })

  it('autocuidado muestra lo que queda del tope semanal', () => {
    expect(pointsPreview('autocuidado', 60, 8)).toEqual({ raw: 10, awarded: 2 })
    expect(pointsPreview('autocuidado', 60, 10)).toEqual({ raw: 10, awarded: 0 })
  })
})

describe('documentos y formato', () => {
  it('el texto del QR solo lleva el contrato de cobro, sin cuidadora', () => {
    const qr = JSON.parse(
      voucherQrText({
        folio: 'CV-2026-0001-MX',
        benefitId: 'metro-semanal',
        costPoints: 5,
        issuedAt: 'a',
        validUntil: 'b',
        manualCode: '1',
        qrSignature: 's',
      }),
    ) as Record<string, unknown>
    expect(qr).toEqual({
      folio: 'CV-2026-0001-MX',
      benefitId: 'metro-semanal',
      points: 5,
      mxn: 50,
      issuedAt: 'a',
      validUntil: 'b',
      code: '1',
      sig: 's',
    })
  })

  it('formatos legibles en los bordes', () => {
    expect(formatDuration(45)).toBe('45 min')
    expect(formatDuration(60)).toBe('1 h')
    expect(formatDuration(150)).toBe('2 h 30 min')
    expect(formatCode('123456789012')).toBe('1234 5678 9012')
  })
})
