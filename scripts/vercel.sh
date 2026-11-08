#!/usr/bin/env bash
# Operación del despliegue de la landing en Vercel. Ver docs/runbook-despliegue.md.
#
#   scripts/vercel.sh status          últimos deploys de producción y corridas de CI en main
#   scripts/vercel.sh smoke           / y /cuidared responden 200 en producción
#   scripts/vercel.sh rollback [url]  vuelve al deploy anterior (o al indicado) y corre smoke
#   scripts/vercel.sh deploy          deploy manual desde main, solo si Actions no corre
#   scripts/vercel.sh ci-token        crea el token de CI, lo guarda en el repo y reintenta el deploy
set -euo pipefail

URL=https://entremanos-mx.vercel.app
SCOPE=g10hdzs-projects
REPO=G10hdz/careledger
# IDs del proyecto, no son credenciales. El login sale de `vercel login`.
export VERCEL_ORG_ID=team_nsq0cjSdqQkaMQ1vNm5ch9yj
export VERCEL_PROJECT_ID=prj_vh1qzlxyvFeLTyUSza8bQ06cDY5R
vercel() { npx --yes vercel@65.10.0 "$@"; }

smoke() {
  local path code fail=0
  for path in / /cuidared; do
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
    vercel pull --yes --environment=production
    vercel build --prod
    vercel deploy --prebuilt --prod
    smoke
    ;;
  ci-token)
    # El token no pasa por pantalla ni por el chat: va directo a gh.
    token=$(vercel tokens create "careledger CI $(date +%Y-%m-%d)" --project "$VERCEL_PROJECT_ID" --json | python3 -c '
import json, sys
def find(o):
    if isinstance(o, dict):
        for k, v in o.items():
            if isinstance(v, str) and "token" in k.lower() and len(v) > 20:
                return v
            r = find(v)
            if r:
                return r
    if isinstance(o, list):
        for v in o:
            r = find(v)
            if r:
                return r
    return ""
print(find(json.load(sys.stdin)))
')
    [ -n "$token" ] || { echo "Vercel no devolvió token; el secret no se tocó." >&2; exit 1; }
    printf %s "$token" | gh secret set VERCEL_TOKEN --repo "$REPO"
    unset token
    run=$(gh run list --repo "$REPO" --branch main --limit 1 --json databaseId --jq '.[0].databaseId')
    gh run rerun "$run" --repo "$REPO" --failed && echo "VERCEL_TOKEN guardado. Reintentando deploy en la corrida $run."
    ;;
  *)
    sed -n '2,8p' "$0" >&2
    exit 2
    ;;
esac
