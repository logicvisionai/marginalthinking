# Marginal Thinking — Research System Audit, 20 October 2026

**Scope:** structural and data-source audit of the canonical repository, 47 registered assets, editorial activity, analytical datasets, public-site build and delivery chain. This document records the results of an inspection and selected evidence-backed updates. **It is not a declaration that every record has been individually fact-checked or that deployment has succeeded.**

## Findings and release integrity

1. The 20 October GitHub Actions build succeeded after the first global-conditions integration, including rendered source-aware pages, registry and research validators. Deploy was still blocked in the *Check Cloudflare credentials* step because GitHub Actions did not supply `CLOUDFLARE_API_TOKEN`. An existing Cloudflare connector is not equivalent to that workflow secret. The correct Cloudflare account ID also needs to be checked.
2. The autonomous editorial QA step was observed disabled and was enabled again on 20 October; the publisher stays independent. This prevents treating a staged or unreviewed article as published.
3. Five editorial lines exceeded their operational cadence, based on the actual independent freshness audit. No generated research article or updated timestamp has been fabricated to clear the warning.
4. The prior freshness display conflated latest global reconciliation and per-asset review. It now computes the last run with a decision **for the specific asset** and separately records `last_modified`, `dataset_age_hours` and `dataset_state`.
5. The original canonical corpus includes **119** indexed research items in the inspected main branch. Counts are not unique time-series observations.

## Verified evidence added or materially changed

- **Global Conditions Monitor:** `data/global-conditions-monitor.json` holds **24** dated and sourced entries as of 20 October 2026. It covers Eurostat inflation, employment and housing; EUAA asylum cases; IMF and OECD projections; and IEA production, petroleum shipments, inventory and demand. It identifies observed versus projected measures, geographical coverage, time periods and incompatible denominators.
- **Public interface:** the dataset is linked in the structured data catalog and rendered as separate English and Brazilian Portuguese pages at `/data/global-conditions-monitor/`, with original-source links. The JSON is copied to `/data/global-conditions-monitor.json` at build time.
- **Dependency Network:** expanded from 34 nodes/30 edges to **35 nodes/31 edges**, with **66** provenance events. IEA October 2026 data documents that Middle East refined-product shipments recovered more slowly than crude flows, creating a distinct fuel-price transmission mechanism. The historical ledger and edge source links were updated.
- **No synthetic freshness:** structural Atlas, actor maps, policy cases, conflict systems and technology signals retain their last actual factual modification unless new qualified evidence justifies altering their canonical claims. Stale coverage remains visible.

### Primary sources used for the additions

- IMF, *World Economic Outlook — October 2026*: https://www.imf.org/en/Publications/WEO/Issues/2026/10/13/world-economic-outlook-october-2026
- OECD, *Interim Economic Outlook — September 2026*: https://www.oecd.org/en/publications/oecd-economic-outlook-interim-report-september-2026_f751d02b-en.html
- Eurostat, *HICP annual inflation — September 2026*: https://ec.europa.eu/eurostat/en/web/products-euro-indicators/w/2-16102026-ap
- Eurostat, *Unemployment — August 2026*: https://ec.europa.eu/eurostat/web/products-euro-indicators/w/3-01102026-ap
- Eurostat, *House prices and rents — Q2 2026*: https://ec.europa.eu/eurostat/en/web/products-eurostat-news/w/ddn-20261001-3
- EUAA, *Asylum Report 2026*: https://www.euaa.europa.eu/news-events/asylum-report-2026-eu-gearing-next-generation-common-european-asylum-system
- IEA, *Oil Market Report — 14 October 2026*: https://www.iea.org/reports/oil-market-report-october-2026

## Inventory: every registered operational asset

The inventory below distinguishes editorial publication cadence from factual modification to cumulative datasets. The "last material data" column is empty where the asset is build-derived, lacks a dedicated mutable file, or requires an event-driven update; absence is **not** evidence of currentness.

| ID | Type | Operating mode | Last material data / latest indexed report | Audit note |
| --- | --- | --- | --- | --- |
| `series-energy-materials-industrial-systems` | editorial-series | event-driven | build/event-driven | Registered; do not infer data refresh |
| `series-global-monetary-financial-institutions` | editorial-series | daily-event-driven | build/event-driven | Registered; do not infer data refresh |
| `series-policy-experiments-institutional-transitions` | editorial-series | weekly-event-driven | build/event-driven | Registered; do not infer data refresh |
| `global-dependency-network` | cumulative-tool | publication-reconciliation | 2026-10-20 | New IEA evidence + history |
| `structural-opportunity-atlas` | cumulative-tool | publication-reconciliation | 2026-09-23 | Evidence-backed reconciliation required |
| `strategic-actors` | cumulative-tool | publication-reconciliation | 2026-09-24 | Evidence-backed reconciliation required |
| `resource-control-atlas` | cumulative-tool | publication-reconciliation | 2026-09-22 | Evidence-backed reconciliation required |
| `policy-case-atlas` | cumulative-tool | publication-reconciliation | 2026-09-23 | Evidence-backed reconciliation required |
| `conflict-systems` | cumulative-tool | publication-reconciliation | 2026-09-20 | Evidence-backed reconciliation required |
| `technology-signal-ledger` | cumulative-tool | publication-reconciliation | 2026-10-05T09:46:12-03:00 | Evidence-backed reconciliation required |
| `country-region-navigation` | discovery-tool | build-derived | build/event-driven | Registered; do not infer data refresh |
| `research-workspace` | reader-tool | build-derived | build/event-driven | Registered; do not infer data refresh |
| `global-search` | discovery-tool | build-derived | build/event-driven | Registered; do not infer data refresh |
| `research-intelligence` | discovery-tool | build-derived | build/event-driven | Registered; do not infer data refresh |
| `evergreen-research-hubs` | discovery-tool | build-derived | build/event-driven | Registered; do not infer data refresh |
| `data-catalog` | access-layer | build-derived | build/event-driven | Registered; do not infer data refresh |
| `mcp` | access-layer | build-derived | build/event-driven | Registered; do not infer data refresh |
| `program-global-system-power` | research-program | event-driven | corpus-derived | Registered; do not infer data refresh |
| `program-political-economy-markets` | research-program | event-driven | corpus-derived | Registered; do not infer data refresh |
| `program-strategic-transitions` | research-program | event-driven | corpus-derived | Registered; do not infer data refresh |
| `program-technology-production-society` | research-program | event-driven | corpus-derived | Registered; do not infer data refresh |
| `editorial-global-macro-daily` | editorial-line | daily-event-driven | 2026-10-19 | Registered; do not infer data refresh |
| `editorial-wealth-flow-weekly` | editorial-line | weekly-event-driven | 2026-10-19 | Registered; do not infer data refresh |
| `editorial-strategic-transitions` | editorial-line | event-driven | 2026-09-29 | Registered; do not infer data refresh |
| `editorial-country-context` | editorial-line | event-driven | 2026-10-04 | Registered; do not infer data refresh |
| `editorial-technology-signals-weekly` | editorial-line | weekly-event-driven | 2026-10-05 | **OVERDUE — source research required** |
| `editorial-strategic-technology-monthly` | editorial-line | monthly-event-driven | 2026-09-16 | Registered; do not infer data refresh |
| `editorial-conflict-systems` | editorial-line | event-driven | 2026-09-20 | Registered; do not infer data refresh |
| `editorial-strategic-actors` | editorial-line | event-driven | 2026-09-23 | Registered; do not infer data refresh |
| `editorial-global-monetary-daily` | editorial-line | daily-event-driven | 2026-09-22 | **OVERDUE — source research required** |
| `editorial-institutional-decisions` | editorial-line | event-driven | 2026-09-22 | Registered; do not infer data refresh |
| `editorial-policy-case-studies` | editorial-line | weekly-event-driven | 2026-09-23 | **OVERDUE — source research required** |
| `series-economic-paradigms-market-design` | editorial-series | weekly-event-driven | build/event-driven | Registered; do not infer data refresh |
| `editorial-economic-paradigms-market-design` | editorial-line | weekly-event-driven | 2026-09-23 | **OVERDUE — source research required** |
| `system-status` | discovery-tool | build-derived | build/event-driven | Registered; do not infer data refresh |
| `research-coverage` | discovery-tool | build-derived | build/event-driven | Registered; do not infer data refresh |
| `agent-discovery` | access-layer | build-derived | build/event-driven | Registered; do not infer data refresh |
| `editorial-wealth-power-monthly` | editorial-line | monthly-event-driven | 2026-09-15 | **OVERDUE — source research required** |
| `editorial-wealth-power-annual` | editorial-line | annual-event-driven | 2026-09-15 | Registered; do not infer data refresh |
| `editorial-global-institution-systems` | editorial-line | event-driven | 2026-09-23 | Registered; do not infer data refresh |
| `editorial-regional-integration-systems` | editorial-line | event-driven | 2026-09-23 | Registered; do not infer data refresh |
| `editorial-technology-society-essays` | editorial-line | event-driven | 2026-10-05 | Registered; do not infer data refresh |
| `editorial-food-systems-development` | editorial-line | event-driven | 2026-10-12 | Registered; do not infer data refresh |
| `editorial-biosecurity-livestock-governance` | editorial-line | event-driven | 2026-10-12 | Registered; do not infer data refresh |
| `editorial-major-power-conflict` | editorial-line | event-driven | 2026-10-19 | Registered; do not infer data refresh |
| `editorial-pandemic-preparedness` | editorial-line | event-driven | 2026-10-19 | Registered; do not infer data refresh |
| `global-conditions-observations` | discovery-tool | weekly-event-driven | 2026-10-20 | Added / verified sources |

## Immediate editorial backlog — no artificial completion

| Line | Latest inspected item | Reason for attention | Required evidence |
| --- | --- | --- | --- |
| `editorial-technology-signals-weekly` | 2026-10-05 | Technical capability and actual deployment delta; reproducibility; manufacturing, cost and scale; contrary evidence | NASA, NIST, standards, replicated experimental work |
| `editorial-global-monetary-daily` | 2026-09-22 | No recent canonical institutional monitor despite daily cadence | ECB, Fed, BIS, IMF, central-bank decisions and release timing |
| `editorial-policy-case-studies` | 2026-09-23 | Implemented decisions require measured outcomes and counterfactual constraints | original legislation, evaluation reports, official national data |
| `editorial-economic-paradigms-market-design` | 2026-09-23 | No new weekly assessment with sufficient empirical evidence | BIS/central banks, regulatory pilots, market-microstructure papers |
| `editorial-wealth-power-monthly` | 2026-09-15 | October monthly package overdue; distinguish stock/flow/repricing/control | IMF WEO, BIS, TIC, SWF filings, IEA/USGS, company filings |

## Next verification obligations

- **Publication:** keep the autonomous QA and public-publisher gates separate. The European protest study is staged and is not a public canonical bundle while `data/approved/` and `reports/` have no matching approved publication.
- **Data refresh:** prioritize fact checks for `data/strategic-actors.json` (latest material 24 September), `data/structural-opportunities.json` (23 September), `data/resource-control-atlas.json` (22 September), `data/policy-cases.json` (23 September), `data/conflict-systems.json` (20 September), and `data/technology-signals.json` (5 October). For each, retain old verification dates until the underlying specific source and controller/capacity claim have been examined.
- **Analytical limitations:** income-flow data, securities positions, current ownership, sovereign-fund AUM and physical production or reserves are separate categories. Values cannot be added into a supposed stock of global wealth. An asset valued at market price is not equivalent to effective operational control or delegated voting rights.
- **Site reliability:** use the build validation and HTTP smoke-test results. The current missing GitHub Actions Cloudflare secret is an actionable deployment-configuration blocker; do not label GitHub commits or approved papers as live without public HTTP verification.
- **Archive integrity:** every report must preserve EN/PT-BR source parity, controlled taxonomy, canonical ID/slug, immutable approval SHAs and append-only reconciliation. Routine producer updates must not bypass QA.

**End of structural audit.** Subsequent refreshes must verify the individual records and source releases before modifying their canonical `updated_at` timestamps.
