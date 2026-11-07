import { describe, expect, it } from 'vitest'
import {
  applyCourseCap,
  applySelfCareCap,
  coursePoints,
  clinicalSavingsUsd,
  computePoints,
  folioFor,
  isConsensusComplete,
  loadMultiplier,
  netSocialValueUsd,
  pointsToMxn,
  sroiRatio,
  tipNet,
} from './index'

describe('puntos (casos dorados del prototipo)', () => {
  it('1h → 10 pts', () => expect(computePoints({ minutes: 60 })).toBe(10))
  it('3.5h → 35 pts', () => expect(computePoints({ minutes: 210 })).toBe(35))
  it('14h → 140 pts', () => expect(computePoints({ minutes: 840 })).toBe(140))
  it('multiplicador de carga sube la emisión hasta 1.6x', () => {
    const max = computePoints({ minutes: 210, loadProfile: { fisica: 5, cognitiva: 5, logistica: 5 } })
    expect(max).toBe(56)
  })
  it('Q acotado a [0.85, 1.15]', () => {
    expect(computePoints({ minutes: 60, q: 99 })).toBe(Math.round(10 * 1.15))
    expect(computePoints({ minutes: 60, q: 0 })).toBe(Math.round(10 * 0.85))
  })
})

describe('autocuidado', () => {
  it('tope semanal de 10 pts', () => {
    expect(applySelfCareCap(8, 0)).toBe(8)
    expect(applySelfCareCap(8, 6)).toBe(4)
    expect(applySelfCareCap(8, 10)).toBe(0)
  })
})

describe('cursos', () => {
  it('emite puntos fijos por curso aprobado', () => {
    expect(coursePoints('aseo-bano-paciente-1')).toBe(25)
    expect(coursePoints('curso-inexistente')).toBe(0)
  })
  it('tope por periodo contra farming', () => {
    expect(applyCourseCap(25, 0)).toBe(25)
    expect(applyCourseCap(25, 50)).toBe(10)
    expect(applyCourseCap(25, 60)).toBe(0)
  })
})

describe('consenso 3-de-3', () => {
  it('incompleto sin las 3 firmas', () => {
    expect(isConsensusComplete({ cuidadora: 'a', beneficiario: 'b' })).toBe(false)
    expect(isConsensusComplete({ cuidadora: 'a', beneficiario: 'b', veedor: 'c' })).toBe(true)
  })
})

describe('SROI (calibración del piloto)', () => {
  it('50k horas con $1M → ratio ≈3.42x', () => {
    const ratio = sroiRatio(1_000_000, 50_000)
    expect(ratio).toBeGreaterThan(3.4)
    expect(ratio).toBeLessThan(3.45)
  })
  it('ahorro clínico público: 3.5h → $120 USD', () => {
    expect(clinicalSavingsUsd(3.5)).toBeCloseTo(120, 0)
  })
})

describe('dinero', () => {
  it('paridad 1 pt = $10 MXN', () => expect(pointsToMxn(140)).toBe(1400))
  it('comisión de propina 5%', () => {
    const { fee, net } = tipNet(1000)
    expect(fee).toBe(50)
    expect(net).toBe(950)
  })
  it('folio CV-AAAA-NNNN-MX', () => expect(folioFor(42, 2025)).toBe('CV-2025-0042-MX'))
})
