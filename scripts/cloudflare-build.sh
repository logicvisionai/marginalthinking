#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

rm -rf dist
mkdir -p dist

# Copy the static site, excluding source-only/deployment-only directories.
find . -mindepth 1 -maxdepth 1 \
  ! -name '.git' \
  ! -name '.github' \
  ! -name '.packed-assets' \
  ! -name 'dist' \
  ! -name 'scripts' \
  -exec cp -R {} dist/ \;

# Restore binary publication assets from chunked Base64 storage.
MANIFEST='.packed-assets/manifest.tsv'
if [[ -f "$MANIFEST" ]]; then
  while IFS=$'\t' read -r source_dir target_path; do
    [[ -z "${source_dir:-}" || "${source_dir:0:1}" == '#' ]] && continue
    [[ -n "${target_path:-}" ]] || { echo "Invalid packed-assets manifest entry: $source_dir" >&2; exit 1; }

    shopt -s nullglob
    parts=(".packed-assets/${source_dir}"/part-*)
    shopt -u nullglob
    (( ${#parts[@]} > 0 )) || { echo "No packed asset parts found for: $source_dir" >&2; exit 1; }

    mkdir -p "dist/$(dirname "$target_path")"
    cat "${parts[@]}" | base64 --decode > "dist/$target_path"
    [[ -s "dist/$target_path" ]] || { echo "Failed to restore asset: $target_path" >&2; exit 1; }
    echo "Restored $target_path"
  done < "$MANIFEST"
fi

# Google Analytics 4 is enabled only for the production branch on Cloudflare Pages.
ENABLE_ANALYTICS=0
if [[ "${CF_PAGES:-}" == '1' ]]; then
  if [[ "${CF_PAGES_BRANCH:-}" == 'main' ]]; then
    [[ -n "${PROD_GA_MEASUREMENT_ID:-}" ]] || {
      echo 'PROD_GA_MEASUREMENT_ID is required for the production deploy.' >&2
      exit 1
    }
    ENABLE_ANALYTICS=1
  else
    echo "Google Analytics disabled for preview branch: ${CF_PAGES_BRANCH:-unknown}"
  fi
elif [[ -n "${PROD_GA_MEASUREMENT_ID:-}" ]]; then
  # Allows explicit local verification without enabling analytics by default.
  ENABLE_ANALYTICS=1
fi

if (( ENABLE_ANALYTICS )); then
  if [[ ! "$PROD_GA_MEASUREMENT_ID" =~ ^G-[A-Za-z0-9]+$ ]]; then
    echo 'PROD_GA_MEASUREMENT_ID must be a GA4 Measurement ID such as G-XXXXXXXXXX.' >&2
    exit 1
  fi

  ANALYTICS_JS='dist/assets/js/analytics.js'
  [[ -f "$ANALYTICS_JS" ]] || { echo 'Missing assets/js/analytics.js template.' >&2; exit 1; }

  sed -i "s|__PROD_GA_MEASUREMENT_ID__|${PROD_GA_MEASUREMENT_ID}|g" "$ANALYTICS_JS"

  while IFS= read -r -d '' html; do
    if ! grep -q '/assets/js/analytics.js' "$html"; then
      sed -i 's#</head>#  <script defer src="/assets/js/analytics.js"></script>\n</head>#' "$html"
    fi
  done < <(find dist -type f -name '*.html' -print0)

  echo "Google Analytics enabled for ${PROD_GA_MEASUREMENT_ID}."
else
  rm -f dist/assets/js/analytics.js
fi

echo 'Cloudflare Pages build ready in ./dist'
