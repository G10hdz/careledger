import { describe, expect, it } from 'vitest'
import { providers } from './fixtures'
import { filterProviders, transition, type Request } from './marketplace'

describe('directorio', () => {
  it('ordena primero las opciones dentro del rango y filtra zona', () => {
    const result = filterProviders(providers, 'Del Valle', 0, 100, '')
    expect(result.slice(0, 2).every(p => p.price <= 100)).toBe(true)
    expect(result.every(p => p.zones.includes('Del Valle'))).toBe(true)
  })
})
describe('solicitud', () => {
  it('avanza hasta completada y rechaza saltos', () => {
    const request: Request = { id: '1', providerId: '0-0', category: 'Medicina', zone: 'Roma-Condesa', budgetMin: 0, budgetMax: 500, schedule: 'Mañana', status: 'enviada' }
    expect(() => transition(request, 'completada')).toThrow()
    expect(transition(transition(transition(request, 'aceptada'), 'agendada'), 'completada').status).toBe('completada')
    expect(transition(request, 'rechazada').status).toBe('rechazada')
  })
})
