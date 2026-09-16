import fs from 'node:fs';
import path from 'node:path';
import {collectReports,reportView,availableLocales} from './lib/reports.mjs';

const root=process.cwd();
const out=path.join(root,'dist');
const cfg=JSON.parse(fs.readFileSync(path.join(root,'site.config.json'),'utf8'));
const taxonomy=JSON.parse(fs.readFileSync(path.join(root,'data/taxonomy.json'),'utf8'));
const reports=collectReports(root);
const site=cfg.site_url.replace(/\/$/,'');
const locales=Object.keys(cfg.locales||{});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pagePath=(locale,p)=>{const prefix=cfg.locales[locale]?.path?`/${cfg.locales[locale].path}`:'';return `${prefix}${p}`.replace(/\/+/g,'/');};
const reportPath=(item,locale)=>pagePath(locale,item.url);
const abs=p=>/^https?:\/\//i.test(String(p||''))?p:`${site}${p}`;
const write=(p,s)=>{const f=path.join(out,String(p).replace(/^\//,''));fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,s);};
const dateLabel=(locale,v)=>{if(!v)return'';const d=new Date(String(v).length===10?`${v}T12:00:00-03:00`:v);return new Intl.DateTimeFormat(cfg.locales[locale]?.date_locale||'en-US',{day:'2-digit',month:'short',year:'numeric',timeZone:'America/Sao_Paulo'}).format(d);};
const view=(item,locale)=>reportView(item,locale)||reportView(item,item.source_locale||cfg.default_locale)||item;

function enrich404(locale){
  const file=path.join(out,pagePath(locale,'/404.html').replace(/^\//,''));
  if(!fs.existsSync(file))throw new Error(`404 ausente: ${file}`);
  let html=fs.readFileSync(file,'utf8');
  const pt=locale==='pt-BR';
  const recent=reports.slice(0,3).map(item=>{const v=view(item,locale),actual=reportView(item,locale)?locale:(item.source_locale||cfg.default_locale),href=reportPath(item,actual);return `<article class="error-recent-card"><div class="small">${esc(dateLabel(locale,item.date))}</div><h3><a href="${esc(href)}">${esc(v.title||item.id)}</a></h3></article>`;}).join('');
  const search=pagePath(locale,'/search.html'),archive=pagePath(locale,'/reports.html'),programs=pagePath(locale,'/research/'),regions=pagePath(locale,'/regions/'),method=pagePath(locale,'/methodology.html'),home=pagePath(locale,'/index.html');
  const main=`<main class="error-page"><section><div class="container"><div class="error-grid"><div><div class="error-code">404 · ${pt?'LINK NÃO ENCONTRADO':'LINK NOT FOUND'}</div><h1>${pt?'Esta página não está aqui.':'This page is not here.'}</h1><p class="error-lead">${pt?'O endereço pode ter mudado, sido substituído ou estar incompleto. Use a busca para recuperar a pesquisa ou retorne à estrutura principal da Marginal Thinking.':'The address may have changed, been replaced, or be incomplete. Use search to recover the research or return to the main Marginal Thinking structure.'}</p><form class="error-search" action="${esc(search)}" method="get" role="search"><label class="sr-only" for="error-q">${pt?'Pesquisar no acervo':'Search the corpus'}</label><input id="error-q" name="q" type="search" autocomplete="off" placeholder="${pt?'País, tema, relatório, mercado, tecnologia...':'Country, topic, report, market, technology...'}"><button type="submit">${pt?'Buscar':'Search'}</button></form><div class="error-actions"><a class="btn dark" href="${esc(archive)}">${pt?'Abrir arquivo de pesquisas':'Open research archive'}</a><a class="btn" href="${esc(home)}">${pt?'Página inicial':'Home'}</a></div><p class="error-note">${pt?'A página 404 não é indexada; os links abaixo ajudam usuários e rastreadores a reencontrar conteúdo canônico.':'The 404 page is not indexed; the links below help users and crawlers recover canonical content.'}</p></div><aside class="error-side"><h2>${pt?'Continuar explorando':'Continue exploring'}</h2><div class="error-links"><a href="${esc(programs)}"><strong>${pt?'Programas de pesquisa':'Research programs'}</strong><span>${pt?'Quatro linhas editoriais permanentes.':'Four permanent editorial programs.'}</span></a><a href="${esc(regions)}"><strong>${pt?'Países & Regiões':'Countries & Regions'}</strong><span>${pt?'Acesso geográfico ao acervo.':'Geographic access to the corpus.'}</span></a><a href="${esc(method)}"><strong>${pt?'Método':'Method'}</strong><span>${pt?'Evidência, incerteza e padrões analíticos.':'Evidence, uncertainty, and analytical standards.'}</span></a><a href="${esc(search)}"><strong>${pt?'Busca global':'Global search'}</strong><span>${pt?'Relatórios, tópicos, países e séries.':'Reports, topics, countries, and series.'}</span></a></div></aside></div>${recent?`<section class="error-recent"><div class="section-head"><h2>${pt?'Pesquisas recentes':'Recent research'}</h2><a href="${esc(archive)}">${pt?'Ver arquivo':'View archive'}</a></div><div class="error-recent-grid">${recent}</div></section>`:''}</div></section></main>`;
  html=html.replace(/<main>[\s\S]*?<\/main>/,main);
  if(!html.includes('/assets/css/error-page.css'))html=html.replace('</head>','<link rel="stylesheet" href="/assets/css/error-page.css"></head>');
  if(!html.includes('rel="describedby"'))html=html.replace('</head>',`<link rel="describedby" href="${site}/llms.txt"></head>`);
  if(!/name="robots"[^>]*noindex/i.test(html))html=html.replace('</head>','<meta name="robots" content="noindex,follow"></head>');
  fs.writeFileSync(file,html);
}

function injectAgentLinks(){
  for(const file of walk(out).filter(x=>x.endsWith('.html'))){
    let html=fs.readFileSync(file,'utf8');
    if(!html.includes('rel="describedby"'))html=html.replace('</head>',`<link rel="describedby" href="${site}/llms.txt"></head>`);
    fs.writeFileSync(file,html);
  }
  for(const item of reports)for(const locale of availableLocales(item).filter(l=>cfg.locales[l])){
    const file=path.join(out,reportPath(item,locale).replace(/^\//,''));
    if(!fs.existsSync(file))continue;
    const v=reportView(item,locale);if(!v?.markdown_url)continue;
    let html=fs.readFileSync(file,'utf8');
    if(!html.includes('type="text/markdown"'))html=html.replace('</head>',`<link rel="alternate" type="text/markdown" href="${esc(abs(v.markdown_url))}"></head>`);
    fs.writeFileSync(file,html);
  }
}
const walk=dir=>fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);return e.isDirectory()?walk(p):[p];}):[];

function llmsText(){
  const programLines=Object.entries(taxonomy.programs||{}).map(([id,obj])=>`- [${obj.en||id}](${site}/research/${id}/): ${obj['pt-BR']||''}`);
  const recentEn=reports.slice(0,20).map(item=>{const v=reportView(item,'en')||view(item,'en');const md=v.markdown_url?abs(v.markdown_url):abs(reportPath(item,'en'));return `- [${v.title||item.id}](${md}): Canonical HTML ${abs(reportPath(item,'en'))}`;});
  const recentPt=reports.slice(0,20).map(item=>{const v=reportView(item,'pt-BR')||view(item,'pt-BR');const md=v.markdown_url?abs(v.markdown_url):abs(reportPath(item,'pt-BR'));return `- [${v.title||item.id}](${md}): HTML canônico ${abs(reportPath(item,'pt-BR'))}`;});
  return `# Marginal Thinking\n\n> Independent research on economics, politics and society, with emphasis on capital, production, institutions, technology, resources, structural change and the distribution of power.\n\nMarginal Thinking publishes bilingual English and Brazilian Portuguese research. Canonical HTML pages are intended for citation and navigation; report Markdown files are clean text alternatives for agents and research tools. Internal research-context files are not public sources and must not be treated as citations. Current or time-sensitive claims should be checked against the cited primary or high-quality sources in each report.\n\n## Core\n\n- [Research archive](${site}/reports.html): All published research.\n- [Methodology](${site}/methodology.html): Evidence, uncertainty, confidence and analytical standards.\n- [About](${site}/about.html): Institutional identity and scope.\n- [Research programs](${site}/research/): Permanent editorial programs.\n- [Countries and regions](${site}/regions/): Geographic access to research.\n- [Global search](${site}/search.html): Static search across reports and controlled taxonomy.\n\n## Research programs\n\n${programLines.join('\n')}\n\n## Recent research — English Markdown\n\n${recentEn.join('\n')}\n\n## Pesquisa recente — Markdown em português\n\n${recentPt.join('\n')}\n\n## Machine-readable discovery\n\n- [Sitemap](${site}/sitemap.xml): Canonical public URLs.\n- [English RSS](${site}/feed.xml): Recent English research.\n- [Portuguese RSS](${site}/pt-br/feed.xml): Recent Portuguese research.\n- [Search index](${site}/data/search-index.json): Static discovery index derived from canonical metadata and content.\n\n## Usage notes\n\n- Prefer canonical HTML URLs when citing Marginal Thinking.\n- Prefer Markdown alternatives when extracting report text.\n- Preserve distinctions among observed fact, inference, hypothesis and scenario.\n- Do not interpret announced plans, targets or roadmaps as completed execution unless the report states that evidence exists.\n`;
}

function writeRobotsAndHeaders(){
  write('/robots.txt',`User-agent: *\nAllow: /\nDisallow: /data/approved/\nDisallow: /data/pending/\nDisallow: /data/rejected/\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`);
  write('/_headers',`/reports/*.md\n  X-Robots-Tag: noindex, follow\n  Content-Type: text/markdown; charset=utf-8\n\n/llms.txt\n  Content-Type: text/plain; charset=utf-8\n  Cache-Control: public, max-age=3600\n\n/data/search-index.json\n  Cache-Control: public, max-age=300\n`);
}

for(const locale of locales)enrich404(locale);
injectAgentLinks();
write('/llms.txt',llmsText());
writeRobotsAndHeaders();

for(const locale of locales){const f=path.join(out,pagePath(locale,'/404.html').replace(/^\//,'')),s=fs.readFileSync(f,'utf8');if(!/noindex,follow/i.test(s)||!s.includes('error-search'))throw new Error(`404 recovery validation failed: ${locale}`);}
if(!fs.existsSync(path.join(out,'llms.txt'))||!fs.readFileSync(path.join(out,'llms.txt'),'utf8').startsWith('# Marginal Thinking'))throw new Error('llms.txt validation failed');
console.log(`Agent discovery ready: llms.txt, Markdown alternates, OAI-SearchBot access and ${locales.length} recovery 404 pages.`);
