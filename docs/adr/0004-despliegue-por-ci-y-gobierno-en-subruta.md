# ADR 0004: Despliegue por CI y panel de gobierno en subruta

Estado: aceptado · 2026-11-07

## Contexto

El auto-deploy de Vercel publicaba cada push a `main` sin esperar a los tests,
así que un cambio roto podía llegar a producción. Actions no siempre corre
(minutos, facturación), y el equipo necesita publicar igual en esos casos.

El panel de gobierno es una app Next distinta de la landing, con su propio
`next.config.ts`, `basePath` y dependencias. El jurado debe ver una sola URL.

## Decisión

- Producción se publica desde el job `deploy` del CI, que depende de `checks`.
  El auto-deploy de `main` queda apagado en `apps/landing/vercel.json`. Los
  previews de PR siguen saliendo de Vercel.
- `scripts/vercel.sh publish` es el único camino de publicación. Lo usa el CI
  y también el deploy manual, así que no hay dos recetas.
- El panel es un proyecto de Vercel aparte, con `basePath` `/gobierno`. La
  landing solo le pasa el tráfico: un rewrite de `/gobierno` y
  `/gobierno/:path+` hacia `entremanos-gobierno.vercel.app`.
- Se eligió subruta con rewrite y no un dominio o subdominio propio para el
  panel. Así el jurado ve una sola URL, y no hay DNS que configurar para
  gobierno.
- Se eligió un proyecto aparte y no uno solo con las dos apps porque cada app
  tiene su configuración Next y su `basePath`; juntarlas obligaría a un build
  único para ambas.

## Consecuencias

- Un cambio que no pasa `checks` no llega a producción.
- Sin Actions no hay publicación automática. El respaldo es
  `scripts/vercel.sh deploy`, desde `main` limpio.
- Los dos proyectos se publican en orden. Si falla el de gobierno, la landing
  no se publica en esa corrida.
- El rewrite apunta a una URL fija. Si el proyecto `entremanos-gobierno` cambia
  de nombre, hay que actualizar `GOBIERNO_ORIGIN` en
  `apps/landing/next.config.ts`.
- Cada app se prueba y se despliega por separado, pero su URL pública es la
  misma.
