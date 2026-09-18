#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
rm -rf dist
mkdir -p dist

# Apply reviewed institutional copy before rendering public pages.
node scripts/apply-institutional-copy.mjs

# Public assets and canonical research only. Staging and QA records are never deployed.
cp -R assets dist/
cp -R reports dist/
find dist/reports -type f -name '*.html' -delete
mkdir -p dist/data
cp data/taxonomy.json dist/data/taxonomy.json
for f in LICENSE-CONTENT.md THIRD-PARTY-NOTICES.md TRADEMARKS.md; do
  [[ -f "$f" ]] && cp "$f" dist/
done

# app.js dynamically rebuilds home/archive cards after first paint. Localize the
# canonical reports dataset before that render so PT-BR cannot flash and revert to EN.
node scripts/fix-client-locale.mjs

node scripts/render-site.mjs
# Validate and render the Structural Opportunity Atlas from a compact, evidence-linked canonical dataset.
node scripts/validate-structural-opportunities.mjs
node scripts/render-structural-opportunities.mjs
# Feature the public analytical systems on the homepage without coupling them to the core renderer.
node scripts/inject-home-analytics.mjs
# Replace legacy free-tag collections with the controlled editorial taxonomy and
# re-rank related research by program -> geography -> controlled topics -> tags.
node scripts/render-taxonomy-pages.mjs
# Derive corpus-level intelligence from canonical metadata only. This adds no
# publication burden to agents and never counts translations as separate research.
node scripts/render-research-intelligence.mjs
# Build the machine-readable public catalog used by the stateless MCP endpoint.
# It contains only metadata and URLs already present in the public research corpus.
node scripts/render-mcp-catalog.mjs
# Controlled product series remain subordinate to permanent programs and receive
# their own collection pages without expanding the global navigation.
node scripts/render-series-pages.mjs
# Keep the homepage aligned with the same four canonical programs used by the taxonomy.
node scripts/inject-program-home.mjs
# Countries & Regions becomes a stable access axis without becoming a new editorial program.
node scripts/inject-geography-nav.mjs
node scripts/editorial-normalize.mjs
node scripts/editorial-normalize-en.mjs
node scripts/editorial-final-cleanup.mjs
node scripts/style-evidence-labels.mjs
node scripts/final-public-language.mjs
# Enforce the selected locale on every research card and make geography the active
# navigation axis before discovery turns localized tags into semantic links.
node scripts/finalize-localized-ui.mjs
# Global static search and semantic navigation are derived after locale/editorial normalization.
# Controlled taxonomy terms receive canonical links; free tags route into global search.
node scripts/render-discovery.mjs
# Render human-facing MCP documentation after the search index exists so the page can
# register itself there, while keeping /mcp reserved for the protocol endpoint.
node scripts/render-mcp-docs.mjs
# Cloudflare Static Assets normalizes *.html routes. Keep the human documentation on a
# distinct directory URL so it can never normalize into the protocol endpoint at /mcp.
node scripts/fix-mcp-docs-route.mjs
# Recovery navigation and agent discovery remain static: llms.txt, Markdown alternates,
# crawler hints and Cloudflare headers are generated from the same canonical corpus.
node scripts/render-agent-discovery.mjs
# SEO is derived after all public routes exist: concise search metadata, per-report
# social cards, collection freshness and index control for empty taxonomy pages.
node scripts/seo-optimize-output.mjs
node scripts/harden-output.mjs
node scripts/validate-taxonomy-output.mjs
node scripts/validate-series.mjs --dist
node scripts/validate-dist.mjs
node scripts/validate-seo.mjs
# Locale integrity is a build invariant: archive cards, report pages, search entries,
# geography navigation and client-side archive rendering must honor the selected locale.
node scripts/validate-localized-output.mjs

# Analytics is optional and never blocks publishing research.
if [[ -n "${PROD_GA_MEASUREMENT_ID:-}" ]]; then
  if [[ "$PROD_GA_MEASUREMENT_ID" =~ ^G-[A-Za-z0-9]+$ ]]; then
    ANALYTICS_JS='dist/assets/js/analytics.js'
    if [[ -f "$ANALYTICS_JS" ]]; then
      sed -i "s|__PROD_GA_MEASUREMENT_ID__|${PROD_GA_MEASUREMENT_ID}|g" "$ANALYTICS_JS"
      while IFS= read -r -d '' html; do
        grep -q '/assets/js/analytics.js' "$html" || sed -i 's#</head>#<script defer src="/assets/js/analytics.js"></script></head>#' "$html"
      done < <(find dist -type f -name '*.html' -print0)
    fi
  else
    echo 'Ignoring invalid PROD_GA_MEASUREMENT_ID.' >&2
    rm -f dist/assets/js/analytics.js
  fi
else
  rm -f dist/assets/js/analytics.js
fi

echo 'Cloudflare build ready: bilingual research with strict locale-card integrity, locale-safe client rendering, deterministic QA pipeline, four canonical research programs, controlled series and domain pages, taxonomy-ranked related research, geographic navigation with correct active state, derived corpus intelligence, public MCP catalog and documentation, global static search, semantic taxonomy navigation, recovery 404, llms.txt and Markdown agent discovery, concise SEO metadata, per-report social cards and empty-collection index control, institutional copy reviewed, responsive output validated.'
