# Marginal Thinking — Technology Signal Intelligence

**Status:** normative research workflow inside `Technology, Production & Society`  
**Version:** 1.0  
**Effective date:** 2026-09-18

## 1. Purpose

Technology Signal Intelligence is the weekly detection and research workflow for technological changes that may alter production, capital allocation, labour, institutions, security or social organisation.

It is **not** a fifth research program, a technology-news vertical, a fixed topic queue or a catalogue of fashionable technologies. Every public item remains inside the permanent program `technology-production-society` and uses the existing controlled taxonomy.

The workflow asks:

> What changed in demonstrated capability, engineering feasibility, cost, deployment or scale — and through which mechanisms could that change alter firms, states, markets or societies?

Public research is produced only when the answer is materially different from the prior evidence base.

## 2. No fixed technology list

The weekly scan must not begin from a hard-coded list such as AI, robotics, quantum computing, biotechnology or cislunar infrastructure.

Those subjects may be selected when evidence warrants them, but they have no reserved place in the queue.

Candidate discovery starts from **changes in evidence**, not from topic names. A candidate may emerge from any scientific, engineering or industrial field if the change is consequential enough.

The system therefore looks for signal classes rather than predefined sectors:

- a material increase in demonstrated technical capability;
- independent replication or validation of a previously uncertain result;
- a meaningful reliability, yield, throughput, density, precision or performance improvement;
- a material reduction in cost, energy use, latency, mass, complexity or another scaling constraint;
- transition from prototype to repeated deployment;
- transition from deployment to industrial or institutional scale;
- commissioning of enabling infrastructure that changes what becomes feasible;
- a manufacturing or supply-chain change that removes or creates a binding constraint;
- procurement, standards or regulation that materially changes adoption capacity;
- evidence that a technology is already changing productivity, labour, firm organisation, security, public capacity or social behaviour;
- contrary evidence that materially weakens a previously important technological thesis.

Media volume, valuation, venture funding, executive claims or novelty alone are not signals.

## 3. Evidence ladder

The internal analytical ladder remains:

**claimed → demonstrated → deployed → scaled**

The weekly workflow must identify the highest state actually supported by evidence and must not promote a technology because later states are plausible.

A useful transformation chain is:

**scientific result → engineering capability → reproducibility → manufacturability → cost → deployment → scale → economic transmission → institutional response → social consequences**

A report may enter at any point in the chain. It must distinguish observed links from inferred or conditional links.

## 4. Dynamic source network

For each material candidate, build a temporary source network from the evidence itself. Do not maintain a prestige whitelist of universities, companies or researchers.

Track actors because they are causally close to the signal, for example:

- authors of decisive papers or datasets;
- laboratories that produced or independently replicated the result;
- universities or institutes operating relevant facilities;
- national laboratories and research agencies;
- standards, regulatory or metrology institutions;
- public agencies funding, procuring or deploying the capability;
- firms manufacturing or operating the technology;
- suppliers controlling a material input, tool or production step.

A famous institution does not receive priority merely because it is famous. A lesser-known laboratory may be more important when it controls the decisive experiment, dataset, instrument, process or replication.

When a signal remains active across weeks, follow the researchers, laboratories and institutions that generated the strongest evidence and look for subsequent papers, datasets, conference results, grants, procurement, standards, production data and independent replication.

## 5. Source hierarchy

Use sources appropriate to the claim.

Prefer:

1. peer-reviewed papers, datasets and technical appendices;
2. primary documentation from universities, laboratories, scientific facilities, standards bodies and public research agencies when tied to reproducible evidence;
3. government budgets, procurement, grants, program documentation and regulatory records;
4. company filings, production disclosures, technical documentation and customer/deployment evidence;
5. patents only as evidence of protected work or intent, not operational capability;
6. high-quality research institutions and technical reporting for context and triangulation;
7. specialist and general media only as discovery or event context when stronger primary evidence is unavailable.

Preprints can be important early signals but must be identified as unreviewed. A press release that summarizes a paper does not replace the paper. A vendor benchmark requires scrutiny of test conditions and independent comparison.

## 6. Weekly signal gate

The weekly scan may inspect many candidates, but **at most one new public technology assessment is staged per weekly execution**.

Publication requires a strong case across all of the following:

### Evidence quality
There is credible primary evidence and enough detail to identify what was actually demonstrated or deployed.

### Delta
Something materially changed relative to the prior evidence base. Repeating a known capability with more publicity is not enough.

### Path to scale
The analysis can identify the main engineering, manufacturing, infrastructure, energy, material, workforce, regulatory and financing constraints between the current state and broader deployment.

### System transmission
There is a defensible pathway to consequences for production, capital, labour, institutions, security or society.

### Research value
The subject adds a new analytical result or materially updates a prior Marginal Thinking assessment.

### Falsifiability
The report can state observable evidence that would weaken the assessment.

If any central component is weak, retain the signal internally and publish nothing.

## 7. Signal states

The internal ledger may use these states:

- `watch` — credible early evidence, insufficient for publication;
- `strengthening` — evidence is accumulating across independent or complementary sources;
- `publishable` — the weekly gate is satisfied;
- `promoted` — a public weekly or monthly assessment has been produced;
- `weakening` — replication, deployment, cost or scaling evidence has deteriorated;
- `retired` — no longer worth active monitoring.

These are internal workflow states. Do not expose them mechanically in public prose.

Keep the active ledger small. Prefer no more than roughly 20 active signals at a time. Merge overlapping signals, remove stale weak candidates and rely on Git history rather than accumulating an indefinite archive.

## 8. Internal ledger

Operational state lives in:

`data/technology-signals.json`

This file is non-public and is not evidence. It exists only to avoid rediscovering the same candidates every week and to preserve a small map of who and what deserves follow-up.

The ledger may store:

- signal slug and state;
- first-seen and last-checked dates;
- concise description of the change;
- highest evidence state actually observed;
- signal classes;
- discovered researchers, laboratories, universities, institutions and firms;
- key evidence references;
- constraints;
- possible economic, political or social transmission;
- contrary evidence and falsifiers;
- related Marginal Thinking research IDs.

Every public claim must still be reverified from the original external source.

## 9. Weekly public product

The public product is a **thesis-specific assessment**, not a roundup.

Metadata:

```json
{
  "id": "MT-TS-YYYY-MM-DD-<slug>",
  "slug": "YYYY-MM-DD-technology-signal-<slug>",
  "kind": "weekly-technology-signal",
  "priority": 32,
  "program": "technology-production-society",
  "format": "assessment",
  "cadence": "weekly",
  "signal_rationale": {
    "delta": "...",
    "evidence": "...",
    "scale_path": "...",
    "transmission": "...",
    "falsifier": "..."
  }
}
```

Use only existing controlled topics, dimensions, geography and phenomena. Do not create a controlled series or new taxonomy for the weekly workflow.

The public title should state the analytical finding. Avoid generic titles such as “Technology Trends This Week”, “Five Technologies to Watch” or “Future Tech”.

## 10. Analytical requirements for a public assessment

A strong assessment should establish, where material:

- what changed and the date cutoff;
- the previous baseline;
- what was claimed versus what was demonstrated;
- whether there is independent replication or corroboration;
- engineering constraints;
- manufacturing, yield and supply-chain constraints;
- energy, compute, material, infrastructure or facility requirements;
- cost and unit economics where measurable;
- deployment evidence and users;
- capital required and who is financing or procuring;
- regulatory, standards and institutional constraints;
- implications for productivity and firm organisation;
- implications for labour, skills, wages or demographic constraints;
- security and geopolitical implications when material;
- distributional and social effects when defensible;
- second-order effects;
- what remains speculative;
- evidence that would weaken the thesis;
- indicators to monitor next.

Do not create a social-impact section when there is no supported mechanism. Do not create a geopolitical section merely because a technology is advanced.

## 11. Transformation horizon

Time horizons may be used when they clarify uncertainty, but they are not forecasts.

Useful internal horizons are:

- present / already observable;
- near-term engineering and deployment;
- medium-term scale constraints;
- longer-term conditional transformation.

Do not assign artificial probabilities or precise adoption dates without evidence.

## 12. Relationship with the monthly Strategic Technology Assessment

The weekly and monthly products have different functions.

**Weekly:** detect and explain the highest-quality new signal.

**Monthly:** step back from weekly noise, compare accumulated evidence, and choose the technology or capability whose trajectory now deserves a broader strategic assessment.

The monthly assessment should use the ledger and weekly research as orientation, then reverify the evidence independently. It is not required to choose a topic that already received a weekly article.

The monthly process must not use a fixed initial technology queue. It should select from the strongest accumulated evidence and may revisit a previous technology only when the underlying assessment materially changed.

## 13. Visual evidence

Weekly public assessments use `format:"assessment"` and therefore follow the assessment floor in `RESEARCH-VISUALS.md`:

- at least one table;
- at least one explicit chart;
- at least one structural visual;
- at least four useful visuals total.

Typical useful visuals include capability comparison tables, cost/performance curves, manufacturing chains, causal transmission diagrams, facility maps and constraint mind maps. Do not fabricate a time series to satisfy the chart requirement.

## 14. Hype and failure controls

Reject or retain internally when the thesis depends mainly on:

- a single vendor claim without inspectable evidence;
- a roadmap presented as capacity;
- a laboratory result with no discussion of reproducibility or scale;
- a benchmark whose conditions make comparison invalid;
- announced manufacturing capacity without evidence of operating output;
- a patent count;
- funding size without technical progress;
- social-media attention;
- a speculative market-size forecast;
- a deterministic claim that a technology “will change the world”.

A negative result, failed replication, cost overrun or deployment bottleneck can itself be a publishable high signal when it materially changes expectations.

## 15. QA requirements

QA must read this document for `kind:"weekly-technology-signal"` and for monthly Strategic Technology Assessments.

QA should reject when:

- there is no material delta from the prior evidence base;
- claim, demonstration, deployment and scale are conflated;
- the source network is dominated by circular reporting;
- commercial claims lack appropriate qualification;
- the scaling path ignores a material physical, manufacturing or institutional constraint;
- social/economic consequences are asserted without a mechanism;
- the assessment does not identify contrary evidence or falsifiers;
- a generic technology topic was selected merely to fill the weekly slot.

## 16. Automation behavior

The weekly producer must:

1. read this document and the current ledger;
2. clear open QA rework first;
3. update stale active signals using original sources;
4. perform broad discovery for new evidence without a fixed technology list;
5. build source networks dynamically;
6. prune or merge weak/stale signals;
7. write the ledger in a separate internal commit when it materially changed;
8. select at most one publishable signal;
9. produce EN/PT-BR staged research and pending v2;
10. hand off immediately to QA;
11. publish nothing when no candidate passes.

The producer must never use the ledger as a public source or let internal states appear as editorial labels.

## 17. Design objective

The system should optimize for **early recognition of consequential capability change**, not maximum article count.

Success means that a reader can see a transformation before it becomes obvious while still being able to audit the evidence, constraints and uncertainty.