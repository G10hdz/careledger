# apps/

Un territorio por app, un agente por territorio (ver `../AGENTS.md`).
Cada agente crea su app dentro de su worktree; no tocar la raíz.

| Dir | Superficie | Specs | Puerto |
| --- | --- | --- | --- |
| `pwa/` | App de la cuidadora (offline-first) | `01`, `02`, `03` | `.wt-port` del worktree |
| `gobierno/` | Panel SROI + simulador + libro mayor | `04` | `.wt-port` |
| `comercios/` | Terminal de cobro + liquidación SPEI | `05` | `.wt-port` |
| `landing/` | Sitio público e infografía | `06` | `.wt-port` |
