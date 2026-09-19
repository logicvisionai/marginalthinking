# Strategic Actors & Structural Power

## Purpose

Strategic Actors is a cross-cutting analytical system for identifying entities whose decisions can materially alter economic, technological, institutional or geopolitical structures. It is not a fifth research program and does not change the frozen editorial taxonomy.

The system does not rank wealth, fame or political importance. It documents **mechanisms of structural capacity**: what an actor can allocate, own, finance, operate, supply, constrain or enable; who depends on that capability; how substitutable it is; and what limits the actor's discretion.

## Core distinction

The public interface must keep the following concepts separate:

**assets under management ≠ beneficial ownership ≠ voting authority ≠ direct corporate control ≠ economic exposure ≠ political influence ≠ state authority**

A relationship is shown only at the level supported by evidence. A delegated asset manager is not described as owning client assets. A minority shareholder is not described as controlling a company unless control is legally or operationally established. A state-owned investment company is not assumed to execute day-to-day government policy unless its mandate or an evidenced action establishes that link.

## Unit of analysis

The unit is:

**actor → capability → target/dependency → transmission → structural consequence**

An actor enters the public system when published Marginal Thinking research establishes at least one material transmission mechanism and identifies the limits of that mechanism.

Selection should favor actors with some combination of:

- large capital-allocation capacity;
- direct ownership or governance rights;
- credit or liquidity provision;
- control or operation of physical infrastructure;
- control of scarce technology or intellectual property;
- material physical commodity intermediation;
- control of productive capacity or resource conversion;
- state mandate or policy linkage;
- high network centrality;
- low short-run substitutability;
- cross-border reach;
- durable rather than episodic capacity.

These are screening dimensions, not a score. They must not be collapsed into a single "power index."

## Entity rule

The database tracks legal or operational entities, not surnames, dynasties or vague networks. "Rothschild", "Rockefeller" or similar labels are not valid actor records by themselves. A specific company, foundation, family office, trust, investment vehicle or other identifiable institution may be included when the relevant relationship is documented.

Historical actors belong in historical research unless a present legal entity and present mechanism can be established.

## Relationship contract

Each public relationship declares:

- actor and target;
- capability channel;
- control mode;
- bilingual mechanism;
- qualitative substitutability;
- qualitative confidence;
- horizon;
- last verification date;
- one or more canonical Marginal Thinking research IDs.

The canonical research remains the evidence carrier and contains external sources. The actor database is a derived intelligence layer.

## Control modes

- **delegated** — authority exercised on behalf of clients or beneficiaries under mandate;
- **direct-ownership** — the actor owns the relevant asset or equity interest;
- **state-mandate** — the actor has an explicit public or sovereign mandate relevant to the mechanism;
- **commercial-intermediation** — structural capacity derives from arranging, moving, storing or matching physical or financial flows;
- **production-control** — structural capacity derives from owned or controlled productive assets;
- **technology-supply** — structural capacity derives from supplying difficult-to-substitute technology.

The control mode describes the evidenced channel. It is not a claim that the actor controls the entire target system.

## Substitutability

Substitutability is central because size alone is a poor proxy for structural importance.

- **low** — credible alternatives are limited on the stated horizon;
- **medium** — alternatives exist but switching carries meaningful time, cost or capability constraints;
- **high** — multiple credible alternatives can replace the channel on the stated horizon;
- **not-assessed** — the evidence does not support a defensible classification.

A low-substitutability relationship is not automatically more politically powerful. It means the dependency is harder to replace within the stated horizon.

## Public surfaces

- `data/strategic-actors.json` — canonical current state;
- `scripts/validate-strategic-actors.mjs` — evidence and schema gate;
- `scripts/render-strategic-actors.mjs` — deterministic bilingual rendering;
- `/actors/` and `/pt-br/actors/` — public analytical tool.

The homepage may show a small preview derived from the canonical dataset. No separate factual dataset may be maintained for presentation.

## Update discipline

New actors should be added because research establishes structural capacity, not because a name is famous. Updates should prefer primary evidence: regulatory filings, audited financial statements, official mandates, corporate annual reports, government records, voting disclosures, ownership registries and directly attributable operational data.

Material changes in mandate, ownership, production, voting authority, regulation, capacity or substitutability require re-verification. Where evidence is incomplete, the public record should say so rather than infer hidden coordination or control.
