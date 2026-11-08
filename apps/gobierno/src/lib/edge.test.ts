import { describe, expect, it } from 'vitest'
import { simulate } from './simulator'

describe('simulador SROI: entradas degeneradas', () => {
  it('inversión cero o negativa no produce ratio infinito', () => {
    expect(simulate(0, 50_000).ratio).toBe(0)
    expect(simulate(-1_000_000, 50_000).ratio).toBe(0)
  })

  it('cero horas proyectadas devuelve un escenario en ceros', () => {
    const result = simulate(1_000_000, 0)
    expect(result.net).toBe(0)
    expect(result.ratio).toBe(0)
    expect(result.breakdown).toEqual({ health: 0, family: 0, commerce: 0 })
  })

  it('con inversión nula el neto y el desglose siguen siendo coherentes', () => {
    const result = simulate(0, 777)
    expect(result.breakdown.health + result.breakdown.family + result.breakdown.commerce).toBeCloseTo(
      result.net,
      10,
    )
    expect(result.net).toBeGreaterThan(0)
  })
})
