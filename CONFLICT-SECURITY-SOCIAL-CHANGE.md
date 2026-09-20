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


## Conflict Systems Framework

When a conflict becomes a persistent research object, use the **Conflict Systems Framework**. The objective is not to write a chronology with a geopolitical appendix. The objective is to reconstruct how a security system formed, how actors came to interpret it, which material constraints shaped their choices, how violence changed the system, and how the resulting shocks transmit into economies and societies.

A conflict-system dossier should answer five different questions without collapsing them into one:

1. **what happened** — dated events, agreements, institutional changes and measurable outcomes;
2. **how the system formed** — path dependence, state formation, borders, alliances, economic integration, military institutions and previous settlements;
3. **how actors understood the system** — official doctrines, strategic narratives, threat perceptions, public opinion and competing schools of interpretation;
4. **what actors could actually do** — fiscal, military, industrial, technological, demographic, logistical, institutional and alliance capacity;
5. **how the conflict changes other systems** — households, labor, migration, energy, trade, capital, technology, industrial policy, institutions and political coalitions.

### Country dossier schema

Countries materially involved in a conflict should be researched as persistent dossiers rather than rewritten from zero for every event. Each dossier should cover, when relevant:

- state formation, borders and constitutional development;
- historical memory and major national narratives;
- political institutions, governing coalitions and state capacity;
- political economy, ownership, fiscal structure and distribution;
- macroeconomics, debt, inflation, external accounts and financial conditions;
- industrial base, energy system, infrastructure, logistics and strategic resources;
- demography, migration, regional inequality, labor and human capital;
- language, religion, ethnicity and regional identity only where evidence shows that they materially affect the conflict;
- civil society, media environment, trust and public opinion;
- defence institutions, force structure, mobilisation base, procurement and defence industry;
- external alliances, treaty commitments, dependencies and strategic exposure;
- social costs of conflict, including casualties where reliably measured, displacement, household income, public services and reconstruction;
- the country's own stated objectives, the objectives attributed to it by others, and the evidence supporting or contradicting those interpretations.

The dossier must distinguish **country**, **government**, **elite coalition**, **institution**, **armed actor** and **population**. None of these should be treated as interchangeable.

### Political-psychology layer

Psychology is analyzed at the level that can be evidenced. Marginal Thinking does not diagnose leaders or infer hidden mental states.

Relevant variables include:

- perceived threat and security expectations;
- collective memory and historical analogy;
- national, regional and institutional identity;
- status concerns and perceived loss of status;
- trust in domestic and foreign institutions;
- public tolerance for economic and military costs;
- expectations about adversary intentions;
- perceived fairness or legitimacy of settlements;
- fear, uncertainty and future expectations measured through credible surveys;
- strategic narratives repeated in official doctrine, speeches, education, media or political discourse.

Evidence should come from longitudinal surveys, survey experiments where available, public-opinion research, official documents, speeches, historical scholarship and other attributable material. Wartime polling must state sampling exclusions, mode, field dates and material limitations. Survey results describe measured respondents; they are not a substitute for an entire society.

### Intellectual and diplomatic interpretations

Renowned diplomats, historians, political scientists, economists and military thinkers belong in the evidence architecture as **interpretive sources**, not as authorities whose prestige converts an argument into fact.

For each major interpretive source, record:

- author and institutional or professional context;
- date of the argument;
- work, speech, interview or archival source;
- central proposition;
- causal mechanism proposed;
- assumptions about actors and international order;
- evidence used;
- policy conclusion, if any;
- contemporary counterarguments;
- later evidence that strengthened or weakened the interpretation;
- whether the author's position changed over time.

This is especially important for long-lived figures. An earlier argument and a later revision should both be preserved rather than synthesised into a fictional single position.

Books should be used as structured interpretive corpora. The research should extract propositions and mechanisms, not decorative quotations. A book such as Henry Kissinger's *World Order*, for example, can be used to identify claims about legitimacy, balance, competing concepts of order and the limits of a shared international system; those claims must then be tested against primary documents and other scholarship in the case under study.

### Competing explanations

Every mature conflict-system dossier should maintain a **contradiction ledger**. For each important proposition, preserve:

| Field | Requirement |
|---|---|
| Claim | A proposition that can be evaluated |
| Source | The actor, document, dataset or author making/supporting it |
| Interpretation class | Primary fact, empirical estimate, historical interpretation, theory, practitioner view or scenario |
| Mechanism | How the proposed cause produces the effect |
| Counterevidence | Material evidence or scholarship that weakens the proposition |
| Alternative explanation | A competing causal account |
| Confidence | Evidence strength, not rhetorical conviction |
| Falsifier | What observation would materially weaken the current assessment |

The purpose is not artificial balance. Competing explanations should receive weight in proportion to the evidence supporting them.

### Long-horizon genealogy

Do not choose a start date merely because it is convenient for the current news cycle. Build timelines in layers:

**deep structure → institutional settlement → accumulated friction → failed or incomplete settlements → proximate crisis → armed conflict → adaptation → current system**

For European security, for example, 2022 is a necessary operational turning point but not a sufficient historical starting point. Research may need to traverse the end of the Cold War, the Soviet dissolution, post-Cold War security institutions, alliance enlargement, Ukrainian state development, NATO-Russia arrangements, the 2014 rupture, the Minsk process, military and economic adaptation, and the 2022 invasion. The relevant depth depends on the causal question, not on a fixed number of years.

### Escalation monitoring

The conflict-system layer may support an escalation monitor, but the monitor must never be presented as a precise probability of general war unless an empirically defensible probability model exists.

Track observable domains separately:

- military posture and geographical expansion of operations;
- alliance consultation, deployments and readiness;
- nuclear doctrine, signalling and force posture;
- diplomatic channels and crisis-management mechanisms;
- arms-control arrangements;
- defence-industrial mobilisation and replenishment;
- sanctions, export controls and economic coercion;
- cyber, space and critical-infrastructure incidents;
- public and elite expectations where measured;
- mechanisms capable of containing escalation.

A composite display may summarise these domains, but users must be able to inspect the underlying observations, direction of change, source, date, uncertainty and weighting rule.

### Evidence tiers

Use a source hierarchy appropriate to the claim:

1. treaties, legislation, official statistics, budgets, court records, regulatory material and primary institutional documents;
2. directly observed or methodologically documented datasets from established international, academic and research institutions;
3. peer-reviewed scholarship and archive-based historical research;
4. specialist research institutions and named expert analysis;
5. high-quality reporting for current developments and evidence not yet available in primary datasets;
6. memoirs, speeches, interviews, opinion essays and practitioner books as attributed evidence of interpretation, strategy or memory.

A lower tier is not automatically false and a higher tier is not automatically correct. The hierarchy governs how a claim is used and how much triangulation it requires.

### Efficient update model

Conflict research should be **stateful**. New events update persistent objects instead of producing disconnected pages.

A useful update chain is:

**new evidence → event record → affected country/actor dossier → conflict-system timeline → mechanism or escalation indicator → related economic/social transmission → research note or revised assessment**

Stable historical material should not be regenerated daily. Only changed evidence, interpretation or confidence should trigger a revision. This reduces duplication, improves internal linking, preserves a canonical history and lets recurring reports strengthen long-lived pages.

### Publication standard

A conflict-system publication should normally contain:

- a clear time cutoff;
- a causal thesis that can be challenged;
- a layered timeline;
- country/actor distinctions;
- material, institutional and social constraints;
- at least one public-opinion or social evidence layer when relevant and available;
- competing interpretations from primary actors and credible scholarship;
- economic and social transmission mechanisms;
- second-order effects;
- conditional escalation and de-escalation pathways;
- a source note explaining the strongest limitations;
- explicit falsifiers for the main analytical inferences.

The output should help a reader reconstruct the system independently. It should not tell the reader which political side to support.
