import { describe, expect, it } from 'vitest'
import { computePoints } from '@careledger/domain'
import { providers } from './fixtures'
import { CAREGIVER_HOURLY_RATE_MXN, categories, createRequest, filterProviders, offerLabel, toCareSession, transition, type Request } from './marketplace'

describe('directorio', () => {
  it('ordena primero las opciones dentro del rango y filtra zona (REQ-SER-001/003)', () => {
    const result = filterProviders(providers, 'Del Valle', 0, 100, '')
    expect(result.slice(0, 2).every(p => p.price <= 100)).toBe(true)
    expect(result.every(p => p.zones.includes('Del Valle'))).toBe(true)
  })

  it('cubre la taxonomía mínima de servicios (REQ-SER-002)', () => {
    const required = ['Medicina', 'Terapia', 'Fisioterapia', 'Enfermería', 'Transporte especializado']
    expect(categories).toEqual(expect.arrayContaining(required))
    expect(required.every(c => providers.some(p => p.category === c))).toBe(true)
  })

  it('etiqueta oferta pública gratuita/subsidiada y privada sin ambigüedad (REQ-SER-004)', () => {
    const gratis = providers.find(p => p.id === 'publico-1')
    const subsidiada = providers.find(p => p.id === 'publico-2')
    const privada = providers.find(p => !p.public)
    expect(offerLabel(gratis!)).toBe('Público · gratuito')
    expect(offerLabel(subsidiada!)).toBe('Público · subsidiado')
    expect(offerLabel(privada!)).toBe('Privado')
  })

  it('todo proveedor expone perfil completo (REQ-SER-005)', () => {
    for (const p of providers) {
      expect(p.name).not.toBe('')
      expect(p.category).not.toBe('')
      expect(p.zones.length).toBeGreaterThan(0)
      expect(p.price).toBeGreaterThanOrEqual(0)
      expect(p.availability).not.toBe('')
      expect(p.certification).not.toBe('')
      expect(typeof p.public).toBe('boolean')
    }
  })
})

describe('solicitud', () => {
  const provider = providers[0]!

  it('envía solo necesidad, zona, presupuesto y horario; sin datos médicos (REQ-SER-006)', () => {
    const request = createRequest({ id: 'r1', provider, zone: 'Roma-Condesa', budgetMin: 0, budgetMax: 500, schedule: 'Mañana' })
    expect(Object.keys(request).sort()).toEqual(['budgetMax', 'budgetMin', 'category', 'id', 'providerId', 'schedule', 'status', 'zone'])
    expect(request.status).toBe('enviada')
  })

  it('avanza enviada → aceptada → agendada → completada y rechaza saltos (REQ-SER-007)', () => {
    const request: Request = { id: 'r2', providerId: provider.id, category: provider.category, zone: 'Roma-Condesa', budgetMin: 0, budgetMax: 500, schedule: 'Mañana', status: 'enviada' }
    expect(() => transition(request, 'completada')).toThrow()
    const aceptada = transition(request, 'aceptada')
    const agendada = transition(aceptada, 'agendada')
    expect(transition(agendada, 'completada').status).toBe('completada')
    expect(transition(request, 'rechazada').status).toBe('rechazada')
  })
})

describe('tarifa por hora uniforme (REQ-SER-010)', () => {
  it('toda cuidadora acreditada cobra la misma hora, sin excepciones', () => {
    const acreditadas = providers.filter(p => p.accredited)
    expect(acreditadas.length).toBeGreaterThanOrEqual(2)
    expect(acreditadas.every(p => p.price === CAREGIVER_HOURLY_RATE_MXN)).toBe(true)
  })

  it('la oferta pública mantiene su etiqueta y no entra a la tarifa uniforme', () => {
    const publicas = providers.filter(p => p.public)
    expect(publicas.every(p => p.price !== CAREGIVER_HOURLY_RATE_MXN && (p.price === 0 || p.price === 50))).toBe(true)
  })

  it('la regla solo alcanza a acreditadas: el resto cotiza distinto', () => {
    const resto = providers.filter(p => !p.accredited && !p.public)
    expect(new Set(resto.map(p => p.price)).size).toBeGreaterThan(1)
  })
})

describe('registro de jornada (REQ-SER-008)', () => {
  it('una solicitud completada de cuidadora acreditada produce jornada y puntos', () => {
    const acreditada = providers.find(p => p.accredited)!
    const request: Request = { id: 'r3', providerId: acreditada.id, category: acreditada.category, zone: 'Roma-Condesa', budgetMin: 0, budgetMax: 500, schedule: 'Mañana', status: 'completada' }
    const session = toCareSession(request, acreditada)
    expect(session).not.toBeNull()
    expect(session!.nodeId).toBe('nodo-roma-condesa')
    expect(session!.minutes).toBeGreaterThan(0)
    expect(session!.supportTypes.length).toBeGreaterThan(0)
    expect(computePoints({ minutes: session!.minutes })).toBe(Math.round((session!.minutes / 60) * 10))
  })

  it('no registra jornada si no es cuidadora acreditada o falta completarse', () => {
    const privado = providers.find(p => !p.accredited && !p.public)!
    const completada: Request = { id: 'r4', providerId: privado.id, category: privado.category, zone: 'Roma-Condesa', budgetMin: 0, budgetMax: 500, schedule: 'Mañana', status: 'completada' }
    expect(toCareSession(completada, privado)).toBeNull()
    const acreditada = providers.find(p => p.accredited)!
    const agendada: Request = { ...completada, providerId: acreditada.id, category: acreditada.category, status: 'agendada' }
    expect(toCareSession(agendada, acreditada)).toBeNull()
  })
})
