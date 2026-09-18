# Structural Opportunity Atlas

## Purpose

The Structural Opportunity Atlas is a cross-cutting analytical layer of Marginal Thinking. It tracks structural conditions that change costs, access, productive capacity, competitive structure or the ability of an actor to capture value. It is not a fifth research program and does not alter the four-program editorial architecture.

The unit of analysis is a specific structural condition observed from an explicit actor, activity or business-model perspective. The Atlas does not score countries.

## Structural states

1. **Blocking inefficiency** — a structural deficiency currently destroys, delays or materially constrains value creation. The existence of the deficiency does not imply that its solution is economically accessible.
2. **Exploitable inefficiency** — a measurable structural gap has a plausible and accessible mechanism through which an actor can capture value by reducing, substituting or working around the constraint.
3. **Blocking efficiency** — an efficient incumbent system, market design or infrastructure compresses margins, removes arbitrage or raises the hurdle for a particular entrant or business model.
4. **Leverageable efficiency** — an existing efficient capability can be reused as infrastructure or productive leverage by another actor.

The same structural feature can occupy different states for different perspectives. Every entry therefore requires an explicit perspective.

## Analytical chain

Every public entry must make the following chain legible:

**structural condition → mechanism → affected actor/activity → economic implication → catalyst or constraint → evidence → confidence**

When a state may be changing, the Atlas also records a transition watch:

**current state → candidate state → observable trigger → invalidation condition**

## Current state and historical record

The Atlas deliberately separates the current snapshot from its change history.

- `data/structural-opportunities.json` is the compact canonical snapshot of active conditions.
- `data/structural-opportunity-history.json` is the append-only record of material changes.
- The public Atlas shows the current state.
- `/opportunities/history/` exposes the chronological record without duplicating the current dataset.

A material update must not silently overwrite its predecessor. Reclassification, material mechanism change, evidence revision or correction requires a history event in the same update that changes the current snapshot.

History events preserve the contemporaneous country and feature labels, state when applicable, summary and source snapshot. This allows an entry to be traced even if its current wording, evidence or classification later changes.

### History event types

- `baseline` — first traceable public inclusion of a condition.
- `evidence_update` — material evidence changed without changing the structural mechanism.
- `state_change` — the structural classification changed.
- `material_update` — mechanism, economic implication or constraints changed materially.
- `correction` — a prior historical record required correction; the correcting event references the superseded event.

## Update transaction

For a validated material change:

1. revalidate the relevant evidence;
2. determine whether the current state, mechanism, implication, constraints or confidence changed materially;
3. append the corresponding history event;
4. update the current snapshot only when required;
5. validate both files together;
6. render the current Atlas and history archive from those canonical files.

Candidate signals that do not alter the structural record remain outside the public Atlas.

## Evidence standard

A public entry requires evidence sufficiently close to the claim. Primary and official sources are preferred for infrastructure, regulation, system statistics and public programmes. Secondary sources may provide context but should not carry a material claim when primary evidence is available.

Each active entry requires an explicit perspective, structural state, mechanism, economic implication, material constraints or contrary evidence, catalysts where applicable, horizon, confidence, last verification date, and public sources with source dates.

Do not convert qualitative uncertainty into a false 0–100 precision score.

## Review cadence

**Signal detection** monitors material changes in infrastructure, regulation, capacity, market design, technology deployment, capital access, logistics, energy, labour, trade and institutions.

**Validation** determines whether new evidence changes the canonical condition, transition path or confidence.

**Reassessment** tests whether accumulated evidence requires structural reclassification, whether an accessible gap has closed, or whether an efficiency has matured into leverage or a barrier.

## Publication discipline

The Atlas is an analytical discovery system, not an investment recommendation, country ranking or forecast of returns. The four states are relational descriptions of mechanisms, not moral judgments about countries or institutions.

Absence of evidence is preferable to synthetic symmetry. No state is published merely to fill a category.
