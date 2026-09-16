# Marginal Thinking — Research Publishing

## Architecture

Marginal Thinking is **English-first and multilingual**. Public research is written in Markdown; public HTML is generated deterministically at build time. Agents do not hand-write final report HTML, CSS, SEO metadata, author blocks, sitemaps or feeds.

The default public language is English. Brazilian Portuguese (`pt-BR`) is required for every public research item. Every publication must also comply with [`EDITORIAL-ARCHITECTURE.md`](./EDITORIAL-ARCHITECTURE.md) and the controlled taxonomy in [`data/taxonomy.json`](./data/taxonomy.json).

A critical publishing invariant applies:

> **A public publication bundle must not exist before factual/editorial QA approval.**

`scripts/render-site.mjs` discovers publication bundles automatically. Creating `reports/YYYY/MM/<slug>/metadata.json` therefore makes an item eligible for the public build. Producers must never create that file before QA.

## Editorial language standard

Every publication must follow [`EDITORIAL-STYLE.md`](./EDITORIAL-STYLE.md) before factual QA.

The Portuguese edition must read as natural Brazilian Portuguese, not as a literal translation of financial, corporate or intelligence English. Analytical density is desirable; compressed jargon is not. Whenever material, a sentence should make clear **who acts, what changes, through which mechanism and with what consequence**.

Terms such as `gargalo`, `captura de valor`, `captura de renda`, `vetor`, `camada`, `variável de controle`, `gravitar`, `repricing`, `funding`, `claims`, `collateral`, `midstream`, `valuation`, `duration`, `carry` and similar expressions require special scrutiny. They may be used when technically necessary, but must not replace the concrete economic relation being described.

The English edition must be idiomatic English rather than a word-for-word rendering of Portuguese. Facts, numbers, confidence, scenarios, taxonomy and analytical meaning must remain equivalent across languages.

## Controlled editorial metadata

Every pending item must declare the classification that will later become public metadata:

```json
{
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

All controlled values must already exist in `data/taxonomy.json`. Producers, QA and the publisher may not silently extend the taxonomy.

## Three-stage workflow

### Stage 1 — Producer: private staging inside the repository

A producer writes bilingual source material under a non-public staging tree:

```text
staging/research/YYYY/MM/<slug>/
├── en.md
└── pt-BR.md
```

The producer then writes, **last**, a transactional sidecar:

```text
data/pending/<slug>.json
```

The pending sidecar contains:

- `schema_version: 1`;
- `ready: true` only after both language files are complete;
- stable `id`, date, kind and priority;
- paths to the staged EN and PT-BR Markdown files;
- localized title, deck and analytical metadata;
- the complete controlled taxonomy classification;
- free-form tags and keywords for search;
- any series-specific metadata such as technology maturity or key constraints.

The producer must **not** create anything under `reports/YYYY/MM/<slug>/` and must not create public HTML. The `staging/` tree is deliberately not copied by the Cloudflare build.

### Stage 2 — Research QA

`MT Research QA` reads the pending sidecar and both staged Markdown editions. It validates facts, sources, dates, methodology, language equivalence and taxonomy.

Approval is written to:

```text
data/approved/<slug>.json
```

and must include the exact blob SHAs of all approved staged sources, `reviewed_commit`, confidence, checks, contrary evidence, limitations, `taxonomy_check:"passed"`, and `translation_check:"passed"` for bilingual material.

A rejected item is recorded under `data/rejected/` and remains non-public.

Any source change after approval invalidates the approval and requires another QA pass.

### Stage 3 — Publisher: create the public bundle

Only `MT Publicador do Site` may turn an approved staged item into a public publication bundle.

After confirming that current staged blob SHAs match the approval, the publisher creates:

```text
reports/YYYY/MM/<slug>/
├── metadata.json
├── en.md
└── pt-BR.md
```

`metadata.json` is created only in the publication commit and uses:

- `source_locale: "en"`;
- the approved controlled taxonomy fields;
- locale-specific title, deck, tags, keywords, regime, risks, watch items and search text;
- Markdown paths relative to the bundle;
- the canonical report URL `/reports/YYYY/MM/<slug>.html`.

The publisher may update `data/reports.json` as a backward-compatible index, but the multilingual bundle is authoritative and overrides a legacy entry with the same ID.

After a successful atomic publication commit, the publisher may remove the staged source files. `data/pending/`, `data/approved/` and Git history preserve the audit trail; rejected records are never erased merely because a corrected edition is later approved.

## Why staging is outside `reports/`

Cloudflare copies `reports/` into the public build before rendering. Markdown placed there is therefore potentially public even if no HTML exists yet. Keeping unapproved sources under `staging/research/` prevents accidental exposure and ensures that QA remains a real publication gate rather than a documentation step after publication.

## Build flow

1. `npm run validate` checks only canonical public bundles and site configuration.
2. `scripts/cloudflare-build.sh` copies public assets and the canonical `reports/` tree; it does not copy `staging/`, `data/pending/`, `data/approved/` or `data/rejected/`.
3. `scripts/render-site.mjs` generates English and Portuguese site pages, report HTML, author/topic pages, SEO metadata, hreflang links, sitemaps and RSS.
4. Language normalizers operate as compatibility layers for existing content, not as substitutes for good source writing.
5. `scripts/validate-dist.mjs` validates rendered output before deployment.
6. Cloudflare publishes `dist/` only after blocking checks pass.

Missing sources, malformed JSON, missing translations, invalid controlled taxonomy and prohibited binary formats are blocking errors.

## Publication bundle example

```json
{
  "id": "MT-GM-2026-09-16",
  "date": "2026-09-16",
  "kind": "daily-global-macro",
  "priority": 10,
  "taxonomy_version": "1.0",
  "program": "political-economy-markets",
  "related_programs": ["global-system-power"],
  "dimensions": ["economy", "politics"],
  "geography": {"level":"global","regions":[],"subregions":[],"countries":[]},
  "topics": ["macroeconomics", "capital-markets"],
  "format": "brief",
  "cadence": "daily",
  "source_locale": "en",
  "locales": {
    "en": {
      "title": "Global Macro, Markets & Political Risk — September 16, 2026",
      "deck": "English abstract.",
      "markdown": "en.md"
    },
    "pt-BR": {
      "title": "Macro Global, Mercados e Risco Político — 16/09/2026",
      "deck": "Resumo em português.",
      "markdown": "pt-BR.md"
    }
  }
}
```

## Visual research primitives

Use visuals only when they improve comprehension and only with facts or analytical structure already present in the report.

### Chart

````text
```chart
title: Treasury 10Y
type: line
unit: %
2026-09-12 | 4.82
2026-09-13 | 4.94
2026-09-14 | 5.00
```
````

`type` may be `bar` or `line`.

### Causal flow

````text
```flow
Energy shock → inflation expectations → long yields → credit conditions → activity
```
````

### Mind map

````text
```mindmap
Global power
- Financial system
  - Dollar
  - Treasuries
- Industrial system
  - Refining
  - Manufacturing
```
````

### Regional map

````text
```map
title: Regional allocation of strategic capital
North America | High | Capital markets and AI infrastructure
Europe | Medium | Industrial assets and savings
Middle East | Rising | Sovereign capital and energy
Asia | Very high | Manufacturing and processing
```
````

### Dependency map / text diagram

Fenced `text`, `diagram` or `ascii` dependency diagrams may be used when they communicate structure more clearly than prose.

## Responsive design rules

- No component may force page-level horizontal overflow.
- Tables may scroll within their own container.
- Dependency maps, flows and mind maps must collapse safely on narrow screens.
- Report metadata cards stack before narrow layouts become unreadable.
- Typography, spacing and hierarchy must remain usable on mobile.

## Search and language rules

- English is the default locale at the root URL.
- Portuguese pages live under `/pt-br/`.
- Every public research item has both `en` and `pt-BR` Markdown sources.
- `source_locale` is `en` for public bundles.
- `hreflang`, `x-default`, canonical URLs, Open Graph, citation metadata and Schema.org language fields are generated automatically.
- Markdown remains publicly accessible for auditability but is excluded from search indexing.
- Future languages are added through configuration, not by redesigning the taxonomy.

## Formats

Public research formats are HTML and Markdown only. Do not publish PDF, DOCX or XLSX as part of the website research pipeline.
