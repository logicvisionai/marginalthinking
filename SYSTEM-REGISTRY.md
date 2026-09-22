# Marginal Thinking — Research System Registry & Reconciliation

**Status:** normative operational standard  
**Version:** 1.0  
**Effective:** 2026-09-22

## Purpose

Every editorial line, cumulative analytical tool, dataset and structured-access layer must exist in one canonical registry. A feature is not considered part of Marginal Thinking merely because a page or script exists somewhere in the repository. It must be registered, have source files, a public route when applicable, an update mode and a reconciliation rule.

The objective is to prevent silent abandonment: new research may not enter the public corpus without a recorded reconciliation pass against every active cumulative system marked as reconciliation-required.

## Canonical files

- `data/system-registry.json` — permanent inventory.
- `data/reconciliation-ledger.json` — append-only operational decisions.
- `scripts/validate-system-registry.mjs` — build invariant.
- `scripts/render-system-status.mjs` — public freshness/status surface.
- `/system-status/` — human-readable status.
- `/data/research-system-status.json` — generated machine-readable status.

## Reconciliation rule

For every public report dated on or after the enforcement date, the latest reconciliation run must name the report ID. The same run must contain a decision for every active registry asset with `reconciliation_required: true`.

Allowed decisions:
- `updated` — canonical data changed;
- `verified_no_change` — reviewed, no material canonical change warranted;
- `not_applicable` — the publication does not materially bear on the system;
- `deferred_evidence_gap` — a candidate relation exists but evidence is insufficient and the reason is recorded.

Freshness and modification are separate. A tool can be freshly reconciled even when its canonical dataset did not change.

## Removal and retirement

A registered public asset may be retired only by an editorial change that records the reason, replacement where applicable, and route/redirect treatment. Deleting an unregistered implementation is not a substitute for retirement.
