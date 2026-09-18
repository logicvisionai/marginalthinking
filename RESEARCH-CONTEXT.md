# Marginal Thinking — Dynamic Research Context

**Status:** additive internal research-memory layer  
**Version:** 1.2  
**Effective date:** 2026-09-17

## 1. Purpose

`research-context/` is a non-public, Markdown-based memory layer for cumulative research. Its purpose is to let new Marginal Thinking research begin from verified prior understanding instead of reconstructing the same political, historical, economic, social and relational background on every run.

This layer does **not** change the frozen editorial architecture in `EDITORIAL-ARCHITECTURE.md`, the controlled taxonomy in `data/taxonomy.json`, the v2 publication contract, QA, public URLs, navigation or the Cloudflare build.

The memory layer is **fully demand-driven**. It has no predefined list of countries, institutions, technologies, commodities, relations, historical processes or themes that must receive a briefing.

The intended loop is:

```text
canonical published research
        ↓
extract candidate durable knowledge
        ↓
decide whether memory would reduce future research cost
        ↓
create / update / merge / retire briefing when useful
        ↓
future research retrieves only relevant briefings
        ↓
current external verification
        ↓
new canonical research
```

## 2. Context is memory, not evidence

Research-context files are internal orientation material. They may identify relevant history, relationships, constraints, prior findings, unresolved questions and useful primary sources.

They are **not citable authority for a public claim**. A producer must re-check material facts against current external sources before using them in a new publication, especially data, officeholders, laws, policy, market conditions, conflicts, sanctions, projects, financing, capacities and other time-sensitive claims.

A context briefing may tell a producer *what to verify, what changed before and why it matters*, but it may not replace verification.

## 3. Storage: one dynamic briefing pool

Canonical context lives in a single generic pool:

```text
research-context/
├── README.md
├── _template.md
└── briefings/
    └── <dynamic-slug>.md
```

Do not create permanent category directories such as `countries/`, `themes/`, `institutions/`, `technologies/` or `relations/`. The analytical object is described inside the Markdown itself and may evolve over time.

A briefing may represent whatever the research actually requires: a country, region, institution, bilateral relationship, corridor, production system, technology, commodity chain, historical process, policy regime, reserve system, social transformation or another durable object.

English is the canonical internal language to avoid duplicated maintenance. Public EN/PT-BR publication requirements remain unchanged.

## 4. Dynamic discovery — no fixed coverage list

The maintenance phase must discover briefing candidates from the canonical corpus and newly published research. It must **not** start from a hard-coded queue of countries, themes or entities.

Candidate discovery should use available signals such as:

- canonical metadata: program, dimensions, geography, topics, phenomena, series, tags and keywords;
- repeated entities or mechanisms across research;
- cross-report relationships that explain transmission;
- historical anchors repeatedly required to explain current developments;
- unresolved questions that recur across publications;
- costly background research that would otherwise be reconstructed repeatedly.

There is no fixed minimum article count and no fixed whitelist. A candidate deserves a briefing when maintaining it has clear expected research value.

The decision is qualitative and should consider:

- recurrence or expected recurrence;
- durability of the structure or relationship;
- cross-program reuse;
- causal importance to Economy · Politics · Society;
- cost saved in future research;
- quality and traceability of supporting evidence;
- whether the object is better represented inside an existing briefing instead of creating another file.

If no candidate has sufficient utility, create nothing.

## 5. Dynamic lifecycle

The system may perform any of these actions when evidence and reuse justify them:

- **create** a new briefing;
- **update** an existing briefing with a durable delta;
- **merge** overlapping briefings when separation no longer adds value;
- **split** an overloaded briefing when distinct mechanisms become independently reusable;
- **rename** a briefing when its analytical scope changes, preserving Git history;
- **retire/delete** a briefing that has become redundant or misleading, because Git preserves its history.

No briefing is permanent merely because it exists.

## 6. Analytical structure is adaptive

A briefing should remain compact and include only sections that materially help future research. Common sections may include:

- `Structural assessment`
- `Historical anchors`
- `Political and institutional structure`
- `Economic and production structure`
- `Society, labour and demography`
- `Relationships`
- `Dependencies and constraints`
- `Structural changes in progress`
- `What changed since last review`
- `Open questions`
- `Related Marginal Thinking research`
- `Sources and verification notes`

These headings are guidance, not a rigid schema. Omit irrelevant sections and add a concise section when a research object genuinely requires it.

History must be selective: include historical material only when it explains a present mechanism, constraint, dependency, institution, relationship or trajectory.

### 6.1 Material-dimension coverage check

Before a maintenance pass concludes that a new or updated briefing is sufficient, compare the canonical publication's `dimensions`, `phenomena`, geography, topics and core mechanisms with the context being retained. This is a **coverage check, not a requirement to create one section per dimension**.

For every materially implicated dimension, ask explicitly:

- **History:** is there a dated turning point, inherited institution, past conflict, policy regime, infrastructure decision, alliance, crisis or path dependency without which the current mechanism is easy to misread?
- **Politics and institutions:** which states, agencies, firms, coalitions, alliances, legal arrangements, fiscal structures, security relationships or institutional constraints shape who can act and what they can do?
- **Society, labour and demography:** when material, how do households, labour markets, migration, demographic structure, distributional effects, legitimacy, urbanization, education or social organization affect — or receive transmission from — the mechanism?
- **Economy and production:** which stocks, flows, productive capabilities, ownership structures, infrastructure, financing channels, resource dependencies or capacity constraints are durable enough to reuse?
- **Relationships:** which bilateral, regional, security, trade, capital, technology or infrastructure relationships materially alter the mechanism or constrain substitution?

A publication tagged with `politics`, conflict/security phenomena or institutional topics must therefore trigger an explicit check for reusable political, institutional and historical context. A publication tagged with `society`, demographic/social phenomena or labour topics must trigger an explicit check for reusable social, labour and demographic context. The maintenance pass may still record no delta if none is durable or useful, but it must not default silently to economic/market context simply because that is easier to extract.

The goal is **transversal intelligence**: context should help a future producer understand why a current event has the effect it does, which relationships and institutions condition that effect, how the mechanism evolved, and where social or political feedback can change the trajectory.

Do not add generic background merely to satisfy this check. If a historical, political or social fact does not change interpretation, mechanism, constraint, comparison or a future research question, omit it.

## 7. Update rule

Update context incrementally. Do not rewrite an entire briefing because a new article was published.

A maintenance pass should ask:

1. What durable fact, relationship or mechanism became better established?
2. What changed materially?
3. What remained structurally unchanged despite new events?
4. Which open question was resolved, weakened or became more important?
5. Which prior statement became stale and needs re-verification or qualification?
6. Did the new evidence reveal a candidate briefing that would materially reduce future research work?
7. Did it reveal that two existing briefings should be merged or one should be split?
8. Did the material-dimension coverage check reveal historical, political/institutional, social/demographic or relational context that is necessary to avoid an economically narrow future reading?

If there is no durable delta, make no context commit.

## 8. Relationship intelligence without a graph database

Relationships should be recorded only when they help explain a mechanism. They may live inside any relevant briefing or, if the relationship itself becomes a recurring analytical object, receive their own dynamically created briefing.

Examples include trade dependence, security cooperation, capital exposure, resource dependence, infrastructure linkage, institutional constraint, technology dependence or social transmission.

Do not introduce a graph database, vector database or separate backend. If structured relationship views become useful later, the static build may derive them from Markdown and canonical publication metadata.

## 9. Producer retrieval

Before researching a topic, a producer should:

1. read this document;
2. derive the research subject from the planned publication rather than from a fixed context list;
3. search `research-context/briefings/` for context that overlaps the intended entities, mechanisms, relations, geography, topics, tags or keywords;
4. read only the few briefings with clear relevance;
5. use them to identify prior findings, historical anchors, political/institutional structure, social/demographic context when material, relationships, open questions and likely sources;
6. verify current claims externally;
7. perform the normal research, bilingual staging and v2 pending workflow.

The producer must not update `research-context/` as part of its article staging transaction.

If no relevant briefing exists, research proceeds normally. Missing context must never block publication and must not force creation of a briefing before the article can proceed.

## 10. Maintenance phase boundaries

Context maintenance may run as a dedicated automation or as an isolated best-effort phase after the publisher has completed a successful public commit. In the current scheduling model it is a separate post-publication Git transaction, not part of the publication transaction itself.

The maintenance phase may create, move, merge, update or delete only `research-context/**` files.

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

A context failure must never roll back, mutate or invalidate a successful publication. A later maintenance pass may catch up.

## 11. Efficiency rules

The context layer must reduce work, not become another maintenance burden.

- Start from newly published metadata and known changed IDs rather than scanning every Markdown file in every run.
- Open full report text only when metadata indicates a plausible durable delta.
- Search existing briefings before creating a new one.
- Prefer enriching an existing briefing over creating a near-duplicate.
- Do not attempt complete global coverage.
- Do not create a briefing merely because an entity appears in one article.
- Do not maintain current market snapshots or ephemeral event summaries as durable context.
- Keep briefings compact enough to be cheap for future agents to read.
- Use Git history instead of embedding a long changelog when old detail no longer helps future research.
- Run the material-dimension coverage check before concluding maintenance on a politically, socially or historically consequential object.

## 12. Concurrency and Git

Context work begins only after the relevant public publication commit is complete. It uses a separate commit containing only context changes.

Before writing, re-read `main`. Prefer a single atomic commit containing only context changes. Never force-update `main`. If `main` advances during the operation, rebuild the context delta against the new HEAD.

Suggested commit prefix:

```text
context: update dynamic research memory YYYY-MM-DDTHHMM
```

## 13. Quality guardrails

- Do not convert interpretation into fact.
- Distinguish durable structure from current condition.
- Preserve uncertainty and contrary evidence when material.
- Do not infer motives for political actors as fact.
- Do not use context to create political rankings, endorsements or electoral recommendations.
- Do not let an old context statement override newer primary evidence.
- Avoid false precision in relationship strength or confidence.
- Prefer dated turning points and explicit mechanisms over generic historical narrative.
- Keep sources sufficiently specific that a future producer can re-open and verify them.
- Do not let context default to market/economic structure when the canonical research materially implicates political, historical or social mechanisms.

## 13.1 Technology signal ledger is not research context

`data/technology-signals.json` is a separate short-horizon operational ledger governed by `TECHNOLOGY-SIGNALS.md`. It tracks candidates that may strengthen, weaken or disappear before they deserve public research.

Do not copy candidate signals into `research-context/**` merely because they are being monitored. Durable technological context should enter the normal context-maintenance loop only after canonical published research or other sufficiently established evidence creates reusable structural knowledge.

The separation is intentional:

- technology signal ledger = what may be changing and deserves another look;
- research context = what has become durable enough to reduce future research cost;
- public research = externally verified, bilingual, QA-approved analysis.

Both internal layers remain orientation rather than evidence.

## 14. Public exposure

This layer remains internal only. `research-context/` is not copied by `scripts/cloudflare-build.sh` and should not receive public routes, navigation items or search indexing.

Public historical timelines, relationship maps or context panels may be considered later only if enough high-quality context emerges organically to justify deterministic build-time derivation.
