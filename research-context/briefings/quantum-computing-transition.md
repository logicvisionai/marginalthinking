# Quantum Computing Transition

**Scope:** the transition from experimental quantum systems toward fault-tolerant economic utility, including the present-day impact of post-quantum cryptography migration  
**Canonical slug:** `quantum-computing-transition`  
**Last reviewed:** 2026-09-16  
**Evidence note:** internal orientation only; public claims require external re-verification.

## Structural assessment

Quantum computing should be tracked as a staged industrial transition rather than through raw qubit counts or vendor roadmaps. The central economic test is whether a system can repeatedly deliver useful computation whose value exceeds the total cost and the best available classical alternative.

The current durable distinction is:

```text
claimed → demonstrated → deployed → scaled
```

Experimental systems and cloud access are deployed for research, but general fault-tolerant economic utility at industrial scale has not been independently established in the current corpus.

## Economic and production structure

The industrial system includes device fabrication, high-purity materials, cryogenics or photonics depending on architecture, control electronics, packaging, interconnects, software, compilers, classical HPC, cloud services, metrology and testing. Manufacturing yield, calibration burden, real-time decoding and modular interconnection can become as important as qubit physics.

The clearest current economic effect is capacity formation: laboratories, specialized hiring, cloud access, public programs, standards and supply-chain investment.

## Institutional and security relationship

Post-quantum cryptography creates present expenditure and institutional change before a cryptographically relevant quantum computer exists. Migration requires cryptographic inventory, protocol and hardware changes, interoperability testing and crypto-agility because long-lived sensitive data and long migration cycles create an anticipatory risk-management problem.

Government benchmarking and standards programs are especially useful because they provide external tests against vendor claims and future roadmaps.

## Dependencies and constraints

- logical error rates and correction overhead;
- long reliable circuit execution;
- real-time control and decoding;
- manufacturing yield and repeatability;
- modularity and interconnect fidelity;
- total system cost versus classical methods;
- availability of independently reproducible application benchmarks;
- progress of PQC migration in real systems.

## Structural changes in progress

Technical error-correction progress is measurable, while economic maturity remains under validation. PQC has already moved from future scenario to current standards and migration work. Hardware progress should therefore be separated from the already-operational institutional effects of preparing for future quantum capability.

## What changed since last review

### 2026-09-16

- **Changed:** the first Marginal Thinking strategic technology assessment establishes a baseline that distinguishes peer-reviewed technical progress, vendor roadmaps, government targets, deployed experimental systems and economic utility.
- **Unchanged:** no single hardware metric is sufficient to establish commercial maturity.
- **Watch:** logical error per cycle, reliable logical operations, modular demonstrations, independent benchmarking, total cost, manufacturing yield, roadmap revisions and actual PQC migration.

## Open questions

- When does independently verified computational advantage become economic advantage after full system costs are included?
- Which architectures can scale manufacturing and control rather than only laboratory performance?
- Does PQC migration proceed fast enough across long-lived infrastructure?
- Do classical algorithm and accelerator improvements narrow the set of workloads where quantum systems can create value?

## Related Marginal Thinking research

- `MT-TECH-2026-09-16-quantum-computing` — baseline assessment of technical maturity, industrial constraints and PQC transmission.

## Sources and verification notes

Re-open peer-reviewed error-correction results, NIST PQC standards and migration guidance, DARPA QBI, GAO/DOE program documentation and current vendor roadmaps. Treat vendor roadmaps and government targets as forward-looking claims, not delivered capability. Preserve architecture-specific differences rather than reducing the field to physical-qubit count.