# CareLedger — Red del Cuidado Cívico

**[English](README.en.md)** · Especificación y monorepo de una infraestructura
cívica que certifica horas de cuidado informal y las convierte en **Puntos
Cívicos** canjeables por beneficios reales: luz, transporte, horas de relevo y
comercios del barrio.

> Cuando cuidas, te descuidas. La plataforma existe para que cuidar no te
> cueste la salud: también se ganan puntos por autocuidado.

La cuidadora (la "generación sándwich", ~38 años, mayoría mujeres) registra su
jornada en menos de 60 segundos, sin internet. Un oráculo vecinal valida
3-de-3 — cuidadora, beneficiario y veedor comunitario — y se emiten puntos
respaldados por presupuesto municipal. Cada peso invertido retorna ~3.42x en
valor social medible (SROI).

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/flow-dark.svg">
  <img alt="Flujo: la PWA registra offline, el oráculo vecinal valida 3/3, el ledger municipal emite puntos y la cuidadora canjea beneficios; los comercios liquidan por SPEI" src="docs/assets/flow-light.svg" width="560">
</picture>

## Estado del proyecto

Etapa de especificación y contratos. `packages/domain` ya tiene la matemática
de puntos, consenso y SROI con tests; las apps (`apps/`) se construyen sobre
estas specs. Las pantallas de referencia exportadas del prototipo están en
`design/stitch/`.

## Estructura

```
specs/            fuente de verdad: 00 plataforma → 08 formación + roadmap
design/           DESIGN.md (sistema) + stitch/ (pantallas de referencia)
docs/             documento fuente, ADRs, assets del README
apps/             pwa, gobierno, comercios, landing, servicios (por spec)
packages/
  domain/         tipos + puntos + consenso + SROI + catálogo (contrato)
  design-tokens/  tema Tailwind v4 "Civic Care & Human Dignity"
docs/explainer.html   explicación del proyecto en un solo archivo
```

## Lo mínimo

Requisitos: Node 22+, pnpm 9+.

```bash
pnpm install
pnpm -r test        # tests del dominio (vitest)
pnpm -r typecheck   # tsc estricto
```

Abrir `docs/explainer.html` en el navegador para el panorama completo, o
https://g10hdz.github.io/careledger/ (GitHub Pages).

## Desarrollo en paralelo

El repo está pensado para varios agentes a la vez: cada superficie vive en su
`apps/<territorio>` y se trabaja en su propio worktree de git. Los contratos
compartidos (`packages/domain`, `packages/design-tokens`) solo se extienden,
no se reescriben. Reglas completas en `AGENTS.md`.

## Privacidad

Nunca se suben nombres de pacientes, diagnósticos ni fotos. La atestación
transporta duración, categoría, tipos de apoyo y firmas; la ubicación se usa
como prueba de proximidad agregada, no como tracking.

## Licencia

[MIT](LICENSE)
