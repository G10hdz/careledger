# Runbook: despliegue

Producción es `https://entremanos-mx.vercel.app`. Son dos proyectos de Vercel:

| Proyecto | Root | Sirve |
| --- | --- | --- |
| `entremanos` | `apps/landing` | `/`, `/cuidared`, `/hora-por-hora`, `/explainer` y el rewrite de `/gobierno` |
| `entremanos-gobierno` | `apps/gobierno` | el panel, con `basePath` `/gobierno` |

El panel no tiene dominio propio. Se llega por `entremanos-mx.vercel.app/gobierno`.

## Publicar un cambio

1. Abrir PR contra `main`. Vercel comenta un preview del PR.
2. Esperar `checks` en verde (typecheck, test, build, gitleaks).
3. Mergear con "rebase and merge".

El job `deploy` de `.github/workflows/ci.yml` corre solo si `checks` pasó.
Ejecuta `scripts/vercel.sh publish`: despliega primero `entremanos-gobierno` y
luego `entremanos`, y termina con el smoke. Nadie tiene que entrar a Vercel.
El auto-deploy de `main` está apagado en `apps/landing/vercel.json`.

## Revisar que está arriba

    scripts/vercel.sh status   # últimos deploys de producción y corridas de CI en main
    scripts/vercel.sh smoke    # /, /cuidared y /gobierno responden 200

## Si producción se rompió

    scripts/vercel.sh rollback        # vuelve al deploy anterior
    scripts/vercel.sh rollback <url>  # o a uno concreto de `status`

Después, arreglar en un PR. Ojo: tras un rollback, Vercel deja de promover
deploys nuevos solos. El siguiente deploy del CI con `--prod` vuelve a
apuntar el dominio.

## Si Actions no corre

    scripts/vercel.sh deploy

Exige estar en `main` limpio e igual a `origin/main`. Corre typecheck,
test y build antes de publicar los dos proyectos, y el smoke al final.

## Requisitos

- `gh` con sesión, y `vercel login` en la cuenta dueña de los proyectos para
  `status`, `rollback` y `deploy`. `smoke` solo necesita `curl`.
- Secret del repo: solo `VERCEL_TOKEN`. Los IDs de organización y de proyecto
  están fijos en `scripts/vercel.sh`.
- Si el job `deploy` falla en `vercel pull` por auth, el token expiró o está
  vacío. Crear uno en vercel.com/account/tokens (el CLI no puede), pegarlo en
  Doppler como `VERCEL_TOKEN` en `careledger/prd` y correr
  `scripts/vercel.sh ci-token`: lo copia al repo sin mostrarlo y reintenta el
  deploy.

## Si Vercel agota los deploys del día

El plan gratis permite 100 deploys en 24 horas, y los previews de cada PR
cuentan. Al pasarlo, el job `deploy` falla con
`api-deployments-free-per-day`. Para que `main` no quede en rojo mientras
tanto:

    gh variable set VERCEL_DEPLOY --body off   # pausa el job deploy
    gh variable set VERCEL_DEPLOY --body on    # lo reactiva

Al reactivarlo, el siguiente push a `main` publica lo último.
