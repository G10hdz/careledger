# apps/landing

Proyecto `entremanos` en Vercel. Sirve el sitio público de EntreManos y
reenvía el panel de gobierno. Despliegue: `docs/runbook-despliegue.md`.

## Qué sirve cada ruta

- `/` y `/cuidared`: landing EntreManos del banco de tiempo, HTML estático en
  `public/cuidared/index.html`. En producción, un rewrite de `next.config.ts`
  manda la raíz a ese archivo.
- `/hora-por-hora`, `/entremanos` y `/explainer`: páginas estáticas en
  `public/`.
- `/gobierno` y `/gobierno/:path+`: rewrite hacia el proyecto
  `entremanos-gobierno`.
- La página Next de `src/app/page.tsx` explica Puntos Cívicos: hero, ruta del
  tiempo, calculadora, niveles, garantías, audiencias, comercios, FAQ y
  contacto. En producción no se ve en `/`; se sirve en los hosts que no son
  `entremanos-mx.vercel.app`, como previews.

## Comandos

```bash
pnpm --filter @careledger/landing dev
pnpm --filter @careledger/landing test
pnpm --filter @careledger/landing typecheck
pnpm --filter @careledger/landing build
```

El puerto de desarrollo sale de `.wt-port` del worktree.

## Estructura

- `src/app/page.tsx`: composición de las secciones de la página Next.
- `src/components/`: hero, ruta (`route-timeline`), calculadora, niveles,
  garantías, audiencias, comercios, FAQ y contacto, más header, footer y
  piezas compartidas.
- `src/lib/estimate.ts`: estimación semanal y matriz de niveles. Usa
  `computePoints`, `clinicalSavingsUsd`, `POINT_VALUE_MXN` y los costos del
  catálogo de `@careledger/domain`.
- `public/folleto-barrial.pdf`: folleto de una hoja para imprimir.
- `screenshots/`: evidencia de desktop, mobile y calculadora.

## Calculadora

El HTML se renderiza en servidor con el estado de 7 horas. El script
`public/calc.js` se carga solo cuando la persona interactúa con la tarjeta
(hover, foco o toque) y actualiza los valores. Así el LCP no depende de la
hidratación de la calculadora. Las constantes y la plantilla del texto salen de
`@careledger/domain` y de `src/lib/estimate.ts`.

## Verificación

- `pnpm --filter @careledger/landing test`: casos dorados 1 h, 3.5 h y 14 h.
- `screenshots/desktop.png` y `screenshots/mobile.png`: página completa.
- `screenshots/calculadora.png`: estado después de mover el control.
- Lighthouse móvil de producción: 98/100 en performance y 100 en
  accesibilidad, buenas prácticas y SEO; LCP 2.49 s, CLS 0.
