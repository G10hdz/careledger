# CareLedger — Red del Cuidado Cívico

Infraestructura cívica que certifica las horas de cuidado informal y las
convierte en **Puntos Cívicos** canjeables por beneficios reales: subsidios de
luz, transporte público, horas de relevo certificado y apoyo en comercios del
barrio.

> Cuando cuidas, te descuidas. Esta plataforma existe para que cuidar no te
> cueste la salud: también se ganan puntos por autocuidado.

La persona que cuida (la "generación sándwich", ~38 años, mayoría mujeres)
registra su jornada en <60 segundos, 100% offline. Un oráculo vecinal valida
3-de-3 (cuidadora + beneficiario + veedor comunitario) y se emiten puntos
respaldados por el Fondo Municipal de Cuidados. Cada peso público retorna
~3.42x en valor social (SROI auditable).

## Estructura

```
specs/            la fuente de verdad (00 plataforma → 06 landing, roadmap)
design/           DESIGN.md (sistema) + stitch/ (pantallas de referencia)
docs/             fuente original del proyecto + ADRs
apps/             pwa, gobierno, comercios, landing (un territorio por app)
packages/
  domain/         tipos + matemática de puntos, SROI y catálogo (contrato)
  design-tokens/  tema Tailwind v4 del sistema Civic Care & Human Dignity
explainer.html    explicación del proyecto en un solo archivo
```

## Desarrollo

```bash
pnpm install
pnpm -r test
```

Worktrees para trabajo en paralelo: `~/agent-configs/scripts/wt.sh`.
Reglas de agentes: `AGENTS.md`.
