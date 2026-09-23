# Os mercados estão se tornando programáveis — a economia está se adaptando, mas de forma desigual

Latência, regras executáveis de formação de mercado, liquidação tokenizada e contratos de eventos estão mudando como os mercados financeiros formam preços, movimentam garantias, agregam informação e transmitem condições de financiamento. Negociadores de alta frequência podem alterar a velocidade e a correlação da descoberta de preços; formadores automáticos de mercado codificam a provisão de liquidez; plataformas tokenizadas podem combinar transferência de ativos e liquidação; mercados de previsão transformam crenças sobre eventos futuros em contratos negociados continuamente.

A teoria econômica já está se adaptando a esses mecanismos. Pesquisas recentes conectam a negociação de alta frequência ao custo de capital das empresas; estudos de finanças descentralizadas tratam os formadores automáticos de mercado como um problema próprio de desenho de mercado; bancos centrais analisam a liquidação programável como arquitetura monetária; e reguladores enfrentam contratos de eventos cujo desenho pode modificar incentivos à manipulação.

A defasagem é principalmente empírica e institucional. Uma nova infraestrutura pode entrar em operação antes de existirem séries comparáveis longas o suficiente para estimar efeitos de bem-estar, antes que reguladores consolidem uma categoria para o instrumento e antes que instituições monetárias definam quais formas de dinheiro digital devem oferecer liquidação final. Por isso, a maturidade da evidência é muito diferente entre negociação de alta frequência, formadores automáticos de mercado, finanças tokenizadas e mercados de previsão, mesmo quando a tecnologia já está em uso.

| Mudança de mercado | Foco analítico anterior | O que se tornou economicamente material | Questão em aberto |
| --- | --- | --- | --- |
| Negociação de alta frequência (HFT) | diferenças entre preços de compra e venda, liquidez e volatilidade | risco sistemático e custo de financiamento das empresas | quando a velocidade melhora a liquidez e quando amplifica risco comum? |
| Formadores automáticos de mercado (AMMs) | formação de mercado por intermediários e livros de ofertas | curvas algorítmicas de liquidez, exposição de inventário e execução na própria rede blockchain | como modelar liquidez e seleção adversa quando a formação de mercado está codificada? |
| Liquidação tokenizada | processamento operacional mais rápido | dinheiro, garantias e ativos em infraestrutura programável com execução atômica | qual arquitetura preserva finalidade, liquidez e unicidade da moeda? |
| Mercados de previsão | precisão de previsões | classe regulada capaz de agregar informação, proteger contra riscos de eventos e criar incentivos à manipulação | onde termina a produção útil de informação e começa um desenho contratual que cria o próprio risco do evento? |

## Velocidade deixou de ser apenas vantagem de negociação e pode alterar condições de financiamento

Durante boa parte do debate sobre negociação de alta frequência, as perguntas empíricas centrais envolviam diferenças entre preços de compra e venda, liquidez disponível, volatilidade e descoberta de preços. Isso continua importante, mas um estudo do BIS publicado em 2025, de Matteo Aquilina, Gbenga Ibikunle, Khaladdin Rzayev e Xuesi Wang, leva o mecanismo para as finanças corporativas. Usando a co-localização de servidores e atualizações de latência da Nasdaq como experimentos naturais, os autores concluem que maior atividade de HFT eleva, em média, o custo de capital, com efeitos muito diferentes entre ações.[1]

O mecanismo não é simplesmente "negociação rápida é ruim". Para as ações mais líquidas, maior atividade de HFT reduz o prêmio de liquidez e pode diminuir o custo de capital. Para ações de beta baixo, o estudo encontra o canal oposto: negociações correlacionadas em alta velocidade tornam esses papéis mais sensíveis a informações de mercado amplo, elevando risco sistemático e o retorno exigido pelos investidores.[1] Um teste complementar em Hong Kong sugere que o resultado não é apenas um artefato da fragmentação do mercado americano.

Isso muda a unidade de análise. A tecnologia da bolsa não é apenas uma questão de custo de transação se consegue alterar a estrutura de covariância que entra no retorno exigido pelos investidores. A microestrutura de mercado pode então chegar ao investimento por meio do custo de financiamento. A tarefa teórica se torna heterogênea: a velocidade pode reduzir uma fricção e ampliar outra, e o efeito econômico depende de quais ativos e participantes absorvem a mudança.

Esse quadro é mais exigente do que a oposição simples entre "benefício de liquidez" e "HFT predatório". É necessário conectar o desenho do sistema de casamento de ordens, a estratégia dos participantes, as características do ativo e as condições de financiamento em equilíbrio.

## Formadores automáticos tornam a regra de preço parte explícita da instituição

Plataformas descentralizadas de negociação introduziram outra mudança: a formação de mercado pode ser incorporada diretamente a um protocolo. O BIS descreveu como protocolos de formadores automáticos de mercado surgiram, em parte, porque manter um livro central de ofertas convencional diretamente em uma blockchain é caro e porque mercados descentralizados anônimos não podem depender das mesmas relações entre formadores de mercado usadas nos mercados de balcão tradicionais.[2]

Um formador automático de mercado faz mais do que automatizar um intermediário humano. A função de preço, a regra de inventário e a estrutura de tarifas passam a ser componentes explícitos do desenho do mercado. Provedores de liquidez assumem uma exposição definida às variações de preços relativos; arbitradores conectam o preço da reserva de liquidez aos mercados externos; e a própria ordem em que as transações são executadas pode adquirir valor econômico.

A teoria tradicional de microestrutura contém muitos dos componentes necessários — risco de inventário, seleção adversa, arbitragem e negociação informada —, mas a implementação altera as restrições. O formador de mercado pode ser uma reserva de liquidez governada por código, enquanto atores estratégicos competem ao redor dela, e não dentro do balanço de um intermediário.

A lacuna analítica é, portanto, menor do que sugere a ideia de um sistema financeiro inteiramente novo. Os conceitos muitas vezes são conhecidos; o mapeamento institucional é novo. A análise econômica precisa identificar qual mecanismo anterior sobrevive à mudança de arquitetura e qual hipótese deixa de funcionar.

## Tokenização leva o debate dos ativos digitais para a arquitetura do dinheiro e da liquidação

A tokenização avançou além da pergunta sobre se um título pode ser representado em um registro distribuído. O Annual Economic Report 2026 do BIS enquadra o problema em torno de como plataformas programáveis podem integrar dinheiro e ativos preservando confiança, finalidade da liquidação e estabilidade monetária.[3]

A proposta do BIS é explicitamente institucional: reservas tokenizadas de banco central continuam sendo a âncora de liquidação, enquanto dinheiro bancário tokenizado e outras formas reguladas de dinheiro privado podem operar em infraestrutura programável compatível. O objetivo não é apenas transferir mais rápido. A programabilidade pode agrupar ações, permitir entrega contra pagamento, reduzir etapas de conciliação e diminuir necessidades de pré-financiamento; a questão econômica é como essas eficiências interagem com liquidez, criação de crédito, finalidade jurídica e unicidade da moeda.[3]

O Project Agorá ilustra a passagem da teoria para o experimento. O BIS informou em junho de 2026 que o protótipo reúne oito bancos centrais e mais de 40 instituições reguladas para testar uma arquitetura compartilhada de depósitos bancários tokenizados e reservas de banco central em pagamentos internacionais de atacado.[4] Na Europa, Piero Cipollone, membro da Diretoria Executiva do BCE, descreveu o desafio como passar de pilotos fragmentados para um mercado tokenizado integrado capaz de liquidar em moeda de banco central.[5]

É um caso em que economia monetária e arquitetura computacional estão convergindo. Uma transferência tecnicamente instantânea de ativo não é economicamente final apenas porque o código executou. O ativo de liquidação, a promessa de resgate, a estrutura de balanço, a natureza jurídica do direito e o mecanismo de liquidez emergencial continuam determinando se o sistema se comporta como dinheiro sob estresse.

```flow
Tecnologia de negociação / liquidação muda → regras de mercado viáveis mudam → estratégias dos participantes se adaptam → liquidez, descoberta de preços e uso de garantias mudam → financiamento e transmissão monetária mudam → regulação e modelos econômicos precisam ser reestimados
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

Os valores são aproximados quando a própria CFTC os apresenta como aproximados. O gráfico mede listagens, não volume negociado, posições em aberto ou utilidade social.

O crescimento cria perguntas econômicas diferentes das existentes em um contrato futuro convencional. Preços de contratos de eventos podem agregar informação dispersa e proteger contra exposições ligadas a acontecimentos específicos, mas a definição do contrato também pode alterar incentivos. O comunicado da CFTC de 22 de setembro de 2026 sobre "mercados de menção" (mention markets) é um caso-limite útil: contratos baseados em uma pessoa pronunciar determinadas palavras ou realizar uma ação discreta podem ser especialmente suscetíveis à manipulação porque alguém pode influenciar diretamente o evento que define a liquidação.[7]

A questão não é se mercados de previsão são inerentemente informativos ou inerentemente apostas. O desenho do mercado determina qual informação é revelada, quem tem vantagem informacional, se o evento subjacente é exógeno aos participantes e se o próprio mercado altera incentivos em torno do evento.

Uma teoria de agregação de informação precisa, portanto, conviver com uma teoria de manipulação endógena. À medida que a variedade de produtos cresce, reguladores precisam distinguir contratos que descobrem informação sobre o mundo daqueles cuja existência ajuda a modificar o mundo sobre o qual liquidam.

| Estágio da evidência | HFT | Formadores automáticos | Finanças tokenizadas | Mercados de previsão |
| --- | --- | --- | --- | --- |
| Operação em escala | sim nos grandes mercados eletrônicos | sim em mercados de criptoativos e finanças descentralizadas | parcial; pilotos e implantações institucionais estão avançando | sim como classe regulada, com rápido crescimento de contratos |
| Evidência econômica madura | substancial em microestrutura; transmissão para economia real ainda em desenvolvimento | crescente, mas específica à arquitetura | limitada para adoção sistêmica porque muito ainda está em estágio de piloto | mista; agregação de informação é estabelecida, enquanto novos produtos criam novas questões de desenho |
| Principal resposta institucional | regras de estrutura de mercado e acesso | regulação de criptoativos e microestrutura | experimentação de bancos centrais e instituições reguladas | supervisão de desenho de produtos e mercados pela CFTC |
| Mecanismo central ainda aberto | distribuição dos benefícios da velocidade e efeitos sobre risco sistêmico | provisão de liquidez, arbitragem e governança sob código | arquitetura de liquidação, liquidez e soberania monetária | agregação de informação versus manipulação e endogeneidade |

## A teoria está se adaptando, mas a identificação empírica fica atrás da engenharia

A fronteira da pesquisa está caminhando em direção aos mecanismos que se tornaram economicamente relevantes.

Pesquisas de HFT estão conectando latência das bolsas ao custo de financiamento. Estudos de formadores automáticos traduzem problemas conhecidos de microestrutura para restrições específicas de protocolos. Bancos centrais tratam tokenização como questão de desenho monetário e confiança institucional. A regulação de mercados de previsão confronta o fato de que o desenho do contrato afeta tanto a qualidade da informação quanto os incentivos à manipulação.

O que frequentemente fica para trás é a identificação empírica. Engenheiros podem colocar um novo mecanismo em produção antes que economistas disponham de um painel longo de dados comparáveis. Reguladores podem precisar formular regras provisórias antes que o comportamento de equilíbrio dos participantes seja conhecido. Os primeiros adotantes demonstram viabilidade operacional, mas podem ser sistematicamente diferentes das instituições que usariam a tecnologia em escala.

Surge então uma sequência recorrente:

**viabilidade técnica → adoção → novo comportamento estratégico → efeito econômico mensurável → revisão teórica → redesenho institucional**

Chamar a primeira etapa de mudança de paradigma seria prematuro. O ponto em que a teoria precisa mudar aparece quando a tecnologia altera uma restrição que o modelo tratava como fixa e essa alteração produz efeitos econômicos persistentes.

## O que caracterizaria uma mudança real de paradigma

Um novo paradigma econômico exige mais do que uma nova classe de ativos ou software mais rápido. O limiar é maior: um modelo importante precisa falhar de maneira sistemática porque um mecanismo antes desprezível se tornou de primeira ordem.

No desenho de mercados, isso poderia ocorrer se latência, agência automatizada ou liquidação programável alterarem de forma persistente a alocação de capital em dimensões que os modelos padrão não consigam explicar sem mudar suas hipóteses institucionais. Na economia monetária, poderia ocorrer se dinheiro programável alterar materialmente a demanda por liquidez, a intermediação bancária ou a transmissão monetária. Na economia da informação, mercados de previsão poderiam ganhar relevância maior se probabilidades geradas por mercado passassem a substituir ou complementar sistematicamente pesquisas e previsões de especialistas em decisões importantes.

O contrário também é possível. Tecnologia nova pode tornar teoria antiga mais útil em vez de obsoleta. Formadores automáticos continuam enfrentando seleção adversa. Dinheiro tokenizado continua precisando de uma âncora nominal crível. Negociação de alta frequência continua sujeita a risco de inventário, informação e concorrência. Mercados de previsão continuam dependendo de incentivos e da qualidade da informação.

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
