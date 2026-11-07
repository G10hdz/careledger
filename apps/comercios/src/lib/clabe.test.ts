import { describe, expect, it } from 'vitest'
import {
  clabeDigitoVerificador,
  clabeEnmascarada,
  clabeValida,
} from './clabe'

describe('clabeValida', () => {
  it('valida la CLABE de prueba 012345678901234568 (dígito verificador 8)', () => {
    expect(clabeDigitoVerificador('01234567890123456')).toBe(8)
    expect(clabeValida('012345678901234568')).toBe(true)
  })

  it('rechaza un dígito verificador equivocado', () => {
    expect(clabeValida('012345678901234569')).toBe(false)
  })

  it('rechaza largos distintos de 18', () => {
    expect(clabeValida('01234567890123456')).toBe(false)
    expect(clabeValida('0123456789012345680')).toBe(false)
  })

  it('rechaza contenido no numérico', () => {
    expect(clabeValida('01234567890123456A')).toBe(false)
  })

  it('acepta espacios alrededor', () => {
    expect(clabeValida(' 012345678901234568 ')).toBe(true)
  })

  it('enmascara dejando solo los últimos 4 dígitos', () => {
    expect(clabeEnmascarada('012345678901234568')).toBe('•••• 4568')
  })
})
