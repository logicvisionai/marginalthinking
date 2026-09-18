# Marginal Thinking — Research Publishing

## Purpose

Marginal Thinking uses a deterministic, QA-gated publishing pipeline. Public research is English-first, bilingual in English and Brazilian Portuguese, written in Markdown and rendered to HTML at build time.

Every publication must comply with:

- [`EDITORIAL-ARCHITECTURE.md`](./EDITORIAL-ARCHITECTURE.md);
- [`data/taxonomy.json`](./data/taxonomy.json);
- [`EDITORIAL-STYLE.md`](./EDITORIAL-STYLE.md);
- [`INSTITUTIONAL-EDITORIAL.md`](./INSTITUTIONAL-EDITORIAL.md);
- [`TECHNOLOGY-SIGNALS.md`](./TECHNOLOGY-SIGNALS.md) for weekly technology-signal research and monthly Strategic Technology Assessments;
- [`CONFLICT-SECURITY-SOCIAL-CHANGE.md`](./CONFLICT-SECURITY-SOCIAL-CHANGE.md) whenever conflict, security or social-change phenomena are materially relevant;
- [`RESEARCH-VISUALS.md`](./RESEARCH-VISUALS.md) for the visual-evidence contract.

The publication invariant is:

> **producer → staged sources → immutable pending sidecar → QA approval tied to exact Git blob SHAs → publisher copies approved sources into the public bundle → build validation → deploy**

No producer or QA task may publish directly.

## Public and non-public trees

Unapproved research lives only under:

```text
staging/research/YYYY/MM/<slug>/
├── en.md
└── pt-BR.md
```

Transactional and QA records live under:

```text
data/pending/<slug>.json
data/approved/<slug>.json
data/rejected/<slug>.json
```

These paths are not copied into the public Cloudflare build.

Only approved research may be copied to:

```text
reports/YYYY/MM/<slug>/
├── metadata.json
├── en.md
└── pt-BR.md
```

`scripts/render-site.mjs` discovers `reports/**/metadata.json` automatically. Therefore the public bundle must not exist before QA approval.

## Internal cumulative research context

Marginal Thinking maintains a non-public Markdown research-memory layer under `research-context/`, governed by [`RESEARCH-CONTEXT.md`](./RESEARCH-CONTEXT.md).

Before external research, a producer must read `RESEARCH-CONTEXT.md` and inspect only the context files clearly relevant to the planned publication. These files may identify prior findings, historical anchors, structural relationships, dependencies, unresolved questions and useful sources.

Research context is **orientation, not evidence**. It must never substitute for current source verification. Any material fact reused in public research — especially data, laws, officeholders, projects, financing, market conditions, conflicts, sanctions, capacities or other time-sensitive claims — must be checked against suitable external sources under the normal research standard.

The producer must treat context as read-only. It must not create or update `research-context/**` as part of the staging transaction. Context maintenance is asynchronous and independent of production, QA and publication correctness.

Missing, stale or incomplete context must never block a report. If no useful context exists, the producer proceeds with ordinary research.

`research-context/` is not part of the public bundle, does not alter the controlled taxonomy, does not receive public routes in version 1.0 and must not become a dependency of build or publication correctness.

## Stage 1 — Producer

The producer writes both staged Markdown editions and performs its source, language and methodological checks. It then writes the pending sidecar **last**.

### Visual-evidence pass

For new or materially revised research governed by the effective date in `RESEARCH-VISUALS.md`, the producer must complete the visual-evidence pass before writing the pending sidecar. The staged EN and PT-BR Markdown must satisfy the minimum visual budget, use the deterministic Markdown visual grammar, preserve semantic parity and contain only visualizations reproducible from the report evidence. Visuals are analytical evidence and structure, not decoration.

New pending items use `schema_version: 2` and the schema in [`data/schemas/research-pending-v2.json`](./data/schemas/research-pending-v2.json).

Canonical shape:

```json
{
  "schema_version": 2,
  "ready": true,
  "id": "MT-GM-2026-09-17",
  "slug": "2026-09-17-global-macro",
  "date": "2026-09-17",
  "published_at": "2026-09-17T08:00:00-03:00",
  "kind": "daily-global-macro",
  "priority": 10,
  "source_locale": "en",
  "sources": {
    "en": {
      "markdown": "staging/research/2026/09/2026-09-17-global-macro/en.md",
      "title": "...",
      "deck": "...",
      "tags": [],
      "keywords": [],
      "regime": "...",
      "key_risk": "...",
      "watch": [],
      "search_text": "..."
    },
    "pt-BR": {
      "markdown": "staging/research/2026/09/2026-09-17-global-macro/pt-BR.md",
      "title": "...",
      "deck": "...",
      "tags": [],
      "keywords": [],
      "regime": "...",
      "key_risk": "...",
      "watch": [],
      "search_text": "..."
    }
  },
  "taxonomy_version": "1.0",
  "program": "political-economy-markets",
  "related_programs": ["global-system-power"],
  "dimensions": ["economy", "politics"],
  "geography": {
    "level": "global",
    "regions": [],
    "subregions": [],
    "countries": []
  },
  "topics": ["macroeconomics", "capital-markets"],
  "phenomena": [],
  "format": "brief",
  "cadence": "daily"
}
```

`phenomena` is a controlled cross-cutting classification axis. New or materially revised research should include it as an array, including an empty array when no controlled phenomenon is materially relevant. Values may only come from `data/taxonomy.json`; producers must not infer a new controlled identifier from article wording. Historical records are not invalid merely because they predate this field.

Series-specific fields and other approved analytical metadata may be added, but controlled fields may not be silently extended or redefined.

The producer must not:

- create `reports/YYYY/MM/<slug>/metadata.json`;
- create public HTML;
- update `data/reports.json`;
- alter global navigation, taxonomy, CSS or institutional copy as part of routine research production.

## Stage 2 — QA

`MT Research QA` reads the pending sidecar and both staged sources. It validates facts, sources, dates, methodology, language equivalence, editorial style, controlled taxonomy and visual evidence. For research governed by `RESEARCH-VISUALS.md`, QA must also verify visual sufficiency, factual reproducibility, dimensional compatibility, mechanism integrity and EN/PT-BR visual parity, recording the result in `checks.visual_evidence_readiness`.

For a new v2 item, approval must be written as `schema_version: 2` and be cryptographically tied to the exact reviewed state.

Required approval fields include:

```json
{
  "schema_version": 2,
  "id": "MT-GM-2026-09-17",
  "qa_status": "approved",
  "reviewed_at": "...",
  "reviewed_commit": "...",
  "pending_blob_sha": "<git-blob-sha-of-data/pending/...>",
  "source_blob_shas": {
    "en": "<git-blob-sha>",
    "pt-BR": "<git-blob-sha>"
  },
  "taxonomy_check": "passed",
  "translation_check": "passed",
  "confidence": "medium",
  "checks": {},
  "contrary_evidence": [],
  "limitations": [],
  "notes": "...",
  "publication": {}
}
```

`publication` is an immutable snapshot of the approved publication state: the complete normalized v2 pending object that the publisher is allowed to materialize publicly. The publisher must never infer missing publication metadata from a later-mutated pending file. When `phenomena` is present, it is part of this immutable snapshot and must remain unchanged through publication.

For research materially involving conflict, war, strategic competition, defense, sanctions, political stability, civil unrest, migration, demographic transition, institutional change or social change, QA must apply the evidence and attribution rules in `CONFLICT-SECURITY-SOCIAL-CHANGE.md` in addition to ordinary factual review.

If a source or pending sidecar changes after QA, its Git blob SHA changes and the approval becomes invalid automatically.

A rejected item is written to `data/rejected/<slug>.json`. Rejection history is retained even after a corrected version later passes QA.

## Stage 3 — Publisher

`MT Publicador do Site` scans **approved v2 records**, not merely `data/pending/`.

For every approved ID that is not already public, it must:

1. load the v2 approval;
2. load the matching pending sidecar;
3. verify `pending_blob_sha` against the current pending file;
4. verify `source_blob_shas.en` and `source_blob_shas.pt-BR` against the current staged Markdown files;
5. verify `taxonomy_check:"passed"` and `translation_check:"passed"`;
6. verify that the approval `publication` snapshot matches the approved ID and controlled taxonomy;
7. validate controlled `phenomena` when present and preserve the approved array exactly rather than infer or rewrite it;
8. copy the approved staged English Markdown to `reports/YYYY/MM/<slug>/en.md`;
9. copy the approved staged Portuguese Markdown to `reports/YYYY/MM/<slug>/pt-BR.md`;
10. create `reports/YYYY/MM/<slug>/metadata.json` with `source_locale:"en"`, relative Markdown paths `en.md` and `pt-BR.md`, the approved taxonomy, approved `phenomena` when present, and localized metadata;
11. use canonical URL `/reports/YYYY/MM/<slug>.html`;
12. update `data/reports.json` only as a backward-compatible index, using the same canonical classification, `phenomena` when present and URL;
13. commit all publication changes atomically.

The publisher must never create public metadata pointing to `staging/`.

The publisher may leave staged files in place for auditability. They are not part of the public build. Cleanup is optional and must never be required for publication correctness.

## Stage 4 — Non-blocking context maintenance

After a public research commit has completed successfully, the same scheduled publisher run may perform a **separate, best-effort context-maintenance transaction** governed by `RESEARCH-CONTEXT.md`. This phase exists because scheduled-task capacity is intentionally kept small; it must behave as if it were an independent asynchronous worker.

The publication commit must be complete before context work begins. Context maintenance must never be included in the publication commit and must never delay, roll back, invalidate or change an already valid public publication.

For newly published canonical research, the maintenance phase should:

1. inspect metadata first and open full Markdown only when it may change an existing context or justify a new one;
2. identify durable political, historical, economic, social or relational knowledge worth retaining;
3. update only relevant `research-context/**` files incrementally;
4. create a new context file only when the creation rule in `RESEARCH-CONTEXT.md` is satisfied;
5. preserve `Related Marginal Thinking research`, `What changed since last review`, `Open questions` and source re-verification notes;
6. make no context commit when there is no material durable delta.

Context is still orientation rather than evidence. Time-sensitive claims must be re-verified before they are added as current context. A failure in this phase is non-blocking: do not alter the successful public commit, do not touch QA state, and allow a later publisher run with new research to catch up.

This phase may create or update **only** `research-context/**`. It must not change reports, staging, pipeline sidecars, taxonomy, scripts, navigation, CSS, JavaScript or institutional copy.

If context changes are warranted, use a separate atomic commit with prefix:

```text
context: update research memory YYYY-MM-DDTHHMM
```

If no context changes are warranted, make no additional commit.

## Deterministic scheduling

QA and publication are independent responsibilities but run on an ordered hourly cadence:

- QA runs first in the hour;
- publisher runs later in the hour.

This avoids the previous race where the publisher could inspect a pending report before QA and then wait multiple hours before checking again.

The pipeline remains idempotent: a published ID is not republished, and an unchanged approval produces no new commit.

Context maintenance runs only after successful publication work in the publisher cycle and remains a separate non-blocking Git transaction.

## Validation gates

`npm run validate` runs both pipeline validation and public research validation.

`scripts/validate-pipeline.mjs` blocks builds when, among other things:

- an unpublished pending item does not use schema v2;
- controlled taxonomy is invalid;
- `phenomena`, when present, contains duplicates or identifiers outside the controlled taxonomy;
- staged sources are missing;
- approval SHAs do not match current staged sources;
- approval does not contain the immutable publication snapshot;
- a public bundle points to `staging/`;
- a public bundle references Markdown outside the `reports/` public tree.

`scripts/validate-research.mjs` validates public bilingual bundles, controlled taxonomy including `phenomena` when present, and Markdown structure.

A deployment must not proceed if either validator fails.

## Build flow

1. `npm run validate:pipeline` validates publication state.
2. `scripts/validate-research.mjs` validates canonical public bundles.
3. `scripts/cloudflare-build.sh` copies only public assets and the canonical `reports/` tree.
4. `scripts/render-site.mjs` generates HTML, localized pages, feeds and sitemap.
5. output normalization and hardening scripts run.
6. `scripts/validate-dist.mjs` validates the rendered site.
7. Cloudflare may deploy `dist/` only after the build completes successfully.

## Legacy records

Historical `schema_version:1` pending and approval records may remain in Git for auditability when their IDs are already published. They are not valid templates for new research.

Historical records may also lack newer optional controlled metadata such as `phenomena`. They should not be mutated merely to conform retroactively; current producers, QA and publishers should preserve historical integrity while requiring the current contract for new or materially revised research.

No new producer, QA or publisher action should create schema v1 records.

## Language rules

- English is the canonical source locale.
- Brazilian Portuguese is required for every public research item.
- Both editions must be semantically equivalent in facts, numbers, evidence status, taxonomy, confidence and analytical conclusion.
- Controlled identifiers such as `program`, `topics` and `phenomena` are language-neutral metadata and must not be translated into different identifiers between editions.
- `hreflang`, canonical URLs, Open Graph, citation metadata and Schema.org metadata are generated by the renderer.

## Public formats

The website research pipeline publishes HTML and Markdown. PDF, DOCX and XLSX are not part of the normal web-publication path.


### Visual validation

From the effective date in `RESEARCH-VISUALS.md`, `scripts/validate-pipeline.mjs` blocks new staged research that misses the visual-evidence floor or EN/PT-BR visual parity. `scripts/validate-research.mjs` applies the same gate to public bundles. This makes visual completeness a build invariant rather than a prompt preference.
