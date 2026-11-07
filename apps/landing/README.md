# apps/landing

Sitio público de Cuando cuidas, te descuidas. Explica la ruta del tiempo, la calculadora de
Puntos Cívicos, las garantías, la afiliación de comercios y la FAQ.

## Comandos

```bash
pnpm --filter @careledger/landing dev
pnpm --filter @careledger/landing test
pnpm --filter @careledger/landing typecheck
pnpm --filter @careledger/landing build
```

El puerto de desarrollo sale de `.wt-port` del worktree.

## Estructura

- `src/app/page.tsx`: composición de las secciones.
- `src/components/`: hero, ruta, calculadora, niveles, garantías, audiencias,
  comercios, FAQ y contacto.
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
