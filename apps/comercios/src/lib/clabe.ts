/** CLABE bancaria mexicana: 18 dígitos con dígito verificador módulo 10.
 *  Peso 3-7-1 repetido sobre los primeros 17 dígitos. */

const CLABE_RE = /^\d{18}$/

/** Peso i-ésimo (0..16) según la regla 3-7-1. */
function peso(i: number): number {
  return [3, 7, 1][i % 3]!
}

/** Dígito verificador para los primeros 17 dígitos de una CLABE. */
export function clabeDigitoVerificador(primeros17: string): number {
  if (!/^\d{17}$/.test(primeros17)) throw new Error('se requieren 17 dígitos')
  let suma = 0
  for (let i = 0; i < 17; i++) {
    suma += Number(primeros17[i]) * peso(i)
  }
  return (10 - (suma % 10)) % 10
}

/** true si es una CLABE de 18 dígitos con dígito verificador correcto. */
export function clabeValida(clabe: string): boolean {
  const limpia = clabe.trim()
  if (!CLABE_RE.test(limpia)) return false
  const esperado = clabeDigitoVerificador(limpia.slice(0, 17))
  return Number(limpia[17]) === esperado
}

/** CLABE para mostrar: solo los últimos 4 dígitos. */
export function clabeEnmascarada(clabe: string): string {
  return `•••• ${clabe.slice(-4)}`
}
