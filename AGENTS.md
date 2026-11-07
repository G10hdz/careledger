# Agentes en este repo

La spec manda. El código que no esté en `specs/` no se inventa.

## Trabajo en paralelo

Una sesión, un worktree. No se cambia de rama en la carpeta de otra persona.

```bash
~/agent-configs/scripts/wt.sh new <nombre> feature/<nombre>
```

Cada cambio entra por PR a `main`. Se empuja la rama al terminar el commit.
`main` se queda para pull. Ramas: `feature/`, `fix/`, `chore/`.

## Territorios (un agente por territorio a la vez)

| Agente | Dueño de | Spec |
| --- | --- | --- |
| pwa | `apps/pwa` | `01`, `03`, `08` |
| oráculo | `packages/domain` | `02` |
| gobierno | `apps/gobierno` | `04` |
| comercios | `apps/comercios` | `05` |
| landing | `apps/landing` | `06` |
| servicios | `apps/servicios` | `07` |

`packages/domain` y `packages/design-tokens` son contratos compartidos: se
extienden, no se reescriben. Cambio de fórmulas (puntos, SROI) → PR propio con
ADR. La raíz (`package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`)
solo la toca quien integra.

## Qué se construye

EntreManos: infra cívica que certifica horas de cuidado informal y las vuelve
Puntos Cívicos canjeables (luz, transporte, relevo). PWA mobile-first,
offline-first. El dispositivo objetivo es un Android de entrada con datos
intermitentes. Si una pantalla exige muchos clics, está mal: la cuidadora
opera agotada y a una mano.

Naming: copy ciudadano dice "Puntos Cívicos". `$CARE` solo vive como nombre
interno en `packages/domain` y pantallas legacy de `design/stitch/`.

## Privacidad (no negociable)

Nunca se suben nombres de pacientes, diagnósticos ni fotos. La atestación
transporta duración, categoría, tipos de apoyo y firmas. La geolocalización es
prueba de proximidad agregada, no tracking.

## Comandos

```bash
pnpm install
pnpm -r test          # tests de packages/*
pnpm -r typecheck
pnpm --filter <app> dev   # dev server en el puerto de .wt-port
```

## No va en git

`.env*`, datos reales de personas (nombres, direcciones, folios reales),
credenciales SPEI, llaves privadas de firmado.
