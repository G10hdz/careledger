import { describe, expect, it } from 'vitest'
import { applyExchange, confirmHours, validateExchange } from './index'
import type { Member, TimebankService } from './index'

const caregiver: Member = {
  id: 'm1',
  membership: 'vecino_cuidador',
  level: 'N0',
  publicServant: false,
}
const dentist: Member = {
  id: 'm2',
  membership: 'demandante',
  level: 'N2',
  publicServant: false,
}

const dentalCare: TimebankService = { id: 'svc-odontologia', kind: 'oficio', minLevel: 'N2' }
const homeCare: TimebankService = { id: 'svc-cuidado', kind: 'cuidado', minLevel: 'N0' }
const plumbing: TimebankService = { id: 'svc-plomeria', kind: 'oficio', minLevel: 'N1' }

describe('banco de tiempo (specs/09)', () => {
  it('paridad: 2 h de odontología (oficio, N2) por 2 h de cuidado (N0) es válido y mueve exactamente 2 h', () => {
    const validation = validateExchange({
      provider: dentist,
      receiver: caregiver,
      service: dentalCare,
      counterService: homeCare,
      hours: 2,
      receiverBalance: 0,
    })
    expect(validation).toEqual({ ok: true })

    const balances = applyExchange({ [dentist.id]: 0, [caregiver.id]: 0 }, dentist.id, caregiver.id, 2)
    expect(balances[dentist.id]).toBe(2)
    expect(balances[caregiver.id]).toBe(-2)
  })

  it('límite: saldo -4 recibiendo 1 h pasa; -4 recibiendo 1.5 h se rechaza con saldo', () => {
    const base = {
      provider: caregiver,
      receiver: dentist,
      service: homeCare,
      counterService: dentalCare,
      receiverBalance: -4,
    }
    expect(validateExchange({ ...base, hours: 1 })).toEqual({ ok: true })
    expect(validateExchange({ ...base, hours: 1.5 })).toEqual({ ok: false, reason: 'saldo' })
  })

  it('autoconfirmación rechazada; familia y tercero aceptados', () => {
    expect(
      confirmHours({ providerId: 'm1', hours: 1, confirmation: { by: 'familia', confirmerId: 'm1' } }),
    ).toEqual({ ok: false, reason: 'mismo_miembro' })
    expect(
      confirmHours({ providerId: 'm1', hours: 1, confirmation: { by: 'familia', confirmerId: 'm2' } }),
    ).toEqual({ ok: true, credited: 1 })
    expect(
      confirmHours({ providerId: 'm1', hours: 1, confirmation: { by: 'tercero', confirmerId: 'm3' } }),
    ).toEqual({ ok: true, credited: 1 })
  })

  it('servidora pública no puede ofrecer servicios de intercambio', () => {
    const publicServant: Member = { ...dentist, publicServant: true }
    expect(
      validateExchange({
        provider: publicServant,
        receiver: caregiver,
        service: dentalCare,
        counterService: homeCare,
        hours: 1,
        receiverBalance: 0,
      }),
    ).toEqual({ ok: false, reason: 'servidor_publico' })
  })

  it('nivel insuficiente para el servicio se rechaza', () => {
    const beginner: Member = { ...caregiver, id: 'm4', level: 'N0' }
    expect(
      validateExchange({
        provider: beginner,
        receiver: caregiver,
        service: dentalCare,
        counterService: homeCare,
        hours: 1,
        receiverBalance: 0,
      }),
    ).toEqual({ ok: false, reason: 'nivel' })
  })

  it('oficio por oficio se rechaza con sin_cuidado; con un lado de cuidado es válido', () => {
    const otherDentist: Member = { ...dentist, id: 'm3' }
    expect(
      validateExchange({
        provider: dentist,
        receiver: otherDentist,
        service: dentalCare,
        counterService: plumbing,
        hours: 1,
        receiverBalance: 0,
      }),
    ).toEqual({ ok: false, reason: 'sin_cuidado' })
    expect(
      validateExchange({
        provider: caregiver,
        receiver: dentist,
        service: homeCare,
        counterService: dentalCare,
        hours: 1,
        receiverBalance: 0,
      }),
    ).toEqual({ ok: true })
    expect(
      validateExchange({
        provider: caregiver,
        receiver: otherDentist,
        service: homeCare,
        counterService: homeCare,
        hours: 1,
        receiverBalance: 0,
      }),
    ).toEqual({ ok: true })
  })

  it('duraciones 0, negativa, 0.25 y 8.5 se rechazan', () => {
    const base = {
      provider: caregiver,
      receiver: dentist,
      service: homeCare,
      counterService: dentalCare,
      receiverBalance: 0,
    }
    for (const hours of [0, -1, 0.25, 8.5]) {
      expect(validateExchange({ ...base, hours })).toEqual({ ok: false, reason: 'duracion' })
    }
    expect(validateExchange({ ...base, hours: 0.5 })).toEqual({ ok: true })
    expect(validateExchange({ ...base, receiverBalance: 3, hours: 8 })).toEqual({ ok: true })
  })

  it('bloques de 15 min con mínimo de 30 (spec 09, estandarización)', () => {
    const base = {
      provider: caregiver,
      receiver: dentist,
      service: homeCare,
      counterService: dentalCare,
      receiverBalance: 3,
    }
    for (const hours of [0.5, 0.75, 1.25, 7.75]) {
      expect(validateExchange({ ...base, hours })).toEqual({ ok: true })
    }
    for (const hours of [0.25, 0.6, 1.1]) {
      expect(validateExchange({ ...base, hours })).toEqual({ ok: false, reason: 'duracion' })
    }
  })

  it('un miembro no puede intercambiar consigo mismo', () => {
    expect(
      validateExchange({
        provider: caregiver,
        receiver: caregiver,
        service: homeCare,
        counterService: homeCare,
        hours: 1,
        receiverBalance: 0,
      }),
    ).toEqual({ ok: false, reason: 'mismo_miembro' })
  })
})

describe('applyExchange', () => {
  it('conserva la suma total y no muta la entrada', () => {
    const input: Record<string, number> = { [caregiver.id]: -1, [dentist.id]: 3 }
    const snapshot = { ...input }
    const next = applyExchange(input, caregiver.id, dentist.id, 2)
    const sum = (b: Record<string, number>) => Object.values(b).reduce((a, v) => a + v, 0)

    expect(input).toEqual(snapshot)
    expect(next).not.toBe(input)
    expect(next[caregiver.id]).toBe(1)
    expect(next[dentist.id]).toBe(1)
    expect(sum(next)).toBe(sum(input))
  })
})
