# Marginal Thinking — Editorial Architecture

**Status:** frozen editorial architecture  
**Version:** 1.0  
**Effective date:** 2026-09-16

This document is the normative editorial architecture for Marginal Thinking. It exists to prevent the publication from becoming a collection of unrelated verticals, country pages, market themes and product names.

The machine-readable counterpart is [`data/taxonomy.json`](./data/taxonomy.json). When prose and taxonomy conflict, both must be reconciled before new research is published. Automations may use the existing taxonomy but may not create a new research program, dimension, region, topic family or publication format on their own.

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

## 3. Geography is an access axis, not an editorial program

`Countries & Regions` organizes research geographically. It does not create additional research programs.

A single report can therefore be found through its program, region, country and topics without being copied or republished.

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

## 5. Publication format is separate from subject

The controlled publication formats are:

- `brief` — concise current assessment;
- `assessment` — focused analytical evaluation;
- `research-report` — deep structured research;
- `country-dossier` — comprehensive country-level research;
- `monitor` — recurring indicator and change monitor;
- `data-note` — narrow evidence or dataset note.

A series name such as `Global Macro`, `Global Wealth & Power Flows` or a future `Strategic Transitions Atlas` is a product series, not a new format or program.

Cadence is also separate and uses `event-driven`, `daily`, `weekly`, `monthly`, `quarterly` or `annual`.

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

/regions/<region>/
/pt-br/regions/<region>/

/countries/<country>/
/pt-br/countries/<country>/

/topics/<topic>/
/pt-br/topics/<topic>/
```

Publication format and cadence should normally be filters in the research archive rather than separate top-level navigation sections.

## 7. Navigation discipline

The primary navigation must remain small. Version 1.0 allows:

- **Research**;
- **Countries & Regions** once the geographic index is generated;
- **Method**;
- **About**.

The logo is the Home link. `Data` remains contextual until Marginal Thinking maintains enough first-party datasets to justify a permanent top-level destination.

Programs appear inside Research and on the home page; they do not each become a top-level navigation item.

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
  "format": "brief",
  "cadence": "daily"
}
```

Rules:

- exactly one `program`;
- zero or more distinct `related_programs` from the same controlled list;
- at least one analytical `dimension`;
- at least two controlled topics for substantive research;
- controlled geography values only;
- `Strategic Transitions` requires all three dimensions: economy, politics and society;
- a `country-dossier` requires `geography.level = country` and at least one country;
- tags and keywords remain free-form and multilingual.

## 9. Strategic Transitions editorial test

A study belongs in Strategic Transitions only when there is evidence of a consequential transition. Selection should not be driven by novelty alone.

The internal selection test is:

**relevance × change × underattention × transmission**

This is a research-selection framework, not an investment score or public country ranking.

The program should look for combinations such as fiscal repair, institutional change, market deepening, industrial transformation, FDI acceleration, infrastructure build-out, demographic shifts, trade-corridor changes, resource development or changes in market accessibility. Financial opportunity must always be analyzed together with liquidity, ownership, custody, regulation, political constraints and social consequences when material.

## 10. Economy–Politics–Society connection rule

The three dimensions must remain visible in the architecture even when an individual brief is dominated by one or two of them.

Deep research (`assessment`, `research-report` and `country-dossier`) should normally connect at least two dimensions. Strategic Transitions connects all three by definition.

A causal claim should state the mechanism. For example, a fiscal reform is not only a fiscal topic if it changes coalition incentives, household income, labor conditions, investment or political room for action.

## 11. Relationships between content

Related research should be determined in this order when the data are available:

1. same primary program;
2. shared country or region;
3. shared controlled topics;
4. related program;
5. free-form tags as a final search aid.

This prevents a loose tag from becoming more important than the publication’s actual research architecture.

## 12. Language and canonical editions

English remains the source locale and default public language. Brazilian Portuguese is the required official secondary edition.

Taxonomy identifiers are language-neutral slugs. Display labels are localized. Translation may adapt syntax and terminology but must not alter program, dimensions, geography, topics, format, cadence, evidence status, numbers or analytical conclusion.

## 13. Automation governance

Automated producers, QA and publishers must read this document and `data/taxonomy.json` before writing or approving public research.

Automations may:

- assign existing programs, dimensions, regions, topics, formats and cadence;
- use free-form tags and keywords for specific entities;
- propose an unmatched concept in QA notes.

Automations may not:

- create a fifth research program;
- turn a country, asset class, technology or commodity into a new top-level editorial vertical;
- add a new controlled topic, region or format silently;
- rename a permanent program;
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
