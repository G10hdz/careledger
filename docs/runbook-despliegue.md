# Runbook: despliegue de la landing

Producción es `https://entremanos-mx.vercel.app`, proyecto `entremanos` en
Vercel, con root `apps/landing`.

## Publicar un cambio

1. Abrir PR contra `main`. Vercel comenta un preview del PR.
2. Esperar `checks` en verde (typecheck, test, build, gitleaks).
3. Mergear con "rebase and merge".

El job `deploy` de `.github/workflows/ci.yml` publica a producción solo
si `checks` pasó, y termina con `scripts/vercel.sh smoke`. Nadie tiene que
entrar a Vercel. El auto-deploy de `main` está apagado en
`apps/landing/vercel.json` para que no se publique nada en rojo.

## Revisar que está arriba

    scripts/vercel.sh status   # últimos deploys de producción y corridas de CI en main
    scripts/vercel.sh smoke    # / y /cuidared con 200

## Si producción se rompió

    scripts/vercel.sh rollback        # vuelve al deploy anterior
    scripts/vercel.sh rollback <url>  # o a uno concreto de `status`

Después, arreglar en un PR. Ojo: tras un rollback, Vercel deja de promover
deploys nuevos solos. El siguiente deploy del CI con `--prod` vuelve a
apuntar el dominio.

## Si Actions no corre

    scripts/vercel.sh deploy

Exige estar en `main` limpio e igual a `origin/main`. Corre typecheck,
test y build antes de publicar, y el smoke al final.

## Requisitos

- `gh` con sesión, y `vercel login` en la cuenta dueña del proyecto para
  `status`, `rollback` y `deploy`. `smoke` solo necesita `curl`.
- Secrets del repo: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
  Si el job `deploy` falla en `vercel pull` por auth, el token expiró o
  está vacío: `scripts/vercel.sh ci-token` crea uno limitado al proyecto,
  lo guarda sin mostrarlo y reintenta el deploy.
