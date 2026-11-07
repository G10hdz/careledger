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

Specification and contracts stage. `packages/domain` already ships the points,
consensus and SROI math with golden tests; the apps under `apps/` are built
against these specs. Reference screens exported from the prototype live in
`design/stitch/`.

## Layout

See `README.md` (Spanish) — structure is identical. Entry points:
`specs/` (source of truth), `packages/domain`, `packages/design-tokens`,
`explainer.html` (single-file project overview).

## Quick start

Requires Node 22+, pnpm 9+.

```bash
pnpm install
pnpm -r test
pnpm -r typecheck
```

## License

[MIT](LICENSE)
