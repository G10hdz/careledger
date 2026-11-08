import type { Benefit } from '@careledger/domain'
import { BENEFITS } from '@careledger/domain'

/**
 * Catálogo que acepta la terminal: el catálogo único del dominio, el mismo
 * con el que la PWA emite vales. Sin ids locales.
 */
export const BENEFITS_TERMINAL: Benefit[] = BENEFITS

const TODOS = new Map<string, Benefit>(BENEFITS_TERMINAL.map((b) => [b.id, b]))

export function benefitById(id: string): Benefit | undefined {
  return TODOS.get(id)
}

/** Puntos del beneficio, o null si el id no está en el catálogo. */
export function benefitPoints(id: string): number | null {
  return benefitById(id)?.costPoints ?? null
}
