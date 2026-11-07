# ADR 0001 — Stack y estructura del monorepo

Estado: aceptado · 2026-11-07

## Contexto

CareLedger necesita 4 superficies (PWA cuidadora, panel de gobierno, terminal
de comercios, landing pública) desarrolladas en paralelo por agentes
independientes en worktrees, sin que se pisen archivos. La referencia visual
viene de un export de Google Stitch (HTML + Tailwind CDN + Material Symbols).

## Decisión

- **Monorepo pnpm workspaces**: `apps/*` (un territorio por app, un agente por
  territorio) + `packages/*` compartidos.
- **Next.js + React + TypeScript + Tailwind v4** por app — la convención ya
  usada en los repos de la casa; la PWA sale con serwist/next-pwa en su spec.
- **`packages/domain`**: contrato único de tipos y matemática (puntos,
  multiplicador de carga, consenso, SROI, catálogo, folios). Todas las apps
  consumen las mismas fórmulas para que no diverjan.
- **`packages/design-tokens`**: `tokens.css` con `@theme` de Tailwind v4
  sacado del DESIGN.md del export de Stitch.
- **Supabase** queda como backend candidato (convención de la casa) pero la
  spec de persistencia aún no lo fija: la PWA manda con IndexedDB + sync.
- **Vitest** para tests de dominio; gates por app los define cada spec.

## Consecuencias

- Cada agente crea su `apps/<territorio>` sin tocar la raíz ni otros apps.
- Cambiar fórmulas de puntos/SROI exige PR dedicado con ADR.
- El HTML de Stitch queda solo como referencia en `design/stitch/`; el código
  real se implementa en React, no se copia el CDN.
