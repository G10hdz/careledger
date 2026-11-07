# Roadmap

Orden de ataque. Cada fase sale por PRs chicos (<400 líneas) a `main`.
Territorios independientes: varios agentes pueden avanzar en paralelo, cada
uno en su worktree, sin tocar los archivos de otro.

## Hoy: Build for Her (cierre 21:00, 2026-11-07)

Alcance congelado. No entran specs ni REQs nuevos hasta después del pitch.

Demo único, de punta a punta:

1. La cuidadora registra su jornada y su autocuidado en la PWA (<60 s, offline).
2. El oráculo simulado valida 3 de 3 y emite Puntos Cívicos.
3. La cuidadora canjea un vale QR.
4. La terminal de comercios cobra ese vale.
5. Gobierno ve horas certificadas y SROI (panel o calculadora de la landing).

| Pendiente | Dueño | Estado |
| --- | --- | --- |
| Deploy con URL pública para el jurado | integración | en curso |
| Vale de la PWA cobrable en comercios (firma Ed25519) | pwa + comercios | PR #13 y #14, CI verde |
| Catálogo único: PWA (`cfe-30`...) y comercios (`despensa-basica`...) usan ids distintos | comercios | por verificar tras #13/#14 |
| Panel de gobierno | gobierno | PR #11 en draft, CI rojo por lockfile; si no entra a las 18:30 se usa la calculadora de la landing |
| Guion de demo y slides | landing | pendiente |

Cortes: 19:30 features cerradas, 20:00 deploy final, 20:30 ensayo del pitch.

Datos del piloto semilla (−53% caídas, 94% satisfacción) y SROI 3.42x se
presentan como proyección metodológica, no como resultado medido.

## Fase 0: Cimientos (hecho)

- specs/, design/, packages/domain (contrato + matemática), design-tokens.

## Fase 1: Corazón cuidadora (hecho)

- `packages/domain`: puntos + SROI con tests.
- `apps/pwa`: registro offline (REQ-PWA-001..008). PR #8.
- `apps/landing`: 4 fases + calculadora (REQ-WEB-001..003, 007). PR #7.

## Fase 2: Dinero visible (hecho, integración pendiente)

- `apps/pwa`: billetera + catálogo + vales QR (REQ-BIL-001..009).
- Oráculo simulado: veedores auto-firman en dev tras N segundos.
- Falta que el vale emitido aquí se cobre en `apps/comercios` (ver Hoy).

## Fase 3: Prueba para gobierno (en curso)

- `apps/gobierno`: dashboard SROI + simulador (REQ-GOB-001..005). PR #11.
- Libro mayor consultable por folio.

## Fase 4: Cierre del círculo (hecho)

- `apps/comercios`: afiliación + terminal de cobro + liquidación SPEI
  simulada. PRs #2, #5, #6, #10.
- Propinas familiares en billetera (REQ-BIL-020..023): después del hackatón.

## Después del hackatón

Congelado hoy. Nada de esto entra antes del pitch; va como visión en slides.

- `apps/servicios`: directorio por zona + presupuesto + solicitudes
  (REQ-SER-001..007). PR #1 en draft, no se mergea hoy.
- `apps/pwa`, Formación (REQ-FOR-001..007): puntos por curso (tabla
  `COURSE_POINTS` ya en domain) y evaluaciones con revisión agéntica.
- Banco de tiempo `cuidared` (doc v3): el prototipo single-file ya está en
  GitHub Pages (`docs/cuidared/`). La reescritura en el monorepo espera spec
  `09`.
  Paridad hora-hora, saldo −5h, doble confirmación QR, topes 8h/día y
  20h/mes por par de cuentas, piloto Iztapalapa ~20 tx/día.
- Spike de verificación foto antes/después on-device con solo hash a BD en
  México (REQ-ORA-024). Resultado en `docs/` antes de decidir.
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
