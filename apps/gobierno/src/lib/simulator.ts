import { clinicalSavingsUsd, ecosystemBreakdown, netSocialValueUsd, sroiRatio } from '@careledger/domain'

export function simulate(investment: number, hours: number) {
  const net = netSocialValueUsd(hours)
  return { net, ratio: sroiRatio(investment, hours), breakdown: ecosystemBreakdown(net) }
}
export const sessionSavings = clinicalSavingsUsd(3.5)
