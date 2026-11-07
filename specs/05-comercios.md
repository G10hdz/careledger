# 05 — Comercios aliados (`apps/comercios`)

Terminal para comercios del barrio que aceptan vales de puntos y liquidan en
dinero real. Referencia: `design/stitch/infograf_a_c_mo_tu_tiempo_se_convierte_en_beneficios/`
(sección "Comercio y Economía Circular") y el pedido pendiente en Stitch:
"flujo dedicado para Comercios Locales (terminal móvil de cobro de puntos y
liquidación SPEI)".

## Requisitos (EARS)

| ID | Requisito | Evidencia |
| --- | --- | --- |
| REQ-COM-001 | THE afiliación SHALL pedir solo: identificación oficial, comprobante de domicilio comercial y cuenta CLABE para depósito. Meta: alta en ≤5 minutos, sin trámites notariados. | Test E2E de alta |
| REQ-COM-002 | THE terminal SHALL aceptar pago por QR del vale o por folio manual; la validación funciona sin conectividad (verificación de firma local del vale). | Test offline |
| REQ-COM-003 | WHEN el comercio cobra un vale, THE sistema SHALL marcarlo `usado` en cuanto haya sync y rechazar un segundo cobro del mismo folio (idempotencia). | Test de doble cobro |
| REQ-COM-004 | THE liquidación SHALL transferir el 100% del valor de ventas del día por SPEI a la cuenta del comercio en ≤24h, con 0% comisión por transacción. | Test de batch de liquidación (simulado) |
| REQ-COM-005 | THE terminal SHALL mostrar historial de cobros del día y liquidaciones pendientes/confirmadas. | Test de UI |
| REQ-COM-006 | THE sistema SHALL emitir el distintivo "Comercio Solidario" (placa digital + prioridad en el directorio de cuidados de la alcaldía) al comercio afiliado activo. | Test de badge |
| REQ-COM-007 | THE comercio SHALL ver la paridad oficial vigente (1 punto = $10 MXN) y el equivalente en pesos de cada vale cobrado. | Test de conversión |

## No-goals

- No terminal física (POS) dedicada: es una app/web en el teléfono del local.
- No inventario ni facturación electrónica.
