# Global Monetary & Financial Architecture — Editorial and Monitoring Standard

**Status:** normative internal standard  
**Effective:** 2026-09-22  
**Public series:** `global-monetary-financial-architecture`

## Editorial purpose

Track material changes in the institutions that create, allocate, constrain or back money, liquidity, sovereign credit and cross-border financial capacity. The unit of analysis is the institutional action and its transmission mechanism, not the press release.

The line covers central banks and monetary authorities worldwide; the IMF and World Bank Group; BIS committees and the FSB; the New Development Bank and other multilateral development banks; reserve, swap and settlement arrangements; sovereign-debt frameworks; and financial-stability rules with cross-border effects.

## Cadence

| Layer | Frequency | Publication rule |
| --- | --- | --- |
| Source collection | continuous | ingest official releases, decisions, minutes, balance sheets, operational notices and board resolutions |
| Institutional Flash | event-driven | only for changes with immediate systemic significance or Impact Score >= 80 |
| Global Monetary Pulse | daily | concise material-change screen; no forced article when no material change exists |
| Weekly Monetary & Institutional Review | weekly | synthesis of cross-institution transmission and divergence |
| Global Monetary Map | monthly | cumulative map of rates, balance sheets, reserves, liquidity, swaps and multilateral capital |
| Monetary Order Review | quarterly | regime-level assessment of monetary capacity, sovereign finance and institutional rules |
| State of the Global Financial Architecture | annual | full-year longitudinal synthesis and structural comparison |

A daily screen is mandatory. A daily public article is not. Silence is preferable to filler.

## Coverage universe

Coverage is jurisdiction-complete rather than BIS-members-only. Monitoring must include sovereign central banks, currency-union central banks and monetary authorities even when they are not BIS members.

Priority affects polling frequency, not eligibility for publication:

- **Tier A — systemic monetary nodes:** Fed, ECB/Eurosystem, PBoC, BoJ, BoE, RBI, BCB, BoC, RBA, SNB, Bank of Korea, Bank Indonesia, SARB, Banxico, Saudi Central Bank, Central Bank of the UAE, MAS and HKMA.
- **Tier B — BIS-member monetary authorities:** all remaining BIS member central banks and monetary authorities.
- **Tier C — global remainder:** all other IMF-member central banks, currency boards, monetary authorities and central banks of monetary unions, plus material territorial monetary authorities.
- **Tier M — multilateral system:** IMF, World Bank Group, BIS, FSB, BCBS, CPMI, IOSCO, IAIS, NDB, AIIB, ADB, AfDB, IDB Group, EBRD, CAF, IsDB and other regional development banks with material sovereign-finance capacity.

The machine-readable registry in `data/monetary-monitor-registry.json` contains the normalized core source set and the rules for extending jurisdiction coverage.

## Monitored signal classes

### Monetary stance
Policy rates, corridor/floor systems, forward guidance, voting splits, reserve remuneration, standing facilities and money-market operating targets.

### Central-bank balance sheets and liquidity
QE/QT, reinvestment, asset-purchase composition, reserves, collateral rules, emergency liquidity, repo facilities and changes in operating frameworks.

### Currency and reserve architecture
Foreign-exchange intervention, reserve composition when disclosed, gold, bilateral and multilateral swap lines, currency arrangements, capital controls, local-currency financing and reserve-currency infrastructure.

### Payments and settlement
RTGS changes, cross-border settlement, payment interoperability, CBDCs, tokenised central-bank money and material changes to financial-market infrastructure.

### Sovereign finance and multilateral capital
IMF programmes and reviews, debt-sustainability frameworks, SDR matters, debt restructuring, development-bank loans, guarantees, capital plans, co-financing and membership changes.

### Prudential and financial-stability rules
BIS/BCBS/FSB/CPMI/IOSCO/IAIS standards, resolution frameworks, non-bank intermediation, bank-capital/liquidity rules and systemic market-infrastructure changes.

## Source hierarchy

1. Decision, resolution, minute, balance sheet, operational notice or dataset published by the institution itself.
2. Joint official statement or national ministry/treasury acting within the arrangement.
3. Official statistical agency, exchange or debt-management office.
4. High-quality secondary reporting only when the primary source is unavailable or needed to establish contemporaneous market reaction.

A secondary source must never replace an available primary source for the institutional decision itself.

## Impact Score

Each candidate action is scored 0–100. The score controls publication urgency, never factual confidence.

| Component | Maximum |
| --- | ---: |
| Monetary/liquidity effect | 20 |
| Cross-border capital transmission | 15 |
| Reserve/currency architecture | 15 |
| Sovereign or multilateral financing | 15 |
| Financial-stability consequence | 10 |
| Regulatory/operational regime change | 10 |
| Geographic reach | 5 |
| Persistence | 5 |
| Structural novelty | 5 |

- **80–100:** event-driven flash plus inclusion in weekly/monthly synthesis.
- **50–79:** daily pulse when material; mandatory weekly ledger.
- **20–49:** ledger and weekly inclusion only if part of a broader pattern.
- **0–19:** archive; no public prose unless it later becomes analytically relevant.

## Daily publication contract

Every daily pulse must contain:

1. a stated cutoff time and coverage window;
2. only material institutional actions;
3. primary-source links for every decision;
4. an explicit distinction between decision, implementation date and announced future step;
5. at least one comparison table, one quantitative chart and one structural visual;
6. a section on transmission across liquidity, currencies, sovereign finance or capital allocation;
7. contrary evidence or limits where the structural interpretation could be overstated;
8. near-term watch items tied to scheduled decisions or measurable indicators.

Do not fill space with routine speeches, ceremonial meetings, generic forecasts or minor project announcements.

## QA: public-language hard gate

Public research must never contain text about the production machinery itself. Reject any public draft that exposes or describes:

- prompts, agents, producer/publisher roles, QA history, sidecars, staging, schemas, renderers, builds, deployment or editorial workflow;
- how Marginal Thinking is building, populating, operating or updating a tool, map, matrix, database or page;
- instructions to the reader or conversational scaffolding such as “let us examine”, “the key question is”, “it is worth noting”, “vamos analisar”, “a pergunta central é” or equivalent;
- methodology boilerplate inserted as prose instead of analytical content.

Legitimate subject-matter uses of terms such as “financial architecture”, “payment architecture” or “institutional framework” are allowed.

The repository gate `scripts/validate-public-prose.mjs` blocks known leakage patterns. QA must still perform human semantic review because a regex cannot guarantee natural prose.

## Analytical discipline

Observed actions, attributed institutional rationale and Marginal Thinking analysis must remain distinguishable. A policy vote is evidence. A stated rationale is the institution's view. A claim about cross-border transmission is analysis and must be supported by the instrument, balance-sheet or market mechanism involved.

Do not infer motives not stated by the institution. Do not convert a scheduled meeting into an expected outcome. Do not call a framework operational before its announced implementation date. Do not infer reserve diversification from bilateral financing alone.

## Bilingual and visual parity

English is the canonical source locale. PT-BR is required before approval. Tables, chart values, structural visuals, dates, units, cutoff times and material claims must be semantically equivalent across editions.

## Review cycle

The institution registry is reviewed monthly and whenever an institution is created, merged, dissolved, changes its official source domain or gains material cross-border capacity. The taxonomy is changed only by human editorial authorization.
