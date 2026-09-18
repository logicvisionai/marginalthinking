# Marginal Thinking — Editorial Architecture

**Status:** frozen editorial architecture  
**Version:** 1.0  
**Effective date:** 2026-09-16

This document is the normative editorial architecture for Marginal Thinking. It exists to prevent the publication from becoming a collection of unrelated verticals, country pages, market themes and product names.

The machine-readable counterpart is [`data/taxonomy.json`](./data/taxonomy.json). When prose and taxonomy conflict, both must be reconciled before new research is published. Automations may use the existing taxonomy but may not create a new research program, controlled series, series domain, cross-cutting lens, controlled phenomenon, dimension, region, topic family or publication format on their own.

## 1. Core identity

Marginal Thinking is organized around three connected dimensions:

- **Economics** — capital, production, prices, trade, finance, resources, productivity and distribution;
- **Politics** — institutions, state capacity, public policy, coalitions, regulation, conflict and international relations;
- **Society** — demography, labor, income, mobility, inequality, legitimacy, urbanization, education and social change.

These are **analytical dimensions, not three separate verticals**. Research should explain how the relevant dimensions interact when the mechanism connects them.

The publication focuses on systems, transitions and changes at the margin: what is changing, why it is changing, who has agency, which constraints matter, how the effects transmit, and what evidence would weaken the assessment.

## 2. Four permanent research programs

Marginal Thinking has exactly four primary research programs in version 1.0. Every public research item must have **one and only one primary program**. A report may reference other programs through `related_programs`, but it must not be duplicated across programs.

### 2.1 Global System & Power

Studies how capital, resources, productive capacity, infrastructure and state capabilities are distributed across the international system and how those distributions change.

Typical questions include reserves, sovereign capital, trade networks, resource access, industrial capacity, strategic infrastructure, geoeconomic dependence and the transmission of changes in global power.

### 2.2 Political Economy & Markets

Studies how macroeconomic conditions, public policy, institutions and political constraints affect markets, firms, households and the allocation of capital.

Typical questions include fiscal and monetary policy, sovereign debt, currencies, credit, capital markets, taxation, regulation, industrial policy, distributional effects and political risk transmitted through economic mechanisms.

### 2.3 Strategic Transitions

Studies consequential national and regional transformations that are not receiving attention proportional to their economic, political or social significance.

The unit of analysis is **the transition, not the obscurity of the country**. This program must not become a “country of the week” series, a frontier-market recommendation list or a ranking of developing countries.

A Strategic Transitions study should normally establish:

1. what materially changed;
2. why the change matters;
3. why conventional coverage may understate it;
4. the economic mechanism;
5. the political mechanism;
6. the social consequences or constraints;
7. catalysts and conditions that could accelerate or reverse the transition;
8. investability or market-access constraints when financial assets are discussed;
9. evidence that would invalidate the thesis.

A country may be high-income, middle-income or low-income. Income classification is contextual information, not the selection rule.

### 2.4 Technology, Production & Society

Studies technologies through demonstrated capability, deployment, industrial scale and their consequences for production, labor, capital, institutions, security and society.

Technology is not treated as a separate futurist news vertical. The analytical chain is technical capability → engineering → deployment → scale → economics → production → institutions → society.

#### Weekly technology-signal workflow

The program includes a weekly evidence-screening workflow governed by [`TECHNOLOGY-SIGNALS.md`](./TECHNOLOGY-SIGNALS.md). This workflow is **not a controlled series**, does not create a landing page or top-level navigation item, and does not reserve coverage for any named technology.

It scans for material changes in demonstrated capability, replication, engineering feasibility, cost, deployment, manufacturing, enabling infrastructure and scale. At most one public assessment may emerge from a weekly run, and publication is conditional on a material evidence delta plus a defensible path from technical change to consequences for production, capital, labour, institutions, security or society.

The workflow maintains a small non-public signal ledger in `data/technology-signals.json` to preserve candidate continuity and dynamically follow the researchers, laboratories, universities, institutions, public agencies and firms closest to the evidence. The ledger is operational memory only and never substitutes for external source verification.

#### Controlled series: Energy, Materials & Industrial Systems

`energy-materials-industrial-systems` is a controlled product series inside Technology, Production & Society. It is **not a fifth research program** and it does not receive a top-level navigation item.

The series studies how energy, materials and industrial systems change costs, productive capacity, dependencies, capital allocation and economic or strategic capability. Its recurring analytical chain is:

**resource → technology → production → infrastructure → cost → scale → dependencies → capital → capacity/power → consequences**

It has exactly four controlled domains:

- `electricity-systems` — Electricity Systems / Sistemas Elétricos;
- `fuels-energy-carriers` — Fuels & Energy Carriers / Combustíveis & Vetores Energéticos;
- `strategic-advanced-materials` — Strategic & Advanced Materials / Materiais Estratégicos & Avançados;
- `industrial-capacity-supply-chains` — Industrial Capacity & Supply Chains / Capacidade Industrial & Cadeias de Suprimento.

The detailed inclusion test, evidence standard and release checklist are defined in [`ENERGY-MATERIALS-INDUSTRIAL-SYSTEMS.md`](./ENERGY-MATERIALS-INDUSTRIAL-SYSTEMS.md).

## 3. Geography is an access axis, not an editorial program

`Countries & Regions` organizes research geographically. It does not create additional research programs.

A single report can therefore be found through its program, controlled series where applicable, region, country and topics without being copied or republished.

Geographic levels are:

- `global`;
- `region`;
- `country`;
- `multi-country`.

Countries are identified by ISO 3166-1 alpha-2 code plus a stable English slug. Regions and subregions come only from the controlled taxonomy.

## 4. Topics are controlled analytical descriptors

Topics answer **what mechanism is being studied**. They are not navigation-level editorial brands.

Examples include macroeconomics, fiscal policy, sovereign debt, capital markets, trade and investment, energy, institutions and governance, demography and labor, or infrastructure and logistics.

Free-form `tags` and `keywords` may still be used for search and article-specific entities, but they do not change the controlled taxonomy.

An automation must never create a new controlled topic because a report contains an unfamiliar concept. It must use the nearest valid topic and preserve the specific term as a tag or keyword. A new controlled topic requires an explicit human editorial change to `data/taxonomy.json`.

### 4.1 Cross-cutting lens: Conflict, Security & Social Change

`conflict-security-social-change` is a controlled cross-cutting lens. It is **not a fifth research program**, not a top-level navigation section and not a standalone news vertical.

Its purpose is to make war, armed conflict, strategic competition, defense and security, sanctions, political stability, civil unrest, migration, demographic transition, institutional change and broader social change analytically visible when they materially affect capital, production, markets, institutions, state capacity or the distribution of power.

The implementation uses a controlled `phenomena` metadata axis. Topics and phenomena are distinct:

- `topics` describe the mechanisms or subject matter being studied;
- `phenomena` describe the condition, transition or form of contestation being observed.

A report may contain zero or more controlled phenomena. New or materially revised research should include a `phenomena` array, which may be empty when no controlled phenomenon is materially relevant. Producers may not invent new phenomenon identifiers.

The controlled phenomena are:

- `war-armed-conflict`;
- `strategic-competition`;
- `defense-security`;
- `sanctions-economic-coercion`;
- `political-stability`;
- `civil-unrest`;
- `migration-displacement`;
- `demographic-transition`;
- `institutional-change`;
- `social-change`.

A conflict or social-change study should not stop at event description. When the evidence supports it, trace the mechanism through:

**conflict or social change → capability/restriction → fiscal, industrial, logistical or institutional response → trade, capital and market effects → household, labor, demographic or political effects → change in the distribution of power**

For war and security analysis, distinguish intentions and attributed claims from demonstrated capability, deployment, operations and verified effects. For social change, identify the observable mechanism connecting demographic, labor, migration, institutional or social evidence to the report's economic or political thesis.

Detailed evidence rules and the QA test are defined in [`CONFLICT-SECURITY-SOCIAL-CHANGE.md`](./CONFLICT-SECURITY-SOCIAL-CHANGE.md).

## 5. Publication format and series are separate from subject

The controlled publication formats are:

- `brief` — concise current assessment;
- `assessment` — focused analytical evaluation;
- `research-report` — deep structured research;
- `country-dossier` — comprehensive country-level research;
- `monitor` — recurring indicator and change monitor;
- `data-note` — narrow evidence or dataset note.

A series name such as `Global Macro`, `Global Wealth & Power Flows`, `Energy, Materials & Industrial Systems` or a future `Strategic Transitions Atlas` is a product series, not a new format or program. Only series registered in the controlled taxonomy may receive a canonical series landing page or structured series metadata.

Cadence is also separate and uses `event-driven`, `daily`, `weekly`, `monthly`, `quarterly` or `annual`.

## 5.1 Visual evidence layer

Research is not complete when its argument exists only as prose. Tables, charts, causal diagrams, maps and mind maps form a deterministic visual-evidence layer governed by [`RESEARCH-VISUALS.md`](./RESEARCH-VISUALS.md).

The visual layer does not create new programs, topics, formats or taxonomy. It is a presentation-and-audit contract across all four programs. Visuals must clarify a comparison, distribution, dependency, corridor, causal chain or uncertainty already supported by evidence; decorative graphics and fabricated completeness are prohibited.

The canonical artifact remains Markdown. The site renderer converts the controlled visual grammar into responsive HTML at build time, keeping the architecture file-based, auditable and compatible with GitHub + Cloudflare.

## 6. URL architecture

Stable report URLs remain:

```text
/reports/YYYY/MM/<slug>.html
/pt-br/reports/YYYY/MM/<slug>.html
```

The report URL must not encode every taxonomy axis. Classification belongs in metadata.

Canonical collection routes are reserved as follows:

```text
/research/<program>/
/pt-br/research/<program>/

/series/<series>/
/pt-br/series/<series>/

/regions/<region>/
/pt-br/regions/<region>/

/countries/<country>/
/pt-br/countries/<country>/

/topics/<topic>/
/pt-br/topics/<topic>/
```

A controlled series may expose domain collections below its landing page, but those domains do not become primary navigation items. Cross-cutting phenomena do not create new top-level routes in version 1.0; they may support search, filters, related-research logic and future analytical indexes. Publication format and cadence should normally be filters in the research archive rather than separate top-level navigation sections.

## 7. Navigation discipline

The primary navigation must remain small. Version 1.0 allows:

- **Research**;
- **Countries & Regions** once the geographic index is generated;
- **Method**;
- **About**.

The logo is the Home link. `Data` remains contextual until Marginal Thinking maintains enough first-party datasets to justify a permanent top-level destination.

Programs appear inside Research and on the home page; they do not each become a top-level navigation item. Controlled series may be featured contextually on the home page or inside their parent program, but they do not expand the global navigation. Cross-cutting lenses and phenomena remain metadata-driven and do not expand global navigation.

## 8. Required metadata contract

Every canonical publication bundle must declare:

```json
{
  "taxonomy_version": "1.0",
  "program": "political-economy-markets",
  "related_programs": ["global-system-power"],
  "dimensions": ["economy", "politics"],
  "geography": {
    "level": "global",
    "regions": [],
    "subregions": [],
    "countries": []
  },
  "topics": ["macroeconomics", "capital-markets"],
  "phenomena": [],
  "format": "brief",
  "cadence": "daily"
}
```

Rules:

- exactly one `program`;
- zero or more distinct `related_programs` from the same controlled list;
- at least one analytical `dimension`;
- at least two controlled topics for substantive research;
- `phenomena`, when present, contains only controlled values and no duplicates;
- controlled geography values only;
- `Strategic Transitions` requires all three dimensions: economy, politics and society;
- a `country-dossier` requires `geography.level = country` and at least one country;
- tags and keywords remain free-form and multilingual.

A publication belonging to a controlled series additionally declares:

```json
{
  "series": "energy-materials-industrial-systems",
  "series_domain": "electricity-systems"
}
```

`series` and `series_domain` must match the controlled registry in `data/taxonomy.json`. The Energy, Materials & Industrial Systems series must retain `technology-production-society` as its primary program.

## 9. Strategic Transitions editorial test

A study belongs in Strategic Transitions only when there is evidence of a consequential transition. Selection should not be driven by novelty alone.

The internal selection test is:

**relevance × change × underattention × transmission**

This is a research-selection framework, not an investment score or public country ranking.

The program should look for combinations such as fiscal repair, institutional change, market deepening, industrial transformation, FDI acceleration, infrastructure build-out, demographic shifts, trade-corridor changes, resource development or changes in market accessibility. Financial opportunity must always be analyzed together with liquidity, ownership, custody, regulation, political constraints and social consequences when material.

Conflict, security or social-change phenomena may be decisive parts of a Strategic Transition, but they do not replace the transition test. A war, protest wave, migration shock or institutional crisis belongs in Strategic Transitions only when the research can demonstrate a consequential transformation and its economic, political and social transmission.

## 10. Economy–Politics–Society connection rule

The three dimensions must remain visible in the architecture even when an individual brief is dominated by one or two of them.

Deep research (`assessment`, `research-report` and `country-dossier`) should normally connect at least two dimensions. Strategic Transitions connects all three by definition.

A causal claim should state the mechanism. For example, a fiscal reform is not only a fiscal topic if it changes coalition incentives, household income, labor conditions, investment or political room for action. Likewise, a war is not only a geopolitical topic if it alters fiscal capacity, industrial output, logistics, trade, migration, household conditions or institutional behavior.

## 11. Relationships between content

Related research should be determined in this order when the data are available:

1. same controlled series and domain, where applicable;
2. same primary program;
3. shared country or region;
4. shared controlled topics;
5. shared controlled phenomena when materially relevant;
6. related program;
7. free-form tags as a final search aid.

This prevents a loose tag from becoming more important than the publication’s actual research architecture.

## 12. Language and canonical editions

English remains the source locale and default public language. Brazilian Portuguese is the required official secondary edition.

Taxonomy identifiers are language-neutral slugs. Display labels are localized. Translation may adapt syntax and terminology but must not alter program, series, series domain, dimensions, geography, topics, phenomena, format, cadence, evidence status, numbers or analytical conclusion.

## 13. Automation governance

Automated producers, QA and publishers must read this document and `data/taxonomy.json` before writing or approving public research. Producers working on Energy, Materials & Industrial Systems must also read `ENERGY-MATERIALS-INDUSTRIAL-SYSTEMS.md`. Producers and QA handling the weekly technology-signal workflow or monthly Strategic Technology Assessment must read `TECHNOLOGY-SIGNALS.md`. Research materially involving conflict, security or social change must follow `CONFLICT-SECURITY-SOCIAL-CHANGE.md`.

Automations may:

- assign existing programs, controlled series and series domains, dimensions, regions, topics, controlled phenomena, formats and cadence;
- use free-form tags and keywords for specific entities;
- propose an unmatched concept in QA notes.

Automations may not:

- create a fifth research program;
- create a new controlled series or series domain;
- create a new cross-cutting lens or controlled phenomenon;
- turn a country, asset class, technology, fuel, material, commodity, war or social phenomenon into a new top-level editorial vertical;
- add a new controlled topic, region or format silently;
- rename a permanent program, controlled series or cross-cutting lens;
- create a public country ranking or investment league table as a substitute for analysis;
- rewrite global navigation or institutional architecture during routine publication.

## 14. Change control

Version 1.0 is frozen. A structural change requires an explicit editorial decision followed by a coordinated update to:

1. `EDITORIAL-ARCHITECTURE.md`;
2. `data/taxonomy.json`;
3. validation rules;
4. institutional copy where relevant;
5. automation prompts where relevant.

Routine research publication must never perform those changes implicitly.
