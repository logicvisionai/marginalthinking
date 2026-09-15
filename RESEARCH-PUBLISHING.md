# Marginal Thinking — Research Publishing Architecture

## Princípio

A publicação tem uma fonte canônica: **Markdown**. O HTML é o leitor web desse conteúdo. PDF, DOCX e XLSX não fazem parte do pipeline.

## Estrutura de uma publicação

Cada pesquisa precisa de apenas três mudanças:

1. `reports/YYYY/MM/<slug>.md` — conteúdo completo e fontes.
2. `reports/YYYY/MM/<slug>.html` — shell leve com título, deck, metadados e `data-markdown`.
3. `data/reports.json` — entrada para home, busca e arquivo.

A home não deve ser editada para cada publicação; ela lê `data/reports.json`.

## Markdown suportado

Use Markdown comum: H1-H4, parágrafos, negrito, itálico, links, listas, citações, tabelas e blocos de código.

### Diagrama causal

Um parágrafo com três ou mais etapas separadas por `→` é transformado em diagrama no HTML:

`Choque de energia → frete → inflação → juros → valuation`

Também é possível usar:

```flow
Capital -> chips -> data centers -> rede elétrica -> energia
```

### Gráfico declarativo

Quando um gráfico realmente melhora a compreensão, use um bloco simples:

```chart
title: Variação do dia
unit: %
S&P 500 | -0.48
Nasdaq | -0.56
Brent | 1.02
```

O Markdown continua legível e o HTML gera o gráfico sem biblioteca externa ou dados hard-coded no JavaScript.

Tabelas com uma coluna percentual chamada `Variação`, `Movimento`, `Mudança` ou `Retorno` também recebem uma visualização automática quando houver pelo menos três observações numéricas.

## Regras editoriais

- separar fato, inferência e cenário;
- informar data e unidade dos números relevantes;
- não misturar estoque, fluxo, valorização e mudança de controle;
- preferir fontes primárias e registrar revisões;
- cenários precisam de gatilhos e contraprovas;
- gráficos devem nascer dos dados presentes na própria pesquisa;
- nenhum relatório pode depender de código específico por número de seção.

## QA antes do deploy

`npm run validate`

A validação bloqueia o build se encontrar:

- PDF, DOCX ou XLSX no diretório de pesquisas;
- referências a formatos binários no site;
- relatório sem par HTML/Markdown;
- caractere `�`;
- bloco de código sem fechamento;
- tabela Markdown estruturalmente inconsistente;
- shell HTML que não aponta para o Markdown correspondente.

## Publicação

`npm run build`

O build valida primeiro e depois copia o site para `dist/`. Não existe reconstrução de binários, chunks Base64 ou manifestos de assets de relatório.
