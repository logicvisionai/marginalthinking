# Marginal Thinking

Marginal Thinking é uma publicação da LOGV dedicada a macroeconomia, mercados, economia política e geopolítica.

## Site

O site é estático e publicado via Cloudflare Workers Static Assets.

Fluxo de produção:

1. `npm run build`
2. `scripts/cloudflare-build.sh` gera `dist/`
3. PDF e XLSX são restaurados em `dist/reports/...`
4. Google Analytics é injetado em produção a partir de `PROD_GA_MEASUREMENT_ID`
5. `wrangler deploy` publica somente `dist/`, conforme `wrangler.jsonc`

O diretório de assets do Worker é explicitamente `./dist`. `node_modules`, `.wrangler` e o próprio diretório `dist` são ignorados pelo Git.

## Cloudflare

Configuração esperada:

- Production branch: `main`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Root directory: raiz do repositório
- Production variable: `PROD_GA_MEASUREMENT_ID=G-...`

O nome do Worker no painel Cloudflare deve corresponder ao campo `name` de `wrangler.jsonc` (`marginalthinking`).

## Licenças

- Código do site: Apache-2.0.
- Conteúdo editorial original LOGV/Marginal Thinking: CC BY 4.0, salvo indicação em contrário.
- Marcas, nomes e identidade visual LOGV/Marginal Thinking não são licenciados pelas licenças acima.
- Materiais de terceiros permanecem sujeitos aos direitos e termos das respectivas fontes.
