#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
rm -rf dist
mkdir -p dist

# Public shell only. Internal QA/pending data and build scripts are never deployed.
cp -R assets dist/
cp -R reports dist/
find dist/reports -type f -name '*.html' -delete
mkdir -p dist/data
cp data/reports.json dist/data/reports.json
for f in index.html reports.html methodology.html about.html 404.html LICENSE-CONTENT.md THIRD-PARTY-NOTICES.md TRADEMARKS.md; do
  [[ -f "$f" ]] && cp "$f" dist/
done

node scripts/render-site.mjs

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

echo 'Cloudflare build ready: static, crawlable HTML generated from canonical Markdown.'
