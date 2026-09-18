# Global Dependency Network

## Purpose

The Global Dependency Network is a cross-cutting analytical tool of Marginal Thinking. It connects evidenced relationships between resources, routes, infrastructure, productive capacity, technology, institutions and capital. It is not a fifth research program and it does not alter the frozen editorial taxonomy.

Its unit of analysis is the **relationship**, not the node. A node can be important without being a dependency; a relationship enters the public network only when published research establishes a defensible mechanism connecting two nodes.

## Canonical files

- `data/global-dependencies.json` — current public state of nodes and dependencies.
- `data/global-dependency-history.json` — append-only history of material changes.
- `scripts/validate-global-dependencies.mjs` — schema, research-link and history validation.
- `scripts/render-global-dependencies.mjs` — deterministic static rendering.
- `/dependencies/` — current network.
- `/dependencies/history/` — chronological change record.

The network is rendered statically at build time. No force-directed runtime library, external graph API or client-side layout engine is required.

## Evidence contract

Every dependency must declare a stable ID, source and target nodes, relation type, bilingual mechanism, criticality, substitutability, confidence, horizon, last verification date and one or more canonical Marginal Thinking research IDs.

The canonical research bundle remains the evidence carrier and contains the underlying external citations. The graph is a derived intelligence layer and must not become an uncited parallel research product.

## Interpretation

**Criticality** describes how materially the relationship can affect the target mechanism if disrupted or constrained.

**Substitutability** describes the availability of credible alternatives on the stated horizon. It is qualitative and must not be converted into a false numerical score.

The network does not measure physical flow magnitude, ownership share or probability unless a separate report explicitly establishes those quantities. An edge means that a mechanism is supported, not that the relationship is exclusive.

Absence from the network does not imply absence of dependency. Coverage expands only when research supports the relationship.

## Current state and history

Current state and change history are separate by design. A material update to an edge requires a history event in the same change when relation type, mechanism, criticality, substitutability, interpretive confidence or retirement changes.

Event types are `baseline`, `edge_added`, `evidence_update`, `mechanism_change`, `criticality_change`, `substitutability_change`, `edge_retired` and `correction`.

History is append-only. Corrections reference the superseded event rather than silently deleting it.

## Visual architecture

The public network uses a deterministic layered layout. Groups organize relationships into coherent systems; layers place upstream constraints and enabling capabilities to the left and downstream transmission or outcomes to the right; curved SVG edges show direction; line weight distinguishes high criticality without numerical scoring; clicking a node isolates immediate neighbors; clicking a dependency opens its mechanism, evidence, horizon and history; and the relation index preserves readability on small screens.

This deterministic layout keeps Git diffs, screenshots and historical comparisons stable across builds.

## Home preview

The homepage preview uses only edges explicitly marked `home_preview:true`. It is a compressed view of the current network, not a separate dataset. The preview links to the canonical network page and never introduces unvalidated relationships.

## Update discipline

A future producer updating the network should start from canonical public research bundles, identify only relationships that materially improve cross-research understanding, revalidate time-sensitive facts externally in the research product before changing the graph, update the current edge and append history atomically, run the validator, and never create a taxonomy program, topic or navigation vertical from a graph cluster.

The network should remain selective. Its value comes from tracing mechanisms and substitutions, not from maximizing node count.
