# Marginal Thinking — Research Publishing

## Architecture

Marginal Thinking is **English-first and multilingual**. Research is written in Markdown; public HTML is generated deterministically at build time. Agents do not hand-write report HTML, CSS, SEO metadata, author blocks, sitemaps or feeds.

The default public language is English. Portuguese (`pt-BR`) is the first required translation for new research. The locale system is configuration-driven so future languages can be added without changing the publishing architecture.

## Preferred agent workflow

For new research, use one folder per publication:

```text
reports/YYYY/MM/<slug>/
├── metadata.json
├── en.md
└── pt-BR.md
```

Example `metadata.json`:

```json
{
  "id": "MT-GM-2026-09-16",
  "date": "2026-09-16",
  "kind": "daily-global-macro",
  "priority": 10,
  "source_locale": "en",
  "tags": ["Global Macro", "Energy", "Political Risk"],
  "locales": {
    "en": {
      "title": "Global Macro, Markets & Political Risk — 16/09/2026",
      "deck": "English abstract.",
      "markdown": "en.md",
      "regime": "...",
      "key_risk": "...",
      "watch": ["..."]
    },
    "pt-BR": {
      "title": "Macro Global, Mercados e Risco Político — 16/09/2026",
      "deck": "Resumo em português.",
      "markdown": "pt-BR.md",
      "regime": "...",
      "key_risk": "...",
      "watch": ["..."]
    }
  }
}
```

In the preferred format the agent edits only the publication folder. `data/reports.json` remains supported for legacy research and current automations, but new bundled research is collected automatically by the build and overrides a legacy entry with the same ID.

## Build flow

1. `npm run validate` checks source files, locale configuration, metadata, tables and custom visual blocks.
2. `scripts/cloudflare-build.sh` copies only public assets and research sources.
3. `scripts/render-site.mjs` generates English and Portuguese site pages, report HTML, author/topic pages, SEO metadata, hreflang links, sitemaps and RSS.
4. `scripts/validate-dist.mjs` validates the rendered output before deployment.
5. Cloudflare publishes `dist/` only if all blocking checks pass.

Recoverable presentation problems—extra H1 headings or orphaned `**` markers—are normalized by the renderer and reported as warnings rather than taking the site offline. Missing source files, malformed JSON, unclosed fenced blocks and prohibited binary formats remain blocking errors.

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

`type` may be `bar` or `line`. Suitable numeric Markdown tables can also receive a conservative automatic bar chart when the renderer detects a coherent change/share/return column.

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

Existing fenced `text`, `diagram` or `ascii` dependency diagrams are rendered as a high-contrast light component. Structured ASCII dependency maps are automatically upgraded to responsive stages and relationships instead of being shown as low-contrast code blocks.

## Responsive design rules

- No component may force page-level horizontal overflow.
- Tables may scroll within their own container.
- Dependency maps, flows and mind maps collapse to one-column structures on small screens.
- Regional maps change from schematic grid to stacked cards on phones.
- Report metadata cards stack before 860 px.
- Typography, spacing and visual hierarchy are preserved down to narrow mobile widths.

## Search and language rules

- English is the default locale at the root URL.
- Portuguese pages live under `/pt-br/`.
- `hreflang`, `x-default`, canonical URLs, Open Graph, citation metadata and Schema.org language fields are generated automatically.
- Legacy Portuguese-only reports remain available and are clearly marked on English archive pages.
- New English-first bundled reports must include a `pt-BR` translation.
- Markdown remains publicly accessible for auditability but is excluded from search indexing.

## Formats

Public research formats are HTML and Markdown only. Do not publish PDF, DOCX or XLSX.
