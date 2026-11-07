import type { LoadProfile } from './types'

/** Puntos por hora base. Casos dorados del prototipo: 1h→10, 3.5h→35, 14h→140. */
export const POINTS_PER_HOUR = 10

/** Tope semanal de puntos por autocuidado. specs/02 REQ-ORA-013. */
export const SELF_CARE_WEEKLY_CAP_POINTS = 10

/** Rango del factor de reputación del nodo. specs/02 REQ-ORA-012. */
export const Q_MIN = 0.85
export const Q_MAX = 1.15

/**
 * Multiplicador de carga 1.0–1.6 a partir de la bitácora de dificultad
 * (3 ejes 0–5: física, cognitiva/emocional, logística). specs/02 REQ-ORA-011.
 */
export function loadMultiplier(profile: LoadProfile): number {
  const clamp = (v: number) => Math.min(5, Math.max(0, v))
  const sum = clamp(profile.fisica) + clamp(profile.cognitiva) + clamp(profile.logistica)
  return 1 + 0.6 * (sum / 15)
}

/** Emisión determinística: horas × 10 × multiplicadorCarga × Q, a entero. */
export function computePoints(opts: {
  minutes: number
  loadProfile?: LoadProfile
  q?: number
}): number {
  const hours = opts.minutes / 60
  const m = opts.loadProfile ? loadMultiplier(opts.loadProfile) : 1
  const q = Math.min(Q_MAX, Math.max(Q_MIN, opts.q ?? 1))
  return Math.round(hours * POINTS_PER_HOUR * m * q)
}

/** Aplica el tope semanal de autocuidado sobre puntos ya emitidos en la semana. */
export function applySelfCareCap(earned: number, alreadyEarnedThisWeek: number): number {
  return Math.max(0, Math.min(earned, SELF_CARE_WEEKLY_CAP_POINTS - alreadyEarnedThisWeek))
}

/** Consenso: puntos solo si están las 3 firmas. specs/02 REQ-ORA-001. */
export function isConsensusComplete(signatures: {
  cuidadora?: string
  beneficiario?: string
  veedor?: string
}): boolean {
  return Boolean(signatures.cuidadora && signatures.beneficiario && signatures.veedor)
}

/** Folio público del vale/atestación. specs/02 REQ-ORA-015. */
export function folioFor(seq: number, year: number): string {
  return `CV-${year}-${String(seq).padStart(4, '0')}-MX`
}

/** Emisión fija por curso completado. specs/08 REQ-FOR-007, 02 REQ-ORA-013b.
   Montos provisionales; los ajusta contenido con ADR. */
export const COURSE_POINTS: Record<string, number> = {
  'cuidado-infancias-1': 20,
  'aseo-bano-paciente-1': 25,
  'jerga-del-sector-1': 10,
  'alfabetizacion-digital-1': 15,
}

/** Tope de puntos por cursos por periodo (anti-farming). Default 60/mes. */
export const COURSE_POINTS_PERIOD_CAP = 60

export function coursePoints(courseId: string): number {
  return COURSE_POINTS[courseId] ?? 0
}

export function applyCourseCap(earned: number, alreadyEarned: number): number {
  return Math.max(0, Math.min(earned, COURSE_POINTS_PERIOD_CAP - alreadyEarned))
}
