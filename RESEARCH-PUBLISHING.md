# Marginal Thinking — Research Publishing

## Purpose

Marginal Thinking uses a deterministic, QA-gated publishing pipeline. Public research is English-first, bilingual in English and Brazilian Portuguese, written in Markdown and rendered to HTML at build time.

Every publication must comply with:

- [`EDITORIAL-ARCHITECTURE.md`](./EDITORIAL-ARCHITECTURE.md);
- [`data/taxonomy.json`](./data/taxonomy.json);
- [`EDITORIAL-STYLE.md`](./EDITORIAL-STYLE.md);
- [`INSTITUTIONAL-EDITORIAL.md`](./INSTITUTIONAL-EDITORIAL.md).

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

## Stage 1 — Producer

The producer writes both staged Markdown editions and performs its source, language and methodological checks. It then writes the pending sidecar **last**.

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
  "format": "brief",
  "cadence": "daily"
}
```

Series-specific fields may be added, but the controlled fields above may not be omitted or silently extended.

The producer must not:

- create `reports/YYYY/MM/<slug>/metadata.json`;
- create public HTML;
- update `data/reports.json`;
- alter global navigation, taxonomy, CSS or institutional copy as part of routine research production.

## Stage 2 — QA

`MT Research QA` reads the pending sidecar and both staged sources. It validates facts, sources, dates, methodology, language equivalence, editorial style and controlled taxonomy.

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

`publication` is an immutable snapshot of the approved publication state: the complete normalized v2 pending object that the publisher is allowed to materialize publicly. The publisher must never infer missing publication metadata from a later-mutated pending file.

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
7. copy the approved staged English Markdown to `reports/YYYY/MM/<slug>/en.md`;
8. copy the approved staged Portuguese Markdown to `reports/YYYY/MM/<slug>/pt-BR.md`;
9. create `reports/YYYY/MM/<slug>/metadata.json` with `source_locale:"en"`, relative Markdown paths `en.md` and `pt-BR.md`, the approved taxonomy and localized metadata;
10. use canonical URL `/reports/YYYY/MM/<slug>.html`;
11. update `data/reports.json` only as a backward-compatible index, using the same canonical classification and URL;
12. commit all publication changes atomically.

The publisher must never create public metadata pointing to `staging/`.

The publisher may leave staged files in place for auditability. They are not part of the public build. Cleanup is optional and must never be required for publication correctness.

## Deterministic scheduling

QA and publication are independent responsibilities but run on an ordered hourly cadence:

- QA runs first in the hour;
- publisher runs later in the hour.

This avoids the previous race where the publisher could inspect a pending report before QA and then wait multiple hours before checking again.

The pipeline remains idempotent: a published ID is not republished, and an unchanged approval produces no new commit.

## Validation gates

`npm run validate` runs both pipeline validation and public research validation.

`scripts/validate-pipeline.mjs` blocks builds when, among other things:

- an unpublished pending item does not use schema v2;
- controlled taxonomy is invalid;
- staged sources are missing;
- approval SHAs do not match current staged sources;
- approval does not contain the immutable publication snapshot;
- a public bundle points to `staging/`;
- a public bundle references Markdown outside the `reports/` public tree.

`scripts/validate-research.mjs` validates public bilingual bundles, taxonomy and Markdown structure.

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

No new producer, QA or publisher action should create schema v1 records.

## Language rules

- English is the canonical source locale.
- Brazilian Portuguese is required for every public research item.
- Both editions must be semantically equivalent in facts, numbers, evidence status, taxonomy, confidence and analytical conclusion.
- `hreflang`, canonical URLs, Open Graph, citation metadata and Schema.org metadata are generated by the renderer.

## Public formats

The website research pipeline publishes HTML and Markdown. PDF, DOCX and XLSX are not part of the normal web-publication path.
