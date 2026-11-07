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
- URLs públicas en GitHub Pages: explainer y CuidaRed.

Pendiente para el pitch:

| Pendiente | Spec | Estado |
| --- | --- | --- |
| Elegir la economía principal: Puntos Cívicos o banco de tiempo (EntreManos) | REQ-EVA-019 | sin decidir |
| 2 cifras oficiales con fuente (INEGI ENASIC, Cuenta Satélite, ENUT) | REQ-EVA-010 | pendiente |
| Programas existentes y su brecha, montos verificados | REQ-EVA-012 | pendiente |
| Métricas del piloto (horas, autocuidado, escala Zarit) | REQ-EVA-003 | pendiente |
| Slide de IA responsable; quitar del borrador la venta de datos de fatiga a aseguradoras | REQ-EVA-040..043 | pendiente |
| Video de respaldo del demo | REQ-EVA-021 | pendiente |
| Banco de 8 preguntas del jurado | REQ-EVA-032 | pendiente |
| Landing en Vercel accesible sin Deployment Protection | REQ-EVA-020 | por verificar tras `b6958d0` |
| Piloto Iztapalapa: el documento fuente dice 20 transacciones a la semana, spec 09 dice al día | 09 | por aclarar |

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
  20h/mes por par de cuentas, piloto Iztapalapa ~20 tx/día.
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
