import { describe, expect, it } from 'vitest'
import {
  applyCourseCap,
  applyExchange,
  applySelfCareCap,
  BENEFITS,
  computePoints,
  confirmHours,
  COURSE_POINTS,
  COURSE_POINTS_PERIOD_CAP,
  ecosystemBreakdown,
  folioFor,
  isConsensusComplete,
  loadMultiplier,
  netSocialValueUsd,
  pointsToMxn,
  sroiRatio,
  SROI_DEFAULTS,
  tipNet,
  totalDeduction,
  validateExchange,
  type Member,
  type TimebankService,
} from './index'

describe('loadMultiplier: acotado a [1.0, 1.6] aunque el perfil se salga de rango', () => {
  it('piso y techo exactos', () => {
    expect(loadMultiplier({ fisica: 0, cognitiva: 0, logistica: 0 })).toBe(1)
    expect(loadMultiplier({ fisica: 5, cognitiva: 5, logistica: 5 })).toBeCloseTo(1.6, 10)
  })

  it('valores por encima de 5 no suben el multiplicador', () => {
    expect(loadMultiplier({ fisica: 99, cognitiva: 99, logistica: 99 })).toBeCloseTo(1.6, 10)
  })

  it('valores negativos no bajan del piso', () => {
    expect(loadMultiplier({ fisica: -3, cognitiva: -3, logistica: -3 })).toBe(1)
  })

  it('un eje solo interpola: 5 en física → 1.2', () => {
    expect(loadMultiplier({ fisica: 5, cognitiva: 0, logistica: 0 })).toBeCloseTo(1.2, 10)
  })
})

describe('computePoints: bordes de minutos y Q', () => {
  it('minutos fraccionados y mínimos', () => {
    expect(computePoints({ minutes: 0 })).toBe(0)
    expect(computePoints({ minutes: 90 })).toBe(15)
    expect(computePoints({ minutes: 1 })).toBe(0)
  })

  it('Q es monótono y los extremos equivalen a salirse de rango', () => {
    const base = { minutes: 600 }
    const bajo = computePoints({ ...base, q: 0.85 })
    const medio = computePoints({ ...base, q: 1 })
    const alto = computePoints({ ...base, q: 1.15 })
    expect(alto).toBeGreaterThan(medio)
    expect(medio).toBeGreaterThan(bajo)
    expect(computePoints({ ...base, q: 99 })).toBe(alto)
    expect(computePoints({ ...base, q: -9 })).toBe(bajo)
  })

  it('no valida la entrada: minutos negativos o NaN propagan (el guard está en la app)', () => {
    expect(computePoints({ minutes: -60 })).toBe(-10)
    expect(Number.isNaN(computePoints({ minutes: NaN }))).toBe(true)
  })
})

describe('isConsensusComplete: la firma vacía no cuenta', () => {
  it('un string vacío no completa el consenso', () => {
    expect(isConsensusComplete({ cuidadora: '', beneficiario: 'b', veedor: 'c' })).toBe(false)
    expect(isConsensusComplete({})).toBe(false)
  })
})

describe('topes: nunca devuelven negativo ni pasan del cap', () => {
  it('applySelfCareCap', () => {
    expect(applySelfCareCap(0, 0)).toBe(0)
    expect(applySelfCareCap(-3, 0)).toBe(0)
    expect(applySelfCareCap(999, 0)).toBe(10)
    expect(applySelfCareCap(8, 15)).toBe(0)
    // Un previo negativo (dato corrupto) no infla el cap.
    expect(applySelfCareCap(8, -5)).toBe(8)
  })

  it('applyCourseCap', () => {
    expect(applyCourseCap(0, 0)).toBe(0)
    expect(applyCourseCap(-3, 0)).toBe(0)
    expect(applyCourseCap(999, 0)).toBe(COURSE_POINTS_PERIOD_CAP)
    expect(applyCourseCap(25, 80)).toBe(0)
    expect(applyCourseCap(8, -5)).toBe(8)
  })
})

describe('tipNet: comisión de propina a centavos', () => {
  it('propina micro no paga comisión', () => {
    expect(tipNet(0.01)).toEqual({ fee: 0, net: 0.01 })
  })

  it('fracciones de peso redondean a centavos', () => {
    expect(tipNet(33.33)).toEqual({ fee: 1.67, net: 31.66 })
  })

  it('invariante: fee + net nunca pierde ni crea centavos', () => {
    for (let mxn = 1; mxn <= 500; mxn += 1) {
      const { fee, net } = tipNet(mxn)
      expect(Math.abs(fee + net - mxn)).toBeLessThan(0.001)
    }
  })
})

describe('folioFor: el formato CV-AAAA-NNNN-MX se rompe pasado 9999', () => {
  it('bordes de secuencia', () => {
    expect(folioFor(0, 2026)).toBe('CV-2026-0000-MX')
    expect(folioFor(9999, 2026)).toBe('CV-2026-9999-MX')
  })

  it('documentado: la secuencia 10000 ya no cumple el patrón de 4 dígitos del terminal', () => {
    // El folio 10,000 sale como CV-2026-10000-MX y la terminal lo rechaza
    // (apps/comercios: folioValido/parseFolio lo devuelven inválido).
    // Límite conocido del prototipo: ~9999 folios por año y por contador.
    expect(folioFor(10000, 2026)).toBe('CV-2026-10000-MX')
  })
})

describe('SROI: deducción y guards', () => {
  it('la deducción total es 54% (corrige el "46%" del mockup)', () => {
    expect(totalDeduction()).toBeCloseTo(0.18 + 0.12 + 0.24, 10)
    expect(totalDeduction()).toBeCloseTo(0.54, 10)
  })

  it('inversión cero o negativa no divide entre cero', () => {
    expect(sroiRatio(0, 50_000)).toBe(0)
    expect(sroiRatio(-100, 50_000)).toBe(0)
    expect(sroiRatio(1_000_000, 0)).toBe(0)
  })

  it('cero horas de cuidado producen valor neto cero', () => {
    expect(netSocialValueUsd(0)).toBe(0)
  })

  it('los shares del ecosistema suman el neto completo', () => {
    const net = netSocialValueUsd(777)
    const parts = ecosystemBreakdown(net)
    expect(parts.health + parts.family + parts.commerce).toBeCloseTo(net, 10)
    expect(SROI_DEFAULTS.shares.health + SROI_DEFAULTS.shares.family + SROI_DEFAULTS.shares.commerce).toBe(1)
  })
})

describe('catálogo y constantes del contrato', () => {
  it('los ids de BENEFITS son únicos y con costo entero positivo', () => {
    const ids = BENEFITS.map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const b of BENEFITS) {
      expect(Number.isInteger(b.costPoints)).toBe(true)
      expect(b.costPoints).toBeGreaterThan(0)
      expect(['hogar', 'movilidad', 'autocuidado', 'canasta']).toContain(b.category)
      expect(b.name.length).toBeGreaterThan(0)
    }
  })

  it('ninguna emisión de curso supera el tope mensual', () => {
    for (const [id, points] of Object.entries(COURSE_POINTS)) {
      expect(points).toBeGreaterThan(0)
      expect(points).toBeLessThanOrEqual(COURSE_POINTS_PERIOD_CAP)
      expect(id).toBeTruthy()
    }
  })

  it('paridad y vigencia del contrato con el terminal', () => {
    expect(pointsToMxn(0)).toBe(0)
    expect(pointsToMxn(1)).toBe(10)
  })
})

describe('banco de tiempo: bordes que la suite principal no cubre', () => {
  const caregiver: Member = { id: 'm1', membership: 'vecino_cuidador', level: 'N0', publicServant: false }
  const pro: Member = { id: 'm2', membership: 'demandante', level: 'N2', publicServant: false }
  const cuidado: TimebankService = { id: 'svc-cuidado', kind: 'cuidado', minLevel: 'N0' }
  const pro2: TimebankService = { id: 'svc-pro', kind: 'oficio', minLevel: 'N2' }

  it('intercambio simple de cuidado sin contra-servicio', () => {
    expect(
      validateExchange({ provider: caregiver, receiver: pro, service: cuidado, hours: 2, receiverBalance: 0 }),
    ).toEqual({ ok: true })
  })

  it('el nivel del receptor aplica al contra-servicio que ofrece', () => {
    expect(
      validateExchange({
        provider: pro,
        receiver: caregiver,
        service: cuidado,
        counterService: pro2,
        hours: 1,
        receiverBalance: 0,
      }),
    ).toEqual({ ok: false, reason: 'nivel' })
  })

  it('servidor público como receptor solo bloquea si ofrece contra-servicio', () => {
    const servidor: Member = { ...pro, publicServant: true }
    const base = { provider: caregiver, receiver: servidor, service: cuidado, hours: 1, receiverBalance: 0 }
    expect(validateExchange(base)).toEqual({ ok: true })
    expect(validateExchange({ ...base, counterService: pro2 })).toEqual({ ok: false, reason: 'servidor_publico' })
  })

  it('mismo_miembro se revisa antes que la duración', () => {
    expect(
      validateExchange({ provider: caregiver, receiver: caregiver, service: cuidado, hours: 99, receiverBalance: 0 }),
    ).toEqual({ ok: false, reason: 'mismo_miembro' })
  })

  it('el saldo puede aterrizar exactamente en -5: -4.5 menos 0.5 pasa; menos 1 no', () => {
    const base = { provider: caregiver, receiver: pro, service: cuidado, receiverBalance: -4.5 }
    expect(validateExchange({ ...base, hours: 0.5 })).toEqual({ ok: true })
    expect(validateExchange({ ...base, hours: 1 })).toEqual({ ok: false, reason: 'saldo' })
  })

  it('confirmHours acepta el tope de 8 h y rechaza duración no válida', () => {
    const confirmer = { by: 'familia', confirmerId: 'm9' } as const
    expect(confirmHours({ providerId: 'm1', hours: 8, confirmation: confirmer })).toEqual({ ok: true, credited: 8 })
    expect(confirmHours({ providerId: 'm1', hours: NaN, confirmation: confirmer })).toEqual({
      ok: false,
      reason: 'duracion',
    })
  })

  it('applyExchange crea saldos nuevos desde cero', () => {
    expect(applyExchange({}, 'a', 'b', 2)).toEqual({ a: 2, b: -2 })
  })
})
