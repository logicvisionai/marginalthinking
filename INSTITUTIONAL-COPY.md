# Marginal Thinking — institutional copy source

`data/institutional-copy.json` is the reviewed bilingual source for public institutional copy on the home, Method, About, archive and recurring report labels.

During build, `scripts/apply-institutional-copy.mjs` merges this reviewed copy into `data/i18n.json` before the site is rendered. This keeps interface labels and institutional prose separate while preserving the existing locale architecture.

Any change to public institutional wording should be made in `data/institutional-copy.json`, reviewed against `INSTITUTIONAL-EDITORIAL.md`, and checked in both English and Brazilian Portuguese.
