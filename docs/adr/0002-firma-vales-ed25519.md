# ADR 0002 — Firma de vales: Ed25519 con payload compacto

Estado: aceptado · 2026-11-07

## Contexto

La terminal de `apps/comercios` nació verificando vales con HMAC-SHA256 y una
clave simulada embebida, mientras la PWA firmaba el `StoredVoucher` con
Ed25519 (WebCrypto) sobre un payload distinto. Además el QR de la PWA solo
transportaba `{folio, benefitId, code, validUntil}`: sin el vale completo, la
terminal no tenía qué verificar y rechazaba todo vale real como
`vale_no_encontrado`.

## Decisión

- **Contrato de QR v1** (`apps/comercios/src/lib/vale.ts`): el QR transporta
  `{folio, benefitId, points, mxn, issuedAt, validUntil, code, sig}`.
- `sig` es una firma **Ed25519** (WebCrypto, b64url sin padding) sobre el
  payload canónico `{benefitId, costPoints, folio, issuedAt, validUntil}`.
- El `caregiverId` no viaja en el QR (REQ-PWA-011, privacidad): la PWA firma
  un payload compacto aparte en `redeem()`.
- `mxn` se re-deriva en la terminal desde la paridad `pointsToMxn`; si el QR
  trae un monto alterado, la firma no cuadra y se rechaza.
- La terminal acepta **ambos esquemas**: `ed25519` (vales reales de la PWA) y
  `hmac-dev` (fixtures locales), ambos documentados en `vale.ts`.
- La verificación usa una clave pública demo embebida; el despliegue real la
  reemplaza por el llavero municipal sin cambiar la interfaz.

## Consecuencias

- Flujo cuidadora → tendero funciona de punta a punta, verificado con
  vectores firmados por el código real de la PWA (9/9 casos E2E).
- El doble cobro entre terminales distintas sigue dependiendo del sync
  (REQ-COM-003): el QR se asume `activo` hasta confirmar.
- Migrar a claves municipales reales = cambiar el fixture del llavero; el
  formato del QR y la cadena de verificación quedan igual.
