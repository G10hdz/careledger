# 01 — PWA de la cuidadora (`apps/pwa`)

App móvil-first para registrar cuidado, registrar autocuidado y operar la
billetera. Referencia: `design/stitch/registro_de_acci_n_de_cuidado/`,
`design/stitch/billetera_c_vica_y_centro_de_canje/`,
`design/stitch/flujo_completo_del_cuidado_c_vico_paso_a_paso/`.

Dispositivo objetivo: Android de entrada (ej. Xiaomi Redmi 9A), pantalla
375–414px, datos móviles intermitentes o inexistentes. La app funciona 100%
sin internet y sincroniza cuando hay red (nodo Wi-Fi del centro comunitario).

## Requisitos (EARS)

| ID | Requisito | Evidencia |
| --- | --- | --- |
| REQ-PWA-001 | THE app SHALL completar un registro de acción de cuidado en ≤3 pantallas y ≤60 segundos desde "¿A quién cuidaste hoy?" hasta firma local. | QA medido + test E2E del flujo |
| REQ-PWA-002 | THE app SHALL ser funcional al 100% sin conectividad: registro, consulta de saldo, vales generados y firma local operan offline con persistencia en IndexedDB. | Test E2E con red cortada |
| REQ-PWA-003 | WHILE el dispositivo recupera conectividad, THE app SHALL sincronizar los registros pendientes sin intervención de la usuaria. | Test de sync con cola simulada |
| REQ-PWA-004 | THE app SHALL ofrecer como destinatario del cuidado exactamente: familiar dependiente, vecino adulto mayor, infancias comunitarias. | Test de UI |
| REQ-PWA-005 | THE app SHALL aceptar tipos de apoyo multi-selección: acompañamiento médico, alimentación y aseo, estimulación cognitiva, guardia nocturna, otro. | Test de UI |
| REQ-PWA-006 | THE app SHALL capturar duración en horas y minutos con presets rápidos (1h, 2h30, 3h30, 5h) y steppers −/+. | Test de UI |
| REQ-PWA-007 | THE app SHALL ofrecer **autocuidado** como registro propio: tiempo libre, hidratación/descanso, asistencia a red de apoyo — con la misma emisión de puntos según `02`. | Test E2E |
| REQ-PWA-008 | THE app SHALL firmar cada registro localmente con Ed25519 (par de claves en el enclave/WebCrypto del dispositivo); ningún dato biométrico sale del terminal. | Test unitario de firma |
| REQ-PWA-009 | THE app SHALL mostrar un indicador persistente de estado de sync ("Sincronizado" / "X pendientes") y de nodo barrial activo. | Test de UI |
| REQ-PWA-010 | THE app SHALL cumplir: targets táctiles ≥48×48px, WCAG 2.1 AA en contraste (meta AAA en lectura), fuente ≥12px, selector de idioma ES/NAH/EN. | Auditoría a11y + test visual |
| REQ-PWA-011 | THE app SHALL NOT enviar nombres de pacientes, diagnósticos ni fotos a servidores; la atestación transporta solo duración, categoría, tipo de apoyo y firmas. | Revisión de payload + test de contrato |
| REQ-PWA-012 | WHEN una jornada se valida por el oráculo, THE app SHALL mostrar el comprobante cívico con folio, puntos emitidos, valor social estimado y sello de tiempo, descargable en PDF. | Test E2E + screenshot |
| REQ-PWA-013 | THE app SHALL ser instalable como PWA (manifest + service worker) y usable a una mano: acciones primarias en pulgar-inferior. | Lighthouse PWA + screenshot |

## Flujo de registro (de la referencia Stitch)

1. ¿A quién cuidaste hoy? (3 tarjetas grandes, una tap)
2. Tiempo dedicado (presets + steppers) y tipo de apoyo (chips multi)
3. "Registrar y validar (+35 pts estimados)" → firma local → comprobante

Texto de confianza bajo el botón: "Registro firmado localmente • Tu privacidad
ciudadana está protegida".

## Dependencias

- `packages/domain`: `computePoints`, tipos `CareSession`, `Attestation`.
- `packages/design-tokens`: tema Tailwind v4 de `design/DESIGN.md`.
- `03-billetera-canje.md` para las pantallas de saldo y canje.

## No-goals de esta spec

- No chat, no red social, no directorio de cuidadoras.
- No integración con wearables en esta fase (es la proyección a 10a del doc).
