# Eurosistema: autoridade monetária compartilhada, implementação distribuída e infraestrutura de liquidação

**Programa:** Global System & Power  
**Código:** MT-SA-2026-09-23-EUROSYSTEM  
**Edição:** 23 de setembro de 2026  
**Corte de informação:** 23 de setembro de 2026

O Eurosistema é estruturalmente relevante porque centraliza decisões de política monetária da área do euro enquanto as implementa por meio do Banco Central Europeu (BCE) e dos bancos centrais nacionais dos países que usam o euro. Sua capacidade vai além das taxas de juros: reservas, regras de colateral e TARGET Services conectam autoridade monetária ao financiamento bancário, pagamentos de grande valor, liquidação de títulos, pagamentos instantâneos e, desde setembro de 2026, a uma ponte operacional para liquidação atacadista tokenizada.

O Eurosistema não é igual ao Sistema Europeu de Bancos Centrais (SEBC), que também inclui os bancos centrais de países da UE fora da área do euro. O Eurosistema compreende especificamente o BCE e os bancos centrais nacionais dos países que adotaram o euro. [BCE — ECB, ESCB and the Eurosystem](https://www.ecb.europa.eu/ecb/orga/escb/html/index.en.html)

## Decisões monetárias são centralizadas; a implementação é distribuída

O Conselho do BCE é o principal órgão de decisão. É formado pelos seis membros da Comissão Executiva e pelos governadores dos bancos centrais nacionais da área do euro. Formula a política monetária, define taxas diretoras e decide sobre a oferta de reservas, enquanto a implementação utiliza a capacidade operacional do Eurosistema como um todo. [BCE — Conselho do BCE](https://www.ecb.europa.eu/ecb/decisions/govc/html/index.pt.html)

Em 10 de setembro de 2026, o Conselho elevou as três taxas em 25 pontos-base. A partir de 16 de setembro, a facilidade permanente de depósito passou a **2,50%**, as operações principais de refinanciamento a **2,65%** e a facilidade permanente de cedência de liquidez a **2,90%**. [BCE — decisões de política monetária](https://www.ecb.europa.eu/press/pr/date/2026/html/ecb.mp260910~314e508016.en.html)

| Instrumento ou camada | Autoridade/capacidade | Transmissão | Limite |
|---|---|---|---|
| Facilidade de depósito | Conselho define juros sobre depósitos de um dia para o outro | ancora condições do mercado monetário em euro | não define diretamente cada empréstimo bancário ou rendimento de título |
| Operações de refinanciamento | Eurosistema empresta contra colateral elegível | fornece liquidez de banco central aos bancos | acesso depende de contrapartes, colateral e regras operacionais |
| Carteiras de ativos | Eurosistema mantém títulos adquiridos por programas monetários | afeta oferta de reservas e duração de mercado | alocação fiscal e crédito privado continuam separados |
| T2 | liquida pagamentos de grande valor em moeda de banco central | sustenta finalidade de pagamentos atacadistas e movimentação de liquidez | infraestrutura não determina a transação comercial subjacente |
| T2S | plataforma de liquidação de títulos | conecta entrega de títulos e liquidação financeira | propriedade e decisões de investimento continuam com participantes |
| TIPS | liquidação de pagamentos instantâneos | fornece liquidação em moeda de banco central para pagamentos rápidos | bancos e provedores mantêm relação com clientes |
| Pontes | liquida transações atacadistas tokenizadas em moeda de banco central | conecta ativos DLT à liquidação do banco central | não valida cada ativo tokenizado nem substitui a legislação de valores mobiliários |

## TARGET Services mostram que infraestrutura monetária é capacidade operacional

Em 2025, o T2 processou em média **431.067 pagamentos em euro por dia**, enquanto o T2S liquidou 922.533 transações de títulos por dia. O TIPS processou 2.735.053 pagamentos instantâneos por dia em média. O volume total de transações no TIPS subiu de 1,35 bilhão em 2024 para 2,47 bilhões em 2025. [BCE — TARGET Services Annual Report 2025](https://www.ecb.europa.eu/press/targetservar/html/ecb.targetservar2025.en.html)

```chart
type: bar
title: Volume de transações no TIPS
unit: bilhões de transações
2024 | 1.35
2025 | 2.47
```

O gráfico mede atividade de liquidação, não intensidade da política monetária. A infraestrutura se torna estruturalmente relevante porque participantes precisam de um ativo final de liquidação confiável e trilhos operacionais pelos quais moeda de banco central circula.

## A cadeia de transmissão parte de uma política comum para sistemas nacionais heterogêneos

Uma única política opera sobre sistemas bancários com balanços, mercados soberanos e estruturas de crédito diferentes. O Conselho define taxas comuns, mas força e velocidade da transmissão para famílias e empresas variam entre países.

```flow
Decisão do Conselho → taxas comuns e condições de reservas em euro → financiamento bancário e rendimentos de títulos → transmissão pelos sistemas bancários e mercados nacionais → empresas e famílias → gasto, investimento e inflação
Colateral elegível → operação de refinanciamento do Eurosistema → reservas de banco central → capacidade de pagamento e financiamento → transações interbancárias e de clientes
```

É por isso que a transmissão homogênea faz parte da arquitetura monetária. Uma taxa comum não garante custos de financiamento idênticos, e diferenças de risco soberano, capital bancário ou colateral podem gerar fragmentação.

## Pontes estende moeda de banco central à liquidação atacadista tokenizada

Em 21 de setembro de 2026, o Eurosistema lançou **Pontes**, permitindo que transações atacadistas em ativos tokenizados sejam liquidadas em moeda de banco central. O BCE descreveu o lançamento como o primeiro passo de implementação de sua estratégia para finanças tokenizadas, com entrada gradual de bancos e infraestruturas de mercado. [BCE — lançamento do Pontes](https://www.ecb.europa.eu/press/pr/date/2026/html/ecb.pr260921~e754847a7b.en.html)

Isso importa porque tokenização, sozinha, não resolve finalidade econômica de liquidação. Um título tokenizado ainda precisa de ativo de liquidação confiável, direito legal e estrutura operacional. O Pontes coloca moeda de banco central em um lado da transação sem tornar todo arranjo DLT equivalente a passivo do banco central.

```mindmap
Canais estruturais do Eurosistema
- Autoridade monetária
  - taxas diretoras
  - condições de reservas
  - operações de refinanciamento
  - carteiras de ativos
- Implementação distribuída
  - BCE
  - bancos centrais nacionais da área do euro
- Infraestrutura de liquidação
  - T2
  - T2S
  - TIPS
  - ECMS
- Extensão digital
  - Pontes
  - liquidação atacadista tokenizada
- Restrições
  - mandato dos Tratados
  - regras de colateral
  - heterogeneidade bancária nacional
  - fragmentação soberana
  - interoperabilidade legal e técnica
  - política fiscal permanece em domínio nacional/institucional da UE
```

## Autoridade monetária compartilhada não elimina instituições nacionais

Bancos centrais nacionais são partes integrantes do Eurosistema e implementam tarefas comuns, mas política fiscal, estruturas bancárias e instituições políticas nacionais continuam distintas. A força estrutural vem da autoridade monetária coordenada e da infraestrutura comum; uma de suas restrições persistentes é a heterogeneidade dos sistemas pelos quais a política se transmite.

A mesma separação vale para supervisão bancária. O BCE tem responsabilidades relevantes no Mecanismo Único de Supervisão, mas o MUS não é sinônimo do Eurosistema e não deve substituir a análise da instituição monetária.

| Evidência que fortaleceria a avaliação | Evidência que a enfraqueceria |
|---|---|
| maior uso de infraestrutura comum de liquidação e colateral na área do euro | migração persistente de liquidação central para fora da moeda do Eurosistema |
| transmissão forte e relativamente homogênea da política entre membros | fragmentação durável enfraquece o pass-through das taxas comuns |
| Pontes escala para atividade atacadista material | mercados tokenizados permanecem marginais ou liquidam majoritariamente por alternativas |
| TARGET Services preservam alta disponibilidade e integração crescente | falhas operacionais recorrentes reduzem materialmente a dependência dos participantes |

## Avaliação

O Eurosistema é um ator estratégico porque combina **autoridade monetária comum, implementação distribuída por bancos centrais e infraestrutura financeira compartilhada**. Seu alcance vai das taxas e reservas aos sistemas em que bancos liquidam dinheiro e títulos. O Pontes adiciona uma nova interface entre moeda de banco central e finanças tokenizadas, mas sua importância dependerá de adoção e escala reais.

As variáveis relevantes são taxas diretoras, regras de reservas e colateral, política de balanço, indicadores de fragmentação, uso e disponibilidade dos TARGET Services, adoção do Pontes e o grau em que condições monetárias comuns se transmitem aos sistemas bancários e mercados de capitais nacionais.

## Fontes principais

- [BCE — ECB, ESCB and the Eurosystem](https://www.ecb.europa.eu/ecb/orga/escb/html/index.en.html)
- [BCE — Conselho do BCE](https://www.ecb.europa.eu/ecb/decisions/govc/html/index.pt.html)
- [BCE — taxas de juros diretoras](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/key_ecb_interest_rates/html/index.en.html)
- [BCE — TARGET Services Annual Report 2025](https://www.ecb.europa.eu/press/targetservar/html/ecb.targetservar2025.en.html)
- [BCE — lançamento do Pontes](https://www.ecb.europa.eu/press/pr/date/2026/html/ecb.pr260921~e754847a7b.en.html)
