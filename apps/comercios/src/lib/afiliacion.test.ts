import { describe, expect, it } from 'vitest'
import { emptyStore } from './store'
import { registrarComercio, placaFolio } from './afiliacion'

const FECHA = new Date('2026-11-07T10:00:00-06:00')

const DATOS_VALIDOS = {
  clabe: '012345678901234568',
  idOficialName: 'ine-frontal.jpg',
  domicilioName: 'recibo-cfe.pdf',
}

describe('registrarComercio', () => {
  it('afilia en una sola operación con los 3 campos (REQ-COM-001)', () => {
    const store = emptyStore()
    const resultado = registrarComercio(store, DATOS_VALIDOS, FECHA)

    expect(resultado.ok).toBe(true)
    if (!resultado.ok) return
    expect(resultado.comercio.estado).toBe('afiliado')
    expect(resultado.comercio.clabe).toBe('012345678901234568')
    expect(resultado.comercio.placaFolio).toBe('CS-2026-0001-MX')
    expect(store.comercio).toBe(resultado.comercio)
  })

  it('rechaza CLABE inválida y no muta el store', () => {
    const store = emptyStore()
    const resultado = registrarComercio(store, { ...DATOS_VALIDOS, clabe: '123' }, FECHA)

    expect(resultado).toEqual({ ok: false, reason: 'clabe_invalida' })
    expect(store.comercio).toBeNull()
  })

  it('rechaza documentos faltantes', () => {
    const store = emptyStore()
    const resultado = registrarComercio(
      store,
      { ...DATOS_VALIDOS, idOficialName: '  ' },
      FECHA,
    )

    expect(resultado).toEqual({ ok: false, reason: 'documentos_faltantes' })
    expect(store.comercio).toBeNull()
  })

  it('solo guarda el nombre del archivo, nunca el contenido', () => {
    const store = emptyStore()
    const resultado = registrarComercio(store, DATOS_VALIDOS, FECHA)

    expect(resultado.ok).toBe(true)
    if (!resultado.ok) return
    expect(resultado.comercio.idOficialName).toBe('ine-frontal.jpg')
  })
})

describe('placaFolio', () => {
  it('emite folios CS-AAAA-NNNN-MX', () => {
    expect(placaFolio(2026, 1)).toBe('CS-2026-0001-MX')
    expect(placaFolio(2026, 87)).toBe('CS-2026-0087-MX')
  })
})
