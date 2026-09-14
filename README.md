# Marginal Thinking

Marginal Thinking é uma publicação da LOGV dedicada à análise de economia, política e sociedade, com foco em macroeconomia, mercados, economia política, geopolítica e risco estratégico.

## Site

O site é estático e publicado pelo Cloudflare Pages a partir da branch `main`.

O arquivo de pesquisas oferece busca client-side, filtro por ano e paginação. Cada edição pode disponibilizar HTML, Markdown, PDF e planilha XLSX de dados.

## Build no Cloudflare Pages

Configuração esperada:

- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Variável de produção: `PROD_GA_MEASUREMENT_ID=G-XXXXXXXXXX`

O build executa `scripts/cloudflare-build.sh`, que:

1. monta o diretório `dist`;
2. reconstrói PDF/XLSX armazenados em `.packed-assets`;
3. injeta o Google Analytics 4 em todas as páginas HTML do deploy de produção;
4. não carrega Analytics em previews;
5. falha o deploy de produção se `PROD_GA_MEASUREMENT_ID` estiver ausente ou não tiver formato GA4 válido.

O Measurement ID do GA4 é incorporado ao JavaScript publicado, como esperado para o Google Analytics. Ele não deve ser tratado como segredo.

## Assets binários

O arquivo `.packed-assets/manifest.tsv` relaciona cada conjunto de partes Base64 ao caminho final dentro de `dist`. Novas edições com PDF/XLSX devem adicionar suas entradas ao manifesto.

## Licenças

- Código do site: Apache-2.0.
- Conteúdo editorial original LOGV/Marginal Thinking: CC BY 4.0, salvo indicação em contrário.
- Marcas, nomes e identidade visual LOGV/Marginal Thinking não são licenciados pelas licenças acima.
- Materiais de terceiros permanecem sujeitos aos direitos e termos das respectivas fontes.
