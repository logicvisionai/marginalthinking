# A infraestrutura cislunar está passando de suporte a missões para uma arquitetura de serviços

**Programa:** Tecnologia, Produção & Sociedade  
**Código:** MT-TS-2026-09-18-cislunar-service-infrastructure  
**Edição:** 18 de setembro de 2026  
**Corte de informação:** 18 de setembro de 2026

A mudança importante na atividade cislunar não é que a Lua tenha subitamente uma economia autossustentável. Ela não tem. A mudança é mais restrita e mais relevante: várias funções antes projetadas em torno de missões individuais — navegação, comunicações, retransmissão, caracterização orbital e algumas tecnologias de suporte à superfície — estão sendo reorganizadas como infraestrutura e serviços reutilizáveis.

Três desenvolvimentos fortalecem esse sinal em 2026. A NASA encerrou a fase de demonstração tecnológica do CAPSTONE depois de validar uma órbita de halo quase retilínea e conceitos de navegação autônoma; contratou o CAPSTONE 02, com duas espaçonaves, para demonstrar operações cislunares mais coordenadas; e entregou uma carga útil de navegação para o primeiro satélite comercial de retransmissão lunar da Intuitive Machines. Ao mesmo tempo, a arquitetura Moon Base da NASA descreve uma constelação inicial de cinco satélites-relé e interoperabilidade LunaNet, enquanto a arquitetura Moonlight da ESA também usa uma constelação de cinco satélites para comunicações e navegação. Isso não prova a existência de um mercado maduro. Mostra que instituições estão começando a especificar operações cislunares como um problema de serviços em rede, e não como um conjunto de missões isoladas.

A avaliação central é, portanto, condicional: **a capacidade cislunar está migrando da demonstração para uma infraestrutura de serviços, mas as restrições vinculantes estão saindo da viabilidade de navegação isolada e passando para energia, sistemas de superfície, lançamento e logística, interoperabilidade, continuidade de compras e demanda recorrente suficiente.**

## A evidência já passou de um único demonstrador precursor

A importância do CAPSTONE não estava em seu tamanho. A espaçonave era um CubeSat 12U, mas demonstrou que uma pequena espaçonave comercial podia entrar e operar em uma órbita de halo quase retilínea, realizar medições de distância entre espaçonaves e testar conceitos de navegação autônoma sem depender exclusivamente de rastreamento a partir da Terra. A NASA encerrou suas atividades no CAPSTONE em junho de 2026 após a missão cumprir os objetivos primários e estendidos. [NASA CAPSTONE](https://www.nasa.gov/mission/capstone/) [NASA — conclusão da missão estendida](https://www.nasa.gov/technology/space-comms/nasas-capstone-completes-extended-mission-testing-lunar-technologies/)

A arquitetura seguinte é ainda mais reveladora. O CAPSTONE 02, com lançamento previsto para 2027, usará **duas espaçonaves** para demonstrar operações de aproximação, navegação autônoma, comunicações cislunares e coordenação entre satélites. A NASA descreve explicitamente as espaçonaves como um modelo de missão escalável e repetível. [NASA CAPSTONE 02](https://www.nasa.gov/directorates/rtmd/nasa-announces-new-spacecraft-technology-demonstration-mission-at-moon/)

Em paralelo, a NASA entregou seu receptor NavCube3-mini para integração ao Altus-1, primeiro satélite de retransmissão lunar da Intuitive Machines. A carga útil foi projetada para usar sinais fracos de GPS e Galileo em distâncias lunares e integra uma arquitetura comercial de satélites-relé do Near Space Network. A NASA apresenta o Altus-1 como o primeiro de uma rede planejada de satélites-relé lunares, não como um experimento isolado. [NASA NavCube3-mini / Altus-1](https://www.nasa.gov/technology/space-comms/nasa-delivers-navigation-system-for-commercial-lunar-relay/) [NASA LCRNS](https://www.nasa.gov/goddard/esc/lcrns/)

| Camada | Evidência em 2026 | O que está demonstrado ou especificado | O que ainda falta |
|---|---|---|---|
| Dinâmica orbital | CAPSTONE concluiu objetivos da NASA | operação em NRHO, caracterização orbital, testes de navegação entre espaçonaves | tráfego multioperador rotineiro em escala |
| Espaçonaves coordenadas | CAPSTONE 02 contratado, meta 2027 | demonstração planejada com duas espaçonaves para aproximação, navegação e comunicação | confiabilidade operacional de serviço |
| Retransmissão comercial | NavCube3-mini entregue para Altus-1 | equipamento de voo integrado a uma arquitetura de provedor comercial | histórico recorrente de serviço e competição multiprovedor |
| Padrões de rede | especificação de interoperabilidade LunaNet | interfaces comuns para comunicações/navegação lunares cooperativas | interoperabilidade operacional ampla entre provedores |
| Infraestrutura de superfície | solicitação NextSTEP-3 / LEIA | lacunas definidas em energia, produção de oxigênio, manufatura e materiais | sistemas utilitários lunares implantados e duráveis |
| Rede europeia | ESA Moonlight | arquitetura de cinco satélites para comunicação/navegação com implantação em fases | constelação completa e economia de serviço demonstrada |

A tabela é deliberadamente conservadora. Contrato, arquitetura ou entrega de carga útil são evidência de compromisso institucional e avanço de engenharia, não prova de qualidade de serviço nem de viabilidade econômica.

```chart
type: bar
title: Número de espaçonaves nas configurações cislunares de navegação e retransmissão citadas
unit: espaçonaves
CAPSTONE demonstrador concluído | 1
CAPSTONE 02 demonstração prevista | 2
Constelação inicial planejada NASA Moon Base Phase One | 5
Constelação completa planejada ESA Moonlight | 5
```

O gráfico compara configurações com status diferentes; **não** é uma série temporal de implantação. O CAPSTONE foi demonstrado, o CAPSTONE 02 é uma demonstração planejada e as duas arquiteturas de cinco satélites são configurações planejadas de serviço. [NASA Moon Base Systems](https://www.nasa.gov/moonbase-systems/) [ESA Moonlight](https://www.esa.int/Newsroom/Press_Releases/ESA_launches_Moonlight_to_establish_lunar_communications_and_navigation_infrastructure)

## A mudança estrutural é institucional tanto quanto técnica

Historicamente, uma missão lunar carregava grande parte de sua lógica de comunicação, navegação e operação dentro do próprio desenho da missão. Uma arquitetura de serviços muda os limites do sistema. Missões podem progressivamente ser planejadas em torno de camadas compartilhadas de comunicação, navegação, sincronização e retransmissão, desde que esses serviços se tornem suficientemente confiáveis.

A especificação LunaNet formaliza essa direção ao definir padrões e interfaces destinados a permitir que múltiplos provedores formem uma rede cooperativa. O Near Space Network da NASA também avançou na direção de comprar capacidades de comunicação e navegação de provedores comerciais, em vez de desenvolver cada camada como ativo governamental de uma única missão. [NASA LunaNet](https://www.nasa.gov/communicating-with-missions/lunanet/) [NASA Near Space Network](https://www.nasa.gov/goddard/esc/near-space-network/)

A ESA segue lógica semelhante com o Moonlight. Sua arquitetura prevê quatro satélites de navegação e um de comunicação, conectados a três estações terrestres, com prioridade para a região do polo sul lunar. A ESA também coopera com NASA e JAXA na interoperabilidade LunaNet. [ESA Moonlight](https://www.esa.int/Newsroom/Press_Releases/ESA_launches_Moonlight_to_establish_lunar_communications_and_navigation_infrastructure)

```map
title: Geografia funcional da camada emergente de serviços cislunares
Terra | Estações terrestres, GNSS e controle de missão | Ainda fornece sincronização, rastreamento, dados e supervisão operacional
Transferência cislunar e NRHO | Demonstrações CAPSTONE / CAPSTONE 02 | Navegação autônoma, operação orbital e coordenação entre satélites
Órbita lunar | Satélites-relé comerciais e constelações do tipo Moonlight | Comunicação, posicionamento, navegação e serviços de tempo
Polo Sul lunar | Rovers, landers, tripulações e infraestrutura futura | Centro de demanda onde linha de visada e energia são restrições mais severas
```

O mapa é esquemático. Ele representa camadas funcionais, não geometria orbital precisa.

```flow
Comunicação e navegação específicas por missão → serviços reutilizáveis de retransmissão, posicionamento, navegação e sincronização → padrões interoperáveis → menor carga de integração para novas missões → mais usuários potenciais → caso econômico mais forte para infraestrutura persistente
```

As duas últimas setas são condicionais. Serviços compartilhados reduzem a carga de integração apenas se disponibilidade, preço, segurança, padrões e continuidade de contratação forem confiáveis.

## A infraestrutura de superfície passa a ser a parte mais difícil da tese

Comunicação e navegação podem amadurecer antes do restante da cadeia industrial lunar. A solicitação Lunar Enabling Infrastructure Accelerator do NextSTEP-3, publicada pela NASA em setembro de 2026, é útil justamente porque mostra o que continua imaturo: painéis solares verticais, extração de oxigênio do regolito, geração Stirling por radioisótopos, manufatura avançada no espaço e nanomateriais. A NASA distingue trabalhos de desenvolvimento capazes de levar sistemas aproximadamente a TRL 5–6 de demonstrações integradas posteriores em TRL 6 ou superior. [NASA NextSTEP-3](https://www.nasa.gov/directorates/stmd/nextstep-3-a-lunar-enabling-technology/) [NASA — solicitação](https://www.nasa.gov/news-release/nasa-calls-for-proposals-to-accelerate-lunar-surface-technologies/)

Isso importa economicamente. Um satélite-relé de comunicação pode ter utilidade com uma base relativamente pequena de ativos lunares. Uma economia lunar mais ampla exige muito mais: energia confiável, pouso e mobilidade, manutenção, construção de superfície, manejo de recursos, peças de reposição, sistemas para presença humana, cadência de lançamento e demanda suficiente para pagar pela infraestrutura fixa.

```mindmap
O que precisa escalar antes de infraestrutura cislunar virar economia
- Serviços de rede
  - comunicação
  - navegação e tempo
  - interoperabilidade
  - confiabilidade de serviço
- Utilidades de superfície
  - energia contínua ou resiliente
  - armazenamento
  - controle térmico
  - mitigação de poeira
- Logística
  - cadência de lançamento
  - entrega de carga
  - peças e manutenção
  - mobilidade de superfície
- Produção
  - oxigênio e processamento de recursos
  - construção
  - manufatura no espaço
- Instituições e demanda
  - continuidade de contratação
  - segurança e padrões
  - múltiplos provedores
  - usuários recorrentes além de um único programa
```

A distinção é central: **infraestrutura pode se tornar tecnicamente real antes de se tornar economicamente autossustentável**.

## Capital e organização industrial estão mudando antes de a receita ser provada

O modelo emergente é híbrido. Instituições públicas definem requisitos, financiam demonstrações e atuam como clientes-âncora; empresas comerciais passam a possuir ou operar parte maior da camada de serviços; padrões reduzem incompatibilidades; usuários futuros podem então decidir comprar serviços em vez de reproduzir infraestrutura missão a missão.

A documentação do LCRNS da NASA descreve explicitamente a Intuitive Machines como o primeiro provedor comercial de serviço de retransmissão lunar do Near Space Network e apresenta o objetivo de estimular um mercado no qual múltiplos provedores possam eventualmente fornecer comunicação e navegação lunares. Essa formulação é institucionalmente relevante, mas não demonstra que já exista demanda não-NASA suficiente para sustentar esse mercado. [NASA LCRNS](https://www.nasa.gov/goddard/esc/lcrns/)

Os efeitos industriais de curto prazo são, portanto, mais visíveis na Terra do que na Lua: fabricação de espaçonaves, cargas úteis de navegação, comunicação óptica e por rádio, redes terrestres, software de voo, navegação autônoma, sistemas de energia, robótica de superfície, serviços de lançamento e engenharia especializada.

## Sociedade entra por instituições, trabalho e distribuição do acesso

O efeito social não é uma migração de pessoas para a Lua no curto prazo. Essa interpretação seria prematura.

O canal mais defensável passa pela organização de capacidade científica e industrial de alto custo. Se comunicação, navegação e logística cislunares se tornarem serviços compartilhados, missões e instituições menores podem enfrentar custos fixos de integração menores do que quando cada missão precisa construir sozinha capacidades equivalentes. Se isso de fato ampliar acesso dependerá de preços, regras de contratação, padrões técnicos, controles de exportação, seguro, acesso a lançamento e concentração de provedores.

O efeito sobre trabalho também é terrestre no horizonte atual. Cresce a demanda por engenharia de sistemas espaciais, comunicações ópticas e por RF, navegação, autonomia, eletrônica de potência, engenharia para ambiente lunar, operações e integração. São competências especializadas, e um programa sustentado pode criar capacidades industriais duradouras antes de existir um mercado autossustentável fora da Terra.

## O que tornaria essa transformação mais forte

A avaliação se fortaleceria se vários sinais independentes convergissem:

1. satélites-relé lunares comerciais entrarem em operação e prestarem serviço repetido a múltiplas missões;
2. serviços compatíveis com LunaNet funcionarem entre mais de um provedor ou agência;
3. sistemas de energia e logística de superfície demonstrarem confiabilidade prolongada;
4. a demanda se ampliar além de um único programa-âncora;
5. provedores divulgarem desempenho de serviço, preços ou contratos recorrentes de forma crível;
6. missões lunares passarem a ser redesenhadas em torno da compra de serviços comuns, em vez de carregar capacidades equivalentes.

A avaliação se enfraqueceria se implantações de satélites-relé fossem repetidamente adiadas, padrões permanecessem nominais em vez de interoperáveis, a demanda continuasse quase totalmente específica de programas públicos ou restrições de energia e logística de superfície impedissem o crescimento da base instalada de usuários.

## O sinal é alto, mas a maturidade ainda é inicial

A evidência mais forte em 2026 não sustenta que uma economia lunar tenha chegado. Sustenta que **a arquitetura das operações lunares está se tornando mais modular, conectada e orientada a serviços**.

O CAPSTONE transformou partes da navegação cislunar de teoria em operação demonstrada. O CAPSTONE 02 leva o problema para coordenação entre espaçonaves. Altus-1 e LCRNS deslocam comunicação e navegação para um modelo de serviços comerciais. LunaNet e Moonlight formalizam interoperabilidade e lógica de constelação. O NextSTEP-3, por outro lado, mostra quanto da infraestrutura básica de superfície ainda precisa amadurecer.

Essa combinação é justamente o que torna o sinal relevante: uma pilha de capacidades antes específica de missões começa a se parecer com infraestrutura, enquanto as restrições remanescentes ficam mais claras, e não menos importantes.

## Fontes principais

- [NASA — CAPSTONE](https://www.nasa.gov/mission/capstone/), atualização de 2026.
- [NASA — CAPSTONE conclui missão estendida](https://www.nasa.gov/technology/space-comms/nasas-capstone-completes-extended-mission-testing-lunar-technologies/), 6 de julho de 2026.
- [NASA — CAPSTONE 02](https://www.nasa.gov/directorates/rtmd/nasa-announces-new-spacecraft-technology-demonstration-mission-at-moon/), 24 de julho de 2026.
- [NASA — NavCube3-mini / Altus-1](https://www.nasa.gov/technology/space-comms/nasa-delivers-navigation-system-for-commercial-lunar-relay/), 3 de agosto de 2026.
- [NASA — LCRNS](https://www.nasa.gov/goddard/esc/lcrns/), consultado em 18 de setembro de 2026.
- [NASA — LunaNet](https://www.nasa.gov/communicating-with-missions/lunanet/), consultado em 18 de setembro de 2026.
- [NASA — Moon Base Systems](https://www.nasa.gov/moonbase-systems/), consultado em 18 de setembro de 2026.
- [NASA — NextSTEP-3 Lunar Enabling Technology](https://www.nasa.gov/directorates/stmd/nextstep-3-a-lunar-enabling-technology/), atualização de 10 de setembro de 2026.
- [ESA — Moonlight](https://www.esa.int/Newsroom/Press_Releases/ESA_launches_Moonlight_to_establish_lunar_communications_and_navigation_infrastructure), arquitetura do programa.
