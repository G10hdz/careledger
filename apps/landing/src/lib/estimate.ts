import {
  BENEFITS,
  POINT_VALUE_MXN,
  clinicalSavingsUsd,
  computePoints,
} from '@careledger/domain'

export const HOURS_MIN = 1
export const HOURS_MAX = 40
export const HOURS_STEP = 0.5
export const HOURS_DEFAULT = 7

const relevo = BENEFITS.find((benefit) => benefit.id === 'relevo-3h')

if (!relevo) {
  throw new Error('El catálogo debe incluir el beneficio relevo-3h')
}

/** Horas de descanso certificado que compra el vale de relevo. */
export const RELEVO_HOURS = 3
export const RELEVO_COST_POINTS = relevo.costPoints

export interface WeeklyEstimate {
  hours: number
  points: number
  valueMxn: number
  savingsUsd: number
  restHours: number
}

/** Estimación semanal con la matemática del dominio, sin multiplicador de carga. */
export function estimateWeek(hours: number): WeeklyEstimate {
  const safeHours = Number.isFinite(hours)
    ? Math.min(HOURS_MAX, Math.max(HOURS_MIN, hours))
    : HOURS_MIN
  const points = computePoints({ minutes: Math.round(safeHours * 60) })

  return {
    hours: safeHours,
    points,
    valueMxn: points * POINT_VALUE_MXN,
    savingsUsd: clinicalSavingsUsd(safeHours),
    restHours: (points / RELEVO_COST_POINTS) * RELEVO_HOURS,
  }
}

export interface Level {
  id: 'basico' | 'cotidiano' | 'integral'
  name: string
  hours: number
  copy: string
  reach: string
  featured: boolean
}

export const LEVELS: Level[] = [
  {
    id: 'basico',
    name: 'Básico',
    hours: 1,
    copy: 'Acompañamiento, toma de signos vitales o un paseo seguro en la manzana.',
    reach: 'Guardas 10 de los 30 puntos del pase semanal de Metro.',
    featured: false,
  },
  {
    id: 'cotidiano',
    name: 'Cotidiano',
    hours: 3.5,
    copy: 'Higiene personal, alimentación especial y supervisión activa de una persona dependiente.',
    reach: 'Alcanza para el pase semanal de Metro.',
    featured: true,
  },
  {
    id: 'integral',
    name: 'Integral',
    hours: 14,
    copy: 'Una semana certificada de cuidado principal, con bitácora validada por el comité del barrio.',
    reach: 'Luz, Metro y 3 horas de relevo en la misma semana.',
    featured: false,
  },
]

export function formatInteger(value: number): string {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function formatHours(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function formatHoursText(value: number): string {
  return `${formatHours(value)} ${value === 1 ? 'hora' : 'horas'}`
}

export function formatUsd(value: number): string {
  return `$${formatInteger(value)} USD`
}

export function formatMxn(value: number): string {
  return `$${formatInteger(value)} MXN`
}
