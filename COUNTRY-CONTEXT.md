# Marginal Thinking — Country Context Dossiers

**Status:** normative producer contract for auxiliary country context  
**Version:** 1.0  
**Effective date:** 2026-09-18

## 1. Purpose

Country Context Dossiers are public, event-driven auxiliary research products created when a canonical Marginal Thinking publication materially depends on understanding a country's political institutions, social structure, economic model, productive base, external relationships or historical path dependencies.

They are not a fifth research program, a country-of-the-day feed, an encyclopedia, a ranking of countries or a replacement for Strategic Transitions. They use the existing controlled publication format `country-dossier` and the existing geography axis.

The purpose is to make the main research easier to understand and to accumulate reusable, verified public context without diluting the Economics · Politics · Society architecture.

## 2. Trigger: derive candidates from published research

Candidate discovery starts only from canonical public research. Never begin from a fixed country queue.

A country becomes a candidate when it is materially involved in a mechanism defended by a published report, including through:

- canonical country metadata;
- repeated material mentions in the title, deck, tags, keywords or body;
- a trade, capital, energy, industrial, security, migration or institutional relationship central to the thesis;
- a country-specific policy or social structure required to understand transmission;
- recurrence across more than one canonical publication.

A passing mention, market ticker, list item, source location or incidental comparison is not sufficient.

## 3. Selection gate

The producer must evaluate the candidate qualitatively across five questions:

1. **thesis relevance** — would the reader understand the triggering research materially better with this country context?
2. **context gap** — does the public corpus lack a sufficiently broad, current country-level explanation?
3. **reuse** — is the context likely to be useful in future research across one or more programs?
4. **structural depth** — are there durable political, social, economic, productive or relational mechanisms worth explaining?
5. **non-duplication** — would a new dossier add material context rather than restate an existing assessment or dossier?

Publish only when the combined case is strong. There is no numeric public country score and no investment ranking.

A recent Strategic Transitions assessment about the same country is not an automatic reason to create a dossier. Create the dossier only if the broader political-social-economic context is materially missing and can be written without duplicating the transition article.

## 4. Anti-flood rules

Scheduled runs should normally stage **at most one new dossier per run**.

The first bootstrap run may stage up to three dossiers when the public corpus has accumulated clear context gaps.

Do not create a dossier merely because a country appeared once. Prefer countries that are recurrent, structurally important to a current mechanism, under-explained in the existing corpus, or likely to recur.

If no candidate passes the gate, produce nothing.

## 5. Editorial form

A dossier is not a generic country profile. It should answer: **how does this society and political economy work in ways that matter for Marginal Thinking research?**

The structure is adaptive, but a substantial dossier should normally cover the material subset of:

- current political and institutional architecture;
- state capacity, fiscal structure and policy constraints;
- economic model and productive base;
- trade, finance, currency and capital-market structure when material;
- energy, resources, infrastructure and logistics;
- labour market, demography, migration, education and human-capital constraints;
- income distribution, regional disparities, housing or other social mechanisms when material;
- historically relevant path dependencies;
- external relations, alliances and economic dependencies;
- current structural transitions and unresolved tensions;
- indicators that would change the assessment;
- links back to the canonical Marginal Thinking research that triggered the dossier.

History is selective. Include a historical episode only when it explains a current institution, dependency, capability, social structure or economic mechanism.

## 6. Political neutrality

Political description must remain factual and non-electoral.

Do not rank parties, governments, leaders or political choices. Do not infer motives as fact. For contested labels, describe the underlying institutions, laws, actions, electoral structure or documented interpretations and attribute disputes to identified sources.

The dossier may describe concentration of authority, constitutional rules, coalition structure, institutional constraints, state capacity, policy continuity, protest, civil society or media structure when these are material and verifiable, without converting them into an editorial verdict.

## 7. Evidence

Use the normal Marginal Thinking evidence hierarchy and re-verify every material public claim externally.

Prefer, as appropriate:

- national statistical offices, central banks, finance ministries and regulators;
- IMF, World Bank, OECD, BIS, UN agencies, Eurostat/European institutions and regional development banks;
- election commissions, constitutions, legislation and official institutional documentation for political structure;
- IEA/EIA/OPEC, USGS and official energy/resource agencies;
- peer-reviewed research and established research institutions for durable social or historical mechanisms;
- high-quality reporting as a complement for recent events.

Internal `research-context/**` may orient research but is never public evidence.

## 8. Visual evidence

Country dossiers dated on or after 2026-09-18 follow `RESEARCH-VISUALS.md`.

Minimum floor:

- at least one Markdown table;
- at least one explicit `chart`;
- at least one structural visual (`flow`, `mindmap`, `map`, `diagram`, `text` or `ascii`);
- at least four useful visuals in total.

Use a map when spatial concentration, trade corridors, energy dependence, regional inequality or external relationships are central. Visuals must be evidence-bearing and reproducible from cited material.

## 9. Metadata contract

Country Context Dossiers use the normal v2 pending contract plus the following auxiliary metadata:

```json
{
  "id": "MT-CC-YYYY-MM-DD-<country>",
  "slug": "YYYY-MM-DD-country-context-<country>",
  "kind": "country-context",
  "priority": 18,
  "format": "country-dossier",
  "cadence": "event-driven",
  "context_role": "country-context",
  "related_research_ids": ["MT-..."],
  "geography": {
    "level": "country",
    "regions": ["<controlled-region>"],
    "subregions": ["<controlled-subregion>"],
    "countries": [{"code": "XX", "slug": "<country>"}]
  }
}
```

Rules:

- `related_research_ids` contains one or more canonical public Marginal Thinking IDs that materially triggered or justify the dossier;
- every referenced ID must exist in the canonical public corpus when the dossier is staged;
- the primary `program` is selected from the existing four programs according to the dossier's dominant analytical mechanism;
- `related_programs`, `dimensions`, `topics` and `phenomena` use only the existing controlled taxonomy;
- a dossier should normally include all three dimensions when politics, society and economics are materially connected, but `Strategic Transitions` rules remain unchanged;
- do not create a new controlled series for Country Context.

## 10. Linking and discovery

`related_research_ids` is the strongest explicit relationship signal.

The public renderer should prefer explicit related IDs, then controlled taxonomy similarity in this order:

1. explicit `related_research_ids`;
2. same controlled series/domain where applicable;
3. shared country or region;
4. same primary program;
5. shared controlled topics;
6. shared controlled phenomena;
7. related program;
8. free-form tags only as a final tie-breaker.

A triggering report should also be able to discover the dossier through the reverse explicit relation even when the original report predates the dossier.

## 11. Revision and freshness

A Country Context Dossier is a research publication, not a permanently current reference page.

Do not silently overwrite old public conclusions. When a material change occurs, create a properly reviewed revision under the normal QA workflow and preserve audit history.

A new dossier is unnecessary when an existing country dossier remains analytically adequate. Update/revise when changes materially alter one or more of:

- political/institutional architecture;
- fiscal or monetary regime;
- productive model or major industrial capacity;
- demographic/labour structure;
- external dependence or strategic relationship;
- energy/resource/logistics structure;
- the interpretation required by new canonical research.

Minor current-data drift should normally be handled in the new main research rather than forcing a dossier revision.

## 12. Producer workflow

For each run:

1. read `RESEARCH-PUBLISHING.md`, `EDITORIAL-ARCHITECTURE.md`, `COUNTRY-CONTEXT.md`, `RESEARCH-CONTEXT.md`, `RESEARCH-VISUALS.md`, `INSTITUTIONAL-EDITORIAL.md`, `CONFLICT-SECURITY-SOCIAL-CHANGE.md` and `data/taxonomy.json`;
2. inspect newly/recently published canonical metadata first;
3. identify candidate countries only from those publications;
4. inspect full Markdown only for candidates that may be material;
5. search existing public reports and internal context to avoid duplication;
6. apply the selection gate;
7. research externally and seek contrary evidence;
8. stage EN and PT-BR editions with visual parity;
9. write the v2 pending sidecar last with `ready:true`;
10. commit atomically per dossier;
11. immediately hand off to `MT Research QA`;
12. never publish directly.

## 13. Relationship to internal research context

The internal `research-context/**` layer and public Country Context Dossiers serve different purposes:

- internal context is compact memory optimized for future agents and is not evidence;
- a Country Context Dossier is a public, sourced, bilingual research product optimized for readers.

Do not automatically expose an internal briefing as a dossier. Public dossiers require fresh research, sourcing, visual evidence, QA and normal publication.

## 14. Quality test

Before staging, ask:

- Does this dossier materially improve comprehension of an existing canonical report?
- Does it add context not already supplied by an existing country-level publication?
- Does it connect political, economic and social mechanisms rather than list facts?
- Are historical facts tied to present mechanisms?
- Are current claims re-verified?
- Are the visuals analytical rather than decorative?
- Are the triggering research IDs explicit?
- Would the dossier still be useful in a later report on the same country?

If the answer to the first two questions is no, do not publish.
