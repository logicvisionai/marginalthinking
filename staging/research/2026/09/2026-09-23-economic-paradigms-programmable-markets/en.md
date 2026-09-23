# Markets are becoming programmable — economics is adapting, but the adjustment is uneven

The important change in financial markets is no longer simply that trading is faster or that assets are digital. The architecture of the market itself is becoming an economic variable. Latency determines who can react first; automated market makers replace parts of the dealer and order-book function with code; tokenised platforms can combine asset transfer, settlement and conditional execution; and prediction markets convert beliefs about future events into continuously traded contracts.

Economic theory is not ignoring these developments. The literature is moving beyond the early question of whether electronic trading narrows spreads. Recent work links high-frequency trading to firms' cost of capital; research on decentralised finance models automated market makers as a distinct market-design problem; central banks are analysing programmable settlement as monetary architecture rather than a crypto niche; and regulators are being forced to decide what kinds of event markets can operate without becoming readily manipulable.

The adjustment is nevertheless uneven. Technology can move from engineering possibility to operating market before economists have enough data to estimate welfare effects, before regulators have a stable category for the instrument, and before monetary institutions have decided which forms of digital money should provide final settlement. The useful question is therefore not whether "old economics" has failed. It is where familiar models remain sufficient, where market plumbing has become part of the mechanism, and where new empirical evidence is changing the answer.

| Market change | Earlier analytical focus | What has become economically material | Open question |
| --- | --- | --- | --- |
| High-frequency trading | spreads, liquidity and volatility | systematic risk and firms' financing costs | when does speed improve liquidity versus amplify common risk? |
| Automated market makers | dealer/order-book market making | algorithmic liquidity curves, inventory exposure and on-chain execution | how should liquidity and adverse selection be modelled when market making is encoded? |
| Tokenised settlement | faster back-office processing | money, collateral and assets on programmable rails with atomic execution | which architecture preserves finality, liquidity and singleness of money? |
| Prediction markets | forecasting accuracy | a regulated market class that can aggregate information, hedge events and create manipulation incentives | where is the boundary between useful information production and contract design that creates the event risk itself? |

## Speed is no longer just a trading advantage; it can alter financing conditions

For much of the HFT debate, the central empirical questions concerned bid-ask spreads, displayed liquidity, volatility and price discovery. That remains important, but a 2025 BIS working paper by Matteo Aquilina, Gbenga Ibikunle, Khaladdin Rzayev and Xuesi Wang pushes the mechanism into corporate finance. Using Nasdaq co-location and latency upgrades as natural experiments, the authors find that higher HFT activity raises the cost of capital on average, while the effect differs sharply across stocks.[1]

The mechanism is not simply "fast trading is bad". For the most liquid stocks, greater HFT activity reduces the liquidity premium and can lower the cost of capital. For low-beta stocks, the paper finds the opposite channel: correlated high-speed trading makes those securities more sensitive to market-wide information, increasing systematic risk and the return investors require.[1] A complementary Hong Kong test suggests that the result is not merely an artefact of fragmented U.S. market structure.

This matters because it changes the unit of analysis. Exchange technology is not only a transaction-cost issue if it can alter the covariance structure that feeds required returns. Market microstructure can then transmit into investment through the cost of financing. The theoretical task becomes heterogeneous: speed can improve one friction while worsening another, and the welfare effect depends on which securities and participants absorb the change.

That is already a more demanding framework than the simple opposition between "liquidity benefit" and "predatory HFT". It requires connecting matching-engine design, participant strategy, asset characteristics and equilibrium financing conditions.

## Automated market makers make the pricing rule part of the institution

Decentralised exchanges introduced another change: market making can be embedded directly in a protocol. The BIS has described how automated market-maker protocols emerged partly because maintaining a conventional on-chain central limit order book is costly and because anonymous decentralised markets cannot rely on the same dealer relationships used in traditional OTC markets.[2]

An AMM therefore does more than automate an existing human dealer. The pricing function, inventory rule and fee structure become explicit pieces of market design. Liquidity providers accept a defined exposure to relative-price movements; arbitrageurs connect the pool price to outside markets; and transaction ordering can itself become economically valuable.

Traditional microstructure theory contains many of the required building blocks — inventory risk, adverse selection, arbitrage and informed trading — but the implementation changes the constraints. The "market maker" may be a pool governed by code, while strategic actors compete around the pool rather than inside a dealer's balance sheet.

The analytical gap is therefore narrower than the rhetoric of a completely new financial system sometimes implies. The concepts are often familiar; the institutional mapping is new. Good economics has to identify which old mechanism survives the change in architecture and which assumption no longer does.

## Tokenisation moves the debate from digital assets to the architecture of money and settlement

Tokenisation has advanced beyond the question of whether a security can be represented on a distributed ledger. The 2026 BIS Annual Economic Report frames the problem around how programmable platforms can integrate money and assets while preserving trust, settlement finality and monetary stability.[3]

The BIS proposal is explicitly institutional: tokenised central-bank reserves remain the settlement anchor, while tokenised commercial-bank money and other regulated private money can operate on compatible programmable infrastructure. The objective is not simply faster transfers. Programmability can bundle actions, support delivery-versus-payment, reduce reconciliation steps and lower pre-funding needs; the economic question is how those efficiencies interact with liquidity, credit creation, legal finality and the singleness of money.[3]

Project Agorá illustrates the shift from theory to experimentation. The BIS reported in June 2026 that the prototype involves eight central banks and more than 40 regulated institutions testing a shared architecture for tokenised commercial-bank deposits and central-bank reserves in cross-border wholesale payments.[4] In Europe, ECB Executive Board member Piero Cipollone has described the policy challenge as moving tokenised finance from fragmented pilots toward an integrated market that can settle in central-bank money.[5]

This is a case where monetary economics and computer architecture are converging. A technically instantaneous asset transfer is not economically final merely because code executed. The settlement asset, redemption promise, balance-sheet structure, legal claim and emergency-liquidity framework still determine whether the system behaves like money under stress.

```flow
Trading / settlement technology changes → feasible market rules change → participant strategies adapt → liquidity, price discovery and collateral use change → financing and monetary transmission change → regulators and economic models must be re-estimated
```

## Prediction markets show how new markets can become both information systems and regulatory objects

Prediction markets expose a different boundary. They are markets, but their prices are also interpreted as aggregated beliefs about future events. That dual role is moving from a niche experiment into a materially larger regulated market category in the United States.

The CFTC reported in its March 2026 rulemaking notice that designated contract markets listed an average of about five event contracts per year from 2006 through 2020. The number rose to 131 in 2021 and to approximately 1,600 newly listed event contracts in 2025.[6]

```chart
type: bar
title: U.S. regulated event-contract listings expanded sharply
unit: event contracts listed per year
2006–2020 annual average | 5
2021 | 131
2025 | 1600
```

The values are approximate where the CFTC itself reports them as approximate. The chart measures listings, not trading volume, open interest or social usefulness.

The growth creates economic questions that are different from those in a conventional futures contract. Event-contract prices may aggregate dispersed information and can hedge event-driven exposures, but the contract definition may also shape incentives. The CFTC's 22 September 2026 advisory on "mention markets" is a useful boundary case: contracts based on whether a person says particular words or performs a discrete action can be unusually susceptible to manipulation because a person may be able to influence the settlement event directly.[7]

The issue is not whether prediction markets are inherently informative or inherently gambling. Market design determines what information is elicited, who has an information advantage, whether the underlying event is exogenous to traders, and whether the market itself changes incentives around the event.

A theory of information aggregation therefore needs to sit beside a theory of endogenous manipulation. As the product universe expands, regulators are effectively being asked to distinguish contracts that discover information about the world from contracts whose existence can help change the world they settle on.

| Evidence stage | HFT | AMMs | Tokenised finance | Prediction markets |
| --- | --- | --- | --- | --- |
| Operating at scale | yes in major electronic markets | yes in crypto/DeFi venues | partial; pilots and institutional deployments are expanding | yes as a regulated product class, with rapid contract growth |
| Mature economic evidence | substantial on microstructure; real-economy transmission still developing | growing but architecture-specific | limited for system-wide adoption because much remains pilot-stage | mixed; information aggregation is established, newer product forms create fresh design questions |
| Main institutional response | market-structure and access rules | crypto/market-structure regulation | central-bank and regulated-institution experimentation | CFTC product and market-design oversight |
| Core unresolved mechanism | distribution of speed benefits and systemic-risk effects | liquidity provision, arbitrage and governance under code | settlement architecture, liquidity and monetary sovereignty | information aggregation versus manipulation/endogeneity |

## Theories are adapting — but empirical identification lags engineering

The strongest conclusion is not that economists have failed to notice technological change. In each of these areas, the research frontier is moving toward the mechanism that became economically relevant.

HFT research is connecting exchange latency to financing costs. AMM research is translating familiar microstructure problems into protocol-specific constraints. Central banks are treating tokenisation as a question of monetary design and institutional trust. Prediction-market regulation is confronting the fact that contract design affects both information quality and manipulation incentives.

What lags is often empirical identification. Engineers can deploy a new market mechanism before economists have a long panel of comparable data. Regulators may have to write provisional rules before the equilibrium behaviour of participants is known. Early adopters reveal operational feasibility, but they may be systematically different from the institutions that would use the technology at scale.

That produces a recurring sequence:

**technical feasibility → adoption → new strategic behaviour → measurable economic effect → theoretical revision → institutional redesign**

Economics is strongest when it resists the temptation to label the first step a paradigm shift. The more useful research agenda is to observe when technology changes a constraint that the model treated as fixed.

## What would constitute a genuine paradigm change

A new economic paradigm should require more than a new asset class or faster software. The threshold is higher: an important model should systematically fail because a mechanism that used to be negligible becomes first-order.

For market design, that could occur if latency, automated agency or programmable settlement consistently changes capital allocation in ways that standard models cannot capture without changing their institutional assumptions. For monetary economics, it could occur if programmable money materially changes liquidity demand, bank intermediation or monetary transmission. For information economics, prediction markets could become more important if market-generated probabilities systematically displace or complement surveys and expert forecasts in consequential decisions.

The opposite is equally possible. New technology can make old theory more useful rather than obsolete. AMMs still face adverse selection. Tokenised money still requires a credible nominal anchor. HFT still confronts inventory, information and competition. Prediction markets still depend on incentives and the quality of information.

The research task is therefore comparative rather than celebratory: identify the constraint technology changed, test the mechanism, measure who gained or lost, and determine whether the result requires a new theory or merely a better institutional version of an old one.

## Sources

1. Bank for International Settlements, Matteo Aquilina, Gbenga Ibikunle, Khaladdin Rzayev and Xuesi Wang, **The speed premium: high-frequency trading and the cost of capital**, BIS Working Papers No. 1290, 23 September 2025: https://www.bis.org/publications/working-paper-1290-speed-premium-high-frequency-trading-and-cost-capital
2. BIS Quarterly Review, Sirio Aramonte, Wenqian Huang and Andreas Schrimpf, **Trading in the DeFi era: automated market-makers**, December 2021: https://www.bis.org/publications/trading-defi-era-automated-market-maker
3. Bank for International Settlements, **Annual Economic Report 2026 — Anchoring trust in money: innovation beyond stablecoins**, June 2026: https://www.bis.org/publications/aer-2026
4. Bank for International Settlements, **The path to the next-generation monetary and financial system lies in safeguarding trust in money**, 23 June 2026: https://www.bis.org/media-releases/20260623-path-next-generation-monetary-and-financial-system-lies-safeguarding-trust-money-bis
5. Piero Cipollone, ECB Executive Board, **From vision to delivery — building Europe's tokenised financial market**, speech delivered 26 August 2026, published by BIS 15 September 2026: https://www.bis.org/speeches/20260915-vision-delivery-building-europes-tokenised-financial-market
6. U.S. Commodity Futures Trading Commission, **Prediction Markets — Advance Notice of Proposed Rulemaking**, Federal Register, 16 March 2026: https://www.cftc.gov/LawRegulation/FederalRegister/proposedrules/2026-05105.html
7. U.S. Commodity Futures Trading Commission, **Staff Advisory 26-27 on mention-market event contracts**, 22 September 2026: https://www.cftc.gov/node/260241

**Data cutoff:** 23 September 2026, 08:20 America/Sao_Paulo.
