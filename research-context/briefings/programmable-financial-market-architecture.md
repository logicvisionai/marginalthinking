# Programmable financial-market architecture

**Object:** durable interaction between market microstructure, programmable settlement, automated liquidity and information markets.  
**Last reviewed:** 2026-09-23  
**Status:** internal orientation; re-verify current claims externally before public use.

## Structural assessment

Financial-market infrastructure can itself be an economic mechanism rather than neutral plumbing. Latency, executable pricing rules, settlement assets and contract design can change participant incentives, liquidity, information aggregation, collateral use, systematic risk and financing conditions. The durable analytical rule is to test which constraint the technology changed before treating the result as a new economic paradigm.

Established theory remains useful across much of this domain. Inventory risk, adverse selection, arbitrage, competition, monetary anchoring and information incentives do not disappear when execution becomes algorithmic or tokenised. The reusable research question is where the implementation changes an institutional assumption enough to alter measured outcomes.

## Mechanisms worth retaining

- **High-frequency trading:** exchange latency and co-location can affect more than transaction costs. Evidence reviewed in MT-EP-2026-09-23-PROGRAMMABLE-MARKETS links HFT activity to firms' cost of capital through heterogeneous liquidity and systematic-risk channels. Future work should distinguish liquid-stock liquidity benefits from correlated-trading effects rather than use a single welfare label for HFT.
- **Automated market makers:** AMMs encode pricing, inventory exposure and fees into protocol rules. Familiar microstructure mechanisms still apply, but strategic behaviour moves around an algorithmic liquidity pool and transaction ordering can become economically valuable.
- **Tokenised settlement:** technical execution is not equivalent to economic or legal finality. Settlement asset, redemption structure, balance-sheet treatment, legal claim and emergency-liquidity arrangements remain first-order. Central-bank experimentation should be tracked by evidence stage: prototype, institutional deployment and system-wide scale are different states.
- **Prediction/event markets:** prices can aggregate dispersed beliefs, but contract design can also make the settlement event endogenous to participants. Research should examine information production and manipulation incentives together, especially where a trader or referenced actor can influence the event directly.

## Institutional relationships

Market architecture increasingly connects software design with monetary and regulatory institutions. Central banks matter because final settlement and the nominal anchor cannot be inferred from ledger technology alone. Securities/derivatives regulators matter because access rules and event-contract definitions affect incentives and market integrity. Exchange and protocol architecture matters because matching, ordering, pricing and latency determine the feasible strategy set for participants.

This creates a recurring transmission chain:

**technical feasibility → market rule → participant strategy → liquidity/information/collateral effects → financing or monetary transmission → regulatory/institutional adaptation**

The chain is a research heuristic, not evidence that every technical change reaches the final stages.

## What changed since last review

Created after publication of MT-EP-2026-09-23-PROGRAMMABLE-MARKETS. The durable addition is the comparative framework linking HFT, AMMs, tokenised settlement and prediction markets through changes in market architecture while retaining a strict distinction between technical novelty and a genuine change in economic theory.

## Open questions

- Does newer causal evidence confirm that HFT-induced changes in systematic risk materially affect corporate investment or capital formation beyond the documented cost-of-capital channel?
- Which tokenised settlement architectures move from pilots into operating scale while preserving settlement finality, liquidity and the singleness of money under stress?
- How should AMM welfare comparisons incorporate arbitrage, transaction ordering, liquidity-provider losses and interactions with external price discovery?
- Which event-contract designs reliably aggregate information without making the settlement event materially endogenous to traders or referenced actors?
- Do autonomous AI agents create new first-order assumptions in market microstructure, or mainly automate strategies already covered by existing models?

## Related Marginal Thinking research

- `MT-EP-2026-09-23-PROGRAMMABLE-MARKETS` — canonical comparative assessment; revision 1.

## Sources and verification notes

The canonical report points to BIS research on HFT and automated market makers, the BIS 2026 monetary-system work and Project Agorá, an ECB/BIS speech on tokenised finance, and CFTC rulemaking/advisory material on prediction markets. These references are orientation for future retrieval, not a substitute for reopening the current primary source. Re-verify project stage, regulatory status, market scale and all time-sensitive quantities before reuse.
