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

node scripts/render-site.mjs
# Replace legacy free-tag collections with the controlled editorial taxonomy and
# re-rank related research by program -> geography -> controlled topics -> tags.
node scripts/render-taxonomy-pages.mjs
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
node scripts/harden-output.mjs
node scripts/validate-taxonomy-output.mjs
node scripts/validate-series.mjs --dist
node scripts/validate-dist.mjs

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

echo 'Cloudflare build ready: bilingual research, deterministic QA pipeline, four canonical research programs, controlled series and domain pages, taxonomy-ranked related research, geographic navigation, institutional copy reviewed, responsive output validated.'
