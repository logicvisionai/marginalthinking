# Cyber conflict as a system of power: Europe’s new attacks, global digital coercion and the economics of civilian vulnerability

**2 November 2026 · Global System & Power · Research cutoff: 2 November 2026.** Events reported on the publication date are provisional; official attribution, technical causation and estimates of aggregate losses may change.

The most consequential feature of contemporary cyber conflict is not an imaginary ability to switch off an entire country with a keystroke. It is the ability to exploit ordinary commercial dependencies—remote refrigeration controllers, hospital databases, cloud identities, software suppliers, industrial gateways, payment networks and communications infrastructure—to impose costs on people who are far removed from a battlefield. A criminal group can pursue payment, an intelligence service can maintain covert access, an activist collective can stage a visible disruption, and a saboteur can corrupt a physical process. The same outward symptom does not establish the same actor or objective. [1][2][3]

The attacks reported against European supermarket refrigeration on 2 November give that distinction immediate material importance. Merchandise may be ruined and public confidence shaken even when no consumer database is stolen or ransom demanded. The public evidence does **not** yet establish that the incidents are coordinated, that a state ordered them, or even that every affected shop was compromised through the identical technical path. What is established by contemporary reporting is a pattern of physical operational disruption across several countries and the exposure of remotely managed equipment. [4][5]

## 1. The disputed boundary between cybercrime, sabotage and war

Strategic language frequently obscures the legal and operational meaning of an incident. An intrusion into a government mailbox is espionage; an encrypted hospital records system can constitute criminal extortion; a false emergency warning can be psychological coercion; tampering with a boiler or cold chain can endanger physical assets. Whether a particular state-linked operation reaches a prohibited use of force or armed attack is a separate, contested legal and factual assessment. The political vocabulary of “cyberwar” must not predetermine the evidence.

Thomas Rid emphasizes espionage, sabotage and subversion as recurring cyber functions rather than treating every penetration as warfare. Ben Buchanan’s cybersecurity dilemma explains the complementary danger: a state cannot easily distinguish another state’s intelligence reconnaissance from preparation to disable the same infrastructure in a crisis. An adversary may retain an access path as an option rather than activate it immediately. Strategic uncertainty becomes a source of risk in its own right. [6][7]

| Activity | Operational objective | Typical direct effect | Attribution and escalation constraint |
|---|---|---|---|
| Cybercrime and ransomware | Extract money or data | Downtime, breach, recovery expense | Criminal infrastructure may overlap with state interests |
| Espionage and prepositioning | Learn or preserve future options | Covert persistence, credential theft | Access does not prove intent to sabotage |
| Hacktivism and DDoS | Signal, intimidate, attract attention | Often temporary website unavailability | Claim of responsibility can be exaggerated |
| Industrial sabotage | Interfere with physical processes | Spoiled stock, equipment damage, service interruption | Requires forensic reconstruction of command and safety systems |
| Information manipulation | Alter beliefs or decisions | Distrust, confusion, reputational harm | Exposure to a narrative does not prove attitude change |
| Military cyber operation | Support a campaign or degrade capability | Intelligence, disruption, targeting support | Legal classification depends on context and effects |

## 2. The historical path: from intelligence collection to systemic dependencies

The early strategic value of computer penetration was largely informational: diplomatic cables, industrial designs, troop movement records and financial intelligence could be copied without an obvious service outage. Mass networking subsequently created leverage over operational systems. Stuxnet, publicly identified in 2010, demonstrated highly specialized manipulation of industrial processes. Attacks on Ukraine’s power infrastructure in 2015–2016 demonstrated that disruption of civilian supply could be an operational goal. In 2017, NotPetya showed a further risk: destructive code moving through trusted commercial software and business relationships can cross borders and harm firms outside the immediate geopolitical confrontation. [6][8]

The 2022 full-scale invasion of Ukraine made the boundary between physical and digital conflict more visible. Destructive malware, satellite communications disruption, disinformation, espionage and conventional attacks overlapped. Yet the observable record has not supported a simple thesis that cyber capabilities alone decide territorial wars. Defensive adaptability, manual controls, allied intelligence, rapid reconstitution and the difficulty of synchronizing covert access with battlefield maneuver have limited several offensive effects. The opposite overstatement—that cyber operations are insignificant—is equally inconsistent with documented civilian harm and costly recovery.

A second transition is underway in the 2025–2026 evidence: the object of control is no longer only an endpoint but **a chain of identities, suppliers, cloud services, industrial controllers and recovery dependencies**. Capturing a privileged contractor account or remotely managed appliance may bypass the assumptions of several otherwise separate organizations. Cyber conflict increasingly resembles a contest over the governance of technical interdependence.

## 3. What the 2026 European evidence actually measures

ENISA’s 22 September 2026 Threat Landscape describes events observed during calendar year 2025. Its percentages are shares of the agency’s monitored incidents or affected organizations, not a probability that any European citizen, business or power plant will be attacked. Within the monitored incident population, DDoS represented **51% of recorded cases**; ideologically motivated events accounted for **57%**, and nearly **30%** were financially motivated. Of targeted organizations, **73%** were in essential or important sectors under the NIS2 classification; public administration accounted for **32%** of sector targets. Ransomware remained particularly consequential in short-term operational damage, despite DDoS accounting for more recorded incidents. [1]

```chart
type: bar
title: Sectors targeted in ENISA 2026 reporting (2025 observation period)
unit: Percent of targeted organisations in the ENISA sample; selected sectors, not exhaustive
Public administration | 32
Business services | 8
Transport | 8
Manufacturing | 7
Finance and banking | 6
```

A dramatic DDoS news cycle can therefore misrepresent the distribution of real harm: a temporarily unavailable municipal website and the corruption of a hospital backup are recorded as incidents, but they are not equivalent welfare losses. Conversely, a relatively rare supplier or industrial-control compromise can spread through thousands of dependent users. Incident counts, affected entities, financial losses, physical effects and political influence must be analyzed as different denominators.

CERT-EU’s April 2026 retrospective tracked **174 threat actors**, up from 110 in the preceding annual view, and identified espionage and prepositioning as the leading motivation at **38%** in its tracked universe. The agency reported nine significant incidents handled in 2025, seven linked to exploitation of vulnerabilities. These figures concern CERT-EU’s institutional field of observation and cannot be added to ENISA’s monitored incidents or treated as an independent European census. [2]

## 4. The 2 November refrigeration attacks: industrial vulnerability in the grocery aisle

Reuters reported on 2 November that stores in Sweden, Belgium, Luxembourg, Ireland and Estonia experienced interference with refrigeration and freezing systems. Belgian operators including Ahold Delhaize, Carrefour and Colruyt described affected shops; Swedish chains ICA and Coop also reported disruptions; the Irish retailer Musgrave reported problems at 13 SuperValu outlets. Some refrigeration units were reported to have been placed into defrost operation or to have experienced extreme temperature settings. Perishable food was removed or discarded, and one Belgian butcher reported approximately €15,000 in spoiled meat. The preceding October attack in France had affected hundreds of stores, according to earlier reporting. Counts and geographic scope remained developing on publication day. [4][5]

The operational chain is unusually concrete. Remote management saves labor and energy by centralizing temperature monitoring, service, alarms and maintenance. If an adversary can issue unauthorized commands or exploit inadequately protected legacy controllers, the inventory is not stolen digitally; it is **destroyed thermodynamically**. The physical loss then propagates into disposal expense, safety inspections, transport, procurement, refrigeration repair and the time needed to restore a safe cold chain. Small grocery operators may lack the spare capacity to discard and replace stock without liquidity consequences.

```flow
Remotely accessible refrigeration control → unauthorized manipulation of temperature or defrost settings → breached cold-chain conditions → food disposal and equipment checks → working-capital strain and consumer uncertainty
Investigation and network isolation → local/manual operational fallback → controlled restart and temperature verification → restored retail availability
```

The case also illustrates an attribution trap. No public perpetrator claim, no revealed motive and no proven relationship among national incidents were available in the cited reporting. Absence of a ransom demand makes sabotage a plausible *hypothesis*, not a demonstrated state mission. A copycat, multiple independent abuses of a shared product, credential theft, a supplier compromise, and organized sabotage are competing explanations requiring appliance telemetry, vendor logs, forensic comparison and incident timelines. Broad speculation about a particular foreign government would overrun the evidence.

## 5. Berlin, Swedish data and Polish medical records: the civilian cost of exposed institutions

CERT-EU’s September 2026 brief described the Berlin government’s confirmation of a Rhysida hack-and-leak affecting two Senate departments, with approximately **5.79 TB** reportedly exfiltrated and a ransom demand of **30 bitcoin**; Berlin said it would not pay. The brief also reported a Swedish privacy-regulator fine of **SEK 1.8 million** related to an attack on IT provider Miljödata, with personal data concerning approximately **2.2 million** people affected. In Poland, press reporting summarized by CERT-EU described another medical-data incident in September. Each case has a different primary harm: sensitive public records and administrative legitimacy, large-scale privacy exposure through a supplier, and potential patient confidentiality losses. None should automatically be reclassified as a military operation. [3]

An administrative breach creates asymmetric time horizons. Attackers can copy data quickly. Victims may spend years addressing impersonation, targeted fraud, domestic abuse risks, professional exposure and the erosion of confidence in public service. The direct budget includes incident response, legal assistance and replacement systems; the much harder-to-measure social burden is borne by individuals whose records cannot simply be “unpublished.”

## 6. Poland’s energy incident: attempted destruction without a blackout

On 29 December 2025, coordinated destructive intrusions targeted wind and solar installations, manufacturing operations and a combined heat-and-power facility serving nearly half a million customers in Poland, according to CERT Polska and the Polish government’s January 2026 report. The government stated that power supply was maintained and no blackout occurred. The technical report described combined information-technology and operational-technology targeting, a significant distinction from attacks confined to public websites. [9][10]

That outcome challenges two simplistic positions. The attempt documents real industrial sabotage risk; continued electricity supply documents resilience. It does **not** demonstrate a successful nationwide grid disruption, nor does the quoted technical account by itself settle public political attribution to a particular government. The difference between attempted destructive effect, affected equipment and delivered public service is central to measuring cyber conflict.

## 7. Europe as the center of overlapping, not singular, threat systems

Europe’s exposure is shaped by the war in Ukraine, sanctions, defense integration, shared cross-border infrastructure, large digital service markets and relatively open information environments. The Council of the EU attributed a malicious ecosystem to Russian state and non-state actors in July 2026 and sanctioned individuals and entities connected to the activities. Such statements are official positions supported by designated evidence and political judgment; they are not proof that every unexplained European intrusion belongs to the same campaign. [11][12]

A separate March 2026 Council decision sanctioned Chinese-based entities and individuals for activities affecting EU states and partners. This matters analytically because a Russian-centric narrative can undercount espionage and commercial compromise associated with other states, as well as independent ransomware markets and insider abuse. Cyber alignment is neither synonymous with criminal nationality nor determinable by a server’s hosting country. [13]

```map
title: Illustrative geography of recent digital exposure; not a map of attacker origins
Belgium, Luxembourg, Sweden, Ireland, Estonia | Retail refrigeration disruptions reported 2 November 2026 | Technical linkage and responsibility not yet established
France | Large supermarket refrigeration incidents reported in October 2026 | Event descriptions still subject to forensic revision
Germany | Berlin administrative data exfiltration reported in August–September 2026 | Criminal leak case, not proof of wartime direction
Poland | Destructive energy-sector attempt in December 2025 and medical-data incidents in 2026 | Power supply continued despite the attempted disruption
Ukraine | Long-running collision of cyber, kinetic and information operations | Strategic outcomes also depend on defense, allies and physical logistics
Global | Supply-chain, cloud, finance and identity exposures | Effects cross borders independently of attacker location
```

## 8. Outside Europe: global competition without one universal model

The United States hosts much of the world’s cloud, software and AI infrastructure and is consequently both a high-value espionage target and a jurisdiction from which suppliers deliver dependencies to other countries. CERT-EU’s September briefing covered China-linked exploitation allegations involving deceptive websites and network infrastructure, credential-abuse campaigns affecting major software services, and North Korea-linked financial or employment-oriented operations. These are distinct ecosystems with different objectives and levels of public confidence. [3][14]

In Asia, dependence on semiconductor fabrication, port logistics, electronics supply chains and cross-border industrial production can translate a digital incident into production delays or intellectual-property losses. In the Middle East, attacks on financial services, energy operators and dissident communications create different potential transmission channels. Across Latin America and Africa, uneven public-sector resources, legacy equipment, digital-payment growth and dependence on outsourced service providers can magnify a breach without making these regions passive actors. Several countries actively build incident response, payments resilience and sovereign capability; differences in capacity cannot be inferred from income classification alone.

The strategic contrast is between **theft of knowledge**, **interference with production**, **extraction of money** and **manipulation of belief**. An actor can combine them, but global comparisons that reduce the landscape to “country X is attacking country Y” lose the crucial mechanisms by which harm crosses political borders.

## 9. The political economy of ransomware and the market for access

Digital extortion has a division of labor. One actor acquires credentials, another develops malicious tools, a third operates infrastructure, and another negotiates ransom or monetizes stolen data. Specialist marketplaces and permissive hosting can reduce capital requirements for an aspiring attacker. Defenders, meanwhile, must protect identity services, backups, supply chains and physical operations while continuing to deliver essential services.

Mandiant’s 2026 report, based on its 2025 investigations rather than a random sample of global incidents, found **32%** of the investigated intrusions began with exploits, **11%** with voice phishing and **10%** with a prior compromise. It reported a global median attacker dwell time of 14 days and, within a particular observed criminal handoff process, a median **22-second** interval between initial access and access by a second operator—down from more than eight hours in 2022. These figures indicate how specialized attacks can accelerate; they do not describe every intrusion. [15]

```chart
type: bar
title: Initial infection vectors in Mandiant M-Trends 2026
unit: Percent of Mandiant engagements investigated during 2025; selected categories
Exploitation | 32
Voice phishing | 11
Prior compromise | 10
```

The economic burden is not limited to paid ransoms. Recovery may involve new hardware, legal obligations, litigation, overtime, operational shutdown and loss of future demand. The capacity to withstand these costs is distributed unevenly: a national institution can finance forensic teams; a rural clinic or family business may not be able to absorb several weeks of disruption.

## 10. Supply-chain concentration turns isolated compromise into correlated risk

Outsourcing improves productivity but concentrates failure modes. Cloud identity, managed IT providers, software update channels, payment gateways, refrigeration controls and specialized industrial components may serve thousands of downstream organizations. The security of each customer becomes partly dependent on actors outside its own governance. A supplier breach can produce simultaneous losses that defeat the assumption that local organizations fail independently.

This is also a regulatory and insurance problem. A systemic shock creates correlated claims, business-interruption disputes and ambiguity over whether contractual warranties, cyber insurance or political-violence exclusions apply. Insurers confront difficult attribution, uncertain accumulation and adversarial behavior capable of changing after a policy is written. Governments face the further problem of prioritizing scarce forensic and emergency-response resources.

| Dependence | Immediate loss channel | Second-order economic or social channel | Resilience test |
|---|---|---|---|
| Cold-chain controllers | Food spoilage and asset checks | Small-retailer liquidity, food prices and trust | Manual isolation, safe temperatures and alternative supply |
| Managed IT and identity | Credential or access compromise | Simultaneous failure across clients | Segmentation and provable independent recovery |
| Hospital records | Service delay and privacy exposure | Clinical backlog and long-term identity risk | Offline clinical continuity and tested restoration |
| Industrial energy controls | Equipment interference | Heat and power reliability, manufacturing downtime | Physical safety interlocks and islanded operation |
| Payments and clearing | Interrupted transactions | Liquidity hoarding, settlement uncertainty | Tested alternative channels and central-bank coordination |
| Media and civic platforms | Manipulated content or account takeover | Distrust, intimidation and fragmented common facts | Provenance, rapid correction and independent journalism |

## 11. Finance: when a technology incident becomes a stability event

A bank may withstand its own cyber breach yet still be exposed to a common payments service, cloud provider, telecoms failure or settlement dependency. The IMF’s 2024 financial stability study warned that malicious cyber losses have usually been manageable but could be extreme in certain settings. Its October 2026 Global Financial Stability Report again identified cyber threats among risks in a digitally interconnected financial system; a June 2026 IMF note highlighted AI-driven speed and common-service concentration. [16][17][18]

A payment outage may prompt households to hold additional cash, businesses to delay delivery, and counterparties to withhold liquidity while reconciling transactions. These outcomes require both technical disruption and behavioral response; an unsuccessful or well-contained intrusion will not necessarily produce them. Financial-system risk therefore depends less on the headline number of attempts than on service criticality, common dependencies, recovery time, failover credibility and communication with the public.

## 12. Psychological conflict, social fracture and information manipulation

Cyber conflict operates on cognition even when no malicious code executes. Fake official notices, forged documents, impersonated journalists, coordinated harassment, bot amplification, deepfakes and selective leaks can be deployed to create ambiguity about whom to trust. Fear of future disruption can itself prompt protective behavior, market reactions or political demands. The adversary may seek a collapse of confidence rather than a collapse of servers.

The EEAS’s fourth FIMI threat report in March 2026 described **540 incidents** involving **10,500 channels** in its examined 2025 evidence base. These are monitored operations and channels, not a measure of people persuaded or elections changed. The EEAS linked information manipulation to overlapping Russian and Chinese networks in its analytical scope, but cross-platform reach cannot by itself demonstrate durable attitude change. Independent exposure, behavioral and counterfactual data would be required for causal claims about voting or social cohesion. [19]

Individuals experience repeated attacks through a compound psychology of uncertainty: they cannot see attacker intent, they cannot audit provider assurances, and they may be asked to trust a breached institution again. Information warfare exploits this asymmetry by turning every denial, outage and correction into another object of dispute. Societal resilience depends on the credibility of institutional communication, trusted local intermediaries and the ability to distinguish a demonstrated failure from a fabricated allegation.

## 13. Artificial intelligence: compressed cycles, new dependencies and empirical limits

AI changes several costs simultaneously. It can translate persuasive fraud, assist reconnaissance, triage stolen files, synthesize impersonation material and expand the number of systems a small team can survey. Defensive applications also include anomaly detection, code review, faster response and correlation of evidence. The October 2026 Microsoft defense report discussed faster AI-assisted operations and controlled experiments with multi-stage autonomous behavior; Google threat research likewise documented agentic workflows and malicious use of AI infrastructure. Neither establishes that every sophisticated-looking intrusion was AI-driven. [20][21]

Mandiant explicitly cautioned that the vast majority of its observed 2025 successful breaches still reflected fundamental human and systemic security weaknesses rather than attacks directly resulting from AI. This is crucial counterevidence to technologically deterministic narratives. AI is simultaneously an offensive productivity tool, a defensive accelerator, a valuable espionage target and a new trusted service dependency. [15]

A plausible operational shift is not universal autonomous cyberwar but a growing gap between machine-speed discovery and slower organizational patching, procurement and legal accountability. The relevant variable is **time to containment compared with time to exploitation**, not the marketing label attached to the model.

## 14. Law, civilian protection and strategic restraint

There is no blanket legal exemption for cyber operations during armed conflict. The International Committee of the Red Cross has emphasized the risks to civilian essential services, medical institutions, humanitarian organizations, civilian hackers and AI-enabled operations. Humanitarian-law obligations regarding distinction, proportionality and feasible precautions remain relevant to operations conducted through information and communications technology when the applicable legal conditions are met. States and scholars still disagree over aspects of sovereignty, thresholds of force and the classification of data-related damage. [22][23]

The European Union responded through a mixture of incident governance, regulation, police cooperation, public attribution and targeted sanctions. Political attribution can mobilize sanctions and solidarity; criminal proof may rely on a different evidentiary procedure; technical attribution may establish an intrusion cluster without publicly identifying its controller. Combining these standards indiscriminately creates both impunity and unjustified accusation risks.

The strategic problem is the same as the humanitarian one in another form: disrupting a service shared by civilians and military users may be operationally attractive but politically escalatory and socially costly. Public institutions need robust continuity capacity without normalizing an unrestricted digital battlefield.

## 15. Scenarios for 2027–2030: conditional pathways and observable tests

| Scenario | Transmission mechanism | Indicators that would support it | What would weaken it |
|---|---|---|---|
| Persistent, bounded disruption | Repeated DDoS, data theft and limited sabotage produce localized losses | High incident frequency with rapid service restoration | Prolonged multi-sector outages and large physical losses |
| Correlated supplier shock | Shared identity, cloud or OT provider compromises multiple countries | Forensic common dependency, simultaneous client failures | Independent root causes and effective supplier isolation |
| Cyber–physical escalation | Intrusions coordinate with security crises and destructive attacks | Confirmed industrial commands, service interruptions and explicit state decisions | Defeated attempts, manual fallback and lack of operational linkage |
| AI-accelerated criminal commoditization | Automated fraud, access brokerage and extortion lower attacker costs | Shorter measured compromise-to-impact times across independent samples | Defensive automation and patching contain losses faster |
| More resilient civilian infrastructure | Mandatory testing, procurement reform and safe fallback reduce blast radius | Recovery exercises succeed and downstream harms fall | Repeated control-system failures despite comparable investment |

No numerical probability is assigned. There is too little stable, independently observable evidence to justify precise multi-year forecasts of war escalation. Several pathways may coexist: cybercrime can rise while infrastructure resilience improves, or reported incident counts can rise simply because detection and disclosure improve.

## 16. What should be monitored rather than guessed

Five families of indicators would discriminate among these scenarios. **Operational:** hours of essential-service unavailability, percentage of equipment on safe local control, and independently verified spoilage or physical damage. **Technical:** common vulnerability exposure, privileged-identity compromise, supplier concentration and recoverability of clean backups. **Economic:** business interruption, insured versus uninsured costs, procurement delay and small-firm closure. **Social:** data-exposure consequences, public trust, demonstrably coordinated false narratives and threats to vulnerable groups. **Strategic:** independent forensic attribution, official legal actions, cross-border incident coordination and the relationship—if any—between digital incidents and kinetic events.

Cyber conflict is asymmetric because access can be cheap, attribution costly, and repair slow. Its consequences are not evenly distributed: the actor who opens a vulnerability may pay little of the social cost borne by patients, consumers, workers, tenants and taxpayers. The governance challenge is therefore to defend systems that are simultaneously profitable commercial networks, essential civilian infrastructure and objects of geopolitical competition. The more precise measure of strategic strength is not the ability to announce that an attack was “repelled”; it is the capacity to maintain essential services, reconstruct the evidence and recover without transferring disproportionate costs to the most exposed populations.

## Sources and evidence record

[1] ENISA, *Threat Landscape 2026*, 22 September 2026 (events observed during 2025). https://www.enisa.europa.eu/news/exploring-the-evolution-of-the-cyber-threat-landscape-how-dependencies-weaken-our-digital-resilience

[2] CERT-EU, *Threat Landscape Report 2025 — A Year in Review*, 8 April 2026. https://cert.europa.eu/publications/threat-intelligence/tlr2025

[3] CERT-EU, *Cyber Brief 26-10 — September 2026*, issued 2 October 2026. https://cert.europa.eu/publications/threat-intelligence/cb26-10

[4] Reuters, *Cyberattack on fridges hits supermarkets across Europe*, 2 November 2026. https://www.reuters.com/business/retail-consumer/temperature-soars-swedish-grocery-store-freezers-one-store-blames-hackers-2026-11-02/

[5] Reuters, *European retailers hit by supermarket fridge hack*, 2 November 2026. https://www.reuters.com/business/european-retailers-hit-by-supermarket-fridge-hack-2026-11-02/

[6] C. Rid and the historical-strategic literature, contextualized through the earlier Marginal Thinking cyber study; primary historical prosecution record: US Department of Justice, 2020 Sandworm indictment. https://www.justice.gov/opa/pr/six-russian-gru-officers-charged-connection-worldwide-deployment-destructive-malware-and

[7] Ben Buchanan, *The Cybersecurity Dilemma*, Oxford University Press, 2017. https://global.oup.com/academic/product/the-cybersecurity-dilemma-9780190665012

[8] CISA, *NotPetya and destructive malware context*. https://www.cisa.gov/news-events/alerts/2017/07/01/petya-ransomware

[9] Poland Ministry of Digital Affairs / CERT Polska, 30 January 2026. https://www.gov.pl/web/cyfryzacja/cyberatak-na-infrastrukture-sektora-energii-w-polsce-opublikowano-szczegolowy-raport-cert-polska

[10] Office of Poland’s Prime Minister, *Poland Stops Cyberattacks on Energy Infrastructure*, 15 January 2026. https://www.gov.pl/web/primeminister/poland-stops-cyberattacks-on-energy-infrastructure

[11] Council of the EU, sanctions of 13 July 2026. https://www.consilium.europa.eu/en/press/press-releases/2026/07/13/russian-cyber-attacks-and-destabilising-activities-council-sanctions-nine-individuals-and-four-entities/

[12] Council of the EU, Russia cyber ecosystem statement, 13 July 2026. https://www.consilium.europa.eu/en/press/press-releases/2026/07/13/cyber-russia-statement-by-the-high-representative-on-behalf-of-the-european-union-denouncing-russia-s-malicious-cyber-ecosystem-targeting-the-eu-its-member-states-and-international-partners/

[13] Council of the EU, cyber sanctions involving entities in China and Iran, 16 March 2026. https://www.consilium.europa.eu/en/press/press-releases/2026/03/16/cyber-attacks-against-the-eu-and-its-member-states-council-sanctions-three-entities-and-two-individuals/

[14] CERT-EU, *Cyber Brief 26-09 — August 2026*, issued 3 September. https://cert.europa.eu/publications/threat-intelligence/cb26-09/

[15] Google Cloud / Mandiant, *M-Trends 2026*, 23 March 2026, investigations during 2025. https://cloud.google.com/blog/topics/threat-intelligence/m-trends-2026

[16] IMF, *Global Financial Stability Report*, April 2024, cyber-risk chapter. https://www.imf.org/en/publications/gfsr/issues/2024/04/16/global-financial-stability-report-april-2024

[17] IMF, *Global Financial Stability Report*, October 2026. https://www.imf.org/en/publications/gfsr/issues/2026/10/13/global-financial-stability-report-october-2026

[18] IMF, *Artificial Intelligence and Cybersecurity in the Financial Sector*, 30 June 2026. https://www.imf.org/en/publications/imf-notes/issues/2026/06/29/artificial-intelligence-and-cybersecurity-in-the-financial-sector-576706

[19] EEAS, *Fourth FIMI Threat Report*, March 2026. https://www.eeas.europa.eu/sites/default/files/2026/documents/EEAS%204th%20Threat%20Report_web.pdf

[20] Microsoft, *2026 Digital Defense Report*, 1 October 2026. https://www.microsoft.com/en-us/security/security-insider/threat-landscape/2026-digital-defense-report

[21] Google Threat Intelligence Group, *From Prompting to Autonomy*, 8 September 2026. https://cloud.google.com/blog/topics/threat-intelligence/from-prompting-to-autonomy-the-evolution-of-adversarial-ai

[22] ICRC, *Six ICT-related threats faced by civilian populations*, 16 July 2026. https://www.icrc.org/en/article/icrc-working-paper-six-ict-related-threats-civilian-populations

[23] ICRC, *Protecting civilians and objects against cyber harm*, 29 April 2025. https://www.icrc.org/en/article/resolution-protecting-civilians-objects-against-ict-activities-armed-conflict
