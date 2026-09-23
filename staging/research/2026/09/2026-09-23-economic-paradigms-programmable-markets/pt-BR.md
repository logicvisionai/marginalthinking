# Os mercados estão se tornando programáveis — a economia está se adaptando, mas de forma desigual

A mudança importante nos mercados financeiros já não é apenas o fato de as negociações serem mais rápidas ou os ativos serem digitais. A própria arquitetura do mercado está se tornando uma variável econômica. A latência determina quem consegue reagir primeiro; formadores automáticos de mercado substituem partes das funções de dealers e livros de ofertas por código; plataformas tokenizadas podem combinar transferência de ativos, liquidação e execução condicional; e mercados de previsão transformam crenças sobre eventos futuros em contratos negociados continuamente.

A teoria econômica não está ignorando essas mudanças. A literatura está avançando além da pergunta inicial sobre se a negociação eletrônica reduz spreads. Trabalhos recentes conectam high-frequency trading ao custo de capital das empresas; pesquisas sobre finanças descentralizadas modelam formadores automáticos de mercado como um problema próprio de desenho de mercado; bancos centrais analisam liquidação programável como arquitetura monetária, e não apenas como nicho de criptoativos; e reguladores precisam decidir quais tipos de mercados de eventos podem operar sem se tornarem facilmente manipuláveis.

A adaptação, porém, é desigual. A tecnologia pode passar da possibilidade de engenharia para um mercado em funcionamento antes que economistas tenham dados suficientes para estimar efeitos de bem-estar, antes que reguladores tenham uma categoria estável para o instrumento e antes que instituições monetárias decidam quais formas de dinheiro digital devem oferecer liquidação final. A pergunta útil, portanto, não é se a "velha economia" fracassou. É onde os modelos conhecidos continuam suficientes, onde a infraestrutura de mercado passou a fazer parte do mecanismo e onde novas evidências empíricas estão mudando a resposta.

| Mudança de mercado | Foco analítico anterior | O que se tornou economicamente material | Questão em aberto |
| --- | --- | --- | --- |
| High-frequency trading | spreads, liquidez e volatilidade | risco sistemático e custo de financiamento das empresas | quando a velocidade melhora a liquidez e quando amplifica risco comum? |
| Formadores automáticos de mercado | formação de mercado por dealer/livro de ofertas | curvas algorítmicas de liquidez, exposição de inventário e execução on-chain | como modelar liquidez e seleção adversa quando a formação de mercado está codificada? |
| Liquidação tokenizada | processamento operacional mais rápido | dinheiro, colateral e ativos em infraestrutura programável com execução atômica | qual arquitetura preserva finalidade, liquidez e unicidade da moeda? |
| Mercados de previsão | precisão de previsões | classe regulada de mercados capaz de agregar informação, fazer hedge de eventos e criar incentivos à manipulação | onde termina a produção útil de informação e começa um desenho contratual que cria o próprio risco do evento? |

## Velocidade deixou de ser apenas vantagem de negociação e pode alterar condições de financiamento

Durante boa parte do debate sobre HFT, as perguntas empíricas centrais envolviam spreads de compra e venda, liquidez exibida, volatilidade e descoberta de preços. Isso continua importante, mas um working paper do BIS de 2025, de Matteo Aquilina, Gbenga Ibikunle, Khaladdin Rzayev e Xuesi Wang, leva o mecanismo para as finanças corporativas. Usando colocation e upgrades de latência da Nasdaq como experimentos naturais, os autores concluem que maior atividade de HFT eleva, em média, o custo de capital, com efeitos muito diferentes entre ações.[1]

O mecanismo não é simplesmente "negociação rápida é ruim". Para as ações mais líquidas, maior atividade de HFT reduz o prêmio de liquidez e pode diminuir o custo de capital. Para ações de beta baixo, o artigo encontra o canal oposto: negociações correlacionadas em alta velocidade tornam esses papéis mais sensíveis a informações de mercado amplo, elevando risco sistemático e o retorno exigido pelos investidores.[1] Um teste complementar em Hong Kong sugere que o resultado não é apenas um artefato da fragmentação do mercado americano.

Isso importa porque muda a unidade de análise. Tecnologia de bolsa deixa de ser apenas questão de custo de transação se consegue alterar a estrutura de covariância que entra no retorno exigido. A microestrutura pode então chegar ao investimento por meio do custo de financiamento. A tarefa teórica se torna heterogênea: a velocidade pode reduzir uma fricção e ampliar outra, e o efeito econômico depende de quais ativos e participantes absorvem a mudança.

Esse quadro já é mais exigente do que a oposição simples entre "benefício de liquidez" e "HFT predatório". É necessário conectar desenho do matching engine, estratégia dos participantes, características do ativo e condições de financiamento em equilíbrio.

## Formadores automáticos tornam a regra de preço parte explícita da instituição

Exchanges descentralizadas introduziram outra mudança: a formação de mercado pode ser incorporada diretamente a um protocolo. O BIS descreveu como protocolos de automated market maker surgiram, em parte, porque manter um livro central de ofertas convencional on-chain é caro e porque mercados descentralizados anônimos não podem depender das mesmas relações entre dealers usadas nos mercados OTC tradicionais.[2]

Um AMM, portanto, faz mais do que automatizar um dealer humano. A função de preço, a regra de inventário e a estrutura de taxas passam a ser componentes explícitos do desenho do mercado. Provedores de liquidez assumem uma exposição definida às variações de preços relativos; arbitradores conectam o preço do pool a mercados externos; e a própria ordem de execução das transações pode adquirir valor econômico.

A teoria tradicional de microestrutura contém muitos dos componentes necessários — risco de inventário, seleção adversa, arbitragem e negociação informada —, mas a implementação altera as restrições. O "market maker" pode ser um pool governado por código, enquanto atores estratégicos competem ao redor do pool, e não dentro do balanço de um dealer.

A lacuna analítica é, portanto, menor do que sugere a retórica de um sistema financeiro completamente novo. Os conceitos muitas vezes são conhecidos; o mapeamento institucional é novo. A boa análise econômica precisa identificar qual mecanismo antigo sobrevive à mudança de arquitetura e qual hipótese deixa de funcionar.

## Tokenização leva o debate dos ativos digitais para a arquitetura do dinheiro e da liquidação

A tokenização avançou além da pergunta sobre se um título pode ser representado em um ledger distribuído. O Annual Economic Report 2026 do BIS enquadra o problema em torno de como plataformas programáveis podem integrar dinheiro e ativos preservando confiança, finalidade da liquidação e estabilidade monetária.[3]

A proposta do BIS é explicitamente institucional: reservas tokenizadas de banco central continuam sendo a âncora de liquidação, enquanto dinheiro bancário tokenizado e outras formas reguladas de dinheiro privado podem operar em infraestrutura programável compatível. O objetivo não é apenas transferir mais rápido. A programabilidade pode agrupar ações, permitir entrega contra pagamento, reduzir etapas de conciliação e diminuir necessidades de pré-financiamento; a questão econômica é como essas eficiências interagem com liquidez, criação de crédito, finalidade jurídica e unicidade da moeda.[3]

O Project Agorá ilustra a passagem da teoria para o experimento. O BIS informou em junho de 2026 que o protótipo reúne oito bancos centrais e mais de 40 instituições reguladas para testar uma arquitetura compartilhada de depósitos bancários tokenizados e reservas de banco central em pagamentos internacionais de atacado.[4] Na Europa, Piero Cipollone, membro da Diretoria Executiva do BCE, descreveu o desafio como passar de pilotos fragmentados para um mercado tokenizado integrado capaz de liquidar em moeda de banco central.[5]

É um caso em que economia monetária e arquitetura computacional estão convergindo. Uma transferência tecnicamente instantânea de ativo não é economicamente final apenas porque o código executou. O ativo de liquidação, a promessa de resgate, a estrutura de balanço, a natureza jurídica do direito e o mecanismo de liquidez emergencial continuam determinando se o sistema se comporta como dinheiro sob estresse.

```flow
Tecnologia de negociação / liquidação muda → regras de mercado viáveis mudam → estratégias dos participantes se adaptam → liquidez, descoberta de preços e uso de colateral mudam → financiamento e transmissão monetária mudam → regulação e modelos econômicos precisam ser reestimados
```

## Mercados de previsão mostram como novos mercados podem ser sistemas de informação e objetos regulatórios ao mesmo tempo

Mercados de previsão expõem outra fronteira. Eles são mercados, mas seus preços também são interpretados como crenças agregadas sobre eventos futuros. Esse papel duplo está saindo de um experimento de nicho e se tornando uma categoria materialmente maior de mercado regulado nos Estados Unidos.

A CFTC informou em sua consulta regulatória de março de 2026 que mercados designados listaram, em média, cerca de cinco contratos de eventos por ano entre 2006 e 2020. O número subiu para 131 em 2021 e para aproximadamente 1.600 novos contratos listados em 2025.[6]

```chart
type: bar
title: Listagens reguladas de contratos de eventos nos EUA cresceram fortemente
unit: contratos de eventos listados por ano
Média anual 2006–2020 | 5
2021 | 131
2025 | 1600
```

Os valores são aproximados quando a própria CFTC os apresenta como aproximados. O gráfico mede listagens, não volume negociado, contratos em aberto ou utilidade social.

O crescimento cria perguntas econômicas diferentes das existentes em um contrato futuro convencional. Preços de contratos de eventos podem agregar informação dispersa e fazer hedge de exposições ligadas a eventos, mas a definição do contrato também pode alterar incentivos. O comunicado da CFTC de 22 de setembro de 2026 sobre "mention markets" é um caso-limite útil: contratos baseados em uma pessoa pronunciar determinadas palavras ou realizar uma ação discreta podem ser especialmente suscetíveis à manipulação porque alguém pode influenciar diretamente o evento que define a liquidação.[7]

A questão não é se mercados de previsão são inerentemente informativos ou inerentemente apostas. O desenho do mercado determina qual informação é revelada, quem tem vantagem informacional, se o evento subjacente é exógeno aos participantes e se o próprio mercado altera incentivos em torno do evento.

Uma teoria de agregação de informação precisa, portanto, conviver com uma teoria de manipulação endógena. À medida que a variedade de produtos cresce, reguladores precisam distinguir contratos que descobrem informação sobre o mundo daqueles cuja existência ajuda a modificar o mundo sobre o qual liquidam.

| Estágio da evidência | HFT | AMMs | Finanças tokenizadas | Mercados de previsão |
| --- | --- | --- | --- | --- |
| Operação em escala | sim nos grandes mercados eletrônicos | sim em mercados de cripto/DeFi | parcial; pilotos e implantações institucionais estão avançando | sim como classe regulada, com rápido crescimento de contratos |
| Evidência econômica madura | substancial em microestrutura; transmissão para economia real ainda em desenvolvimento | crescente, mas específica à arquitetura | limitada para adoção sistêmica porque muito ainda está em estágio de piloto | mista; agregação de informação é estabelecida, enquanto novos produtos criam novas questões de desenho |
| Principal resposta institucional | regras de estrutura de mercado e acesso | regulação de criptoativos e microestrutura | experimentação de bancos centrais e instituições reguladas | supervisão de desenho de produtos e mercados pela CFTC |
| Mecanismo central ainda aberto | distribuição dos benefícios da velocidade e efeitos sobre risco sistêmico | provisão de liquidez, arbitragem e governança sob código | arquitetura de liquidação, liquidez e soberania monetária | agregação de informação versus manipulação/endogeneidade |

## A teoria está se adaptando, mas a identificação empírica fica atrás da engenharia

A principal conclusão não é que economistas deixaram de perceber a mudança tecnológica. Em cada uma dessas áreas, a fronteira da pesquisa está caminhando em direção ao mecanismo que se tornou economicamente relevante.

Pesquisas de HFT estão conectando latência das bolsas ao custo de financiamento. Estudos de AMMs traduzem problemas conhecidos de microestrutura para restrições específicas de protocolos. Bancos centrais tratam tokenização como questão de desenho monetário e confiança institucional. A regulação de mercados de previsão confronta o fato de que o desenho do contrato afeta tanto qualidade da informação quanto incentivos à manipulação.

O que frequentemente fica para trás é a identificação empírica. Engenheiros podem colocar um novo mecanismo em produção antes que economistas disponham de um painel longo de dados comparáveis. Reguladores podem precisar formular regras provisórias antes que o comportamento de equilíbrio dos participantes seja conhecido. Os primeiros adotantes demonstram viabilidade operacional, mas podem ser sistematicamente diferentes das instituições que usariam a tecnologia em escala.

Surge então uma sequência recorrente:

**viabilidade técnica → adoção → novo comportamento estratégico → efeito econômico mensurável → revisão teórica → redesenho institucional**

A economia funciona melhor quando resiste à tentação de chamar a primeira etapa de mudança de paradigma. A agenda de pesquisa mais útil é observar quando a tecnologia altera uma restrição que o modelo tratava como fixa.

## O que caracterizaria uma mudança real de paradigma

Um novo paradigma econômico deve exigir mais do que uma nova classe de ativos ou software mais rápido. O limiar é maior: um modelo importante deve falhar de maneira sistemática porque um mecanismo antes desprezível se tornou de primeira ordem.

No desenho de mercados, isso poderia ocorrer se latência, agência automatizada ou liquidação programável alterarem de forma persistente a alocação de capital em dimensões que os modelos padrão não consigam explicar sem mudar suas hipóteses institucionais. Na economia monetária, poderia ocorrer se dinheiro programável alterar materialmente demanda por liquidez, intermediação bancária ou transmissão monetária. Na economia da informação, mercados de previsão poderiam ganhar relevância maior se probabilidades geradas por mercado passassem a substituir ou complementar sistematicamente pesquisas e previsões de especialistas em decisões importantes.

O contrário também é possível. Tecnologia nova pode tornar teoria antiga mais útil em vez de obsoleta. AMMs continuam enfrentando seleção adversa. Dinheiro tokenizado continua precisando de uma âncora nominal crível. HFT continua sujeito a inventário, informação e concorrência. Mercados de previsão continuam dependendo de incentivos e da qualidade da informação.

A tarefa de pesquisa é, portanto, comparativa, e não celebratória: identificar a restrição alterada pela tecnologia, testar o mecanismo, medir quem ganhou ou perdeu e determinar se o resultado exige uma nova teoria ou apenas uma versão institucional melhor de uma teoria conhecida.

## Fontes

1. Bank for International Settlements, Matteo Aquilina, Gbenga Ibikunle, Khaladdin Rzayev e Xuesi Wang, **The speed premium: high-frequency trading and the cost of capital**, BIS Working Papers No. 1290, 23 de setembro de 2025: https://www.bis.org/publications/working-paper-1290-speed-premium-high-frequency-trading-and-cost-capital
2. BIS Quarterly Review, Sirio Aramonte, Wenqian Huang e Andreas Schrimpf, **Trading in the DeFi era: automated market-makers**, dezembro de 2021: https://www.bis.org/publications/trading-defi-era-automated-market-maker
3. Bank for International Settlements, **Annual Economic Report 2026 — Anchoring trust in money: innovation beyond stablecoins**, junho de 2026: https://www.bis.org/publications/aer-2026
4. Bank for International Settlements, **The path to the next-generation monetary and financial system lies in safeguarding trust in money**, 23 de junho de 2026: https://www.bis.org/media-releases/20260623-path-next-generation-monetary-and-financial-system-lies-safeguarding-trust-money-bis
5. Piero Cipollone, Diretoria Executiva do BCE, **From vision to delivery — building Europe's tokenised financial market**, discurso de 26 de agosto de 2026, publicado pelo BIS em 15 de setembro de 2026: https://www.bis.org/speeches/20260915-vision-delivery-building-europes-tokenised-financial-market
6. U.S. Commodity Futures Trading Commission, **Prediction Markets — Advance Notice of Proposed Rulemaking**, Federal Register, 16 de março de 2026: https://www.cftc.gov/LawRegulation/FederalRegister/proposedrules/2026-05105.html
7. U.S. Commodity Futures Trading Commission, **Staff Advisory 26-27 sobre contratos de eventos do tipo mention market**, 22 de setembro de 2026: https://www.cftc.gov/node/260241

**Corte dos dados:** 23 de setembro de 2026, 08:20 America/Sao_Paulo.
