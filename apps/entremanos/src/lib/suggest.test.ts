import { MockLanguageModelV4 } from 'ai/test'
import { describe, expect, it } from 'vitest'
import { normalizePedido, normalizeServicio, parseSuggestRequest, suggest } from './suggest'

const catalog = [
  { id: 'demo-cita', title: 'Acompañar a cita médica', kind: 'cuidado' as const, minLevel: 'N0' as const },
  { id: 'demo-corte', title: 'Corte de cabello', kind: 'oficio' as const, minLevel: 'N0' as const },
]

function model(json: unknown) {
  return new MockLanguageModelV4({
    doGenerate: async () => ({
      content: [{ type: 'text', text: JSON.stringify(json) }],
      finishReason: { unified: 'stop', raw: undefined },
      usage: {
        inputTokens: { total: 1, noCache: 1, cacheRead: undefined, cacheWrite: undefined },
        outputTokens: { total: 1, text: 1, reasoning: undefined },
      },
      warnings: [],
    }),
  })
}

describe('normalizePedido', () => {
  it('descarta un servicio que no está en el catálogo', () => {
    expect(normalizePedido({ serviceId: 'inventado', hours: 2 }, catalog).serviceId).toBeNull()
  })

  it('ajusta las horas a bloques de 15 min', () => {
    expect(normalizePedido({ serviceId: 'demo-cita', hours: 1.3 }, catalog).hours).toBe(1.25)
  })

  it.each([0.25, 9, Number.NaN])('descarta horas fuera de 0.5 a 8: %s', (hours) => {
    expect(normalizePedido({ serviceId: 'demo-cita', hours }, catalog).hours).toBeNull()
  })
})

describe('normalizeServicio', () => {
  it('recorta el título a 80 caracteres', () => {
    expect(normalizeServicio({ title: 'a'.repeat(120), kind: 'cuidado', minLevel: 'N1' })?.title).toHaveLength(80)
  })

  it('devuelve null sin título', () => {
    expect(normalizeServicio({ title: '  ', kind: 'oficio', minLevel: 'N0' })).toBeNull()
  })
})

describe('parseSuggestRequest', () => {
  it('rechaza texto de más de 280 caracteres', () => {
    expect(parseSuggestRequest({ mode: 'servicio', text: 'a'.repeat(281) })).toBeNull()
  })

  it('rechaza un modo desconocido', () => {
    expect(parseSuggestRequest({ mode: 'otro', text: 'hola' })).toBeNull()
  })

  it('acepta un pedido con catálogo', () => {
    expect(parseSuggestRequest({ mode: 'pedido', text: 'cita del IMSS', catalog })).not.toBeNull()
  })
})

describe('suggest', () => {
  it('propone servicio y horas del catálogo', async () => {
    const result = await suggest({ mode: 'pedido', text: 'llevar a mi papá al IMSS 2 horas', catalog }, model({ serviceId: 'demo-cita', hours: 2 }))
    expect(result).toEqual({ mode: 'pedido', serviceId: 'demo-cita', hours: 2 })
  })

  it('no deja pasar un id inventado por el modelo', async () => {
    const result = await suggest({ mode: 'pedido', text: 'algo', catalog }, model({ serviceId: 'x', hours: 2 }))
    expect(result).toEqual({ mode: 'pedido', serviceId: null, hours: 2 })
  })

  it('sugiere tipo y nivel de un servicio', async () => {
    const result = await suggest({ mode: 'servicio', text: 'soy enfermera, pongo inyecciones' }, model({ title: 'Aplicar inyecciones', kind: 'cuidado', minLevel: 'N2' }))
    expect(result).toEqual({ mode: 'servicio', title: 'Aplicar inyecciones', kind: 'cuidado', minLevel: 'N2' })
  })
})
