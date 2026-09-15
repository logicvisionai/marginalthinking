# Marginal Thinking — Research Publishing

## Canonical model

Research is written in Markdown. Public HTML is generated at build time from `data/reports.json` plus the canonical Markdown file. Hand-written report HTML is ignored by the production build.

## Publishing flow

1. Research and triangulate sources.
2. Write the complete report in Markdown.
3. Add/update the report entry in `data/reports.json`.
4. Run `npm run validate`.
5. Run `npm run build`.
6. Inspect the generated HTML in `dist/` before deployment when layout changes.

The build generates:

- full static HTML for every report;
- canonical URLs and robots directives;
- Open Graph/Twitter metadata;
- Schema.org `ScholarlyArticle`, `BreadcrumbList`, `Person` and organization metadata;
- citation meta tags;
- author page;
- topic landing pages;
- `sitemap.xml`;
- `feed.xml`;
- `robots.txt`.

## Search/indexing rules

- HTML is the canonical indexable representation.
- Markdown remains publicly accessible for auditability but is excluded from crawler indexing through `robots.txt`.
- `data/approved`, `data/pending` and `data/rejected` are internal workflow data and are not copied to `dist`.
- Each report must have one H1, at least two H2 sections when practical, a unique ID, a unique HTML URL and a corresponding Markdown source.

## Author identity

Default author metadata is defined in `site.config.json` and may be overridden per report with an `authors` array. Current default contact: `christian@marginalthinking.org`.

## Visual research primitives

Markdown tables are rendered as responsive tables. Causal chains using repeated arrows can render as flows. Explicit `flow` and `chart` fenced blocks are supported. Graphs and diagrams must carry information already present in the research; presentation must not invent data.

## Formats

Do not publish PDF, DOCX or XLSX. The public formats are HTML and Markdown only.
