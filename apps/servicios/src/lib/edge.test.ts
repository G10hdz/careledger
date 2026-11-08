import { describe, expect, it } from 'vitest'
import type { SupportType } from '@careledger/domain'
import {
  categories,
  createRequest,
  filterProviders,
  offerLabel,
  toCareSession,
  transition,
  type Provider,
  type Request,
  type Status,
} from './marketplace'

const ALL_STATUSES: Status[] = ['enviada', 'aceptada', 'agendada', 'completada', 'rechazada']

const ALLOWED: Record<Status, Status[]> = {
  enviada: ['aceptada', 'rechazada'],
  aceptada: ['agendada'],
  agendada: ['completada'],
  completada: [],
  rechazada: [],
}

function request(status: Status, zone = 'Roma-Condesa'): Request {
  return {
    id: 'r1',
    providerId: 'p1',
    category: 'Medicina',
    zone,
    budgetMin: 0,
    budgetMax: 500,
    schedule: 'Mañana',
    status,
  }
}

function providerDe(category: (typeof categories)[number], extra: Partial<Provider> = {}): Provider {
  return {
    id: `p-${category}`,
    name: 'Proveedora de prueba',
    category,
    zones: ['Roma-Condesa'],
    price: 120,
    public: false,
    availability: 'Lunes a viernes · mañana',
    certification: 'Credencial profesional verificada',
    accredited: true,
    ...extra,
  }
}

describe('máquina de estados: cada par (origen, destino) se comporta como la tabla', () => {
  it('transiciones exhaustivas 5×5', () => {
    for (const from of ALL_STATUSES) {
      for (const to of ALL_STATUSES) {
        if (ALLOWED[from].includes(to)) {
          expect(transition(request(from), to).status).toBe(to)
        } else {
          expect(() => transition(request(from), to)).toThrow('Transición inválida')
        }
      }
    }
  })

  it('los estados terminales no tienen salida, ni a sí mismos', () => {
    for (const status of ['completada', 'rechazada'] as const) {
      for (const to of ALL_STATUSES) {
        expect(() => transition(request(status), to)).toThrow()
      }
    }
  })
})

describe('filterProviders: bordes de zona y presupuesto', () => {
  const tres: Provider[] = [
    providerDe('Medicina', { id: 'a', price: 100 }),
    providerDe('Medicina', { id: 'b', price: 200 }),
    providerDe('Medicina', { id: 'c', price: 300 }),
  ]

  it('una zona fuera del piloto no devuelve nada', () => {
    expect(filterProviders(tres, 'Iztapalapa', 0, 9999, '')).toEqual([])
  })

  it('el precio en los bordes del rango cuenta como dentro', () => {
    const result = filterProviders(tres, 'Roma-Condesa', 100, 200, '')
    expect(result.slice(0, 2).map((p) => p.id)).toEqual(['a', 'b'])
  })

  it('una categoría inexistente en la zona no devuelve nada', () => {
    expect(filterProviders(tres, 'Roma-Condesa', 0, 9999, 'Terapia')).toEqual([])
  })
})

describe('toCareSession: bordes del registro de jornada', () => {
  it('zona fuera del mapa territorial no produce jornada', () => {
    const provider = providerDe('Enfermería')
    expect(toCareSession(request('completada', 'Tlalpan'), provider)).toBeNull()
  })

  it('toda categoría del catálogo mapea a un tipo de apoyo válido', () => {
    const validos: SupportType[] = [
      'acompanamiento_medico',
      'alimentacion_aseo',
      'estimulacion_cognitiva',
      'guardia_nocturna',
      'otro',
    ]
    for (const category of categories) {
      const session = toCareSession(request('completada'), providerDe(category))
      expect(session).not.toBeNull()
      expect(validos).toContain(session!.supportTypes[0])
    }
  })
})

describe('bordes de entrada del marketplace', () => {
  it('createRequest no valida el rango de presupuesto (documentado)', () => {
    const req = createRequest({
      id: 'r9',
      provider: providerDe('Medicina'),
      zone: 'Roma-Condesa',
      budgetMin: 900,
      budgetMax: 100,
      schedule: 'Noche',
    })
    expect(req.budgetMin).toBe(900)
    expect(req.budgetMax).toBe(100)
  })

  it('offerLabel con precio público fraccionado sigue siendo subsidiado', () => {
    expect(offerLabel(providerDe('Medicina', { public: true, price: 0.5 }))).toBe('Público · subsidiado')
    expect(offerLabel(providerDe('Medicina', { public: true, price: 0 }))).toBe('Público · gratuito')
  })
})
