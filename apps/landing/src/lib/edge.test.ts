import { describe, expect, it } from 'vitest'
import {
  estimateWeek,
  formatHours,
  formatHoursText,
  formatInteger,
  formatMxn,
  formatUsd,
  LEVELS,
  HOURS_MAX,
  HOURS_MIN,
} from './estimate'

describe('estimateWeek: entradas degeneradas', () => {
  it('NaN e infinitos caen al mínimo del control', () => {
    expect(estimateWeek(NaN).hours).toBe(HOURS_MIN)
    expect(estimateWeek(Infinity).hours).toBe(HOURS_MIN)
    expect(estimateWeek(-Infinity).hours).toBe(HOURS_MIN)
  })

  it('acota por debajo y por encima del slider', () => {
    expect(estimateWeek(-5).hours).toBe(HOURS_MIN)
    expect(estimateWeek(0.5).hours).toBe(HOURS_MIN)
    expect(estimateWeek(40.7).hours).toBe(HOURS_MAX)
    expect(estimateWeek(40).hours).toBe(HOURS_MAX)
  })
})

describe('formatos de número en los bordes', () => {
  it('separador de miles y redondeo', () => {
    expect(formatInteger(0)).toBe('0')
    expect(formatInteger(999)).toBe('999')
    expect(formatInteger(1000)).toBe('1,000')
    expect(formatInteger(1234567)).toBe('1,234,567')
    expect(formatInteger(-1234)).toBe('-1,234')
    expect(formatInteger(0.4)).toBe('0')
  })

  it('horas y textos de moneda', () => {
    expect(formatHours(4)).toBe('4')
    expect(formatHours(4.5)).toBe('4.5')
    expect(formatHoursText(1)).toBe('1 hora')
    expect(formatHoursText(0.5)).toBe('0.5 horas')
    expect(formatUsd(1234)).toBe('$1,234 USD')
    expect(formatMxn(0)).toBe('$0 MXN')
  })
})

describe('LEVELS: invariantes de la matriz', () => {
  it('exactamente un nivel destacado y horas en orden creciente dentro de rango', () => {
    expect(LEVELS.filter((l) => l.featured)).toHaveLength(1)
    const hours = LEVELS.map((l) => l.hours)
    expect([...hours].sort((a, b) => a - b)).toEqual(hours)
    for (const level of LEVELS) {
      expect(level.hours).toBeGreaterThanOrEqual(HOURS_MIN)
      expect(level.hours).toBeLessThanOrEqual(HOURS_MAX)
      expect(level.copy.length).toBeGreaterThan(0)
      expect(level.reach.length).toBeGreaterThan(0)
    }
  })
})
