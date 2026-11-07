# Roadmap

Orden de ataque. Cada fase sale por PRs chicos (<400 líneas) a `main`.
Territorios independientes: varios agentes pueden avanzar en paralelo, cada
uno en su worktree, sin tocar los archivos de otro.

## Build for Her (cierre 21:00, 2026-11-07)

Código congelado. Lo que queda es el pitch, guiado por
`specs/10-pitch-y-evaluacion.md` (rúbrica oficial: impacto 30%, problema y
políticas 25%, solución 20%, storytelling 15%, IA responsable 10%).

Entregado en main (CI verde):

- Demo de punta a punta: la cuidadora registra en la PWA (<60 s, offline), el
  oráculo valida 3 de 3 y emite Puntos Cívicos, canjea un vale QR y la
  terminal de comercios lo cobra. PRs #13 y #14; el vale emitido en vivo
  quedó cobrable con el PR #18 (antes salía `firma_invalida`). ADR 0002.
- Panel de gobierno con simulador y libro mayor: PR #11.
- Marketplace de servicios con tarifa uniforme: PR #1, ADR 0003.
- Spike antifraude: `docs/spike-verificacion-antifraude.md` (PR #15).
- Landing EntreManos del equipo como demo del banco de tiempo en `/cuidared`.

Pendiente para el pitch:

| Pendiente | Spec | Estado |
| --- | --- | --- |
| Economía principal | REQ-EVA-019 | decidido: EntreManos (banco de tiempo, doc v4); demo en `/cuidared` |
| Cifras oficiales con fuente y programas con su brecha | REQ-EVA-010, 012 | hecho: `docs/pitch/problema-y-politicas.md` |
| Puente de la causa raíz al banco de tiempo (pobreza de tiempo) | REQ-EVA-011 | pendiente |
| Métrica de éxito del piloto (horas, carga Zarit) | REQ-EVA-003 | pendiente; el doc v4 también la marca |
| Slide de IA responsable y banco de preguntas | REQ-EVA-032, 040..042 | hecho: `docs/pitch/ia-y-preguntas.md`; falta el riesgo propio de EntreManos (identidad) |
| Venta de datos de fatiga en doc v4, spec 00 y pitch-borrador | REQ-EVA-043 | decisión del equipo |
| Reescribir `docs/pitch-borrador.md` para EntreManos | REQ-EVA-030 | pendiente |
| Confirmación de horas: familia o tercero contra doble código | REQ-BT-003 | decisión del equipo |
| Volumen del piloto: 20 al día (doc v4) o por semana | 09 | decisión del equipo |
| Video de respaldo del demo | REQ-EVA-021 | pendiente |
| Landing en Vercel accesible sin Deployment Protection | REQ-EVA-020 | por verificar |

Detalle y puntaje estimado (~68, meta ~80): `docs/auditoria-rubrica.md`.

Datos del piloto semilla (−53% caídas, 94% satisfacción) y SROI 3.42x se
presentan como proyección metodológica, no como resultado medido.

## Fase 0: Cimientos (hecho)

- specs/, design/, packages/domain (contrato + matemática), design-tokens.

## Fase 1: Corazón cuidadora (hecho)

- `packages/domain`: puntos + SROI con tests.
- `apps/pwa`: registro offline (REQ-PWA-001..008). PR #8.
- `apps/landing`: 4 fases + calculadora (REQ-WEB-001..003, 007). PR #7.

## Fase 2: Dinero visible (hecho)

- `apps/pwa`: billetera + catálogo + vales QR (REQ-BIL-001..009).
- Oráculo simulado: veedores auto-firman en dev tras N segundos.
- El vale de la PWA se cobra en `apps/comercios` (contrato Ed25519, ADR 0002).

## Fase 3: Prueba para gobierno (hecho)

- `apps/gobierno`: dashboard SROI + simulador (REQ-GOB-001..005). PR #11.
- Libro mayor consultable por folio.

## Fase 4: Cierre del círculo (hecho)

- `apps/comercios`: afiliación + terminal de cobro + liquidación SPEI
  simulada. PRs #2, #5, #6, #10.
- Propinas familiares en billetera (REQ-BIL-020..023): después del hackatón.

## Después del hackatón

Congelado durante el pitch. Hecho ya: servicios (PR #1) y el spike
antifraude (`docs/spike-verificacion-antifraude.md`). Resta:

- `apps/pwa`, Formación (REQ-FOR-001..007): puntos por curso (tabla
  `COURSE_POINTS` ya en domain) y evaluaciones con revisión agéntica.
- Banco de tiempo `cuidared` (doc v3): el prototipo single-file ya está en
  GitHub Pages (`docs/cuidared/`) y hay una primera versión en
  `apps/cuidared`. La integración completa al monorepo sigue la spec `09`:
  paridad hora-hora, saldo −5h, doble confirmación QR, topes 8h/día y
  20h/mes por par de cuentas; volumen del piloto por decidir (doc v4: ~20 al día).
- Verificación foto antes/después on-device con solo hash a BD en México
  (REQ-ORA-024): decidir con base en el spike.
- Canal WhatsApp: evaluar Capsule (partner de Meta, free tier) contra Twilio.
  Descartar Baileys y librerías no oficiales por riesgo de ban.
- Landing con FAQ completo + folleto PDF.
- Horas certificadas como historial que cuente para derechos (semanas
  cotizadas), alineado con el escenario preferible del forecast.

## Reglas de oro para agentes paralelos

1. `packages/domain` y `packages/design-tokens` son contratos: se extienden,
   no se reescriben. Cambio ahí: PR propio con ADR si altera fórmulas.
2. Raíz (`package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`) solo la
   toca el agente que integra; los demás no.
3. Cada app vive en `apps/<territorio>`; dev server en el puerto de
   `.wt-port` del worktree.
4. El copy ciudadano dice "Puntos Cívicos"; `$CARE` queda solo como nombre
   interno de ledger en `packages/domain`.
