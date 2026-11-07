import type { AttestationView, CertificateView } from './app'
import type { StoredVoucher } from './db'
import { pointsToMxn } from '@careledger/domain'
import { formatCode, formatDuration, formatWhen } from './format'
import { pdfIncludes, simplePdf } from './pdf'

export { pdfIncludes }

/**
 * Contrato del QR de vale (v1, espejo del terminal de comercios):
 * {folio, benefitId, points, mxn, issuedAt, validUntil, code, sig}.
 * `sig` es Ed25519 (WebCrypto) sobre el payload canónico
 * stableStringify({benefitId, costPoints, folio, issuedAt, validUntil}),
 * sin caregiverId: lo único que sale del dispositivo es lo necesario
 * para el cobro (REQ-PWA-011).
 */
export function voucherQrText(
  voucher: Pick<
    StoredVoucher,
    'folio' | 'benefitId' | 'costPoints' | 'issuedAt' | 'validUntil' | 'manualCode' | 'qrSignature'
  >,
): string {
  return JSON.stringify({
    folio: voucher.folio,
    benefitId: voucher.benefitId,
    points: voucher.costPoints,
    mxn: pointsToMxn(voucher.costPoints),
    issuedAt: voucher.issuedAt,
    validUntil: voucher.validUntil,
    code: voucher.manualCode,
    sig: voucher.qrSignature,
  })
}

export function certificateQrText(cert: Pick<CertificateView, 'folio' | 'courseId' | 'issuedAt' | 'payloadHash'>): string {
  return JSON.stringify({
    folio: cert.folio,
    courseId: cert.courseId,
    issuedAt: cert.issuedAt,
    hash: cert.payloadHash,
  })
}

export function receiptPdf(view: AttestationView, nodeName: string): Uint8Array {
  const lines = [
    'Cuando cuidas, te descuidas',
    'Comprobante civico',
    `Folio: ${view.folio ?? 'pendiente'}`,
    `Puntos Civicos: ${view.points ?? 0}`,
    view.socialValueUsd !== null ? `Ahorro estimado al sistema de salud: ${view.socialValueUsd} USD` : 'Autocuidado',
    `Sello: ${formatWhen(view.occurredAt, 'es')}`,
    `Nodo: ${nodeName}`,
    `Duracion: ${formatDuration(view.minutes)}`,
    `Huella: ${view.canonicalHash}`,
    'Firmas: 3 de 3',
    'Sin nombres de pacientes ni datos medicos.',
  ]
  return simplePdf(lines)
}

export function certificatePdf(cert: CertificateView): Uint8Array {
  return simplePdf([
    'Cuando cuidas, te descuidas',
    'Certificado de formacion',
    cert.courseName,
    `Folio: ${cert.folio}`,
    `Fecha: ${formatWhen(cert.issuedAt, 'es')}`,
    `Huella: ${cert.payloadHash}`,
    `Puntos Civicos: ${cert.points}`,
    'Aval de finalizacion dentro de la plataforma.',
  ])
}

export function voucherPdf(voucher: StoredVoucher, issuer: string): Uint8Array {
  return simplePdf([
    'Cuando cuidas, te descuidas',
    'Vale civico',
    voucher.benefitName,
    `Folio: ${voucher.folio}`,
    `Codigo: ${formatCode(voucher.manualCode)}`,
    `Puntos: ${voucher.costPoints}`,
    `Vigente hasta: ${formatWhen(voucher.validUntil, 'es')}`,
    `Emisor: ${issuer}`,
    `Huella: ${voucher.payloadHash}`,
  ])
}
