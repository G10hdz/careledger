import type { Benefit } from './types'

/** Paridad contable. specs/03 REQ-BIL-002. */
export const POINT_VALUE_MXN = 10

/** Vigencia de un vale emitido: 30 días naturales. REQ-BIL-005. */
export const VOUCHER_VALIDITY_DAYS = 30

/** Comisión de procesamiento sobre propinas familiares. REQ-BIL-021. */
export const TIP_FEE_RATE = 0.05

/** Catálogo único de beneficios, compartido por PWA (emisión) y terminal (cobro). specs/03 REQ-BIL-003. */
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
  {
    id: 'despensa-basica',
    name: 'Despensa básica',
    description: 'Canasta de 10 productos de la cooperativa del barrio.',
    category: 'canasta',
    tag: 'Comercio Local',
    costPoints: 10,
  },
  {
    id: 'medicamentos',
    name: 'Medicamentos sin receta',
    description: 'Vale en farmacia de barrio para medicamentos de venta libre.',
    category: 'canasta',
    tag: 'Comercio Local',
    costPoints: 20,
  },
  {
    id: 'pan-cafe',
    name: 'Pan y café',
    description: 'Desayuno en la panadería del barrio.',
    category: 'canasta',
    tag: 'Comercio Local',
    costPoints: 5,
  },
]

export function pointsToMxn(points: number): number {
  return points * POINT_VALUE_MXN
}

export function tipNet(mxn: number, feeRate = TIP_FEE_RATE): { fee: number; net: number } {
  const fee = Math.round(mxn * feeRate * 100) / 100
  return { fee, net: Math.round((mxn - fee) * 100) / 100 }
}
