import { describe, expect, it } from 'vitest'
import { BENEFITS } from '@careledger/domain'
import { BENEFITS_TERMINAL, benefitById } from './catalogo'

/**
 * Hueco 4 de la auditoría: los benefitIds que la PWA emite en el QR y los
 * que la terminal acepta deben ser el mismo conjunto (catálogo único en
 * @careledger/domain). Si alguien agrega un beneficio solo en una app,
 * alguno de estos tests falla.
 */
describe('catálogo compartido PWA ↔ terminal', () => {
  const emitidos = new Set(BENEFITS.map((b) => b.id))
  const aceptados = new Set(BENEFITS_TERMINAL.map((b) => b.id))

  it('cada benefitId que la PWA puede emitir existe en el catálogo de la terminal', () => {
    for (const benefit of BENEFITS) {
      const enTerminal = benefitById(benefit.id)
      expect(enTerminal, `la terminal no conoce '${benefit.id}'`).toBeDefined()
      expect(enTerminal!.costPoints).toBe(benefit.costPoints)
    }
  })

  it('la terminal no acepta benefitIds que la PWA no emite', () => {
    for (const id of aceptados) {
      expect(emitidos.has(id), `la PWA no emite '${id}'`).toBe(true)
    }
  })
})
