# Agentes de IA estão virando uma camada operacional do trabalho do conhecimento, mas governança passa a ser a restrição central

**Programa:** Tecnologia, Produção & Sociedade  
**Código:** MT-TS-2026-09-18-agentic-operating-layer  
**Edição:** 18 de setembro de 2026  
**Corte de informação:** 18 de setembro de 2026

A mudança importante na IA empresarial já não é apenas que modelos de linguagem respondem melhor a perguntas. O sinal mais forte de 2026 é que agentes estão sendo conectados a contexto interno, ferramentas de software e fluxos de trabalho de várias etapas, permitindo que organizações deleguem partes de trabalho real em vez de apenas pedir assistência.

Evidências de ambientes muito diferentes apontam para a mesma direção. A telemetria empresarial da OpenAI indica que o uso de agentes de IA passou a representar parcela grande da produção dentro de sua base de clientes e que as organizações mais intensivas em IA estão se distanciando das empresas típicas. A Microsoft Research, porém, encontra taxas materiais de vazamento de informação sensível quando agentes trabalham com contexto corporativo, além de queda de desempenho em condições com múltiplas tarefas. Na medicina, um estudo revisado por pares na Nature Medicine mostrou que um agente clínico executado integralmente na infraestrutura local podia se aproximar de uma referência em nuvem em avaliações diagnósticas, mas o resultado operacional mais útil não foi a acurácia bruta: um critério de triagem por confiabilidade permitiu que apenas parte dos casos seguisse autonomamente, encaminhando os demais para revisão.

A avaliação central é, portanto: **a restrição está migrando de “o modelo consegue executar a tarefa?” para “uma instituição consegue controlar contexto, avaliar confiabilidade, limitar ações e decidir onde autonomia é econômica e socialmente aceitável?”** A capacidade do modelo continua importante, mas a adoção em produção passa a depender cada vez mais do sistema operacional ao redor dele: permissões, avaliação, desenho de fluxo de trabalho, revisão humana e responsabilização.

## O sinal de implantação é real, mas telemetria de fornecedor não é estimativa de produtividade

O Enterprise Signals da OpenAI de agosto de 2026 informa que, em junho, o Codex gerou **64% dos tokens de saída combinados de Codex e ChatGPT** entre clientes empresariais. O mesmo conjunto informa que empresas no decil superior de uso de IA geraram **8,3 vezes** mais tokens de saída por usuário ativo do que empresas típicas, ante **2,6 vezes** em janeiro. Desde fevereiro, usuários empresariais ativos semanais do Codex cresceram especialmente rápido fora da engenharia: 108× no jurídico, 41× em vendas, 41× em recrutamento e 26× em marketing, contra 5× em engenharia. [OpenAI Enterprise Signals](https://openai.com/signals/enterprise-data/)

Esses dados são sinais relevantes de adoção porque descrevem uso observado, e não uma previsão de mercado. Eles não provam ganhos gerais de produtividade. Volume de tokens mede profundidade de uso dentro da base de um fornecedor; não estabelece valor econômico, qualidade, substituição de trabalho nem retorno sobre investimento.

```chart
type: bar
title: Diferença de intensidade de tokens entre empresas de fronteira e empresas típicas na telemetria empresarial da OpenAI
unit: múltiplo
Janeiro de 2026 | 2.6
Valor mais recente reportado em 2026 | 8.3
```

O gráfico reproduz uma medida de uso específica de um fornecedor. Não deve ser interpretado como múltiplo de produtividade. [OpenAI Enterprise Signals](https://openai.com/signals/enterprise-data/)

O sinal estrutural mais importante é qualitativo: os usuários mais intensivos estão conectando agentes a ferramentas e contexto organizacional, transformando modelos de interfaces isoladas em componentes de fluxos de trabalho.

## Problemas de confiabilidade ficam mais visíveis quando agentes recebem contexto institucional

As mesmas características que tornam um agente economicamente útil podem ampliar o risco operacional. Um sistema capaz de recuperar dados privados, agir em softwares e executar tarefas multietapas tem uma superfície de falha maior do que um chatbot que apenas devolve texto.

O benchmark CI-Work, da Microsoft Research, testa se agentes empresariais conseguem usar informação interna necessária preservando contexto sensível. Entre os modelos de fronteira avaliados, as taxas de violação de integridade contextual variaram de **15,8% a 50,9%**, com vazamento de até **26,7%**. Os pesquisadores também encontraram que maior utilidade na tarefa pode se correlacionar com mais violações de privacidade. [Microsoft Research — CI-Work](https://www.microsoft.com/en-us/research/publication/ci-work-benchmarking-contextual-integrity-in-enterprise-llm-agents/) [versão arXiv](https://arxiv.org/abs/2604.21308)

Outro trabalho da Microsoft, CORPGEN, aborda um modo diferente de falha: trabalho real com múltiplas tarefas. A Microsoft informa que agentes líderes de uso de computador caíram de **16,7% de conclusão em condição de tarefa única para 8,7% sob carga multitarefa**. Seu sistema hierárquico proposto elevou a conclusão em até 3,5× em relação às referências, mas o sinal principal está na degradação da referência: capacidade medida uma tarefa por vez não se transfere automaticamente para ambientes com tarefas interdependentes, memória e prioridades concorrentes. [Microsoft Research — CORPGEN](https://www.microsoft.com/en-us/research/blog/corpgen-advances-ai-agents-for-real-work/)

| Evidência | Resultado observado | O que sustenta | O que não prova |
|---|---|---|---|
| OpenAI Enterprise Signals | uso de agentes de IA é parcela grande e crescente da produção empresarial observada | agentes estão entrando em fluxos de trabalho reais dentro da base desse fornecedor | produtividade geral da economia |
| Microsoft CI-Work | violações de integridade contextual de 15,8–50,9% nos modelos testados | governança de contexto é restrição de produção | que toda implantação empresarial tenha o mesmo risco |
| Microsoft CORPGEN | conclusão da referência caiu de 16,7% para 8,7% em multitarefa | orquestração realista pode ser muito mais difícil do que teste isolado | que uma arquitetura resolva confiabilidade empresarial de forma geral |
| Agente clínico na Nature Medicine | melhor modelo executado localmente alcançou cerca de 90,0% contra 90,7% da referência em nuvem no MIRA-v2 | controle institucional local não precisa impor grande perda de capacidade nesse benchmark | prontidão clínica sem validação prospectiva |
| Minuta NIST TEVV-Athlon | estrutura de avaliação inclui explicitamente sistemas baseados em agentes | instituições estão formalizando requisitos de teste para uso real | um padrão universal único de segurança de agentes |

A convergência importa mais do que qualquer número isolado: implantação exige uma arquitetura de controle em torno do modelo.

## A saúde mostra por que autonomia seletiva importa mais do que a acurácia de manchete

Um estudo publicado na Nature Medicine em 15 de setembro de 2026 avaliou um agente clínico executado integralmente na infraestrutura local com modelos de pesos abertos e controle institucional local. Na avaliação MIRA-v2, a melhor configuração local alcançou aproximadamente **90,0% de acurácia diagnóstica**, contra **90,7%** da referência em nuvem sob a mesma arquitetura de agente. Em uma segunda avaliação, CDM, o melhor modelo executado localmente chegou a **83,8%**. [Nature Medicine](https://www.nature.com/articles/s41591-026-04609-x)

O resultado estrategicamente mais útil foi o critério de triagem por confiabilidade. Usando consistência comportamental do diagnóstico, os pesquisadores mantiveram **49,4% dos casos com 98,9% de acurácia diagnóstica** em um limiar de consistência de 0,90, encaminhando os demais para revisão. Sob uma perturbação que retirou informação relevante, a acurácia total caiu de **90,6% para 70,2%**, mostrando por que desempenho nominal em teste de referência não pode definir sozinho autonomia segura.

Isso não demonstra implantação clínica em escala, e o próprio estudo destaca governança institucional e necessidade de evidência prospectiva. Ele demonstra, porém, uma arquitetura com lógica econômica diferente:

```flow
Agente tenta executar a tarefa → confiabilidade é medida no momento da decisão → subconjunto de alta confiança segue autonomamente → casos incertos são encaminhados → capacidade humana se concentra onde o risco é maior
```

Essa estrutura pode ser mais importante do que perseguir autonomia universal. Ela transforma revisão humana de requisito binário em recurso escasso alocado conforme risco observado.

## A arquitetura empresarial está passando de uma lógica centrada no modelo para outra centrada no contexto

Quando um agente vira parte da infraestrutura organizacional, quatro camadas precisam funcionar ao mesmo tempo:

```mindmap
Camada operacional baseada em agentes
- Capacidade do modelo
  - raciocínio
  - planejamento
  - uso de ferramentas
  - execução de longo horizonte
- Arquitetura de contexto
  - identidade
  - permissões
  - limites de recuperação
  - isolamento de memória
- Avaliação e garantia operacional
  - sucesso da tarefa
  - privacidade
  - confiabilidade
  - custo e latência
  - testes de regressão
- Controle organizacional
  - escalonamento humano
  - trilha de auditoria
  - limites de aprovação
  - responsabilidade
- Redesenho do trabalho
  - decomposição de tarefas
  - fluxos de trabalho reutilizáveis
  - novas amplitudes de supervisão gerencial
  - mudança na composição de habilidades
```

É por isso que apenas aumentar o tamanho do modelo pode gerar retornos decrescentes para implantação. O CI-Work relata explicitamente que aumentar tamanho ou profundidade de raciocínio não resolveu as violações de integridade contextual. A minuta TEVV-Athlon de 2026 do NIST também trata avaliação de IA no mundo real como processo extensível que inclui sistemas baseados em agentes, e não como uma única pontuação em teste de referência. [NIST TEVV-Athlon](https://www.nist.gov/artificial-intelligence/ai-research/tevv-athlon-framework-evaluating-ai-systems)

O problema de engenharia emergente se parece tanto com sistemas distribuídos e controles internos quanto com avaliação clássica de modelos.

## Avaliação contínua vira infraestrutura, não checklist de pré-lançamento

Fluxos de trabalho empresariais mudam. Interfaces de software mudam, políticas mudam, permissões mudam e os dados recuperados pelo agente mudam. Isso torna teste de referência estático cada vez mais fraco como controle de produção.

Um trabalho de 2026 da Microsoft Research sobre geração contínua de benchmarks argumenta que agentes empresariais precisam de avaliações que evoluam com os requisitos e usem descrições dos fluxos de trabalho da própria organização para gerar e atualizar casos de teste. O objetivo não é apenas certificar um modelo uma vez; é detectar regressões à medida que o ambiente operacional muda. [Microsoft Research — Continuous Benchmark Generation](https://www.microsoft.com/en-us/research/publication/continuous-benchmark-generation-for-evaluating-enterprise-scale-llm-agents/)

Uma consequência relacionada é que o artefato economicamente importante pode se tornar o **fluxo de trabalho avaliado**, e não apenas o modelo. Organizações que constroem conjuntos de testes, sistemas de permissão, limites de contexto, interfaces de ferramentas e procedimentos de recuperação duráveis podem trocar o modelo subjacente preservando parte da capacidade operacional.

```diagram
Modelo
  ↓
Política do agente + ferramentas
  ↓
Contexto / permissões
  ↓
Fluxo de trabalho
  ↓
Avaliação contínua
  ↓
Ação em produção
  ↘
   Auditoria / escalonamento humano / recuperação
```

Essa arquitetura transforma a escolha do modelo em um componente de um sistema de produção maior.

## Efeitos sobre trabalho devem aparecer primeiro na composição de tarefas e no desenho organizacional

Ainda é cedo para inferir desemprego ou produtividade agregada a partir dos dados atuais de agentes. O mecanismo de curto prazo mais forte é a recomposição das tarefas.

À medida que agentes assumem fluxos de trabalho mais longos e com uso de ferramentas, alguns trabalhadores migram da execução direta para especificação, revisão, tratamento de exceções e desenho de fluxo de trabalhos. Alguns empregos podem exigir menos passos rotineiros; outros podem crescer porque a redução do custo de execução aumenta a quantidade de trabalho tentada. A gestão também pode mudar se uma pessoa conseguir supervisionar vários fluxos automatizados.

O efeito distributivo dependerá de quem controla os fluxos de trabalho, quem consegue redesenhá-los, como os ganhos são divididos e se trabalhadores conseguem migrar para tarefas de maior valor. Uma empresa que dê contexto e ferramentas aos agentes sem redesenhar processos pode consumir mais computação sem produzir crescimento proporcional. Uma organização que redesenhe fluxos de trabalho pode reduzir custo de coordenação, mas também concentrar conhecimento operacional em software e permissões.

A pergunta social correta não é apenas “quais empregos desaparecem?”. É **quais tarefas se tornam delegáveis, quais decisões continuam atribuídas a humanos e quem captura o ganho de produtividade**.

## Instituições passarão a regular ações, não apenas saídas de texto

Governança tradicional de IA frequentemente se concentrava no conteúdo gerado. Agentes criam um problema diferente porque ações podem produzir efeitos externos: enviar mensagens, editar registros, modificar código, interagir com clientes, contratar serviços ou acessar dados sensíveis.

A superfície de controle passa, portanto, a incluir:

- identidade e autenticação;
- permissões de privilégio mínimo;
- escopos específicos por ferramenta;
- limites de aprovação;
- segmentação de contexto;
- logs duráveis;
- rollback e recuperação;
- avaliação antes e depois de mudanças no sistema;
- escalonamento humano para decisões incertas ou de alto impacto.

Isso cria demanda por uma nova camada de infraestrutura empresarial: identidade de agentes, mecanismos de aplicação de políticas, estruturas de avaliação, telemetria dos fluxos de trabalho e auditoria. O modelo pode ficar mais barato ao longo do tempo enquanto a camada de garantia operacional ganha peso.

## O que transformaria isso em uma mudança econômica maior

A avaliação se fortaleceria se:

1. estudos independentes demonstrarem ganhos duráveis de produtividade em fluxos de trabalho de produção, e não apenas crescimento de uso;
2. organizações conseguirem manter confiabilidade com agentes executando múltiplas tarefas interdependentes;
3. taxas de vazamento de contexto e ações inseguras caírem substancialmente em condições realistas;
4. sistemas de autonomia seletiva reduzirem trabalho humano sem elevar erro residual;
5. avaliação contínua se tornar infraestrutura operacional rotineira;
6. fluxos de trabalho com agentes de IA se espalharem de organizações pioneiras para setores regulados e operacionalmente complexos;
7. custo por tarefa concluída e verificada cair mais rápido do que cresce o custo adicional da revisão humana.

Ela se enfraqueceria se o uso continuar crescendo sem melhora de qualidade verificada, privacidade e confiabilidade; se supervisão humana crescer quase na mesma proporção que a atividade dos agentes; ou se integração com ferramentas criar custos de falha que anulem a economia de execução.

## O sinal não é “IA substitui o trabalho do conhecimento”

Essa conclusão ultrapassaria a evidência.

O sinal mais forte de 2026 é que **IA está começando a ocupar uma camada operacional dentro das organizações**. Dados de uso indicam transição da assistência para execução delegada. Benchmarks de pesquisa mostram que contexto, coordenação multitarefa e privacidade revelam fraquezas que sucesso de tarefa simples esconde. Pesquisa clínica demonstra que controle local e autonomia seletiva podem transformar estimativas de confiabilidade em decisões concretas no fluxo de trabalho.

A pergunta transformadora está deixando de ser se um modelo consegue produzir uma resposta correta. Passa a ser se instituições conseguem construir um sistema controlado no qual agentes possam agir repetidamente, ser avaliados continuamente, expor incerteza e escalar adequadamente.

Se essa infraestrutura amadurecer, a unidade de competição tecnológica pode migrar do melhor modelo isolado para o melhor **sistema operacional humano-agente para trabalho real**.

## Fontes principais

- [OpenAI — Enterprise Signals](https://openai.com/signals/enterprise-data/), agosto de 2026; telemetria do fornecedor, tratada como evidência de adoção e não como evidência independente de produtividade.
- [Microsoft Research — CI-Work](https://www.microsoft.com/en-us/research/publication/ci-work-benchmarking-contextual-integrity-in-enterprise-llm-agents/), ACL Industry Track, julho de 2026.
- [Microsoft Research — CORPGEN](https://www.microsoft.com/en-us/research/blog/corpgen-advances-ai-agents-for-real-work/), 26 de fevereiro de 2026.
- [Microsoft Research — Continuous Benchmark Generation](https://www.microsoft.com/en-us/research/publication/continuous-benchmark-generation-for-evaluating-enterprise-scale-llm-agents/), 2026.
- [Nature Medicine — On-premise medical AI agents for reliable clinical decision-making](https://www.nature.com/articles/s41591-026-04609-x), 15 de setembro de 2026.
- [NIST — TEVV-Athlon Framework](https://www.nist.gov/artificial-intelligence/ai-research/tevv-athlon-framework-evaluating-ai-systems), draft de 7 de agosto de 2026.
