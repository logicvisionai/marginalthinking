import fs from 'node:fs';
import path from 'node:path';
import {esc} from './lib/markdown.mjs';
import {makeLayout} from './lib/layout.mjs';

const root=process.cwd();
const out=path.join(root,'dist');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const cfg=JSON.parse(read('site.config.json'));
const i18n=JSON.parse(read('data/i18n.json'));
const site=cfg.site_url.replace(/\/$/,'');
const author=cfg.default_author;
const social=`${site}${cfg.social_image}`;
const locales=Object.keys(cfg.locales||{});
const pagePath=(locale,p)=>{const prefix=cfg.locales[locale]?.path?`/${cfg.locales[locale].path}`:'';return `${prefix}${p}`.replace(/\/+/g,'/');};
const reportPath=(item,locale)=>pagePath(locale,item.url);
const layout=locale=>makeLayout({cfg,i18n,site,author,social,locale,reportPath,pagePath});
const write=(p,s)=>{const target=path.join(out,String(p).replace(/^\//,''));fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,s);};
const alternates=Object.fromEntries(locales.map(locale=>[locale,pagePath(locale,'/mcp.html')]));
const endpoint=`${site}/mcp`;

function head(locale,title,description,canonical){
  const L=layout(locale);
  return `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#09131a"><meta name="description" content="${esc(description)}"><link rel="icon" href="/assets/brand/favicon.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&display=swap" rel="stylesheet"><link rel="stylesheet" href="/assets/css/styles.css"><link rel="stylesheet" href="/assets/css/research-static.css"><link rel="stylesheet" href="/assets/css/mcp-docs.css">${L.baseHead(title,description,canonical,'TechArticle',alternates,{isAccessibleForFree:true})}<title>${esc(title)}</title>`;
}

const copy={
  en:{
    eyebrow:'AI ACCESS · MODEL CONTEXT PROTOCOL',
    title:'Connect your AI agent to Marginal Thinking',
    deck:'Use the Marginal Thinking MCP to give an AI agent structured, read-only access to our public research on economics, politics, society, capital, productive capacity, resources, technology and global power.',
    endpoint:'Public MCP endpoint',
    open:'Open · read-only · no authentication',
    introTitle:'What this gives your agent',
    intro:[
      'An AI model can answer broad questions on its own, but reproducing a serious research workflow still requires finding the right material, assembling context, comparing periods and connecting related developments. The Marginal Thinking MCP exposes that research layer directly to the agent.',
      'Marginal Thinking maintains the research corpus. Your agent can then retrieve the relevant material and adapt it to your own question, company, portfolio, research problem or decision context.'
    ],
    connectTitle:'Connect',
    connectText:'In an MCP-compatible client, add the remote server URL below. The server is public and stateless at the application layer, and all tools are read-only.',
    examplesTitle:'What you can ask',
    examples:[
      'Read the latest Marginal Thinking research on global capital flows and explain what matters for a Brazilian industrial company.',
      'Compare the current critical-minerals research with previous Marginal Thinking reports and show what changed.',
      'Build a 30-day timeline of Marginal Thinking research related to oil, sovereign yields and political risk.',
      'Find research connected to Poland, industrial policy and European security, then summarize the second-order economic effects.'
    ],
    toolsTitle:'Available tools',
    tools:[
      ['search_research','Search the corpus by question or subject, with optional filters for program, topic, country, cadence, format, series and date range.'],
      ['get_research','Retrieve canonical metadata and the public Markdown of a research item. A heading can be requested to return only one section.'],
      ['latest_research','Return the most recent publications, optionally constrained by the same controlled metadata used by the site.'],
      ['get_related_research','Find structurally related publications using programs, topics, geography, series and analytical dimensions.'],
      ['get_timeline','Build a chronological view of research around a country, market, institution, technology, resource or other subject.'],
      ['get_corpus_overview','Return the corpus-level coverage intelligence already derived automatically by the Marginal Thinking build.']
    ],
    resourceTitle:'Machine-readable resource',
    resourceText:'The server also exposes the public research catalog as an MCP resource:',
    architectureTitle:'How it works',
    architectureText:'The MCP does not maintain a second knowledge base. It reads the same canonical research artifacts already produced by the Marginal Thinking publishing pipeline.',
    architecture:'GitHub research repository\n        ↓\nexisting Cloudflare build\n        ↓\nMarkdown + canonical metadata\n        ↓\nMCP catalog\n        ↓\n/mcp on the existing Cloudflare Worker\n        ↓\nyour MCP-compatible agent',
    limitsTitle:'Scope and limits',
    limits:[
      'The MCP retrieves and organizes published Marginal Thinking research; it does not generate new Marginal Thinking analysis inside the server.',
      'It does not browse the web, mutate the repository or call an LLM.',
      'Time-sensitive claims should still be read together with the dates, evidence and cited sources in the underlying research.',
      'When citing Marginal Thinking, prefer the canonical HTML URL. When extracting report text, prefer the Markdown returned by the MCP.'
    ],
    whyTitle:'Why this matters',
    why:'The internet made information abundant. AI makes it easier to work with that information. The remaining constraint is often the research layer in between: what to collect, how to connect it and how to preserve context over time. The Marginal Thinking MCP makes that layer directly usable by your own agent.',
    nav:['Overview','Connect','Examples','Tools','Architecture','Limits']
  },
  'pt-BR':{
    eyebrow:'ACESSO PARA IA · MODEL CONTEXT PROTOCOL',
    title:'Conecte seu agente de IA à Marginal Thinking',
    deck:'Use o MCP da Marginal Thinking para dar ao seu agente acesso estruturado e somente leitura às nossas pesquisas públicas sobre economia, política, sociedade, capital, capacidade produtiva, recursos, tecnologia e poder global.',
    endpoint:'Endpoint MCP público',
    open:'Aberto · somente leitura · sem autenticação',
    introTitle:'O que isso dá ao seu agente',
    intro:[
      'Um modelo de IA pode responder perguntas amplas por conta própria, mas reproduzir um processo sério de pesquisa ainda exige encontrar o material certo, montar contexto, comparar períodos e conectar acontecimentos relacionados. O MCP da Marginal Thinking entrega essa camada de pesquisa diretamente ao agente.',
      'A Marginal Thinking mantém o acervo e a estrutura analítica. Seu agente pode recuperar o material relevante e adaptá-lo à sua empresa, patrimônio, pesquisa, problema ou contexto de decisão.'
    ],
    connectTitle:'Como conectar',
    connectText:'Em um cliente compatível com MCP, adicione a URL do servidor remoto abaixo. O servidor é público, sem estado na camada da aplicação e todas as ferramentas são somente leitura.',
    examplesTitle:'O que você pode pedir',
    examples:[
      'Leia as pesquisas mais recentes da Marginal Thinking sobre fluxos globais de capital e explique o que importa para uma indústria brasileira.',
      'Compare a pesquisa atual sobre minerais críticos com relatórios anteriores da Marginal Thinking e mostre o que mudou.',
      'Monte uma linha do tempo de 30 dias das pesquisas da Marginal Thinking relacionadas a petróleo, juros soberanos e risco político.',
      'Encontre pesquisas relacionadas à Polônia, política industrial e segurança europeia e resuma os efeitos econômicos de segunda ordem.'
    ],
    toolsTitle:'Ferramentas disponíveis',
    tools:[
      ['search_research','Pesquisa o acervo por pergunta ou assunto, com filtros opcionais de programa, tópico, país, cadência, formato, série e período.'],
      ['get_research','Recupera metadados canônicos e o Markdown público de uma pesquisa. É possível pedir apenas uma seção pelo título.'],
      ['latest_research','Retorna as publicações mais recentes, opcionalmente filtradas pelos mesmos metadados controlados usados pelo site.'],
      ['get_related_research','Encontra pesquisas estruturalmente relacionadas por programas, tópicos, geografia, séries e dimensões analíticas.'],
      ['get_timeline','Monta uma visão cronológica das pesquisas em torno de um país, mercado, instituição, tecnologia, recurso ou outro tema.'],
      ['get_corpus_overview','Retorna a inteligência de cobertura do acervo que já é derivada automaticamente pelo build da Marginal Thinking.']
    ],
    resourceTitle:'Recurso legível por máquina',
    resourceText:'O servidor também expõe o catálogo público de pesquisas como um recurso MCP:',
    architectureTitle:'Como funciona',
    architectureText:'O MCP não mantém uma segunda base de conhecimento. Ele lê os mesmos artefatos canônicos já produzidos pelo pipeline editorial da Marginal Thinking.',
    architecture:'repositório de pesquisas no GitHub\n        ↓\nbuild existente na Cloudflare\n        ↓\nMarkdown + metadados canônicos\n        ↓\ncatálogo MCP\n        ↓\n/mcp no Worker já existente\n        ↓\nseu agente compatível com MCP',
    limitsTitle:'Escopo e limites',
    limits:[
      'O MCP recupera e organiza pesquisas já publicadas pela Marginal Thinking; ele não gera novas análises da Marginal Thinking dentro do servidor.',
      'Ele não navega na web, não altera o repositório e não chama um LLM.',
      'Afirmações sensíveis ao tempo devem ser interpretadas junto das datas, evidências e fontes citadas na pesquisa original.',
      'Ao citar a Marginal Thinking, prefira a URL HTML canônica. Para extrair o texto do relatório, prefira o Markdown retornado pelo MCP.'
    ],
    whyTitle:'Por que isso importa',
    why:'A internet tornou informação abundante. A IA tornou mais fácil trabalhar com essa informação. A restrição que permanece muitas vezes está na camada intermediária de pesquisa: o que reunir, como conectar e como preservar contexto ao longo do tempo. O MCP da Marginal Thinking torna essa camada diretamente utilizável pelo seu próprio agente.',
    nav:['Visão geral','Conectar','Exemplos','Ferramentas','Arquitetura','Limites']
  }
};

function page(locale){
  const c=copy[locale]||copy.en,L=layout(locale),canonical=pagePath(locale,'/mcp.html');
  const description=c.deck;
  const tools=c.tools.map(([name,text])=>`<article class="mcp-capability"><code>${esc(name)}</code><p>${esc(text)}</p></article>`).join('');
  const examples=c.examples.map(x=>`<div class="mcp-example">${esc(x)}</div>`).join('');
  const limits=c.limits.map(x=>`<li>${esc(x)}</li>`).join('');
  return `<!doctype html><html lang="${esc(L.loc.lang)}"><head>${head(locale,`${c.title} — ${cfg.site_name}`,description,canonical)}</head><body data-locale="${esc(locale)}"><div class="utility-bar"><div class="container utility-row"><span>${esc(L.t.utility)}</span><a href="${pagePath(locale,'/reports.html')}">${esc(L.t.footer.archive)}</a></div></div>${L.nav('',alternates)}<main><section class="page-hero mcp-hero"><div class="container"><div class="eyebrow dark">${esc(c.eyebrow)}</div><h1>${esc(c.title)}</h1><p class="deck">${esc(c.deck)}</p><div class="mcp-endpoint"><code>${esc(endpoint)}</code><span class="mcp-status"><i aria-hidden="true"></i>${esc(c.open)}</span></div></div></section><section class="section mcp-docs"><div class="container mcp-docs-grid"><div class="mcp-docs-main"><section class="mcp-section" id="overview"><h2>${esc(c.introTitle)}</h2>${c.intro.map(x=>`<p>${esc(x)}</p>`).join('')}<div class="mcp-note"><strong>Marginal Thinking → MCP → ${locale==='pt-BR'?'seu agente → sua decisão':'your agent → your decision'}</strong></div></section><section class="mcp-section" id="connect"><h2>${esc(c.connectTitle)}</h2><p>${esc(c.connectText)}</p><pre>${esc(endpoint)}</pre><p class="mcp-small">${locale==='pt-BR'?'A documentação técnica do repositório permanece disponível em MCP.md; esta página é a interface pública e estável para usuários e agentes.':'Repository-level technical documentation remains available in MCP.md; this page is the stable public interface for users and agents.'}</p></section><section class="mcp-section" id="examples"><h2>${esc(c.examplesTitle)}</h2>${examples}</section><section class="mcp-section" id="tools"><h2>${esc(c.toolsTitle)}</h2><div class="mcp-capabilities">${tools}</div><h3>${esc(c.resourceTitle)}</h3><p>${esc(c.resourceText)}</p><pre>marginalthinking://catalog</pre></section><section class="mcp-section" id="architecture"><h2>${esc(c.architectureTitle)}</h2><p>${esc(c.architectureText)}</p><pre>${esc(c.architecture)}</pre></section><section class="mcp-section" id="limits"><h2>${esc(c.limitsTitle)}</h2><ul>${limits}</ul></section><section class="mcp-section"><h2>${esc(c.whyTitle)}</h2><p>${esc(c.why)}</p></section></div><aside class="mcp-side"><div class="panel"><div class="badge">MCP</div><nav>${[['overview',c.nav[0]],['connect',c.nav[1]],['examples',c.nav[2]],['tools',c.nav[3]],['architecture',c.nav[4]],['limits',c.nav[5]]].map(([id,label])=>`<a href="#${id}">${esc(label)}</a>`).join('')}</nav></div><div class="panel"><div class="badge">${locale==='pt-BR'?'SERVIDOR REMOTO':'REMOTE SERVER'}</div><p class="small"><strong>${esc(endpoint)}</strong><br>${esc(c.open)}</p></div></aside></div></section></main>${L.footer()}<script src="/assets/js/app.js"></script></body></html>`;
}

for(const locale of locales)write(pagePath(locale,'/mcp.html'),page(locale));

// Include the documentation in global static search without changing the main navigation.
const searchFile=path.join(out,'data','search-index.json');
if(fs.existsSync(searchFile)){
  const index=JSON.parse(fs.readFileSync(searchFile,'utf8'));
  for(const locale of locales){
    if(!Array.isArray(index.locales?.[locale]))continue;
    const c=copy[locale]||copy.en,url=pagePath(locale,'/mcp.html');
    index.locales[locale]=index.locales[locale].filter(x=>x.id!=='page:mcp');
    index.locales[locale].push({type:'page',id:'page:mcp',title:c.title,description:c.deck,url,meta:'MCP · AI agents',search:`MCP Model Context Protocol AI agents ${c.title} ${c.deck} ${c.tools.map(x=>x.join(' ')).join(' ')}`});
  }
  fs.writeFileSync(searchFile,JSON.stringify(index));
}

// Add both localized documentation pages to the existing sitemap.
const sitemapFile=path.join(out,'sitemap.xml');
if(fs.existsSync(sitemapFile)){
  let xml=fs.readFileSync(sitemapFile,'utf8');
  const entries=locales.map(locale=>`${site}${pagePath(locale,'/mcp.html')}`).filter(url=>!xml.includes(`<loc>${url}</loc>`)).map(url=>`<url><loc>${url}</loc></url>`).join('');
  if(entries)xml=xml.replace('</urlset>',`${entries}</urlset>`);
  fs.writeFileSync(sitemapFile,xml);
}

for(const locale of locales){
  const file=path.join(out,pagePath(locale,'/mcp.html').replace(/^\//,''));
  if(!fs.existsSync(file))throw new Error(`MCP documentation page missing: ${locale}`);
}
console.log(`MCP documentation rendered for ${locales.length} locales and linked into search/sitemap.`);
