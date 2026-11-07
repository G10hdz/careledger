# Roadmap

Orden de ataque. Cada fase sale por PRs chicos (<400 líneas) a `main`.
Territorios independientes: varios agentes pueden avanzar en paralelo, cada
uno en su worktree, sin tocar los archivos de otro.

## Fase 0 — Cimientos (este commit)

- specs/, design/, packages/domain (contrato + matemática), design-tokens.
- Sin apps todavía: cada territorio levanta la suya.

## Fase 1 — Corazón cuidadora (paralelizable)

- `packages/domain`: `points.ts` + `sroi.ts` + `ledger.ts` con tests dorados.
- `apps/pwa`: scaffold Next.js PWA + registro offline (REQ-PWA-001..008).
- `apps/landing`: scaffold + 4 fases + calculadora (REQ-WEB-001..003, 007).
  No depende de nadie: buen primer trabajo en paralelo.

## Fase 2 — Dinero visible

- `apps/pwa`: billetera + catálogo + vales QR (REQ-BIL-001..009).
- Oráculo simulado: veedores auto-firman en dev tras N segundos para poder
  probar el flujo completo sin actores reales.

## Fase 3 — Prueba para gobierno

- `apps/gobierno`: dashboard SROI + simulador (REQ-GOB-001..005).
- Libro mayor consultable por folio.

## Fase 4 — Cierre del círculo

- `apps/comercios`: afiliación + terminal de cobro + liquidación SPEI simulada.
- Propinas familiares en billetera (REQ-BIL-020..023).

## Fase 4.5 — Marketplace y formación (doc v2 + decisión puntos-cursos)

- `apps/servicios`: directorio por zona + filtro de presupuesto + solicitudes
  (REQ-SER-001..007). El canje de "relevo certificado" de la billetera aterriza
  aquí como solicitud de servicio.
- `apps/pwa`: sección Formación (REQ-FOR-001..007) con emisión de puntos por
  curso completado (tabla `COURSE_POINTS` en domain) y evaluaciones con
  revisión agéntica (REQ-FOR-006).
- Spike paralelo (no bloqueante): investigar verificación foto antes/después
  on-device con solo hash a BD en México (REQ-ORA-024). Resultado documentado
  en `docs/` antes de decidir implementación.

## Fase 5 — Piloto

- Landing con FAQ completo + folleto PDF.
- Datos del piloto semilla (Coyoacán / Santa Úrsula: −53% caídas, 94%
  satisfacción) solo si la alcaldía los valida; si no, se marcan como
  "proyección metodológica".

## Reglas de oro para agentes paralelos

1. `packages/domain` y `packages/design-tokens` son contratos: se extienden,
   no se reescriben. Cambio ahí → PR propio con ADR si altera fórmulas.
2. Raíz (`package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`) solo la
   toca el agente que integra; los demás no.
3. Cada app vive en `apps/<territorio>` con su propio lockfile de pnpm
   workspace; dev server en el puerto de `.wt-port` del worktree.
4. El copy ciudadano dice "Puntos Cívicos"; `$CARE` queda solo como nombre
   interno de ledger en `packages/domain`.
