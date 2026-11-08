import { describe, expect, it } from 'vitest'
import type { ComercioStore } from './types'
import { cobrarVale, marcarSincronizado } from './cobro'
import { b64UrlToBytes, firmarVale } from './firma'
import { folioValido, normalizarFolio, parseFolio } from './folio'
import { clabeDigitoVerificador, clabeEnmascarada, clabeValida } from './clabe'
import { dateKey, liquidarDia } from './liquidacion'
import { decodificarQr } from './qr'
import { emptyStore, parseStore } from './store'
import { verificarVale } from './vale'
import { valesFixture } from './fixtures'
import { QR_VALE_PWA_ACTIVO } from './valePwa.fixture'

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

describe('verificarVale: la vigencia es inclusiva en los bordes', () => {
  const [activo] = valesFixture(HOY)
  const borde = firmarVale({
    ...activo!,
    issuedAt: '2026-11-06T12:00:00.000Z',
    validUntil: '2026-11-07T12:00:00.000Z',
  })

  it('exactamente en validUntil aún cobra; un ms después ya no', async () => {
    const justo = new Date('2026-11-07T12:00:00.000Z')
    const tarde = new Date(justo.getTime() + 1)
    expect(await verificarVale(borde, justo)).toEqual({ ok: true })
    expect(await verificarVale(borde, tarde)).toEqual({ ok: false, reason: 'vencido' })
  })

  it('exactamente en issuedAt cobra; un ms antes no', async () => {
    const justo = new Date('2026-11-06T12:00:00.000Z')
    const temprano = new Date(justo.getTime() - 1)
    expect(await verificarVale(borde, justo)).toEqual({ ok: true })
    expect(await verificarVale(borde, temprano)).toEqual({ ok: false, reason: 'aun_no_vigente' })
  })
})

describe('cobrarVale: rechazos que la firma no ve', () => {
  it('un beneficio que no está en el catálogo se rechaza aunque la firma sea válida', async () => {
    const [activo] = valesFixture(HOY)
    const desconocido = firmarVale({ ...activo!, benefitId: 'beneficio-que-no-existe' })
    const resultado = await cobrarVale(emptyStore(), { voucher: desconocido, now: HOY })

    expect(resultado).toEqual({ ok: false, reason: 'beneficio_desconocido', folio: 'CV-2026-0087-MX' })
  })

  it('el mismo folio con distinta capitalización es el mismo cobro (idempotencia)', async () => {
    const [activo] = valesFixture(HOY)
    const minusculas = firmarVale({ ...activo!, folio: 'cv-2026-0087-mx' })
    const store = emptyStore()

    expect((await cobrarVale(store, { voucher: activo!, now: HOY })).ok).toBe(true)
    expect(await cobrarVale(store, { voucher: minusculas, now: HOY })).toEqual({
      ok: false,
      reason: 'ya_cobrado',
      folio: 'CV-2026-0087-MX',
    })
  })

  it('un código manual vacío explícito cuenta como código incorrecto', async () => {
    const [activo] = valesFixture(HOY)
    const resultado = await cobrarVale(emptyStore(), {
      voucher: activo!,
      manualCode: '',
      now: HOY,
    })

    expect(resultado).toEqual({ ok: false, reason: 'codigo_manual_invalido', folio: 'CV-2026-0087-MX' })
  })
})

describe('vale compacto ed25519: bordes de campos', () => {
  function compacto(mutar: (c: Record<string, unknown>) => void = () => {}) {
    const c = JSON.parse(QR_VALE_PWA_ACTIVO) as Record<string, unknown>
    mutar(c)
    const deco = decodificarQr(JSON.stringify(c))
    return deco
  }

  it('rechaza puntos no enteros, cero o negativos antes de mirar la firma', async () => {
    for (const points of [50.5, 0, -3]) {
      const deco = compacto((c) => {
        c.points = points
      })
      if (!deco?.voucher || !deco.compacto) throw new Error('no decodificó')
      const resultado = await cobrarVale(emptyStore(), {
        voucher: deco.voucher,
        compacto: deco.compacto,
        now: HOY,
      })
      expect(resultado).toEqual({ ok: false, reason: 'firma_invalida', folio: 'CV-2026-0142-MX' })
    }
  })

  it('el código manual no va firmado: quitarlo no rompe el vale pero bloquea el cobro manual', async () => {
    const deco = compacto((c) => {
      delete c.code
    })
    if (!deco?.voucher || !deco.compacto) throw new Error('no decodificó')

    const sinCodigo = await cobrarVale(emptyStore(), {
      voucher: deco.voucher,
      compacto: deco.compacto,
      now: HOY,
    })
    expect(sinCodigo.ok).toBe(true)

    const conCodigo = await cobrarVale(emptyStore(), {
      voucher: deco.voucher,
      compacto: deco.compacto,
      manualCode: '829990551036',
      now: HOY,
    })
    expect(conCodigo).toEqual({ ok: false, reason: 'codigo_manual_invalido', folio: 'CV-2026-0142-MX' })
  })

  it('una firma de 85 caracteres no alcanza el formato ed25519', async () => {
    const deco = compacto((c) => {
      c.sig = 'A'.repeat(85)
    })
    if (!deco?.voucher || !deco.compacto) throw new Error('no decodificó')
    const resultado = await cobrarVale(emptyStore(), {
      voucher: deco.voucher,
      compacto: deco.compacto,
      now: HOY,
    })
    expect(resultado).toEqual({ ok: false, reason: 'firma_invalida', folio: 'CV-2026-0142-MX' })
  })

  it('un compacto sin sig degrada a solo folio (captura manual), no truena el escáner', () => {
    const deco = compacto((c) => {
      delete c.sig
    })
    expect(deco).toEqual({ folio: 'CV-2026-0142-MX' })
  })
})

describe('decodificarQr: bordes de entrada', () => {
  it('folio en texto plano se normaliza a mayúsculas', () => {
    expect(decodificarQr('  cv-2026-0087-mx ')).toEqual({ folio: 'CV-2026-0087-MX' })
    expect(decodificarQr('careledger://vale/ cv-2026-0087-mx ')).toEqual({ folio: 'CV-2026-0087-MX' })
  })

  it('folio dentro de JSON conserva su capitalización original', () => {
    // Quirk: el camino JSON no pasa por normalizarFolio; cobrarVale sí normaliza.
    expect(decodificarQr('{"folio":"cv-2026-0087-mx"}')).toEqual({ folio: 'cv-2026-0087-mx' })
  })

  it('prefijo sin folio, arreglos JSON y nulos no truenan el decodificador', () => {
    expect(decodificarQr('careledger://vale/')).toBeNull()
    expect(decodificarQr('careledger://vale')).toBeNull()
    expect(decodificarQr('[1,2,3]')).toBeNull()
    expect(decodificarQr('null')).toBeNull()
    expect(decodificarQr('{"folio":123}')).toBeNull()
  })
})

describe('folio: parseo y límites conocidos', () => {
  it('extrae año y secuencia con ceros a la izquierda', () => {
    expect(parseFolio('CV-2026-0042-MX')).toEqual({ year: 2026, seq: 42 })
    expect(parseFolio('cv-2026-0042-mx')).toEqual({ year: 2026, seq: 42 })
  })

  it('la secuencia de 5 dígitos ya no es folio de vale (dominio emite CV-2026-10000-MX)', () => {
    expect(folioValido('CV-2026-10000-MX')).toBe(false)
    expect(parseFolio('CV-2026-10000-MX')).toBeNull()
  })

  it('los folios de placa de comercio no son vales', () => {
    expect(folioValido('CS-2026-0001-MX')).toBe(false)
    expect(parseFolio('CS-2026-0001-MX')).toBeNull()
  })

  it('normalizarFolio recorta y sube a mayúsculas', () => {
    expect(normalizarFolio('  cv-2026-0001-mx\n')).toBe('CV-2026-0001-MX')
  })
})

describe('CLABE: entradas degeneradas', () => {
  it('el dígito verificador exige 17 dígitos', () => {
    expect(() => clabeDigitoVerificador('123')).toThrow()
    expect(() => clabeDigitoVerificador('')).toThrow()
  })

  it('vacío y puros espacios no son CLABE', () => {
    expect(clabeValida('')).toBe(false)
    expect(clabeValida('                  ')).toBe(false)
  })

  it('enmascarada no valida: recorta lo que sea que le den', () => {
    expect(clabeEnmascarada('xyz')).toBe('•••• xyz')
  })
})

describe('store: tolerancia a datos corruptos', () => {
  it('entradas no objeto regresan store vacío', () => {
    for (const raw of ['basura', 42, null, undefined, [], '']) {
      expect(parseStore(raw)).toEqual({ comercio: null, cobros: [], liquidaciones: [] })
    }
  })

  it('secciones malformadas caen a sus defaults sin tirar el resto', () => {
    expect(parseStore({ comercio: { nombre: 'x' }, cobros: 'no', liquidaciones: 5 })).toEqual({
      comercio: null,
      cobros: [],
      liquidaciones: [],
    })
    const comercioValido = storeConComercio().comercio!
    expect(parseStore({ comercio: comercioValido, cobros: [{ folio: 'x' }] }).comercio).toEqual(comercioValido)
  })
})

describe('liquidación: bordes de día y de sync', () => {
  it('el día de negocio es CDMX: 23:59 UTC del 8 todavía es día 7', () => {
    expect(dateKey('2026-11-08T05:59:59.000Z')).toBe('2026-11-07')
    expect(dateKey('2026-11-08T06:00:00.000Z')).toBe('2026-11-08')
  })

  it('un cobro ya sincronizado al ledger igual entra a la liquidación (son ortogonales)', async () => {
    const [activo] = valesFixture(HOY)
    const store = storeConComercio()
    const cobro = (await cobrarVale(store, { voucher: activo!, now: HOY }))
    if (!cobro.ok) throw new Error('cobro falló')
    marcarSincronizado(store, cobro.cobro.folio)

    const resultado = liquidarDia(store, HOY)
    expect(resultado.ok).toBe(true)
    if (resultado.ok) expect(resultado.liquidacion.folios).toEqual([cobro.cobro.folio])
  })

  it('el segundo batch del mismo día numera LIQ-...-2', async () => {
    const [activo] = valesFixture(HOY)
    const store = storeConComercio()
    await cobrarVale(store, { voucher: activo!, now: HOY })
    liquidarDia(store, HOY)
    const otro = firmarVale({ ...activo!, folio: 'CV-2026-0088-MX' })
    await cobrarVale(store, { voucher: otro, now: HOY })

    const segundo = liquidarDia(store, new Date(HOY.getTime() + 3600_000))
    expect(segundo.ok).toBe(true)
    if (segundo.ok) expect(segundo.liquidacion.id).toBe('LIQ-2026-11-07-2')
  })
})

describe('b64UrlToBytes (contrato con la PWA)', () => {
  it('decodifica longitudes con y sin padding implícito', () => {
    expect([...b64UrlToBytes('YQ')]).toEqual([97])
    expect([...b64UrlToBytes('YWI')]).toEqual([97, 98])
    expect([...b64UrlToBytes('YWJj')]).toEqual([97, 98, 99])
    expect([...b64UrlToBytes('aGVsbG8')]).toEqual([104, 101, 108, 108, 111])
  })
})
