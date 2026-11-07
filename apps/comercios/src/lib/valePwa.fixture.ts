/**
 * Vectores firmados con el CÓDIGO REAL de la PWA: apps/pwa/src/lib/
 * keys.ts (WebCrypto Ed25519) + documents.ts (voucherQrText), usando la
 * llave demo del llavero municipal (apps/pwa/fixtures/demoLedger.ts).
 *
 * Generados el 2026-11-07 con `now = 2026-11-07T12:00:00-06:00`; el
 * terminal los verifica con la parte pública embebida en firma.ts
 * (LEDGER_PUBLIC_JWK_DEMO). Ed25519 es determinista: regenerarlos con el
 * mismo código y llave produce exactamente estos bytes.
 */
export const QR_VALE_PWA_ACTIVO =
  '{"folio":"CV-2026-0142-MX","benefitId":"cfe-30","points":50,"mxn":500,"issuedAt":"2026-11-02T12:00:00.000Z","validUntil":"2026-12-02T12:00:00.000Z","code":"829990551036","sig":"tI50ub-4CmpWg8dZNz2Etzec_ABXBJ0AoYNgC_u7vcfUvwz7_kMUAuPpeweRNEsVyqbsnrHMmAgOmpcYNkasBA"}'

export const QR_VALE_PWA_VENCIDO =
  '{"folio":"CV-2026-0007-MX","benefitId":"metro-semanal","points":30,"mxn":300,"issuedAt":"2026-10-01T12:00:00.000Z","validUntil":"2026-11-01T12:00:00.000Z","code":"116265603268","sig":"UVAvsd1z5rQa-pVBF-J6f5D8UgeB4-k6_EsIb29_4Dq2LGac1BRLe7VRmMHDSpojrsS1olqc2zK1ipK5hZC8DQ"}'

export const QR_VALE_PWA_FUTURO =
  '{"folio":"CV-2026-0150-MX","benefitId":"cfe-30","points":50,"mxn":500,"issuedAt":"2026-11-08T12:00:00.000Z","validUntil":"2026-12-08T12:00:00.000Z","code":"457374680565","sig":"LfTDrx-UZSSeDQmcJr0zqDQrkahq7jd2CL6r96N7dGH0pCTTrV2O1xzHQ6JG24-qQ8RQP5z7r3ow1otlJerMDw"}'
