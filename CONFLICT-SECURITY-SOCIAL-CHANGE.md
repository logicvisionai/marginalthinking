# Marginal Thinking — Conflict, Security & Social Change

**Status:** controlled cross-cutting editorial lens  
**Parent architecture:** `EDITORIAL-ARCHITECTURE.md`  
**Effective date:** 2026-09-16

## Purpose

Conflict, Security & Social Change is a cross-cutting analytical lens for Marginal Thinking. It is **not a fifth research program**, not a top-level navigation section and not a separate news vertical.

Its purpose is to ensure that war, armed conflict, strategic competition, sanctions, security policy, political instability, civil unrest, migration, demographic transition, institutional change and broader social change are incorporated when they materially alter capital, production, institutions, markets, state capacity or the distribution of power.

The lens may be used inside any of the four permanent research programs:

- `global-system-power`;
- `political-economy-markets`;
- `strategic-transitions`;
- `technology-production-society`.

## Analytical rule

Do not treat conflict or social change as isolated event categories. The research question is how the phenomenon changes capabilities, constraints and transmission mechanisms.

A useful analytical chain is:

**conflict or social change → capability/restriction → fiscal, industrial, logistical or institutional response → trade, capital and market effects → household, labor, demographic or political effects → change in the distribution of power**

Not every report must traverse every link. It must, however, identify the links on which its conclusion depends.

## Controlled phenomena

New and materially revised research may classify zero or more of the following controlled `phenomena` values from `data/taxonomy.json`:

- `war-armed-conflict` — War & Armed Conflict / Guerra & Conflito Armado;
- `strategic-competition` — Strategic Competition / Competição Estratégica;
- `defense-security` — Defense & Security / Defesa & Segurança;
- `sanctions-economic-coercion` — Sanctions & Economic Coercion / Sanções & Coerção Econômica;
- `political-stability` — Political Stability / Estabilidade Política;
- `civil-unrest` — Civil Unrest / Mobilização & Instabilidade Civil;
- `migration-displacement` — Migration & Displacement / Migração & Deslocamento;
- `demographic-transition` — Demographic Transition / Transição Demográfica;
- `institutional-change` — Institutional Change / Mudança Institucional;
- `social-change` — Social Change / Mudança Social.

`phenomena` is an analytical classification axis. It does not replace `topics`. Topics describe mechanisms or subject matter; phenomena describe the condition, transition or form of contestation being observed.

For example, a report on sanctions may use `sanctions-economic-coercion` as a phenomenon while using `trade-investment`, `currencies`, `industry-production` and `geopolitics-security` as topics.

## Armed conflict and war

Research on war or armed conflict must distinguish, when relevant:

1. **intentions and stated objectives** — attributed to the actor or source making the claim;
2. **capability** — forces, industrial capacity, logistics, finance, technology and institutional ability;
3. **deployment and operations** — what is demonstrably fielded or occurring;
4. **verified effects** — territorial, material, economic, fiscal, demographic or institutional consequences supported by evidence;
5. **claims and information operations** — claims that remain unverified or disputed must be labeled as such;
6. **constraints** — manpower, ammunition, logistics, fiscal space, industrial throughput, alliances, geography, domestic politics and social legitimacy when material;
7. **transmission** — effects on energy, commodities, trade routes, capital flows, currencies, sovereign risk, supply chains, investment, migration and household conditions;
8. **second-order effects** — rearmament, industrial policy, alliance behavior, sanctions adaptation, technological diffusion, institutional change and longer-run social effects.

Do not infer operational capability from a program announcement, procurement plan, prototype, budget line or political statement alone.

## Sanctions and economic coercion

Separate the instrument from its effect. A sanctions analysis should identify:

- legal scope and implementing authority;
- target and intended transmission channel;
- enforcement and circumvention constraints;
- trade, financial, technology or logistics exposure;
- substitution and adaptation;
- incidence across governments, firms and households;
- observed versus intended effects;
- spillovers to third countries and markets.

Do not describe a sanction as successful or unsuccessful without defining the stated objective, time horizon and observable evidence.

## Political stability, institutional change and civil unrest

Avoid reducing political stability to leadership turnover or protest counts. Examine, where material:

- institutional continuity and rule implementation;
- fiscal and administrative capacity;
- coalition durability and legislative constraints;
- security-sector behavior under public evidence;
- protest scale, persistence and geographic reach;
- labor action and economic interruption;
- legitimacy indicators without treating polling as a complete measure of stability;
- effects on investment, production, public finance and household behavior.

Use neutral descriptions. Contested political labels should be attributed to identified sources rather than adopted as editorial conclusions.

## Social change

Social change belongs in Marginal Thinking when it modifies economic behavior, institutional capacity, political incentives or the allocation of resources. Relevant mechanisms may include:

- demographic aging or youth bulges;
- fertility and household formation;
- migration and forced displacement;
- labor-force participation and skill composition;
- education and human capital;
- urbanization and regional concentration;
- income distribution and mobility;
- changes in social trust, legitimacy or collective organization when supported by evidence;
- technological change affecting work, consumption, organization or political institutions.

Do not add a social section merely to satisfy a template. The analysis must state the mechanism connecting the social change to the report's thesis.

## Evidence hierarchy

Prefer primary and directly observable evidence appropriate to the claim: official statistical releases, budget and procurement documents, legal texts, international organizations, verified geospatial or operational data when appropriate, peer-reviewed research and established research institutions. High-quality reporting may be used for events and context, but a material claim should not rest on anonymous or circular sourcing when stronger evidence exists.

For fast-moving conflicts, distinguish the date of the event from the publication date and state uncertainty explicitly. Do not convert absence of public evidence into evidence of absence.

## Scenarios and confidence

Scenarios are conditional paths, not predictions. State the conditions that would make a scenario more or less consistent with observed evidence. Do not assign artificial probabilities when the evidence does not support them.

Confidence should reflect source quality, agreement among independent evidence, data recency, observability and the number of inferential steps required.

## Metadata and navigation discipline

For new or materially revised research, producers should include a top-level `phenomena` array in the pending sidecar, using only controlled identifiers from `data/taxonomy.json`. The array may be empty when no controlled phenomenon is materially relevant.

The lens does not create a new top-level route. Phenomena may support search, filtering, related-research logic and future analytical indexes without expanding the primary navigation.

## QA test

QA should reject or require revision when a material conflict/security/social-change claim:

- treats an attributed claim as an established fact;
- confuses announced, demonstrated, deployed and operational capability;
- asserts causality without a transmission mechanism;
- uses a social or political label without defining observable evidence;
- ignores a major constraint or contrary evidence that materially weakens the thesis;
- uses an uncontrolled `phenomena` identifier;
- turns the lens into a fifth program, country ranking or standalone news category.
