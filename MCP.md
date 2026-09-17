# Marginal Thinking MCP

Marginal Thinking exposes its public research corpus to AI agents through a stateless Model Context Protocol (MCP) endpoint.

## Endpoint

```text
https://www.marginalthinking.org/mcp
```

The endpoint is public and read-only. It does not require a separate database, vector store, API service, VM, Durable Object, KV namespace or authentication layer.

## Architecture

The MCP is deliberately thin:

```text
GitHub research repository
        ↓
existing Cloudflare build
        ↓
Markdown + canonical metadata
        ↓
render-mcp-catalog.mjs
        ↓
dist/data/mcp-catalog.json
        ↓
/mcp on the existing Cloudflare Worker
        ↓
ChatGPT / Claude / Cursor / other MCP clients
```

GitHub remains the source of truth. The existing publishing agents continue to create and review research exactly as before. The site build continues to render the public HTML, Markdown, taxonomy, search index and research-intelligence files. The MCP only reads the resulting public assets.

`wrangler.jsonc` routes only `/mcp` through Worker code. All normal website paths continue to use Cloudflare Static Assets directly.

## Tools

### `search_research`

Searches titles, decks, tags, keywords, controlled taxonomy and indexed research text. Supports filters for program, topic, country, cadence, format, series and date range.

### `get_research`

Returns canonical metadata and the public Markdown for a research ID. A heading can be supplied to retrieve only one section and reduce context usage.

### `latest_research`

Returns the latest publications, optionally filtered by program, topic, country, cadence, format or series.

### `get_related_research`

Finds related publications using the same structural signals already present in the corpus: research program, related programs, topics, countries, regions, series and analytical dimensions.

### `get_timeline`

Builds a chronological research timeline around a country, market, institution, technology, resource or other subject.

### `get_corpus_overview`

Returns the automatically generated corpus coverage data from `dist/data/research-intelligence.json`.

## Resource

The server also exposes:

```text
marginalthinking://catalog
```

This resource contains the machine-readable public research catalog used by the tools.

## What the MCP does not do

The MCP does not generate new analysis, call an LLM, browse the web, mutate the repository or maintain a second knowledge base. It retrieves and organizes research that has already passed through the Marginal Thinking publishing pipeline.

This separation is intentional: Marginal Thinking builds and maintains the research layer; the user's own agent can interpret that material for the user's context.

## Build integration

The normal build now generates:

```text
dist/data/mcp-catalog.json
```

The catalog is derived from `collectReports()` and the same canonical locale metadata used by the website. Adding a new properly structured report therefore makes it available to the MCP automatically on the next normal deployment.

No additional publishing step is required.

## Local validation

```bash
npm install
npm run build
npx wrangler deploy --dry-run --outdir .wrangler-dry-run
```

The GitHub validation workflow performs the same static build checks and a Wrangler dry run before changes can be merged.
