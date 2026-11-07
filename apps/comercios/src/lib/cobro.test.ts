import { describe, expect, it } from 'vitest'
import { emptyStore } from './store'
import { cobrarVale, colaSync, marcarSincronizado } from './cobro'
import { valesFixture } from './fixtures'
import { decodificarQr, type QrDecodificado } from './qr'
import { verificarVale } from './vale'
import { verificarFirma, calcularFirma } from './firma'

const HOY = new Date('2026-11-07T12:00:00-06:00')

describe('verificarVale (firma y vigencia offline)', () => {
  const [activo, vencido, usado, alterado] = valesFixture(HOY)

  it('acepta un vale activo con firma válida', () => {
    expect(verificarVale(activo!, HOY)).toEqual({ ok: true })
  })

  it('rechaza firma alterada aunque la vigencia sea correcta', () => {
    expect(verificarVale(alterado!, HOY)).toEqual({ ok: false, reason: 'firma_invalida' })
  })

  it('rechaza vales vencidos', () => {
    expect(verificarVale(vencido!, HOY)).toEqual({ ok: false, reason: 'vencido' })
  })

  it('rechaza vales ya usados en el ledger', () => {
    expect(verificarVale(usado!, HOY)).toEqual({ ok: false, reason: 'usado' })
  })

  it('la firma cambia si cambia cualquier campo canónico', () => {
    const copia = { ...activo! }
    expect(calcularFirma(copia)).toBe(calcularFirma(activo!))
    copia.manualCode = '99999999'
    expect(verificarFirma(copia)).toBe(false)
  })
})

describe('decodificarQr', () => {
  const [activo] = valesFixture(HOY)

  it('decodifica folio plano', () => {
    expect(decodificarQr('CV-2026-0087-MX')).toEqual({ folio: 'CV-2026-0087-MX' })
  })

  it('decodifica folio con prefijo careledger://vale/', () => {
    expect(decodificarQr('careledger://vale/CV-2026-0087-MX')).toEqual({
      folio: 'CV-2026-0087-MX',
    })
  })

  it('decodifica JSON con folio y código manual', () => {
    const resultado = decodificarQr('{"folio":"CV-2026-0087-MX","manualCode":"48291377"}')
    expect(resultado).toEqual({ folio: 'CV-2026-0087-MX', manualCode: '48291377' })
  })

  it('decodifica el vale completo embebido en el QR', () => {
    const resultado = decodificarQr(JSON.stringify(activo)) as QrDecodificado
    expect(resultado?.voucher).toEqual(activo)
    expect(resultado?.folio).toBe('CV-2026-0087-MX')
  })

  it('rechaza basura y folios malformados', () => {
    expect(decodificarQr('')).toBeNull()
    expect(decodificarQr('hola')).toBeNull()
    expect(decodificarQr('CV-26-87-MX')).toBeNull()
    expect(decodificarQr('{"foo":1}')).toBeNull()
  })
})

describe('cobrarVale (idempotencia REQ-COM-003 y conversión REQ-COM-007)', () => {
  const [activo] = valesFixture(HOY)

  it('cobra un vale y registra 10 pts = $100 MXN', () => {
    const store = emptyStore()
    const resultado = cobrarVale(store, { voucher: activo!, now: HOY })

    expect(resultado.ok).toBe(true)
    if (!resultado.ok) return
    expect(resultado.points).toBe(10)
    expect(resultado.mxn).toBe(100)
    expect(resultado.cobro.synced).toBe(false)
    expect(store.cobros).toHaveLength(1)
  })

  it('rechaza el mismo folio dos veces con motivo claro', () => {
    const store = emptyStore()
    const primero = cobrarVale(store, { voucher: activo!, now: HOY })
    const segundo = cobrarVale(store, { voucher: activo!, now: HOY })

    expect(primero.ok).toBe(true)
    expect(segundo).toEqual({ ok: false, reason: 'ya_cobrado', folio: 'CV-2026-0087-MX' })
    expect(store.cobros).toHaveLength(1)
  })

  it('rechaza un vale con código manual equivocado', () => {
    const store = emptyStore()
    const resultado = cobrarVale(store, {
      voucher: activo!,
      manualCode: '00000000',
      now: HOY,
    })

    expect(resultado).toEqual({ ok: false, reason: 'codigo_manual_invalido', folio: 'CV-2026-0087-MX' })
    expect(store.cobros).toHaveLength(0)
  })

  it('la cola de sync lleva los cobros sin confirmar y se vacía al sincronizar', () => {
    const store = emptyStore()
    cobrarVale(store, { voucher: activo!, now: HOY })

    expect(colaSync(store)).toHaveLength(1)
    marcarSincronizado(store, 'CV-2026-0087-MX')
    expect(colaSync(store)).toHaveLength(0)
    expect(store.cobros[0]!.synced).toBe(true)
  })

  it('un vale con firma alterada nunca entra al store', () => {
    const [activo, , , alterado] = valesFixture(HOY)
    const store = emptyStore()
    const resultado = cobrarVale(store, { voucher: alterado!, now: HOY })

    expect(resultado).toEqual({ ok: false, reason: 'firma_invalida', folio: 'CV-2026-0099-MX' })
    expect(store.cobros).toHaveLength(0)
    expect(activo).toBeDefined()
  })
})
