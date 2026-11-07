# Spike: verificación antifraude on-device (REQ-ORA-024)

Estado: investigación cerrada, sin código. Fecha: 2026-11-07.

Cierra el spike pendiente de REQ-ORA-024 y lista los gaps contra `main`
(`eb531c6`). Lo legal es orientación técnica, no opinión de abogado.

## Conclusión

La foto antes/después no se construye. Lo que prueba es que alguien estuvo en
una habitación, no que cuidó. El pHash guardado en servidor es dato personal
seudonimizado (se puede invertir), y fotografía el domicilio de un tercero que
no consintió. Falla además si cambia el ángulo.

El riesgo de fraude está en lo que el fondo emite (puntos, bono de respiro),
no en cada hora entre pares, que suma cero. La verificación se escala por
monto en juego.

## Capas propuestas

| Capa | Aplica a | Técnica | Prueba |
| --- | --- | --- | --- |
| 0 | Todas las cuentas | WebAuthn/passkeys, una clave por dispositivo | Una cuenta, un teléfono |
| 1 | Toda hora | QR rotativo entre dos PWA, firmas, sincroniza después | Ambas partes confirman inicio y fin |
| 2 | Canje de emisión del fondo | TWA (Bubblewrap) + Play Integrity | Teléfono real, app sin modificar |
| 3 | Emisión de tier 2 o 3 | Firma del veedor (3 de 3 existente) | Validación social |
| 4 | Cuidados recurrentes de monto alto | NFC o QR fijo en el domicilio | Presencia sin guardar coordenadas |
| 5 | Muestreo aleatorio o alerta | Liveness opt-in (`vladmandic/human`), imagen descartada | La dueña de la cuenta opera |

## Descartado

- pHash antes/después como prueba de acción.
- zk-SNARKs en el cliente: piden ~3 GB de RAM libre, el objetivo tiene 2 a 4 GB.
- Liveness como paso por defecto: es biometría (consentimiento expreso) y carga
  a la usuaria.
- Web Bluetooth para balizas: soporte limitado.

## Gaps contra el código

| Gap | Estado en `main` |
| --- | --- |
| Clave ligada al hardware | `keys.ts` crea Ed25519 con `extractable: true`; `app.ts:174` guarda `privateJwk` en IndexedDB. Sin WebAuthn. |
| 3 de 3 entre dispositivos | `oracle.ts` es simulado: beneficiario y veedor son llaves del mismo teléfono. |
| Integridad del dispositivo | Sin TWA ni Play Integrity. |
| Sybil | `caregiverId = crypto.randomUUID()` por instalación, sin ancla de identidad. |
| Reloj offline | `occurredAt` sale del reloj del teléfono, sin contador de la contraparte. TTL de 72 h lo acota. |
| Colusión (REQ-ORA-005) | Implementada: `needsAudit` en `app.ts` cuando una terna repite más de `COLLUSION_REPEAT_LIMIT`, con test en `flow.test.ts`. Solo detecta repetición, no proximidad imposible ni ráfagas. |
| Auditoría 5% (REQ-ORA-020) | Prometida en la FAQ de la landing; sin código. |
| Aviso de privacidad | No existe; falta ADR de datos personales. |

Cubierto: colusión por repetición (REQ-ORA-005, parcial), idempotencia por hash (REQ-ORA-023) y datos mínimos en la atestación
(`CANONICAL_KEYS`, `assertCanonical`).

## Choques con la spec

- REQ-ORA-022 pide prueba de proximidad zero-knowledge. No es viable en el
  dispositivo objetivo; cambiar a NFC/QR o geohash truncado con sal.
- La garantía "ZK" de `06-landing` queda sin respaldo hasta cambiar REQ-ORA-022.
- La spec 02 trata igual toda hora. Falta distinguir hora entre pares de
  emisión del fondo.

## Preguntas abiertas

- Ley aplicable: la LFPDPPP rige a particulares. Si opera el municipio aplica
  la normativa de sujetos obligados (ley general y local). Definir quién es
  el Responsable antes de redactar el aviso.
- Ancla de identidad en el alta (CURP validada por el municipio o alta
  presencial con promotora).
- Costo de distribuir por Play Store y de la cuota de Play Integrity.
- Los artículos y montos de multa citados por la fuente no están verificados.

## Fuentes

Basado en un reporte de investigación externo (Gemini Deep Research,
2026-11-07). Repos revisados por el reporte: `vladmandic/human`,
`@mediapipe/tasks-vision`, `iden3/snarkjs`, `medic/cht-core`, `wwWallet`.
