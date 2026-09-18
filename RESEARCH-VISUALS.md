# Marginal Thinking — Research Visual Evidence Standard

**Status:** normative publishing standard  
**Version:** 1.0  
**Effective for new or materially revised research:** 2026-09-18

## Purpose

Visual evidence is part of the analytical product, not decoration. Charts, tables, causal diagrams, maps and mind maps must reduce cognitive load, expose comparisons or make a transmission mechanism easier to audit.

The canonical source remains Markdown. Visuals must therefore use the deterministic grammar already rendered by `scripts/lib/markdown.mjs`; no report may depend on a binary chart, screenshot, external dashboard or client-side visualization service to satisfy this standard.

## Supported deterministic grammar

Research Markdown may use:

- ordinary Markdown tables for auditable structured evidence;
- `chart` fences for bar or line charts;
- `flow` fences for causal or transmission chains;
- `mindmap` fences for structured systems, dependencies or analytical branches;
- `map` fences for geographic exposure and regional transmission cards;
- `diagram`, `text` or `ascii` fences for other deterministic dependency diagrams.

The renderer may also derive a chart from a compatible table, but automatic derivation is an enhancement only. It does not satisfy the explicit-chart gate because producers must make an intentional visual choice.

## Minimum visual budget

For research dated on or after 2026-09-18:

- `brief`: at least 1 table, 1 explicit chart and 1 structural visual (`flow`, `mindmap`, `map` or diagram), at least 3 visuals total;
- `monitor`, `assessment`, `research-report` and `country-dossier`: at least 1 table, 1 explicit chart, 1 structural visual, and at least 4 visuals total;
- `data-note`: at least 1 table or explicit chart; structural visuals are optional.

These are floors, not targets. A report should not add weak graphics merely to increase the count.

A geographic map is required by editorial judgment when spatial distribution, corridor exposure, regional transmission or country-to-country dependence is central and a map is clearer than prose. A mind map is appropriate for multi-branch systems, institutional relationships, industrial chains and second-order effects. Neither is mechanically mandatory in every article.

## Evidence rules

1. Every quantitative visual must be reproducible from claims or source data used in the report.
2. Never invent a value to complete a series, interpolate an unpublished observation, convert a range to a midpoint without saying so, or turn a scenario into an observed value.
3. Titles and units must make the comparison unambiguous. If categories are not additive, say so.
4. A chart must not compare quantities with incompatible units or definitions merely because they fit on one axis.
5. Tables should expose period, unit, status or confidence when those distinctions prevent misreading.
6. Structural visuals must encode a mechanism actually defended in the prose. Arrows imply a relationship that the report must explain.
7. Maps must represent exposure, flow, location, corridor or regional mechanism; they must not imply geographic precision that the source does not provide.
8. Visuals need enough surrounding prose to state what the reader should notice and what the visual does not establish.
9. EN and PT-BR editions must contain the same visual evidence, with semantically equivalent labels, values and units. Locale formatting may differ.
10. Visuals must remain legible on mobile and must not require horizontal page overflow beyond the existing responsive table container.

## Authoring examples

Chart:

~~~markdown
```chart
type: line
title: Solar and wind share of global electricity generation
unit: %
2026 | 17
2030 | 27
```
~~~

Causal chain:

~~~markdown
```flow
Shipping disruption → freight and insurance costs → landed energy prices → inflation and fiscal response → household real income
```
~~~

Mind map:

~~~markdown
```mindmap
Grid constraint
- Physical capacity
  - transmission
  - transformers
- Utilisation
  - queue design
  - dynamic line rating
- Capital
  - regulated returns
  - financing cost
```
~~~

Regional map:

~~~markdown
```map
title: Regional transmission of the shock
Europe | Import-cost relief | Lower crude changes transport margins
Gulf | Fiscal and logistics exposure | Export routes and insurance remain material
Asia | Dollar-rate transmission | Effects differ by currency regime and domestic demand
```
~~~

## Producer gate

Before writing the pending sidecar, the producer must perform a visual-evidence pass:

1. identify the comparisons, distributions and causal mechanisms that benefit from visual treatment;
2. build the smallest set of visuals that materially improves comprehension;
3. verify every value and unit against the report evidence;
4. ensure EN/PT-BR visual parity;
5. run the repository validation rules;
6. only then mark the item `ready:true`.

The visual pass must not change a factual conclusion merely to make a chart possible.

## QA gate

QA treats visual readiness as publication readiness. It must reject an effective-date item when:

- the minimum visual budget is not met;
- a chart or table is materially misleading;
- EN and PT-BR visual evidence diverges;
- an arrow, map or mind map asserts a mechanism not supported by the analysis;
- a visual uses fabricated, silently transformed or dimensionally incompatible data;
- the report is technically compliant but visually redundant or decorative.

Approvals should record `checks.visual_evidence_readiness` with the result and material limitations.

## Publishing and maintenance

The publisher preserves approved Markdown visual blocks verbatim. Rendering remains deterministic and build-time only.

For pre-standard research, visual backfills may be made as editorial maintenance when they are derived strictly from already-published facts and do not alter the report's substantive claims. Any factual change must use the normal revision + QA path.


## Analytical microvisuals on collection and home surfaces

Small visuals used on the home page, collection cards or analytical-system previews are governed by the same evidence principle as report visuals: they must encode a stable analytical structure or a property derived from canonical data. Decorative scatter points, arbitrary orbital motifs and unlabeled abstract geometry are prohibited when they can be mistaken for data.

The preferred patterns are:

- **Technology signals:** a maturity or capability path derived from the canonical signal state, with the current evidence stage and an actual recorded constraint. The visual must not imply that maturity is a quantitative score.
- **Country context:** a fixed structural frame connecting politics, economy, society and external relations. Active dimensions may be derived from canonical context metadata; when no dossier is selected, the frame represents the dimensions of the system rather than a measured country profile.
- **Dependency networks:** a reduced graph using real nodes and validated edges from the canonical dependency dataset.
- **Structural opportunities:** geographic or matrix previews derived from the canonical Atlas state.
- **Capital or wealth flow:** directional flow only when the underlying research establishes the direction being shown.

Microvisuals are generated at build time from existing canonical data whenever possible. A preview must not maintain a second factual dataset merely for presentation.

Visual state must remain deterministic across builds, responsive on small screens and semantically equivalent in EN and PT-BR. Accent colour identifies the analytically relevant state or constraint; it must not be scattered decoratively.
