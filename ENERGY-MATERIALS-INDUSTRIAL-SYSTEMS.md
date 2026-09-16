# Energy, Materials & Industrial Systems — Editorial Standard

**Status:** controlled product series  
**Parent program:** Technology, Production & Society  
**Taxonomy version:** 1.0  
**Effective date:** 2026-09-16

This document defines the editorial and analytical standard for the Marginal Thinking series **Energy, Materials & Industrial Systems / Energia, Materiais & Sistemas Industriais**. The series is not a fifth research program and must not become a generic energy, climate, engineering or technology-news vertical. Every publication remains classified under the permanent program `technology-production-society` and the controlled Marginal Thinking taxonomy.

## 1. Research question

The series asks:

> How do changes in energy, materials and industrial systems alter costs, productive capacity, dependencies, capital allocation and the distribution of economic and strategic capability?

The recurring analytical chain is:

**resource → technology → production → infrastructure → cost → scale → dependencies → capital → capacity/power → consequences**

A report may enter the chain at any point, but it should identify the upstream requirements and downstream consequences that materially affect the assessment.

## 2. Four controlled domains

The series has exactly four controlled domains. Routine automations may assign them but may not create additional domains.

### 2.1 Electricity Systems

Covers generation, actual output, transmission, distribution, interconnections, storage, dispatchability, flexibility, connection queues, curtailment, market design and the equipment required to deliver reliable electricity.

An electricity matrix must be treated as a system. Installed capacity is not equivalent to generation, and generation is not equivalent to reliable delivered power.

### 2.2 Fuels & Energy Carriers

Covers conventional and emerging fuels or carriers when they can materially change industrial economics, energy security, storage, trade or hard-to-electrify end uses. This includes hydrogen and derivatives, ammonia, methanol, e-fuels, sustainable aviation fuels, biofuels, natural gas and nuclear fuel cycles when relevant to the research question.

A new fuel is not publishable merely because it is novel. Research must include energy inputs, conversion losses, infrastructure, delivered cost, demand or offtake, substitutes and scale.

### 2.3 Strategic & Advanced Materials

Covers critical minerals, processed materials and advanced materials when availability, concentration, technical properties or manufacturing requirements affect industrial systems. Research should distinguish reserves, mine output, refining, processing, intermediate materials and component manufacturing.

Laboratory properties alone are insufficient. New materials should be evaluated through repeatability, yield, feedstocks, purity, cost, manufacturability, substitutes, intellectual property where material, and evidence of deployment.

### 2.4 Industrial Capacity & Supply Chains

Covers the factories, equipment, specialised materials, workforce, standards, logistics and supplier networks required to turn resources and technologies into operating systems. Examples include transformers, cables, switchgear, turbines, batteries, power electronics, specialised steel, semiconductor manufacturing equipment and other capacity that can become a binding industrial constraint.

## 3. Inclusion test

A topic belongs in this series only when there is evidence that it can materially affect at least one of the following:

- cost of energy or industrial production;
- physical availability or reliability;
- productive capacity or productivity;
- import or supplier dependence;
- strategic resource access;
- infrastructure requirements;
- capital allocation at meaningful scale;
- trade patterns or industrial location;
- policy constraints or state capacity;
- the capabilities available to firms, countries or institutions.

Novelty, press attention, venture funding or a laboratory announcement are not sufficient selection criteria.

## 4. Required analytical questions

Substantive assessments should answer, where applicable:

1. **What changed?** Separate current evidence from announced targets and scenarios.
2. **What is the mechanism?** Identify the physical, engineering or economic link.
3. **What is the current scale?** Distinguish laboratory, demonstration, commercial deployment and industrial scale.
4. **What are the constraints?** Materials, energy, manufacturing, infrastructure, regulation, workforce, finance and demand.
5. **Who controls relevant capacity?** Identify concentration by stage rather than using broad labels.
6. **What capital is required?** Separate announced investment, committed capital, final investment decisions and spending already made.
7. **Who gains or loses capacity if the change scales?** This is descriptive analysis, not an investment recommendation.
8. **What are the second-order effects?** Follow transmission into production, trade, prices, policy or society only where evidence supports the link.
9. **What would invalidate or materially weaken the assessment?** Define observable indicators for revision.

## 5. Evidence and maturity

The existing Marginal Thinking hierarchy of evidence remains mandatory. Primary statistical agencies, system operators, regulators, governments, multilateral organisations, company filings and directly published datasets are preferred for quantitative and official claims.

For emerging technologies and materials, evidence must be classified implicitly or explicitly across these maturity states:

**claimed → demonstrated → deployed → scaled**

A vendor roadmap is evidence of intent and investment planning, not evidence that a future capability exists. A peer-reviewed laboratory result is evidence of demonstrated technical capability, not automatically of manufacturing yield, commercial cost or industrial deployment.

## 6. Quantitative discipline

Do not combine quantities that measure different states of the system.

Examples:

- installed generation capacity is not actual generation;
- connection-queue capacity is not future commissioned capacity;
- mineral reserves are not refined supply;
- announced factory capacity is not operating output;
- announced project value is not capital already spent;
- contracted offtake is not identical to physical consumption;
- price appreciation is not a physical flow of material or capital.

When different measures are presented together, the report must state what each one measures.

## 7. Relationship with the four permanent programs

The series belongs to **Technology, Production & Society** because its primary unit is the transition from technical capability and resources into deployment and industrial scale.

It may reference other programs without duplicating the report:

- **Global System & Power** when the question concerns geographic concentration, strategic dependence or changes in international capability;
- **Political Economy & Markets** when policy, financing, prices, regulation or capital-market transmission are material;
- **Strategic Transitions** only when a country or region is itself undergoing a consequential economic-political-social transition that satisfies that program's separate test.

The same event may be relevant to several programs, but every report retains exactly one primary program.

## 8. Publishing and navigation discipline

The series is a product series, not a top-level navigation item. It receives a controlled landing page under `/series/energy-materials-industrial-systems/` and may be featured contextually on the home page or inside Technology, Production & Society.

Reports use the normal canonical routes:

`/reports/YYYY/MM/<slug>.html`  
`/pt-br/reports/YYYY/MM/<slug>.html`

The primary site navigation remains unchanged.

## 9. Metadata contract

Series publications add two controlled fields to the normal research metadata:

```json
{
  "series": "energy-materials-industrial-systems",
  "series_domain": "electricity-systems"
}
```

Allowed domain identifiers are:

- `electricity-systems`;
- `fuels-energy-carriers`;
- `strategic-advanced-materials`;
- `industrial-capacity-supply-chains`.

A report with `series_domain` but no valid `series` must fail validation. A report in this series must use the parent program `technology-production-society`.

## 10. Automation governance

Automated research may:

- select a topic already covered by the controlled taxonomy;
- assign this series and one of its four domains;
- propose a candidate topic for later human review;
- update an existing assessment when new evidence materially changes it.

Automated research may not:

- create a new domain;
- create a fifth permanent program;
- publish a technology solely because it is new or widely discussed;
- convert a fuel, mineral or technology into a top-level navigation section;
- present an announced project as operating capacity;
- convert scenarios into forecasts without evidence;
- publish unsupported claims of a technology being revolutionary, disruptive or inevitable.

## 11. Release checklist

Before publication, QA must verify:

- the report passes the inclusion test;
- the primary program and series domain are correct;
- English and Brazilian Portuguese editions preserve the same numbers and conclusions;
- key quantitative claims are traceable to sources;
- maturity states are not conflated;
- stocks, flows, capacity, output and valuation are separated;
- the report identifies constraints and conditions for revision;
- terminology is concrete and consistent with Marginal Thinking institutional copy;
- no new taxonomy or navigation category was silently created.

The objective is controlled expansion of the research system, not expansion of the number of labels on the site.
