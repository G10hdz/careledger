import { describe, expect, it } from 'vitest'
import { LEVELS, estimateWeek } from './estimate'

describe('estimateWeek', () => {
  it('respeta los casos dorados de la matriz: 1 h, 3.5 h y 14 h', () => {
    expect(estimateWeek(1).points).toBe(10)
    expect(estimateWeek(3.5).points).toBe(35)
    expect(estimateWeek(14).points).toBe(140)
  })

  it('convierte puntos a pesos con la paridad de 10 MXN', () => {
    const week = estimateWeek(3.5)
    expect(week.valueMxn).toBe(350)
  })

  it('estima el ahorro clínico con el tarifario del piloto', () => {
    expect(Math.round(estimateWeek(3.5).savingsUsd)).toBe(120)
    expect(Math.round(estimateWeek(7).savingsUsd)).toBe(240)
  })

  it('calcula horas de relevo con el costo real del catálogo', () => {
    expect(estimateWeek(7).restHours).toBeCloseTo(5.25, 4)
  })

  it('acota horas fuera del rango del control', () => {
    expect(estimateWeek(0).hours).toBe(1)
    expect(estimateWeek(100).hours).toBe(40)
  })

  it('mantiene la matriz de niveles alineada con la spec', () => {
    expect(LEVELS.map((level) => [level.hours, estimateWeek(level.hours).points])).toEqual([
      [1, 10],
      [3.5, 35],
      [14, 140],
    ])
  })
})
