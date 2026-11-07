# CareLedger — Civic Care Network

**[Español](README.md)** · Specs and monorepo for civic infrastructure that
certifies informal care hours and turns them into **Civic Points** redeemable
for real benefits: electricity subsidies, public transit, certified respite
hours and neighborhood merchants.

> "When you care, you neglect yourself." The platform exists so that caring
> does not cost caregivers their health: points are also earned for self-care.

The caregiver — the "sandwich generation", ~38, mostly women — logs a shift in
under 60 seconds, fully offline. A neighborhood oracle validates it 3-of-3
(caregiver + beneficiary + community verifier) and points are issued, backed
by municipal budget lines. Every public dollar returns ~3.42x in measurable
social value (SROI).

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/flow-dark.svg">
  <img alt="Flow: the PWA logs care offline, the neighborhood oracle validates 3-of-3, the municipal ledger issues points, and the caregiver redeems benefits; merchants settle via SPEI" src="docs/assets/flow-light.svg" width="560">
</picture>

## Project status

Working monorepo with all six surfaces implemented as a demo: the PWA logs
and redeems offline, the merchant terminal verifies the Ed25519-signed voucher
and charges it, the government panel computes SROI, and the services
marketplace covers the full request lifecycle. `packages/domain` holds the
shared math (points, consensus, SROI, catalog). Reference screens exported
from the prototype live in `design/stitch/`.

Live demos:

- Explainer: <https://g10hdz.github.io/careledger/>
- CuidaRed (time-bank prototype, spec 09):
  <https://g10hdz.github.io/careledger/cuidared/>

## Layout

See `README.md` (Spanish) — structure is identical. Entry points:
`specs/` (source of truth), `packages/domain`, `packages/design-tokens`,
`docs/explainer.html` (single-file project overview, also on GitHub Pages).

## Quick start

Requires Node 22+, pnpm 9+.

```bash
pnpm install
pnpm -r test
pnpm -r typecheck
```

## License

[MIT](LICENSE)
