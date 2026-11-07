import type { Voucher } from '@careledger/domain'
import { firmarVale } from './firma'

function diasA(ahora: Date, dias: number): string {
  const d = new Date(ahora)
  d.setDate(d.getDate() + dias)
  return d.toISOString()
}

/**
 * Vales de demostración del prototipo. Se firman con la función real:
 * nada de firmas fijas. `hoy` fija la base de fechas para tests
 * determinísticos; la UI pasa la fecha actual.
 */
export function valesFixture(hoy = new Date()): Voucher[] {
  const activo: Voucher = firmarVale({
    folio: 'CV-2026-0087-MX',
    benefitId: 'despensa-basica',
    caregiverId: 'cuid-101',
    issuedAt: diasA(hoy, -5),
    validUntil: diasA(hoy, 25),
    status: 'activo',
    manualCode: '48291377',
  })

  const vencido: Voucher = firmarVale({
    folio: 'CV-2026-0031-MX',
    benefitId: 'pan-cafe',
    caregiverId: 'cuid-102',
    issuedAt: diasA(hoy, -32),
    validUntil: diasA(hoy, -1),
    status: 'activo',
    manualCode: '77541029',
  })

  const usado: Voucher = firmarVale({
    folio: 'CV-2026-0042-MX',
    benefitId: 'medicamentos',
    caregiverId: 'cuid-103',
    issuedAt: diasA(hoy, -8),
    validUntil: diasA(hoy, 22),
    status: 'usado',
    manualCode: '99120745',
  })

  const firmaAlterada: Voucher = firmarVale({
    folio: 'CV-2026-0099-MX',
    benefitId: 'despensa-basica',
    caregiverId: 'cuid-104',
    issuedAt: diasA(hoy, -3),
    validUntil: diasA(hoy, 27),
    status: 'activo',
    manualCode: '33015682',
  })
  firmaAlterada.ledgerSignature = '00'.repeat(32)

  return [activo, vencido, usado, firmaAlterada]
}

/** Contenido del QR tal como lo muestra la app de la cuidadora. */
export function qrDeVale(vale: Voucher): string {
  return JSON.stringify(vale)
}

/** Directorio local de vales por folio: emula el cache offline del ledger. */
export function ledgerLocal(vouchers: Voucher[]): Map<string, Voucher> {
  return new Map(vouchers.map((v) => [v.folio, v]))
}
