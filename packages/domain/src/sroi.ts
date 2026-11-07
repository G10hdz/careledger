/** SROI — metodología Social Value International. specs/04.
   V = (ΔS + ΔC + ΔE) × Q × (1 − δ_dw − δ_disp − δ_atrib)

   Constantes calibradas al piloto de diseño: con $1M USD invertidos y
   50,000 horas proyectadas, el valor neto sale ≈$3.42M (ratio 3.42x).
   Son defaults de calibración; los ajusta la Secretaría por ADR. */

export const SROI_DEFAULTS = {
  /** descuentos metodológicos (agregado 54%: 18+12+24; el mockup de Stitch
     dice "46%" pero es un error de suma del prototipo — mandan los
     componentes auditables) */
  deadweight: 0.18,
  displacement: 0.12,
  attribution: 0.24,
  /** deltas brutos por hora de cuidado (USD), calibrados al piloto:
     50k hrs → neto ≈$3.42M (bruto ×0.46 tras la deducción del 54%) */
  deltaSPerHour: 71.38, // ahorro en admisiones y ambulancias evitadas
  deltaCPerHour: 47.58, // capital social / seguridad vecinal
  deltaEPerHour: 29.74, // reincorporación laboral parcial
  qFactor: 1.0,
  /** distribución del retorno por ecosistema (sobre el valor neto) */
  shares: { health: 0.48, family: 0.32, commerce: 0.2 },
} as const

/** Ahorro clínico preventivo mostrado en el comprobante: $120 USD a 3.5h.
   Figura pública del tarifario IMSS/SEDESA; es el número de comunicación
   ciudadana, distinto del componente ΔS del modelo SROI completo. */
export const CLINICAL_SAVINGS_PER_HOUR_USD = 120 / 3.5

export function totalDeduction(d = SROI_DEFAULTS): number {
  return d.deadweight + d.displacement + d.attribution
}

/** Valor social neto (USD) para N horas de cuidado. */
export function netSocialValueUsd(hours: number, q = SROI_DEFAULTS.qFactor, d = SROI_DEFAULTS): number {
  const gross = hours * (d.deltaSPerHour + d.deltaCPerHour + d.deltaEPerHour)
  return gross * q * (1 - totalDeduction(d))
}

/** Ratio SROI: retorno neto por cada $1 invertido. */
export function sroiRatio(investmentUsd: number, projectedHours: number, q = SROI_DEFAULTS.qFactor): number {
  if (investmentUsd <= 0) return 0
  return netSocialValueUsd(projectedHours, q) / investmentUsd
}

/** Desglose del retorno por ecosistema (suma = neto). */
export function ecosystemBreakdown(netUsd: number, d = SROI_DEFAULTS) {
  return {
    health: netUsd * d.shares.health,
    family: netUsd * d.shares.family,
    commerce: netUsd * d.shares.commerce,
  }
}

/** Cifra pública del comprobante cívico (REQ-PWA-012): ahorro clínico. */
export function clinicalSavingsUsd(hours: number): number {
  return hours * CLINICAL_SAVINGS_PER_HOUR_USD
}
