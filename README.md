# Marginal Thinking

Independent research on macroeconomics, markets, political economy, geopolitics, capital and power.

## Publishing model

Research has two public formats only:

- **Markdown** — canonical source;
- **HTML** — web reading layer rendered from the Markdown source.

There are no PDF, DOCX or XLSX report artifacts in the publishing pipeline.

See [`RESEARCH-PUBLISHING.md`](./RESEARCH-PUBLISHING.md) for the editorial architecture, supported visual syntax and QA rules.

## MCP

The public research corpus is also exposed through a stateless, read-only Model Context Protocol endpoint:

```text
https://www.marginalthinking.org/mcp
```

The MCP is generated from the same canonical report metadata and Markdown used by the site. It adds no database, vector store or parallel publishing pipeline. See [`MCP.md`](./MCP.md) for the architecture and available research tools.

## Validate

```bash
npm run validate
```

## Build

```bash
npm run build
```

The build validates the research archive and writes the static site plus the public MCP research catalog to `dist/` for Cloudflare Workers Static Assets.
