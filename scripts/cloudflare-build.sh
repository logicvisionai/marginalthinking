#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
rm -rf dist
mkdir -p dist

# Public assets and canonical research sources only. Internal QA data and scripts are never deployed.
cp -R assets dist/
cp -R reports dist/
find dist/reports -type f -name '*.html' -delete
mkdir -p dist/data
for f in LICENSE-CONTENT.md THIRD-PARTY-NOTICES.md TRADEMARKS.md; do
  [[ -f "$f" ]] && cp "$f" dist/
done

node scripts/render-site.mjs
node scripts/editorial-normalize.mjs
node scripts/editorial-normalize-en.mjs
node scripts/harden-output.mjs
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

echo 'Cloudflare build ready: bilingual research, Portuguese and English editorial language normalized, hardened responsive layout, validated static output.'
