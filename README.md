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
https://marginalthinking.org/mcp
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

## Operational surfaces

The public build exposes the same research system through several derived surfaces:

- `/research/coverage/` — corpus coverage by program, geography, topic and language;
- `/system-status/` — editorial cadence, freshness, reconciliation and pipeline state;
- `/data/` — machine-readable analytical datasets;
- `/data/research-system-status.json` — machine-readable system health;
- `/data/mcp-catalog.json` — machine-readable research catalog;
- `/llms.txt` — agent-oriented discovery and canonical research links.

These pages are derived at build time from canonical report bundles, the frozen taxonomy and the system registry. They are not separate editorial databases.


## Live publishing and deployment health

The GitHub Actions workflow `.github/workflows/validate.yml` now deploys the
verified `dist/` bundle to **Cloudflare Workers**, not just a dry run. Successful
build checks do not mean the site is live. The workflow only succeeds after an
actual Wrangler deploy and an HTTP smoke test of `marginalthinking.org`.

### One-time configuration

In **GitHub → Settings → Secrets and variables → Actions**, configure:

- `CLOUDFLARE_API_TOKEN` (repository secret): a Cloudflare API token authorized
  to edit Workers for the account that actually hosts `marginalthinking.org`.
- `CLOUDFLARE_ACCOUNT_ID` (repository secret or variable): ID of **that same
  Cloudflare account**, not an unrelated account containing other projects.

Ensure `marginalthinking.org` is attached to the Worker named `marginalthinking`
(`wrangler.jsonc`) in the relevant Cloudflare account. A Cloudflare project in a
**different** account will not be updated by these credentials.

Once configured, use **Actions → Validate Marginal Thinking → Run workflow**
to perform a build, real deploy and verification. Every push to `main` and the
daily scheduled run also deploy the latest approved version. The status will
remain failed when credentials are missing, the deployment fails, the deployed
SHA does not match `main`, or the report/archive URLs do not contain the
expected article.

The build writes `/deployment.json` containing a public, non-sensitive Git
commit SHA to distinguish an up-to-date deployment from a stale one. The smoke
test also checks English and PT-BR pages of the most recent Global Macro and
18 October 2026 edition. The HTTP checker is in
`scripts/verify-live-publication.mjs`.

### Editorial review and scheduling

Unapproved pending manuscripts are validated by the **Editorial drafts and
freshness** workflow and are **not** a deployment dependency. Only QA-approved
and public bundles can enter the live build. Overdue unrelated editorial-series
SLAs continue to surface separately without suppressing an approved report.
This does not weaken public-research checks or allow unapproved content online.
