import { describe, expect, it } from 'vitest'
import { sessionSavings, simulate } from './simulator'

describe('simulador SROI', () => {
  it('calcula el escenario de referencia y distribuye el valor neto', () => {
    const result = simulate(1_000_000, 50_000)
    expect(result.net).toBeCloseTo(3_420_000, -3)
    expect(result.ratio).toBeCloseTo(3.42, 2)
    expect(Object.values(result.breakdown).reduce((a, b) => a + b, 0)).toBeCloseTo(result.net, 5)
    expect(sessionSavings).toBeCloseTo(120)
  })
  it('recalcula cuando cambian la inversión y las horas', () => {
    expect(simulate(2_000_000, 50_000).ratio).toBeCloseTo(simulate(1_000_000, 50_000).ratio / 2)
    expect(simulate(1_000_000, 100_000).net).toBeCloseTo(simulate(1_000_000, 50_000).net * 2)
  })
})
