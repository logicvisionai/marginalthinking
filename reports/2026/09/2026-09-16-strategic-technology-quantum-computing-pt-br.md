# Computação quântica em 2026: progresso real, utilidade econômica ainda em validação

**Linha:** Tecnologia, Poder e Transformação  
**Código:** MT-TECH-2026-09-16-quantum-computing  
**Edição:** 16 de setembro de 2026  
**Corte de informação:** 16/09/2026, 10h40 BRT  
**Maturidade avaliada:** experimental e pré-industrial para computação tolerante a falhas; sistemas físicos acessíveis por nuvem já estão implantados para pesquisa, desenvolvimento e experimentação.  
**Confiança geral:** alta para o estado atual; moderada para 3–5 anos; baixa a moderada para horizontes superiores a 5 anos.

> **Avaliação central.** A computação quântica avançou de forma mensurável em correção de erros, controle, integração com computação clássica e investimento industrial. Isso não equivale, ainda, a uma máquina tolerante a falhas com utilidade econômica independente e verificada. O impacto mais concreto no curto prazo está fora da execução de algoritmos quânticos comerciais: migração para criptografia pós-quântica, investimento em infraestrutura e pessoal, criação de padrões, experimentação híbrida e formação de uma cadeia industrial especializada.

## 1. Executive Assessment

Há três fatos que precisam ser mantidos separados.

Primeiro, a **correção de erros quânticos melhorou de maneira experimentalmente verificável**. Em trabalho publicado na *Nature*, o Google Quantum AI demonstrou memória de surface code abaixo do limiar de erro: um código distance-7 usando 101 qubits físicos atingiu erro lógico de 0,143% por ciclo e vida lógica 2,4 vezes maior que a do melhor qubit físico do dispositivo. O mesmo artigo, porém, registra explicitamente que ainda existem ordens de magnitude entre as taxas de erro lógico atuais e as necessárias para computação quântica prática em larga escala. Esse segundo ponto é tão importante quanto o primeiro. [Nature, 2024/2025; correção em 2026](https://www.nature.com/articles/s41586-024-08449-y)

Segundo, **fornecedores passaram a estabelecer roadmaps mais concretos**, com processadores, decodificação em tempo real, modularidade e metas de circuitos maiores. A IBM informa que seu Nighthawk r2 executa circuitos com mais de 7.500 portas em 120 qubits programáveis e apresenta seu caminho para computação tolerante a falhas em 2029. Esses dados são relevantes como evidência de engenharia e investimento, mas o cronograma futuro continua sendo um roadmap corporativo. A própria IBM declara que os marcos publicados representam intenção atual e podem ser alterados ou retirados. [IBM Quantum Roadmap, atualização de março de 2026](https://www.ibm.com/roadmaps/quantum/2026/) [IBM Nighthawk r2, 31/08/2026](https://www.ibm.com/quantum/blog/nighthawk-r2)

Terceiro, **governos já estão tratando a possibilidade de máquinas futuras como risco presente**. O NIST mantém três padrões principais de criptografia pós-quântica finalizados e afirma que a migração deve começar agora. O motivo não depende de um computador capaz de quebrar criptografia existir hoje: sistemas complexos levam anos para migrar, e dados capturados agora podem ser armazenados para tentativa de decifração no futuro. [NIST PQC](https://www.nist.gov/pqc) O GAO registra que um computador criptograficamente relevante pode ainda estar a 10–20 anos de distância, mas considera material o risco de *harvest now, decrypt later*. [GAO-26-107759, 18/03/2026](https://www.gao.gov/products/gao-26-107759)

**Conclusão:** em setembro de 2026, a computação quântica deve ser tratada como uma tecnologia com progresso científico e industrial real, mas com utilidade econômica geral ainda não demonstrada. O indicador mais importante não é a contagem bruta de qubits. São a taxa de erro lógico, a profundidade e fidelidade dos circuitos, a estabilidade de controle, a capacidade de correção em tempo real, o custo total da máquina e a existência de workloads nos quais o valor produzido exceda o custo de execução.

## 2. O que a tecnologia realmente é

Computação quântica explora estados quânticos para representar e transformar informação. Qubits podem participar de superposição e emaranhamento; algoritmos específicos exploram essas propriedades para produzir estruturas de cálculo diferentes das usadas por computadores clássicos.

Isso não significa que um computador quântico seja um substituto geral de CPUs e GPUs. A hipótese economicamente relevante é mais restrita: determinados problemas podem admitir algoritmos quânticos que, quando executados em hardware suficientemente grande, preciso e controlável, superem os melhores métodos clássicos em tempo, custo ou qualidade da solução.

A diferença entre **qubit físico** e **qubit lógico** é central. Qubits físicos são ruidosos. Computação tolerante a falhas exige codificar informação lógica em múltiplos qubits físicos e detectar/corrigir erros continuamente. Por isso, comparar plataformas apenas por quantidade de qubits físicos pode produzir conclusões enganosas.

## 3. Estado da arte documentado

| Evidência | Estado em setembro de 2026 | O que ela prova | O que não prova |
|---|---|---|---|
| Google Willow / surface code | **Demonstrado em experimento revisado por pares** | aumento da distância do código pode reduzir erro lógico abaixo do limiar; decodificação em tempo real foi demonstrada | computador tolerante a falhas em escala ou vantagem econômica |
| IBM Nighthawk r2 | **Sistema/resultado reportado pelo fornecedor** | progresso em throughput, reset, circuitos maiores e integração da plataforma | vantagem econômica independente; cumprimento futuro do roadmap |
| DARPA QBI | **Programa de verificação independente em andamento** | o governo considera útil testar se alguma arquitetura consegue valor computacional superior ao custo até 2033 | que uma arquitetura já tenha passado por validação final |
| DOE Quantum Genesis | **Programa/meta governamental** | o DOE pretende desenvolver e implantar capacidade tolerante a falhas cientificamente relevante até 2028 | que essa capacidade já exista |
| NIST PQC | **Padrões implantáveis agora** | a resposta criptográfica ao risco quântico já é operacionalizável | que um CRQC exista hoje |

A DARPA fornece uma definição especialmente útil de maturidade econômica: sua Quantum Benchmarking Initiative busca verificar se uma arquitetura pode atingir **utility scale**, isto é, se o valor computacional supera seu custo. Em março de 2026, 11 organizações haviam avançado ao Stage B e dois participantes de programa relacionado estavam em Stage C para verificação e validação de operação em nível de sistema. O fato de existir um programa público específico para separar viabilidade de marketing é, por si, uma indicação de que a questão ainda está aberta. [DARPA QBI](https://www.darpa.mil/research/programs/quantum-benchmarking-initiative) [DARPA, 10/03/2026](https://www.darpa.mil/news/2026/qbi-stage-a-qbit)

## 4. Claimed → demonstrated → deployed → scaled

### Demonstrado

- correção de erros abaixo do limiar em configurações experimentais específicas;
- decodificação em tempo real em experimentos de correção de erros;
- execução remota de workloads em sistemas quânticos acessíveis por nuvem;
- circuitos progressivamente maiores em plataformas atuais;
- algoritmos pós-quânticos padronizados e prontos para adoção.

### Implantado

Há infraestrutura de computação quântica disponível em nuvem e instalações de pesquisa. Ela serve para P&D, formação, experimentação de algoritmos e integração com HPC. Isso é implantação de **plataformas experimentais**, não implantação em escala de computação quântica tolerante a falhas como infraestrutura produtiva geral.

### Em escala

Não há evidência pública, em setembro de 2026, de uma máquina quântica universal tolerante a falhas e em escala industrial cujo valor econômico líquido tenha sido verificado de maneira independente em aplicações relevantes.

### Metas e roadmaps

O DOE anunciou em junho de 2026 a Quantum Genesis, com objetivo de desenvolver e implantar até 2028 uma capacidade tolerante a falhas cientificamente relevante. É um objetivo de programa. [DOE, 23/06/2026](https://www.energy.gov/science/articles/energy-department-announces-initiative-create-and-deploy-worlds-first)

A IBM projeta exemplos de vantagem quântica em 2026 e uma máquina tolerante a falhas em 2029, além de sistemas maiores posteriormente. O roadmap é tecnicamente informativo, mas não deve ser convertido em previsão independente da Marginal Thinking. [IBM roadmap](https://www.ibm.com/roadmaps/quantum/)

```chart
type: bar
title: Organizações em estágios públicos avançados de validação citados na análise
unit: organizações
DARPA QBI Stage B | 11
Participantes em Stage C de programa relacionado | 2
```

Os dois participantes em Stage C vêm de um programa de validação relacionado; portanto, as barras não devem ser lidas como um único funil nem como taxa de conversão.

```mindmap
O que precisa escalar antes da utilidade quântica
- Computação lógica
  - menor erro lógico
  - circuitos longos e confiáveis
  - decodificação em tempo real
- Sistema físico
  - qualidade dos qubits
  - criogenia e controle
  - interconexões modulares
- Industrialização
  - rendimento de fabricação
  - carga de calibração
  - repetibilidade
- Economia
  - custo total do sistema
  - melhor alternativa clássica
  - workloads pagos recorrentes
- Instituições
  - validação independente
  - padrões
  - migração pós-quântica
```

## 5. As restrições que realmente determinam a transição

### 5.1 Erros e overhead de correção

O obstáculo não é apenas fabricar mais qubits. Um sistema tolerante a falhas precisa manter erros lógicos suficientemente baixos durante circuitos muito longos. O experimento do Google é importante porque demonstra a direção desejada — mais redundância reduzindo erro lógico —, mas o próprio trabalho identifica eventos correlacionados raros e uma distância ainda grande até os requisitos de circuitos maiores.

### 5.2 Controle em tempo real

Correção de erros exige medir síndromes, decodificar informação e aplicar/acompanhar correções com latência compatível com a dinâmica do processador. Isso transforma o computador quântico em um sistema híbrido: criogenia, eletrônica de controle, interconexão, software, compiladores, decodificadores e HPC clássico tornam-se parte da máquina econômica real.

### 5.3 Fabricação, rendimento e repetibilidade

Uma demonstração de laboratório precisa se transformar em processo repetível. Uniformidade dos dispositivos, rendimento de fabricação, calibração e confiabilidade ao longo do tempo são variáveis industriais tão importantes quanto a física do qubit.

### 5.4 Modularidade e interconexão

Muitas arquiteturas dependem de conectar módulos. Isso transfere parte do problema de escala para interconexões com baixa perda/erro e para controle distribuído. Uma arquitetura modular bem-sucedida pode reduzir o risco de fabricar um único dispositivo gigantesco; uma interconexão insuficiente pode apenas deslocar a restrição.

### 5.5 Custo por resultado útil

Mesmo uma vantagem computacional não é automaticamente vantagem econômica. Uma tarefa precisa considerar custo de capital, criogenia, energia, operação, filas, integração de software, preparação de dados e custo de métodos clássicos concorrentes. Esse é o motivo pelo qual a definição da DARPA — valor superior ao custo — é mais útil para análise econômica do que recordes isolados.

## 6. Base industrial e capital

A cadeia relevante inclui fabricação de dispositivos, materiais de alta pureza, criogenia, lasers/fotônica em algumas arquiteturas, eletrônica de RF e controle, embalagem, interconexão, software, HPC, serviços em nuvem, metrologia e equipamentos de teste.

O Estado continua sendo um comprador e financiador importante. O GAO calcula que o governo federal dos Estados Unidos vem gastando cerca de **US$ 200 milhões por ano** em P&D especificamente de computação quântica desde o ano fiscal de 2020, cerca de um quinto do dispêndio federal anual em ciência da informação quântica considerado no relatório. O próprio GAO concluiu que a estratégia nacional ainda carecia de objetivos subordinados, métricas e avaliação mais completa de infraestrutura. [GAO-26-107759](https://files.gao.gov/reports/GAO-26-107759/index.html)

No setor privado, a IBM anunciou em junho de 2026 intenção de investir mais de **US$ 10 bilhões em cinco anos** em computação quântica, incluindo P&D, capital físico, manufatura, ecossistema e aquisições. Esse número deve ser tratado como **compromisso anunciado pela empresa**, não como investimento já realizado. [IBM, 02/06/2026](https://newsroom.ibm.com/2026-06-02-ibm-commits-more-than-10-billion-to-quantum-computing%2C-funding-its-roadmap-from-todays-leading-systems-to-the-worlds-first-fault-tolerant-quantum-computers)

A consequência econômica atual é, portanto, mais clara na **formação de capacidade** do que na venda de computação quântica como substituta de HPC clássico: laboratórios, contratação de especialistas, contratos de nuvem, instalações de teste, fabricação especializada e padrões.

```flow
Melhoria dos qubits físicos → qubits lógicos estáveis e correção de erros → circuitos longos e confiáveis → vantagem de workload verificada de forma independente → sistema industrial repetível → utilidade econômica acima do custo total quântico mais clássico
```

## 7. O impacto já presente: criptografia pós-quântica

A transição criptográfica é o caso em que uma tecnologia futura já altera decisões presentes.

O NIST finalizou três padrões principais de PQC e recomenda migração agora. Em julho de 2026, uma vulnerabilidade foi encontrada no candidato de assinatura HAWK, que foi retirado do processo; o NIST afirma que isso não afeta os padrões finalizados ML-KEM e ML-DSA. O episódio é útil metodologicamente: padronização criptográfica precisa continuar exposta a análise adversarial, e diversidade de construções importa. [NIST PQC](https://www.nist.gov/pqc) [NIST IR 8610 / atualização HAWK](https://www.nist.gov/news-events/news/2026/05/nine-candidates-advance-third-round-additional-digital-signatures-pqc)

Para empresas e governos, as tarefas concretas incluem inventário criptográfico, identificação de dados com longa vida útil, atualização de protocolos e hardware, testes de interoperabilidade e criação de criptoagilidade. O custo existe mesmo que um computador criptograficamente relevante demore mais do que o esperado.

## 8. Impactos econômicos e geoeconômicos

### 0–2 anos — confiança alta

O efeito dominante deve continuar sendo investimento, padronização e preparação: PQC, contratação, parcerias com universidades/laboratórios, acesso por nuvem, testes híbridos e expansão de infraestrutura especializada. Não é necessário supor vantagem quântica generalizada para esse fluxo existir.

### 3–5 anos — confiança moderada

O principal teste será aparecerem aplicações estreitas em ciência, química, materiais ou otimização com **vantagem verificada contra os melhores métodos clássicos e com custo total comparável**. Resultados reproduzidos por terceiros importariam mais do que benchmarks escolhidos pelo próprio fornecedor.

### 5–10 anos — confiança baixa a moderada

Se correção de erros, modularidade e fabricação escalarem, computação quântica pode se tornar acelerador especializado conectado a HPC. Isso poderia mudar P&D em materiais, química e determinados problemas de simulação. O cenário é condicional, não uma previsão.

### 10–20 anos — confiança baixa

Uma infraestrutura quântica madura poderia alterar criptografia, desenho de materiais e alguns processos de descoberta científica. Nesse horizonte, incerteza sobre arquitetura vencedora, custo e progresso de algoritmos clássicos é grande demais para projeções quantitativas confiáveis.

## 9. Produtividade, trabalho e organização industrial

No curto prazo, o efeito sobre trabalho é de composição, não de substituição em massa. Cresce a demanda por físicos, engenheiros de controle, especialistas em criogenia/fotônica, compiladores, HPC, segurança e integração de sistemas. Organizações também precisam de profissionais capazes de avaliar quando **não** usar computação quântica.

Para produtividade agregada, ainda não há base empírica para atribuir aumento mensurável à computação quântica. O canal plausível passa primeiro por P&D: reduzir tempo ou custo de determinadas simulações e descobertas. Até que workloads úteis sejam demonstrados, estimativas de impacto sobre PIB ou produtividade total dos fatores têm incerteza excessiva.

## 10. Cenários de acompanhamento

| Horizonte | Cenário | Evidência necessária | Leitura de confiança |
|---|---|---|---|
| 0–2 anos | PQC e infraestrutura avançam; hardware melhora incrementalmente | migração NIST, resultados de QEC, novos sistemas e contratos | Alta |
| 3–5 anos | surgem nichos de utilidade científica/econômica verificável | benchmark contra melhor clássico, custo total, replicação independente | Moderada |
| 5–10 anos | aceleradores quânticos tolerantes a falhas entram em alguns centros de HPC | qubits lógicos estáveis, circuitos longos, modularidade e operação repetível | Baixa a moderada |
| 10–20 anos | computação quântica torna-se infraestrutura especializada relevante | redução sustentada de custo, ecossistema de software e aplicações recorrentes | Baixa |

Um cenário alternativo também precisa permanecer aberto: progresso em hardware pode continuar, mas métodos clássicos, algoritmos aproximados, GPUs/accelerators e custo de correção de erros podem reduzir ou adiar o espaço econômico da computação quântica.

## 11. Indicadores observáveis

A Marginal Thinking acompanhará principalmente:

1. **erro lógico por ciclo e sua escala com distância do código**, não apenas qubits físicos;
2. **número de operações lógicas confiáveis** antes da falha;
3. **decodificação em tempo real** e estabilidade durante execuções longas;
4. **demonstrações de módulos interconectados** com fidelidade suficiente;
5. **benchmark econômico**: custo total do quantum + clássico contra o melhor método clássico;
6. **resultados independentes da DARPA QBI** e outros programas de validação;
7. **migração real para PQC**, não apenas planos publicados;
8. **rendimento e capacidade de fabricação**, inclusive disponibilidade de componentes especializados;
9. **evidência de workloads recorrentes pagos** cuja escolha do quantum seja explicada por desempenho/custo, não por experimentação;
10. **mudanças em cronogramas de fornecedores**, com atenção especial a marcos adiados ou redefinidos.

## 12. O que mudaria nossa avaliação?

A avaliação ficaria **mais favorável** à maturidade econômica se um sistema demonstrasse, com verificação independente, execução repetível de workload relevante em que o valor computacional superasse o custo total e o melhor método clássico disponível; se a taxa de erro lógico continuasse caindo de forma previsível ao escalar códigos; e se modularidade/fabricação fossem demonstradas fora de protótipos isolados.

A avaliação ficaria **mais cautelosa** se os roadmaps fossem repetidamente adiados, se erros correlacionados impedissem escala, se o número de qubits físicos necessário por qubit lógico mantivesse custos proibitivos, ou se algoritmos clássicos eliminassem vantagens alegadas em benchmarks relevantes.

## 13. Limitações e nível de confiança

Comparar arquiteturas diferentes por uma única métrica é metodologicamente fraco. Supercondutores, íons aprisionados, átomos neutros, fotônica e outras abordagens têm estruturas de erro e requisitos de controle distintos. Este relatório, por isso, não classifica empresas ou arquiteturas como “vencedoras”.

Resultados corporativos são usados quando material, mas aparecem explicitamente como dados/claims do fornecedor. Metas de governo são tratadas como metas, não como capacidades entregues. A evidência mais forte para progresso técnico vem de resultados experimentais revisados por pares; a evidência mais forte para maturidade econômica ainda está sendo construída.

**Confiança final:** **alta** na conclusão de que houve avanço técnico real e de que PQC já produz custos e decisões concretas; **moderada** na possibilidade de utilidade estreita em 3–5 anos; **baixa a moderada** em qualquer afirmação sobre escala econômica além disso.

## 14. Fontes principais e método

- [NIST — Post-Quantum Cryptography](https://www.nist.gov/pqc), consultado em 16/09/2026.
- [NIST — Additional Digital Signatures / IR 8610](https://www.nist.gov/news-events/news/2026/05/nine-candidates-advance-third-round-additional-digital-signatures-pqc), atualização de 2026.
- [DARPA — Quantum Benchmarking Initiative](https://www.darpa.mil/research/programs/quantum-benchmarking-initiative), consultado em 16/09/2026.
- [DARPA — QBI expansion](https://www.darpa.mil/news/2026/qbi-stage-a-qbit), 10/03/2026.
- [GAO-26-107759 — Quantum Computing](https://www.gao.gov/products/gao-26-107759), 18/03/2026.
- [DOE — Quantum Genesis](https://www.energy.gov/science/articles/energy-department-announces-initiative-create-and-deploy-worlds-first), 23/06/2026.
- [Google Quantum AI et al., Nature — Quantum error correction below the surface code threshold](https://www.nature.com/articles/s41586-024-08449-y), publicado em 09/12/2024, volume de 2025, correção em 28/04/2026.
- [IBM — Quantum Roadmap 2026](https://www.ibm.com/roadmaps/quantum/2026/), atualização de março de 2026; tratado como roadmap do fornecedor.
- [IBM — Nighthawk r2](https://www.ibm.com/quantum/blog/nighthawk-r2), 31/08/2026; tratado como resultado reportado pelo fornecedor.

**Método:** triangulação entre fonte primária pública, literatura revisada por pares, auditoria/avaliação governamental e documentação de fornecedores. O relatório separa demonstração de laboratório, implantação, escala, meta e cenário; evita transformar cronograma corporativo ou governamental em previsão própria.
