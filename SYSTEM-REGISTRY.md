# Marginal Thinking — Research System Registry & Reconciliation

**Status:** normative operational standard  
**Version:** 1.1  
**Effective:** 2026-09-22  
**Operational review:** 2026-10-07

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

## Editorial-line coverage

The registry is the operational inventory of publication kinds already used by the canonical corpus. It does not create new research programs or alter the frozen taxonomy. Every public report dated on or after the enforcement date must map to a registered `editorial-line` by `kind`.

Recurring operating modes are:

- `daily-event-driven`;
- `weekly-event-driven`;
- `monthly-event-driven`;
- `annual-event-driven`;
- `event-driven` when no elapsed-time SLA is appropriate.

A line without an SLA is not stale merely because time passed. It is event-driven and becomes actionable when evidence, an explicit editorial decision or a publication dependency creates a new research need.

## Freshness semantics

The public status surface deliberately separates four clocks:

1. **latest publication/activity** — the newest canonical report for a line, program or series;
2. **latest reconciliation** — the newest append-only review against cumulative tools;
3. **dataset modified** — the date on which canonical structured data actually changed;
4. **SLA age** — elapsed time since the activity that governs a scheduled line or tool.

A cumulative tool may therefore be current even when its dataset has not changed recently. `verified_no_change` is a valid fresh review result; changing `updated_at` merely to make a dataset look recent is prohibited.

When multiple reconciliation runs share the same timestamp, the later append in `data/reconciliation-ledger.json` is authoritative. Reconciliation ordering is therefore timestamp-first and append-order-second.

## Pipeline visibility

`/system-status/` and `/data/research-system-status.json` expose Git-derived counts for public bundles, the backward-compatible report index, pending records, approvals, rejection history, pending unpublished work and approved unpublished work.

The source `data/reports.json` remains a backward-compatible index rather than the canonical corpus, but every canonical public bundle must have a matching index entry. Build validation blocks a new silent divergence.

## Registry change control

Adding an operational line for an already-used report kind or registering an already-existing public tool is a registry maintenance change, not a taxonomy expansion. Creating a new program, controlled series, dimension, topic family, phenomenon or publication format still requires the change-control process in `EDITORIAL-ARCHITECTURE.md`.

