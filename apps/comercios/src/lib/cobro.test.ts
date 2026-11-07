import { describe, expect, it } from 'vitest'
import { emptyStore } from './store'
import { cobrarVale, colaSync, marcarSincronizado } from './cobro'
import { valesFixture } from './fixtures'
import { decodificarQr, type QrDecodificado } from './qr'
import { verificarVale } from './vale'
import { verificarFirma, calcularFirma, stableStringify } from './firma'
import { QR_VALE_PWA_ACTIVO, QR_VALE_PWA_FUTURO, QR_VALE_PWA_VENCIDO } from './valePwa.fixture'

const HOY = new Date('2026-11-07T12:00:00-06:00')

describe('verificarVale (firma y vigencia offline)', () => {
  const [activo, vencido, usado, alterado] = valesFixture(HOY)

  it('acepta un vale activo con firma válida', async () => {
    expect(await verificarVale(activo!, HOY)).toEqual({ ok: true })
  })

  it('rechaza firma alterada aunque la vigencia sea correcta', async () => {
    expect(await verificarVale(alterado!, HOY)).toEqual({ ok: false, reason: 'firma_invalida' })
  })

  it('rechaza vales vencidos', async () => {
    expect(await verificarVale(vencido!, HOY)).toEqual({ ok: false, reason: 'vencido' })
  })

  it('rechaza vales ya usados en el ledger', async () => {
    expect(await verificarVale(usado!, HOY)).toEqual({ ok: false, reason: 'usado' })
  })

  it('la firma cambia si cambia cualquier campo canónico', () => {
    const copia = { ...activo! }
    expect(calcularFirma(copia)).toBe(calcularFirma(activo!))
    copia.manualCode = '99999999'
    expect(verificarFirma(copia)).toBe(false)
  })

  it('stableStringify ordena claves y arrays como la PWA', () => {
    expect(stableStringify({ b: 1, a: [2, 1] })).toBe('{"a":[1,2],"b":1}')
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

  it('decodifica el vale completo embebido en el QR (esquema hmac-dev)', () => {
    const resultado = decodificarQr(JSON.stringify(activo)) as QrDecodificado
    expect(resultado?.voucher).toEqual(activo)
    expect(resultado?.folio).toBe('CV-2026-0087-MX')
  })

  it('decodifica el vale compacto firmado de la PWA (esquema ed25519)', () => {
    const resultado = decodificarQr(QR_VALE_PWA_ACTIVO)
    expect(resultado?.folio).toBe('CV-2026-0142-MX')
    expect(resultado?.manualCode).toBe('829990551036')
    expect(resultado?.compacto).toMatchObject({ benefitId: 'cfe-30', points: 50, mxn: 500 })
    expect(resultado?.voucher).toMatchObject({
      folio: 'CV-2026-0142-MX',
      benefitId: 'cfe-30',
      status: 'activo',
    })
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

  it('cobra un vale y registra 10 pts = $100 MXN', async () => {
    const store = emptyStore()
    const resultado = await cobrarVale(store, { voucher: activo!, now: HOY })

    expect(resultado.ok).toBe(true)
    if (!resultado.ok) return
    expect(resultado.points).toBe(10)
    expect(resultado.mxn).toBe(100)
    expect(resultado.cobro.synced).toBe(false)
    expect(store.cobros).toHaveLength(1)
  })

  it('rechaza el mismo folio dos veces con motivo claro', async () => {
    const store = emptyStore()
    const primero = await cobrarVale(store, { voucher: activo!, now: HOY })
    const segundo = await cobrarVale(store, { voucher: activo!, now: HOY })

    expect(primero.ok).toBe(true)
    expect(segundo).toEqual({ ok: false, reason: 'ya_cobrado', folio: 'CV-2026-0087-MX' })
    expect(store.cobros).toHaveLength(1)
  })

  it('rechaza un vale con código manual equivocado', async () => {
    const store = emptyStore()
    const resultado = await cobrarVale(store, {
      voucher: activo!,
      manualCode: '00000000',
      now: HOY,
    })

    expect(resultado).toEqual({ ok: false, reason: 'codigo_manual_invalido', folio: 'CV-2026-0087-MX' })
    expect(store.cobros).toHaveLength(0)
  })

  it('la cola de sync lleva los cobros sin confirmar y se vacía al sincronizar', async () => {
    const store = emptyStore()
    await cobrarVale(store, { voucher: activo!, now: HOY })

    expect(colaSync(store)).toHaveLength(1)
    marcarSincronizado(store, 'CV-2026-0087-MX')
    expect(colaSync(store)).toHaveLength(0)
    expect(store.cobros[0]!.synced).toBe(true)
  })

  it('un vale con firma alterada nunca entra al store', async () => {
    const [, , , alterado] = valesFixture(HOY)
    const store = emptyStore()
    const resultado = await cobrarVale(store, { voucher: alterado!, now: HOY })

    expect(resultado).toEqual({ ok: false, reason: 'firma_invalida', folio: 'CV-2026-0099-MX' })
    expect(store.cobros).toHaveLength(0)
  })
})

describe('vale QR de la PWA (ed25519, contrato v1)', () => {
  function decodificar(qr: string): {
    voucher: NonNullable<QrDecodificado['voucher']>
    compacto: NonNullable<QrDecodificado['compacto']>
  } {
    const deco = decodificarQr(qr)
    if (!deco?.voucher || !deco.compacto) throw new Error('QR no decodificó a vale compacto')
    return { voucher: deco.voucher, compacto: deco.compacto }
  }

  it('el vale firmado por la PWA se cobra: 50 pts = $500', async () => {
    const store = emptyStore()
    const deco = decodificar(QR_VALE_PWA_ACTIVO)
    const resultado = await cobrarVale(store, {
      voucher: deco.voucher,
      compacto: deco.compacto,
      now: HOY,
    })

    expect(resultado.ok).toBe(true)
    if (!resultado.ok) return
    expect(resultado.points).toBe(50)
    expect(resultado.mxn).toBe(500)
    expect(resultado.cobro.benefitId).toBe('cfe-30')
    expect(store.cobros).toHaveLength(1)
  })

  it('rechaza el doble cobro del mismo folio emitido por la PWA', async () => {
    const store = emptyStore()
    const deco = decodificar(QR_VALE_PWA_ACTIVO)
    const primero = await cobrarVale(store, { voucher: deco.voucher, compacto: deco.compacto, now: HOY })
    const segundo = await cobrarVale(store, { voucher: deco.voucher, compacto: deco.compacto, now: HOY })

    expect(primero.ok).toBe(true)
    expect(segundo).toEqual({ ok: false, reason: 'ya_cobrado', folio: 'CV-2026-0142-MX' })
  })

  it('rechaza un monto alterado aunque la firma parezca intacta', async () => {
    const alterado = JSON.parse(QR_VALE_PWA_ACTIVO) as Record<string, unknown>
    alterado.mxn = 999
    const deco = decodificar(JSON.stringify(alterado))
    const resultado = await cobrarVale(emptyStore(), {
      voucher: deco.voucher,
      compacto: deco.compacto,
      now: HOY,
    })

    expect(resultado).toEqual({ ok: false, reason: 'firma_invalida', folio: 'CV-2026-0142-MX' })
  })

  it('rechaza un folio alterado', async () => {
    const alterado = JSON.parse(QR_VALE_PWA_ACTIVO) as Record<string, unknown>
    alterado.folio = 'CV-2026-0999-MX'
    const deco = decodificar(JSON.stringify(alterado))
    const resultado = await cobrarVale(emptyStore(), {
      voucher: deco.voucher,
      compacto: deco.compacto,
      now: HOY,
    })

    expect(resultado).toEqual({ ok: false, reason: 'firma_invalida', folio: 'CV-2026-0999-MX' })
  })

  it('rechaza puntos alterados', async () => {
    const alterado = JSON.parse(QR_VALE_PWA_ACTIVO) as Record<string, unknown>
    alterado.points = 5
    const deco = decodificar(JSON.stringify(alterado))
    const resultado = await cobrarVale(emptyStore(), {
      voucher: deco.voucher,
      compacto: deco.compacto,
      now: HOY,
    })

    expect(resultado).toEqual({ ok: false, reason: 'firma_invalida', folio: 'CV-2026-0142-MX' })
  })

  it('rechaza una firma corrompida', async () => {
    const alterado = JSON.parse(QR_VALE_PWA_ACTIVO) as Record<string, unknown>
    alterado.sig = 'A'.repeat(86)
    const deco = decodificar(JSON.stringify(alterado))
    const resultado = await cobrarVale(emptyStore(), {
      voucher: deco.voucher,
      compacto: deco.compacto,
      now: HOY,
    })

    expect(resultado).toEqual({ ok: false, reason: 'firma_invalida', folio: 'CV-2026-0142-MX' })
  })

  it('rechaza un vale vencido emitido por la PWA', async () => {
    const deco = decodificar(QR_VALE_PWA_VENCIDO)
    const resultado = await cobrarVale(emptyStore(), {
      voucher: deco.voucher,
      compacto: deco.compacto,
      now: HOY,
    })

    expect(resultado).toEqual({ ok: false, reason: 'vale_vencido', folio: 'CV-2026-0007-MX' })
  })

  it('rechaza un vale aún no vigente emitido por la PWA', async () => {
    const deco = decodificar(QR_VALE_PWA_FUTURO)
    const resultado = await cobrarVale(emptyStore(), {
      voucher: deco.voucher,
      compacto: deco.compacto,
      now: HOY,
    })

    expect(resultado).toEqual({ ok: false, reason: 'vale_aun_no_vigente', folio: 'CV-2026-0150-MX' })
  })
})
