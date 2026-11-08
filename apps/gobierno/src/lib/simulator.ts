import { clinicalSavingsUsd, ecosystemBreakdown, netSocialValueUsd, sroiRatio } from '@careledger/domain'

export const SCENARIO_LIMITS = {
  investment: { min: 100_000, max: 5_000_000, step: 50_000, default: 1_000_000 },
  hours: { min: 0, max: 200_000, step: 1_000, default: 50_000 },
} as const

export function parseScenario(search: string) {
  const params = new URLSearchParams(search)
  function read(key: string, limits: { min: number; max: number; default: number }) {
    const raw = params.get(key)
    const value = Number(raw)
    return raw?.trim() && Number.isFinite(value) && value >= limits.min && value <= limits.max
      ? value : limits.default
  }
  return { investment: read('inversion', SCENARIO_LIMITS.investment), hours: read('horas', SCENARIO_LIMITS.hours) }
}

export function simulate(investment: number, hours: number) {
  const net = netSocialValueUsd(hours)
  return { net, ratio: sroiRatio(investment, hours), breakdown: ecosystemBreakdown(net) }
}
export const sessionSavings = clinicalSavingsUsd(3.5)
