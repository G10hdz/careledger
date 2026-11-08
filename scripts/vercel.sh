#!/usr/bin/env bash
# Operación del despliegue en Vercel (landing y panel de gobierno). Ver docs/runbook-despliegue.md.
#
#   scripts/vercel.sh status          últimos deploys de producción y corridas de CI en main
#   scripts/vercel.sh smoke           /, /cuidared y /gobierno responden 200 en producción
#   scripts/vercel.sh publish         pull, build y deploy --prod de los dos proyectos (lo usa el CI)
#   scripts/vercel.sh rollback [url]  vuelve al deploy anterior (o al indicado) y corre smoke
#   scripts/vercel.sh deploy          deploy manual desde main, solo si Actions no corre
#   scripts/vercel.sh ci-token        copia VERCEL_TOKEN de Doppler al repo y reintenta el deploy
set -euo pipefail

URL=https://entremanos-mx.vercel.app
SCOPE=g10hdzs-projects
REPO=G10hdz/careledger
# IDs de proyecto, no son credenciales. En local el login sale de
# `vercel login`; en CI, de VERCEL_TOKEN.
export VERCEL_ORG_ID=team_nsq0cjSdqQkaMQ1vNm5ch9yj
LANDING_ID=prj_vh1qzlxyvFeLTyUSza8bQ06cDY5R
GOBIERNO_ID=prj_zgJpZf80YCksCQpCCT4f1sy4NUkF
export VERCEL_PROJECT_ID=$LANDING_ID
vercel() { npx --yes vercel@65.10.0 "$@" ${VERCEL_TOKEN:+--token="$VERCEL_TOKEN"}; }

# Gobierno primero: la landing reescribe /gobierno hacia él.
publish() {
  cd "$(git rev-parse --show-toplevel)"
  for VERCEL_PROJECT_ID in "$GOBIERNO_ID" "$LANDING_ID"; do
    export VERCEL_PROJECT_ID
    vercel pull --yes --environment=production
    vercel build --prod
    vercel deploy --prebuilt --prod
  done
  export VERCEL_PROJECT_ID=$LANDING_ID
}

smoke() {
  local path code fail=0
  for path in / /cuidared /gobierno; do
    code=$(curl -s -L -o /dev/null -w '%{http_code}' "$URL$path")
    echo "$path $code"
    [ "$code" = 200 ] || fail=1
  done
  return "$fail"
}

case "${1:-status}" in
  status)
    vercel ls entremanos --scope "$SCOPE" --prod 2>/dev/null | head -n 12
    gh run list --repo "$REPO" --branch main --limit 5
    ;;
  smoke)
    smoke
    ;;
  publish)
    publish
    smoke
    ;;
  rollback)
    vercel rollback ${2:+"$2"} --scope "$SCOPE" --yes
    smoke
    ;;
  deploy)
    cd "$(git rev-parse --show-toplevel)"
    [ "$(git rev-parse --abbrev-ref HEAD)" = main ] || { echo "Solo desde main." >&2; exit 1; }
    git diff --quiet && git diff --cached --quiet || { echo "Hay cambios sin commit." >&2; exit 1; }
    git fetch -q origin
    [ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ] || { echo "main local no coincide con origin/main." >&2; exit 1; }
    pnpm install --frozen-lockfile
    pnpm -r typecheck
    pnpm -r test
    pnpm -r build
    git checkout -q -- apps/pwa/next-env.d.ts 2>/dev/null || true
    publish
    smoke
    ;;
  ci-token)
    # El CLI de Vercel no puede crear tokens: se crean en
    # vercel.com/account/tokens y se pegan en Doppler (careledger/prd).
    # De ahí van directo a gh, sin pasar por pantalla.
    token=$(doppler secrets get VERCEL_TOKEN -p careledger -c prd --plain 2>/dev/null || true)
    [ -n "$token" ] || { echo "Doppler careledger/prd no tiene VERCEL_TOKEN." >&2; exit 1; }
    printf %s "$token" | gh secret set VERCEL_TOKEN --repo "$REPO"
    unset token
    run=$(gh run list --repo "$REPO" --workflow CI --branch main --limit 1 --json databaseId --jq '.[0].databaseId')
    gh run rerun "$run" --repo "$REPO" --failed && echo "VERCEL_TOKEN copiado de Doppler. Reintentando deploy en la corrida $run."
    ;;
  *)
    sed -n '2,9p' "$0" >&2
    exit 2
    ;;
esac
