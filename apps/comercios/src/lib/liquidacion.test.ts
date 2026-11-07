import { describe, expect, it } from 'vitest'
import type { ComercioStore } from './types'
import { cobrarVale } from './cobro'
import { valesFixture } from './fixtures'
import { firmarVale } from './firma'
import {
  confirmarLiquidacion,
  cobrosDelDia,
  dateKey,
  liquidacionesPendientes,
  liquidarDia,
  sincronizarTodo,
} from './liquidacion'

const HOY = new Date('2026-11-07T12:00:00-06:00')

function storeConComercio(): ComercioStore {
  return {
    comercio: {
      nombre: 'Comercio Solidario',
      clabe: '012345678901234568',
      idOficialName: 'ine.jpg',
      domicilioName: 'recibo.pdf',
      afiliadoAt: '2026-11-01T10:00:00-06:00',
      estado: 'afiliado',
      placaFolio: 'CS-2026-0001-MX',
    },
    cobros: [],
    liquidaciones: [],
  }
}

async function cobrar(store: ComercioStore, folio: string, hora: Date) {
  const [activo] = valesFixture(hora)
  const vale = firmarVale({ ...activo!, folio })
  const resultado = await cobrarVale(store, { voucher: vale, now: hora })
  if (!resultado.ok) throw new Error(`cobro de fixture falló: ${resultado.reason}`)
  return resultado.cobro
}

describe('dateKey', () => {
  it('usa la fecha local del ISO', () => {
    expect(dateKey('2026-11-07T23:30:00-06:00')).toBe('2026-11-07')
    expect(dateKey('2026-11-08T01:00:00-06:00')).toBe('2026-11-08')
  })
})

describe('liquidarDia (REQ-COM-004: 100% del día, 0% comisión, ≤24h)', () => {
  it('agrupa los cobros del día y transfiere la suma exacta sin comisión', async () => {
    const store = storeConComercio()
    await cobrar(store, 'CV-2026-0087-MX', new Date('2026-11-07T09:15:00-06:00')) // $100
    await cobrar(store, 'CV-2026-0088-MX', new Date('2026-11-07T11:40:00-06:00')) // $100
    const resultado = liquidarDia(store, HOY)

    expect(resultado.ok).toBe(true)
    if (!resultado.ok) return
    expect(resultado.liquidacion.amountMxn).toBe(200) // 0% comisión: suma exacta
    expect(resultado.liquidacion.folios.sort()).toEqual([
      'CV-2026-0087-MX',
      'CV-2026-0088-MX',
    ])
    expect(resultado.liquidacion.status).toBe('programada')
    expect(resultado.liquidacion.clabe).toBe('012345678901234568')
    expect(new Date(resultado.liquidacion.etaAt).getTime()).toBe(HOY.getTime() + 24 * 3600 * 1000)
    expect(liquidacionesPendientes(store)).toHaveLength(1)
  })

  it('sin comercio no liquida', () => {
    const store = storeConComercio()
    store.comercio = null
    expect(liquidarDia(store, HOY)).toEqual({ ok: false, reason: 'sin_comercio' })
  })

  it('sin cobros del día no liquida', async () => {
    const store = storeConComercio()
    await cobrar(store, 'CV-2026-0087-MX', new Date('2026-11-06T18:00:00-06:00')) // ayer
    expect(liquidarDia(store, HOY)).toEqual({ ok: false, reason: 'sin_cobros' })
  })

  it('un folio entra en una sola liquidación (idempotencia del batch)', async () => {
    const store = storeConComercio()
    await cobrar(store, 'CV-2026-0087-MX', new Date('2026-11-07T09:15:00-06:00'))
    const primera = liquidarDia(store, HOY)
    expect(primera.ok).toBe(true)

    // Segundo batch el mismo día sin cobros nuevos: nada que liquidar.
    const segunda = liquidarDia(store, new Date('2026-11-07T18:00:00-06:00'))
    expect(segunda).toEqual({ ok: false, reason: 'sin_cobros' })
    expect(store.liquidaciones).toHaveLength(1)
  })

  it('un cobro nuevo tras liquidar entra en el siguiente batch, no en el anterior', async () => {
    const store = storeConComercio()
    await cobrar(store, 'CV-2026-0087-MX', new Date('2026-11-07T09:15:00-06:00'))
    liquidarDia(store, new Date('2026-11-07T10:00:00-06:00'))
    await cobrar(store, 'CV-2026-0088-MX', new Date('2026-11-07T12:30:00-06:00'))

    const segundo = liquidarDia(store, new Date('2026-11-07T13:00:00-06:00'))
    expect(segundo.ok).toBe(true)
    if (!segundo.ok) return
    expect(segundo.liquidacion.folios).toEqual(['CV-2026-0088-MX'])
    expect(segundo.liquidacion.amountMxn).toBe(100)
    expect(store.liquidaciones).toHaveLength(2)
  })
})

describe('confirmarLiquidacion', () => {
  it('confirma una liquidación programada con acuse simulado', async () => {
    const store = storeConComercio()
    await cobrar(store, 'CV-2026-0087-MX', new Date('2026-11-07T09:15:00-06:00'))
    const resultado = liquidarDia(store, HOY)
    if (!resultado.ok) throw new Error('no liquidó')

    const confirmada = confirmarLiquidacion(
      store,
      resultado.liquidacion.id,
      new Date('2026-11-07T20:00:00-06:00'),
    )
    expect(confirmada).toBe(true)
    expect(store.liquidaciones[0]!.status).toBe('confirmada')
    expect(store.liquidaciones[0]!.confirmedAt).toBe('2026-11-08T02:00:00.000Z')
    expect(liquidacionesPendientes(store)).toHaveLength(0)
  })

  it('no confirma dos veces ni ids desconocidos', async () => {
    const store = storeConComercio()
    await cobrar(store, 'CV-2026-0087-MX', new Date('2026-11-07T09:15:00-06:00'))
    const resultado = liquidarDia(store, HOY)
    if (!resultado.ok) throw new Error('no liquidó')
    confirmarLiquidacion(store, resultado.liquidacion.id, HOY)
    expect(confirmarLiquidacion(store, resultado.liquidacion.id, HOY)).toBe(false)
    expect(confirmarLiquidacion(store, 'LIQ-2026-11-07-99', HOY)).toBe(false)
  })
})

describe('cobrosDelDia y sincronizarTodo', () => {
  it('filtra por día y sincroniza toda la cola', async () => {
    const store = storeConComercio()
    await cobrar(store, 'CV-2026-0087-MX', new Date('2026-11-07T09:15:00-06:00'))
    await cobrar(store, 'CV-2026-0088-MX', new Date('2026-11-06T18:00:00-06:00'))

    expect(cobrosDelDia(store, '2026-11-07')).toHaveLength(1)
    expect(sincronizarTodo(store)).toBe(2)
    expect(store.cobros.every((c) => c.synced)).toBe(true)
  })
})
