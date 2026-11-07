# 03 — Billetera cívica y centro de canje (`apps/pwa`)

Referencia: `design/stitch/billetera_c_vica_y_centro_de_canje/`. La billetera
muestra saldo en puntos, equivalente en moneda, historial del mes y el catálogo
de beneficios canjeables. Opera offline; los vales generados no caducan.

## Requisitos (EARS)

| ID | Requisito | Evidencia |
| --- | --- | --- |
| REQ-BIL-001 | THE billetera SHALL mostrar: saldo en puntos, equivalente monetario aproximado, puntos ganados este mes y horas reconocidas. | Test de UI |
| REQ-BIL-002 | THE paridad contable SHALL ser 1 punto = $10 MXN, configurable por despliegue (el equivalente USD se deriva del tipo de cambio configurado). | Test de conversión |
| REQ-BIL-003 | THE catálogo SHALL listar beneficios con: nombre, descripción llana, categoría (Hogar/Movilidad/Autocuidado/Canasta), etiqueta, costo en puntos y CTA "Canjear". Catálogo inicial: 30% desc. recibo CFE = 50 pts; pase semanal Metro/Metrobús/RTP = 30 pts; 3h de relevo certificado = 40 pts. El catálogo es extensible por despliegue a las categorías del documento fuente: agua, guarderías, transporte especializado a citas médicas (adultos mayores/discapacidad) y comercios barriales (estéticas, deportivos, tiendas). | Test de catálogo |
| REQ-BIL-004 | WHEN la cuidadora canjea, THE sistema SHALL quemar los puntos y emitir el vale en una sola operación atómica: o se completan ambos o ninguno. | Test de atomicidad (fallo a mitad) |
| REQ-BIL-005 | THE vale SHALL incluir: folio único, QR legible ≥180×180px, código numérico manual de respaldo, emisor, monto del beneficio, firma de ledger y vigencia de 30 días naturales. Funciona sin conectividad en ventanilla/taquilla. | Test de vale + screenshot |
| REQ-BIL-006 | THE vale SHALL permitir guardarse en galería del dispositivo o imprimirse; la verificación del folio no requiere la app de la cuidadora en línea. | Test E2E |
| REQ-BIL-007 | THE historial SHALL listar canjes con estado: activo, usado, vencido. Los vales ya generados conservan validez jurídica aunque el saldo cambie. | Test de estados |
| REQ-BIL-008 | WHEN un vale vence sin uso, THE sistema SHALL regresar los puntos a la billetera y marcar el vale `vencido`. | Test de reembolso |
| REQ-BIL-009 | THE app SHALL sostener el aviso "Garantía del Fondo Municipal": cada punto emitido está respaldado por partida presupuestaria. Texto fijo bajo el catálogo. | Screenshot |

## Propinas familiares (del documento fuente)

| ID | Requisito | Evidencia |
| --- | --- | --- |
| REQ-BIL-020 | THE sistema SHALL permitir que un familiar fondee la cuenta de la cuidadora: depósito en moneda que se convierte en saldo de propinas para ella. | Test de flujo con pasarela simulada |
| REQ-BIL-021 | THE sistema SHALL cobrar una comisión de procesamiento configurable sobre cada propina (default 5%); el desglose se muestra antes de confirmar. | Test de cálculo |
| REQ-BIL-022 | THE familiar SHALL poder mandar una propina con mensaje corto sin crear cuenta completa (link de pago). | Test E2E |
| REQ-BIL-023 | THE sistema SHALL separar contablemente saldo de puntos (ganados por cuidado) y saldo de propinas (fondeado): reglas de canje solo aplican a puntos; las propinas son retirables o canjeables según política del despliegue. | Test de ledger |

## No-goals

- No retiro de puntos a moneda fiat por parte de la cuidadora en esta fase
  (los puntos solo se queman en el catálogo; las propinas son otra cuenta).
- No transferencias punto-a-punto entre cuidadoras en fase inicial.
