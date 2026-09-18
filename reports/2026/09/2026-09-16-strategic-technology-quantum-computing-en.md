# Quantum Computing in 2026: Real Progress, Economic Utility Still Under Validation

**Program:** Technology, Power & Transformation  
**Code:** MT-TECH-2026-09-16-quantum-computing  
**Edition:** September 16, 2026  
**Information cutoff:** 2026-09-16, 10:40 BRT  
**Assessed maturity:** experimental and pre-industrial for fault-tolerant computing; physical systems are deployed through cloud and research facilities for R&D and experimentation.  
**Overall confidence:** high on the current state; medium on 3–5 years; low-to-medium beyond five years.

> **Central assessment.** Quantum computing has made measurable progress in error correction, control, classical integration and industrial investment. That does not yet amount to a fault-tolerant machine with independently verified, scalable economic utility. The clearest near-term effects are outside commercial quantum algorithm execution: post-quantum cryptography migration, infrastructure and workforce investment, standards, hybrid experimentation and the formation of a specialized industrial supply chain.

## 1. Executive Assessment

Three facts should remain separate.

First, **quantum error correction has improved in experimentally verifiable ways**. A peer-reviewed *Nature* paper from Google Quantum AI demonstrated below-threshold surface-code memories: a distance-7 code using 101 physical qubits reached a 0.143% logical error rate per correction cycle and a logical lifetime 2.4 times that of the device's best physical qubit. The same paper explicitly states that orders of magnitude still separate present logical error rates from the requirements of practical large-scale quantum computation. Both findings matter. [Nature, 2024/2025; corrected in 2026](https://www.nature.com/articles/s41586-024-08449-y)

Second, **vendors are publishing increasingly concrete engineering roadmaps** involving processors, real-time decoding, modular systems and longer circuits. IBM reports that Nighthawk r2 executes circuits exceeding 7,500 gates on 120 programmable qubits and presents a path toward fault-tolerant computing in 2029. These are relevant engineering and investment signals, but future dates remain a corporate roadmap. IBM itself states that published milestones represent current intent and may change or be withdrawn. [IBM Quantum Roadmap, March 2026 update](https://www.ibm.com/roadmaps/quantum/2026/) [IBM Nighthawk r2, Aug. 31, 2026](https://www.ibm.com/quantum/blog/nighthawk-r2)

Third, **governments are already treating a future capability as a present risk-management problem**. NIST has three principal finalized post-quantum cryptography standards and says migration should begin now. This does not require a cryptographically relevant quantum computer to exist today: complex systems take years to migrate, while data collected today could be stored for later decryption attempts. [NIST PQC](https://www.nist.gov/pqc) GAO states that a cryptographically relevant quantum computer may still be 10–20 years away, while treating harvest-now-decrypt-later as a material risk. [GAO-26-107759, Mar. 18, 2026](https://www.gao.gov/products/gao-26-107759)

**Bottom line:** as of September 2026, quantum computing is a field with genuine scientific and industrial progress but no demonstrated general economic utility at fault-tolerant scale. Raw physical-qubit counts are not the central metric. Logical error rates, reliable circuit depth, control stability, real-time correction, total system cost and workloads whose value exceeds execution cost matter more.

## 2. What the technology actually is

Quantum computing uses quantum states to represent and transform information. Qubits can participate in superposition and entanglement, allowing specific algorithms to organize computation differently from classical machines.

This does not make a quantum computer a general replacement for CPUs and GPUs. The economically relevant proposition is narrower: some problems may have quantum algorithms that, on sufficiently large and reliable hardware, outperform the best classical methods in time, cost or solution quality.

The distinction between **physical** and **logical qubits** is essential. Physical qubits are noisy. Fault tolerance requires encoding logical information across multiple physical qubits while detecting and correcting errors continuously. Comparing platforms by physical-qubit count alone can therefore be misleading.

## 3. Documented state of the art

| Evidence | Status in September 2026 | What it establishes | What it does not establish |
|---|---|---|---|
| Google Willow / surface code | **Peer-reviewed experimental demonstration** | increasing code distance can suppress logical errors below threshold; real-time decoding was demonstrated | industrial-scale fault tolerance or economic advantage |
| IBM Nighthawk r2 | **Vendor-reported system/result** | progress in throughput, reset, larger circuits and platform integration | independent economic advantage or future roadmap completion |
| DARPA QBI | **Independent validation program underway** | government is testing whether any architecture can produce computational value above cost by 2033 | that an architecture has already passed final validation |
| DOE Quantum Genesis | **Government program/target** | DOE aims at scientifically relevant fault-tolerant capability by 2028 | that such capability already exists |
| NIST PQC | **Standards deployable now** | the cryptographic response to future quantum risk is actionable today | that a CRQC exists today |

DARPA provides a particularly useful economic maturity test. Its Quantum Benchmarking Initiative seeks to verify whether an architecture can reach **utility scale**, defined as computational value exceeding cost. By March 2026, 11 organizations had advanced to Stage B and two performers from a related program had reached Stage C for system-level verification and validation. A public program explicitly designed to separate feasibility from hype is evidence that the core economic question remains open. [DARPA QBI](https://www.darpa.mil/research/programs/quantum-benchmarking-initiative) [DARPA, Mar. 10, 2026](https://www.darpa.mil/news/2026/qbi-stage-a-qbit)

## 4. Claimed → demonstrated → deployed → scaled

### Demonstrated

- below-threshold error correction in specific experimental configurations;
- real-time decoding in error-correction experiments;
- remote execution on cloud-accessible quantum hardware;
- progressively larger circuits on current systems;
- standardized post-quantum algorithms ready for adoption.

### Deployed

Quantum systems are available through cloud platforms and research installations. They support R&D, training, algorithm experiments and HPC integration. This is deployment of **experimental platforms**, not industrial-scale deployment of general fault-tolerant quantum computing.

### Scaled

There is no public evidence, as of September 2026, of a universal fault-tolerant quantum computer operating at industrial scale whose net economic value has been independently verified in material applications.

### Targets and roadmaps

DOE launched Quantum Genesis in June 2026 with a target of developing and deploying a scientifically relevant fault-tolerant capability by 2028. It is a program target. [DOE, June 23, 2026](https://www.energy.gov/science/articles/energy-department-announces-initiative-create-and-deploy-worlds-first)

IBM projects examples of quantum advantage in 2026 and a fault-tolerant machine in 2029, followed by larger systems. The roadmap is technically informative but is not converted into a Marginal Thinking forecast. [IBM roadmap](https://www.ibm.com/roadmaps/quantum/)

```chart
type: bar
title: Organizations at advanced public validation stages cited in the assessment
unit: organizations
DARPA QBI Stage B | 11
Related-program Stage C performers | 2
```

The two Stage C performers come from a related validation program, so the bars should not be read as a single funnel or conversion rate.

```mindmap
What must scale before quantum utility can scale
- Logical computation
  - lower logical error
  - long reliable circuits
  - real-time decoding
- Hardware system
  - qubit quality
  - cryogenics and control
  - modular interconnects
- Industrialisation
  - manufacturing yield
  - calibration burden
  - repeatability
- Economics
  - total system cost
  - classical baseline
  - recurring paid workloads
- Institutions
  - independent validation
  - standards
  - post-quantum migration
```

## 5. Constraints that determine the transition

### 5.1 Errors and correction overhead

The problem is not merely fabricating more qubits. A fault-tolerant system must keep logical errors low enough through very long circuits. Google's experiment matters because it demonstrates the desired direction—more redundancy reducing logical error—but the paper also identifies rare correlated events and a substantial distance from the requirements of larger fault-tolerant circuits.

### 5.2 Real-time control

Error correction requires syndrome measurement, decoding and correction tracking at latencies compatible with processor dynamics. A commercially relevant quantum computer is therefore a hybrid system: cryogenics, control electronics, interconnects, software, compilers, decoders and classical HPC all enter the economic system boundary.

### 5.3 Manufacturing yield and repeatability

A laboratory demonstration must become a repeatable industrial process. Device uniformity, yield, calibration burden and reliability over time are industrial variables as important as qubit physics.

### 5.4 Modularity and interconnects

Many architectures depend on connecting modules. This shifts part of the scaling challenge into low-loss, low-error interconnects and distributed control. Successful modularity can reduce the risk of manufacturing a single enormous device; poor interconnect performance merely relocates the constraint.

### 5.5 Cost per useful result

Computational advantage is not automatically economic advantage. Total cost includes capital, cryogenics, energy, operations, queues, software integration, data preparation and the cost of competing classical methods. This is why DARPA's value-above-cost definition is more useful for economic analysis than isolated records.

## 6. Industrial base and capital

The relevant supply chain spans device fabrication, high-purity materials, cryogenics, lasers and photonics for some architectures, RF/control electronics, packaging, interconnects, software, HPC, cloud services, metrology and test equipment.

Government remains an important funder and buyer. GAO reports that the U.S. federal government has spent about **$200 million per year** on quantum-computing R&D since fiscal 2020, roughly one-fifth of the federal quantum-information-science spending described in the report. GAO also found gaps in subordinate objectives, performance measures and broader infrastructure assessment in the national strategy. [GAO-26-107759](https://files.gao.gov/reports/GAO-26-107759/index.html)

In the private sector, IBM announced in June 2026 an intention to invest more than **$10 billion over five years** across quantum R&D, capital expenditure, manufacturing, ecosystem activity and acquisitions. This is a **company-announced commitment**, not capital already spent. [IBM, June 2, 2026](https://newsroom.ibm.com/2026-06-02-ibm-commits-more-than-10-billion-to-quantum-computing%2C-funding-its-roadmap-from-todays-leading-systems-to-the-worlds-first-fault-tolerant-quantum-computers)

The clearest present economic effect is therefore **capacity formation**, rather than quantum computing displacing classical HPC: laboratories, specialized hiring, cloud contracts, test infrastructure, manufacturing capability and standards.

```flow
Physical-qubit improvement → stable logical qubits and error correction → long reliable circuits → independently verified workload advantage → repeatable industrial system → economic utility above total quantum-plus-classical cost
```

## 7. The present impact: post-quantum cryptography

Cryptographic migration is the clearest case in which a future technology changes current decisions.

NIST has finalized three principal PQC standards and recommends migration now. In July 2026, a vulnerability was found in the HAWK signature candidate, which was then withdrawn; NIST states that the episode does not affect finalized standards such as ML-KEM and ML-DSA. The episode is methodologically useful: cryptographic standardization must remain exposed to adversarial analysis, and diversity of constructions matters. [NIST PQC](https://www.nist.gov/pqc) [NIST IR 8610 / HAWK update](https://www.nist.gov/news-events/news/2026/05/nine-candidates-advance-third-round-additional-digital-signatures-pqc)

Concrete tasks for organizations include cryptographic inventory, identifying long-lived sensitive data, upgrading protocols and hardware, interoperability testing and building crypto-agility. These costs exist even if a cryptographically relevant quantum computer arrives later than expected.

## 8. Economic and geoeconomic effects

### 0–2 years — high confidence

The dominant effects should remain investment, standards and preparation: PQC migration, hiring, university/laboratory partnerships, cloud access, hybrid experiments and specialized infrastructure. General quantum advantage is not required for these flows to continue.

### 3–5 years — medium confidence

The key test is whether narrow applications in science, chemistry, materials or optimization demonstrate **verified advantage against the best classical methods at comparable total cost**. Third-party reproduction would matter more than vendor-selected benchmarks.

### 5–10 years — low-to-medium confidence

If error correction, modularity and manufacturing scale, quantum systems could become specialized accelerators connected to HPC. This could alter R&D in materials, chemistry and selected simulation problems. It is a conditional scenario, not a forecast.

### 10–20 years — low confidence

A mature quantum infrastructure could affect cryptography, materials design and selected discovery processes. At this horizon, uncertainty over architecture, cost and classical algorithmic progress is too large for robust quantitative forecasts.

## 9. Productivity, labor and industrial organization

In the near term, labor effects are compositional rather than mass displacement. Demand rises for physicists, control engineers, cryogenic/photonics specialists, compiler and HPC engineers, security professionals and systems integrators. Organizations also need people able to determine when **not** to use a quantum computer.

There is not yet an empirical basis for assigning measurable aggregate productivity growth to quantum computing. The plausible channel initially runs through R&D: reducing the time or cost of selected simulations and discovery processes. Until useful workloads are demonstrated, GDP or total-factor-productivity estimates carry excessive uncertainty.

## 10. Monitoring scenarios

| Horizon | Scenario | Evidence required | Confidence |
|---|---|---|---|
| 0–2 years | PQC and infrastructure advance; hardware improves incrementally | NIST migration, QEC results, systems and contracts | High |
| 3–5 years | narrow scientific/economic utility becomes verifiable | best-classical benchmark, total cost, independent replication | Medium |
| 5–10 years | fault-tolerant quantum accelerators enter selected HPC centers | stable logical qubits, long circuits, modularity, repeatable operations | Low-to-medium |
| 10–20 years | quantum becomes material specialized infrastructure | sustained cost reduction, software ecosystem, recurring applications | Low |

An alternative scenario must remain open: hardware may continue improving while classical algorithms, approximation methods, GPUs/accelerators and error-correction overhead reduce or delay the economic domain of quantum computing.

## 11. Observable indicators

Marginal Thinking will monitor:

1. **logical error per cycle and scaling with code distance**, rather than physical-qubit count alone;
2. **reliable logical operations** before failure;
3. **real-time decoding** and stability in long executions;
4. **interconnected-module demonstrations** at adequate fidelity;
5. **economic benchmarks** comparing total quantum+classical cost against the best classical method;
6. **independent DARPA QBI results** and comparable validation efforts;
7. **actual PQC migration**, not just published plans;
8. **manufacturing yield and capacity** for specialized components;
9. **recurring paid workloads** where quantum is selected for performance/cost rather than experimentation;
10. **changes to vendor roadmaps**, especially delayed or redefined milestones.

## 12. What would change our assessment?

We would raise the maturity assessment if an independently verified system repeatedly executed a material workload whose computational value exceeded total cost and the best available classical method; if logical error rates continued falling predictably as codes scaled; and if modularity/manufacturing were demonstrated beyond isolated prototypes.

We would become more cautious if roadmaps were repeatedly delayed, correlated errors blocked scaling, physical-qubit overhead per logical qubit kept costs prohibitive, or classical methods erased claimed advantages in relevant benchmarks.

## 13. Limitations and confidence

Cross-architecture comparison through one metric is methodologically weak. Superconducting devices, trapped ions, neutral atoms, photonics and other approaches have different error structures and control requirements. This report therefore does not rank companies or architectures as winners.

Corporate results are used when material but are explicitly identified as vendor-reported data or claims. Government targets are treated as targets, not delivered capabilities. The strongest evidence of technical progress comes from peer-reviewed experiments; the evidence for economic maturity is still being assembled.

**Final confidence:** **high** that technical progress is real and PQC already creates concrete costs and decisions; **medium** that narrow utility may emerge over 3–5 years; **low-to-medium** for claims about broader economic scale beyond that horizon.

## 14. Principal sources and method

- [NIST — Post-Quantum Cryptography](https://www.nist.gov/pqc), accessed Sept. 16, 2026.
- [NIST — Additional Digital Signatures / IR 8610](https://www.nist.gov/news-events/news/2026/05/nine-candidates-advance-third-round-additional-digital-signatures-pqc), 2026 update.
- [DARPA — Quantum Benchmarking Initiative](https://www.darpa.mil/research/programs/quantum-benchmarking-initiative), accessed Sept. 16, 2026.
- [DARPA — QBI expansion](https://www.darpa.mil/news/2026/qbi-stage-a-qbit), Mar. 10, 2026.
- [GAO-26-107759 — Quantum Computing](https://www.gao.gov/products/gao-26-107759), Mar. 18, 2026.
- [DOE — Quantum Genesis](https://www.energy.gov/science/articles/energy-department-announces-initiative-create-and-deploy-worlds-first), June 23, 2026.
- [Google Quantum AI et al., Nature — Quantum error correction below the surface code threshold](https://www.nature.com/articles/s41586-024-08449-y), published Dec. 9, 2024; 2025 volume; author correction Apr. 28, 2026.
- [IBM — Quantum Roadmap 2026](https://www.ibm.com/roadmaps/quantum/2026/), March 2026 update; treated as a vendor roadmap.
- [IBM — Nighthawk r2](https://www.ibm.com/quantum/blog/nighthawk-r2), Aug. 31, 2026; treated as vendor-reported results.

**Method:** triangulation across public primary sources, peer-reviewed literature, government audit/evaluation and vendor documentation. The assessment separates laboratory demonstration, deployment, scale, targets and scenarios; it does not convert corporate or government schedules into an independent forecast.
