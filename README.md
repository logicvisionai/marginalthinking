# Marginal Thinking

Independent research on macroeconomics, markets, political economy, geopolitics, capital and power.

## Publishing model

Research has two public formats only:

- **Markdown** — canonical source;
- **HTML** — web reading layer rendered from the Markdown source.

There are no PDF, DOCX or XLSX report artifacts in the publishing pipeline.

See [`RESEARCH-PUBLISHING.md`](./RESEARCH-PUBLISHING.md) for the editorial architecture, supported visual syntax and QA rules.

## Validate

```bash
npm run validate
```

## Build

```bash
npm run build
```

The build validates the research archive and writes the static site to `dist/` for Cloudflare Workers Static Assets.
