# Marginal Thinking — Research Context

**Status:** additive internal research-memory layer  
**Version:** 1.0  
**Effective date:** 2026-09-16

## 1. Purpose

`research-context/` is a non-public, Markdown-based memory layer for cumulative research. It exists to help future Marginal Thinking research begin from verified prior understanding instead of repeatedly reconstructing the same political, historical, economic and social background.

This layer does **not** change the frozen editorial architecture in `EDITORIAL-ARCHITECTURE.md`, the controlled taxonomy in `data/taxonomy.json`, the v2 publication contract, QA, public URLs, navigation or the Cloudflare build.

The intended loop is:

```text
published research
      ↓
durable knowledge
      ↓
research-context/*.md
      ↓
future research orientation
      ↓
new external verification
      ↓
new staged research
```

## 2. Context is memory, not evidence

Research-context files are internal orientation material. They may identify relevant history, relationships, constraints, prior findings, unresolved questions and useful primary sources.

They are **not citable authority for a public claim**. A producer must re-check material facts against current external sources before using them in a new publication, especially data, officeholders, laws, policy, market conditions, conflicts, sanctions, projects, financing, capacities and other time-sensitive claims.

A context file may therefore tell a producer *what to verify and why it matters*, but it may not replace verification.

## 3. Storage

Canonical context lives only under:

```text
research-context/
├── countries/
├── regions/          # create only when needed
├── institutions/     # create only when needed
├── themes/
└── _template.md
```

Do not create empty directories merely for symmetry. Git should contain only useful files.

English is the canonical internal language to avoid duplicating maintenance. Public EN/PT-BR publication requirements remain unchanged.

## 4. What deserves a context file

Create a context file when at least one of these is true:

1. the entity or theme appears materially in two or more canonical Marginal Thinking research items;
2. it is a persistent structural object likely to recur across programs, such as a major institution, strategic corridor, reserve system, industrial system or durable geopolitical/economic relationship;
3. maintaining a concise context file would clearly reduce repeated research work.

Do not create context files for one-off mentions, isolated news events, transient market moves, single statistics or entities unlikely to recur.

Context growth must be demand-driven. Coverage completeness is not a goal.

## 5. Required analytical structure

A context file should remain compact and normally use these sections when relevant:

- `Structural assessment`
- `Historical anchors`
- `Political and institutional structure`
- `Economic and production structure`
- `Society, labour and demography`
- `External relationships`
- `Dependencies and constraints`
- `Structural changes in progress`
- `What changed since last review`
- `Open questions`
- `Related Marginal Thinking research`
- `Sources and verification notes`

Not every section is required for every context type. History must be selective: include only historical material that explains a present mechanism, constraint, dependency, institution, relationship or trajectory.

## 6. Update rule

Update context incrementally. Do not rewrite a whole file because a new article was published.

A maintenance pass should ask:

1. What durable fact, relationship or mechanism became better established?
2. What changed materially?
3. What remained structurally unchanged despite new events?
4. Which open question was resolved or became more important?
5. Which prior statement has become stale and needs re-verification or qualification?

If the answer is “nothing material”, make no commit.

Prefer a small high-signal context file over a long encyclopedic dossier.

## 7. Relationship intelligence without a graph database

Relationships should be written explicitly in prose or compact lists inside the relevant context file. Examples include trade dependence, institutional membership, security cooperation, capital exposure, resource dependence, infrastructure linkage or political constraint.

Do not introduce a graph database, vector database or separate backend. If structured relationship views become useful later, the static build may derive them from Markdown and canonical publication metadata.

That later derivation must remain deterministic and must not be required for publication correctness.

## 8. Producer use

Before researching a topic, a producer should:

1. read this document;
2. inspect only the context files clearly relevant to the intended article;
3. use them to identify prior findings, historical anchors, relationships, open questions and likely sources;
4. verify current claims externally;
5. perform the normal research, bilingual staging and v2 pending workflow.

The producer must not update `research-context/` as part of its article publication transaction. Context maintenance is asynchronous and independent.

If no context file exists, research proceeds normally. Missing context must never block publication.

## 9. Maintenance task boundaries

The context-maintenance automation may create and update only `research-context/**`.

It must not alter:

- `reports/**`;
- `staging/**`;
- `data/pending/**`;
- `data/approved/**`;
- `data/rejected/**`;
- `data/reports.json`;
- `data/taxonomy.json`;
- `EDITORIAL-ARCHITECTURE.md`;
- public HTML, navigation, CSS or JavaScript;
- the producer → QA → publisher workflow.

It may read canonical public research and external sources. It should prefer canonical published bundles over staged or pending material.

## 10. Concurrency and Git

Context maintenance is independent of publication and should run after the publisher in the scheduling cycle.

Before writing, re-read `main`. Prefer a single atomic commit containing only context changes. Never force-update `main`. If `main` advances during the operation, rebuild the context delta against the new HEAD.

Suggested commit prefix:

```text
context: update research memory YYYY-MM-DDTHHMM
```

## 11. Quality guardrails

- Do not convert interpretation into fact.
- Distinguish durable structure from current condition.
- Preserve uncertainty and contrary evidence when material.
- Do not infer motives for political actors as fact.
- Do not use context to create political rankings, endorsements or electoral recommendations.
- Do not let an old context statement override newer primary evidence.
- Avoid false precision in relationship strength or confidence.
- Prefer dated turning points and explicit mechanisms over generic historical narrative.
- Keep sources sufficiently specific that a future producer can re-open and verify them.

## 12. Public exposure

Version 1.0 of this layer is internal only. `research-context/` is not copied by `scripts/cloudflare-build.sh` and should not receive public routes, navigation items or search indexing.

Public historical timelines, relationship maps or context panels may be considered later only after enough high-quality context has accumulated to justify deterministic build-time derivation.
