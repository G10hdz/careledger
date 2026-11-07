# apps/

Un territorio por app, un agente por territorio (ver `../AGENTS.md`).
Cada agente crea su app dentro de su worktree; no tocar la raíz.

| Dir | Superficie | Specs | Puerto |
| --- | --- | --- | --- |
| `pwa/` | App de la cuidadora (offline-first) + formación | `01`, `02`, `03`, `08` | `.wt-port` del worktree |
| `gobierno/` | Panel SROI + simulador + libro mayor | `04` | `.wt-port` |
| `comercios/` | Terminal de cobro + liquidación SPEI | `05` | `.wt-port` |
| `landing/` | Sitio público e infografía | `06` | `.wt-port` |
| `servicios/` | Marketplace de servicios por zona/presupuesto | `07` | `.wt-port` |
| `cuidared/` | Banco de tiempo hora por hora (segunda economía) | `09` | `.wt-port` |
