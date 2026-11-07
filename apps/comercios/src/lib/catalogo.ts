import type { Benefit } from '@careledger/domain'
import { BENEFITS } from '@careledger/domain'

/** Beneficios locales que emiten comercios del barrio (mock del hito 2). */
export const BENEFITS_COMERCIO: Benefit[] = [
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

const TODOS = new Map<string, Benefit>(
  [...BENEFITS, ...BENEFITS_COMERCIO].map((b) => [b.id, b]),
)

export function benefitById(id: string): Benefit | undefined {
  return TODOS.get(id)
}

/** Puntos del beneficio, o null si el id no está en el catálogo. */
export function benefitPoints(id: string): number | null {
  return benefitById(id)?.costPoints ?? null
}
