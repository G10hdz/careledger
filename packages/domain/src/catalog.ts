import type { Benefit } from './types'

/** Paridad contable. specs/03 REQ-BIL-002. */
export const POINT_VALUE_MXN = 10

/** Vigencia de un vale emitido: 30 días naturales. REQ-BIL-005. */
export const VOUCHER_VALIDITY_DAYS = 30

/** Comisión de procesamiento sobre propinas familiares. REQ-BIL-021. */
export const TIP_FEE_RATE = 0.05

/** Catálogo inicial de beneficios. specs/03 REQ-BIL-003. */
export const BENEFITS: Benefit[] = [
  {
    id: 'cfe-30',
    name: 'Descuento del 30% en tu próximo recibo de Luz / Energía',
    description:
      'Convenio con la Comisión Federal de Electricidad y Secretaría del Bienestar. Tarifas residenciales 1A, 1B y 1C.',
    category: 'hogar',
    tag: 'Subsidio Directo',
    costPoints: 50,
  },
  {
    id: 'metro-semanal',
    name: 'Pase Semanal Ilimitado de Transporte Público',
    description: 'Válido en red Metro, Metrobús y RTP. Carga directa por NFC o en taquilla municipal.',
    category: 'movilidad',
    tag: '7 Días Libres',
    costPoints: 30,
  },
  {
    id: 'relevo-3h',
    name: '3 horas de Asistente de Relevo Certificado para tu descanso',
    description:
      'Un profesional certificado por el Sistema Municipal de Cuidados releva tus labores para consultas, descanso o recreación.',
    category: 'autocuidado',
    tag: 'Personal Certificado',
    costPoints: 40,
  },
]

export function pointsToMxn(points: number): number {
  return points * POINT_VALUE_MXN
}

export function tipNet(mxn: number, feeRate = TIP_FEE_RATE): { fee: number; net: number } {
  const fee = Math.round(mxn * feeRate * 100) / 100
  return { fee, net: Math.round((mxn - fee) * 100) / 100 }
}
