import { describe, expect, it } from 'vitest'
import { parseScenario, sessionSavings, simulate } from './simulator'

describe('parseScenario', () => {
  it('lee un escenario válido', () => {
    expect(parseScenario('?inversion=2000000&horas=75000')).toEqual({ investment: 2_000_000, hours: 75_000 })
  })

  it.each(['', '?inversion=&horas=', '?inversion=%20&horas=%20'])('usa los valores iniciales si faltan números: %s', search => {
    expect(parseScenario(search)).toEqual({ investment: 1_000_000, hours: 50_000 })
  })

  it.each(['-1', 'NaN', 'Infinity', '-Infinity', 'abc', '5000001', '99999'])('rechaza inversión inválida: %s', investment => {
    expect(parseScenario(`?inversion=${investment}&horas=1000`)).toEqual({ investment: 1_000_000, hours: 1_000 })
  })

  it.each(['-1', 'NaN', 'Infinity', 'abc', '200001'])('rechaza horas inválidas: %s', hours => {
    expect(parseScenario(`?inversion=150000&horas=${hours}`)).toEqual({ investment: 150_000, hours: 50_000 })
  })

  it.each([
    ['?inversion=100000&horas=0', { investment: 100_000, hours: 0 }],
    ['?inversion=5000000&horas=200000', { investment: 5_000_000, hours: 200_000 }],
  ])('acepta los límites: %s', (search, expected) => {
    expect(parseScenario(search)).toEqual(expected)
  })
})

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
