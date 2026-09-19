import fs from 'node:fs';
import path from 'node:path';
import {esc} from './lib/markdown.mjs';
import {collectReports,reportView,availableLocales} from './lib/reports.mjs';
import {makeLayout} from './lib/layout.mjs';

const root=process.cwd(),out=path.join(root,'dist');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const cfg=JSON.parse(read('site.config.json'));
const i18n=JSON.parse(read('data/i18n.json'));
const taxonomy=JSON.parse(read('data/taxonomy.json'));
const reports=collectReports(root);
const site=cfg.site_url.replace(/\/$/,'');
const author=cfg.default_author,social=`${site}${cfg.social_image}`;
const locales=Object.keys(cfg.locales||{});
const pagePath=(locale,p)=>{const prefix=cfg.locales[locale]?.path?`/${cfg.locales[locale].path}`:'';return `${prefix}${p}`.replace(/\/+/g,'/');};
const reportPath=(item,locale)=>pagePath(locale,item.url);
const layout=locale=>makeLayout({cfg,i18n,site,author,social,locale,reportPath,pagePath});
const write=(p,s)=>{const target=path.join(out,String(p).replace(/^\//,''));fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,s);};
const label=(obj,locale,fallback)=>obj?.[locale]||obj?.en||fallback;
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const titleCase=s=>String(s||'').split('-').filter(Boolean).map(x=>x[0]?.toUpperCase()+x.slice(1)).join(' ');
const countryName=(locale,code,slug)=>{try{return new Intl.DisplayNames([locale],{type:'region'}).of(code)||titleCase(slug);}catch{return titleCase(slug);}};
const stripMarkdown=s=>String(s||'').replace(/```[\s\S]*?```/g,' ').replace(/`([^`]+)`/g,' $1 ').replace(/!\[[^\]]*\]\([^)]*\)/g,' ').replace(/\[([^\]]+)\]\([^)]*\)/g,' $1 ').replace(/^#{1,6}\s+/gm,' ').replace(/[>*_~|]/g,' ').replace(/\s+/g,' ').trim();
const stripHtml=s=>String(s||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
const walk=dir=>fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);return e.isDirectory()?walk(p):[p];}):[];

const countryMap=new Map();
for(const r of reports)for(const c of r.geography?.countries||[]){const key=c.slug||String(c.code||'').toLowerCase();if(key&&!countryMap.has(key))countryMap.set(key,{slug:key,code:c.code||''});}

function localizedView(item,locale){return reportView(item,locale)||reportView(item,item.source_locale||cfg.default_locale)||item;}
function bodyHint(view){
  const rel=String(view.markdown_url||'').replace(/^\//,'');
  if(!rel)return'';
  const file=path.join(root,rel);
  if(!fs.existsSync(file))return'';
  const md=fs.readFileSync(file,'utf8');
  const headings=[...md.matchAll(/^#{2,4}\s+(.+)$/gm)].map(m=>m[1].replace(/[#*_`]/g,'').trim()).slice(0,20).join(' · ');
  return `${headings} ${stripMarkdown(md).slice(0,1800)}`.trim();
}
function taxonomyTerms(item,locale){
  const outTerms=[];
  if(item.program)outTerms.push(label(taxonomy.programs?.[item.program],locale,item.program));
  for(const id of item.geography?.regions||[])outTerms.push(label(taxonomy.regions?.[id],locale,id));
  for(const c of item.geography?.countries||[])outTerms.push(countryName(locale,c.code,c.slug));
  for(const id of item.topics||[])outTerms.push(label(taxonomy.topics?.[id],locale,id));
  if(item.series){const s=taxonomy.series?.[item.series];outTerms.push(label(s,locale,item.series));if(item.series_domain)outTerms.push(label(s?.domains?.[item.series_domain],locale,item.series_domain));}
  return outTerms.filter(Boolean);
}

function reportEntry(item,locale){
  const v=localizedView(item,locale),terms=taxonomyTerms(item,locale),tags=v.tags||item.tags||[],keywords=v.keywords||item.keywords||[];
  return {type:'report',id:item.id,title:v.title||item.title||item.id,description:v.deck||item.deck||'',url:reportPath(item,locale),date:item.date||'',meta:terms.slice(0,6).join(' · '),search:[v.title,v.deck,v.regime,v.key_risk,...(v.watch||[]),...tags,...keywords,...terms,bodyHint(v)].filter(Boolean).join(' ')};
}
function collectionEntries(locale){
  const entries=[];
  for(const [id,obj] of Object.entries(taxonomy.programs||{}))entries.push({type:'program',id:`program:${id}`,title:label(obj,locale,id),description:locale==='pt-BR'?'Programa permanente de pesquisa.':'Permanent research program.',url:pagePath(locale,`/research/${id}/`),meta:locale==='pt-BR'?'Programa de pesquisa':'Research program',search:`${id} ${Object.values(obj||{}).join(' ')}`});
  for(const [id,obj] of Object.entries(taxonomy.regions||{}))entries.push({type:'region',id:`region:${id}`,title:label(obj,locale,id),description:locale==='pt-BR'?'Coleção geográfica de pesquisas.':'Geographic research collection.',url:pagePath(locale,`/regions/${id}/`),meta:locale==='pt-BR'?'Região':'Region',search:`${id} ${Object.values(obj||{}).join(' ')}`});
  for(const c of countryMap.values())entries.push({type:'country',id:`country:${c.slug}`,title:countryName(locale,c.code,c.slug),description:locale==='pt-BR'?'Pesquisas relacionadas a este país.':'Research related to this country.',url:pagePath(locale,`/countries/${c.slug}/`),meta:locale==='pt-BR'?'País':'Country',search:`${c.slug} ${c.code} ${countryName('en',c.code,c.slug)} ${countryName('pt-BR',c.code,c.slug)}`});
  for(const [id,obj] of Object.entries(taxonomy.topics||{}))entries.push({type:'topic',id:`topic:${id}`,title:label(obj,locale,id),description:locale==='pt-BR'?'Tópico da taxonomia analítica controlada.':'Controlled analytical taxonomy topic.',url:pagePath(locale,`/topics/${id}/`),meta:locale==='pt-BR'?'Tópico':'Topic',search:`${id} ${Object.values(obj||{}).join(' ')}`});
  for(const [id,s] of Object.entries(taxonomy.series||{})){
    entries.push({type:'series',id:`series:${id}`,title:label(s,locale,id),description:label(s.description,locale,''),url:pagePath(locale,`/series/${id}/`),meta:locale==='pt-BR'?'Série de pesquisa':'Research series',search:`${id} ${Object.values(s||{}).filter(x=>typeof x==='string').join(' ')}`});
    for(const [domain,obj] of Object.entries(s.domains||{}))entries.push({type:'series-domain',id:`series-domain:${id}:${domain}`,title:label(obj,locale,domain),description:locale==='pt-BR'?`Domínio da série ${label(s,locale,id)}.`:`Domain within the ${label(s,locale,id)} series.`,url:pagePath(locale,`/series/${id}/${domain}/`),meta:label(s,locale,id),search:`${domain} ${Object.values(obj||{}).join(' ')} ${label(s,locale,id)}`});
  }
  return entries;
}
function institutionalEntries(locale){
  const defs=locale==='pt-BR'?[['home','Marginal Thinking','Pesquisa sobre economia, política e sociedade.','/index.html'],['archive','Arquivo de pesquisas','Todos os relatórios e análises publicados.','/reports.html'],['method','Método','Método, evidências, incerteza e padrões analíticos.','/methodology.html'],['about','Sobre','Identidade institucional, escopo e princípios editoriais.','/about.html'],['coverage','Cobertura de pesquisa','Cobertura temática, geográfica e por idioma do acervo.','/research/coverage/'],['atlas','Atlas de Oportunidades Estruturais','Condições estruturais que impedem valor, podem ser exploradas ou funcionam como alavanca econômica.','/opportunities/']]:[['home','Marginal Thinking','Research on economics, politics and society.','/index.html'],['archive','Research archive','All published reports and analysis.','/reports.html'],['method','Method','Method, evidence, uncertainty and analytical standards.','/methodology.html'],['about','About','Institutional identity, scope and editorial principles.','/about.html'],['coverage','Research coverage','Thematic, geographic and language coverage of the corpus.','/research/coverage/'],['atlas','Structural Opportunity Atlas','Structural conditions that block value, can be exploited or function as economic leverage.','/opportunities/']];
  defs.push(locale==='pt-BR'?['workspace','Caderno de pesquisa','Filtre pesquisas, compare teses e riscos, salve leituras e organize notas pessoais.','/workspace/']:['workspace','Research workspace','Filter research, compare theses and risks, save reading and organize personal notes.','/workspace/']);
  defs.push(locale==='pt-BR'?['dependencies','Rede Global de Dependências','Relações econômicas documentadas, fontes, histórico e pesquisas associadas.','/dependencies/']:['dependencies','Global Dependency Network','Documented economic relationships, sources, history and associated research.','/dependencies/']);
  return defs.map(([id,title,description,url])=>({type:'page',id:`page:${id}`,title,description,url:pagePath(locale,url),meta:locale==='pt-BR'?'Institucional':'Institutional',search:`${title} ${description}`}));
}

const searchIndex={schema_version:1,generated_from:reports[0]?.date||null,locales:{}};
for(const locale of locales)searchIndex.locales[locale]=[...reports.filter(r=>availableLocales(r).includes(locale)).map(r=>reportEntry(r,locale)),...collectionEntries(locale),...institutionalEntries(locale)];
write('/data/search-index.json',JSON.stringify(searchIndex));

function searchPage(locale){
  const L=layout(locale),pt=locale==='pt-BR',title=pt?'Busca global':'Global search',description=pt?'Pesquise relatórios, países, regiões, programas, séries, tópicos e páginas institucionais em todo o acervo da Marginal Thinking.':'Search reports, countries, regions, programs, series, topics and institutional pages across the Marginal Thinking corpus.',canonical=pagePath(locale,'/search.html'),alts=Object.fromEntries(locales.map(l=>[l,pagePath(l,'/search.html')]));
  const base=L.baseHead(`${title} — ${cfg.site_name}`,description,canonical,'SearchResultsPage',alts).replace('index,follow,max-image-preview:large,max-snippet:-1','noindex,follow');
  return `<!doctype html><html lang="${esc(L.loc.lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#09131a"><meta name="description" content="${esc(description)}"><link rel="icon" href="/assets/brand/favicon.svg"><link rel="stylesheet" href="/assets/css/styles.css"><link rel="stylesheet" href="/assets/css/research-static.css"><link rel="stylesheet" href="/assets/css/discovery.css">${base}<title>${esc(title)} — ${esc(cfg.site_name)}</title></head><body data-locale="${esc(locale)}">${L.nav('research',alts)}<main><section class="page-hero search-hero"><div class="container"><div class="eyebrow dark">${pt?'PESQUISA':'DISCOVERY'}</div><h1>${esc(title)}</h1><p>${esc(description)}</p><form class="global-search-form" id="global-search-form" role="search"><label class="sr-only" for="global-search-input">${pt?'Pesquisar no site':'Search the site'}</label><div class="global-search-box"><input id="global-search-input" type="search" autocomplete="off" spellcheck="false" placeholder="${pt?'País, tema, relatório, mercado, tecnologia...':'Country, topic, report, market, technology...'}" data-index="/data/search-index.json" data-locale="${esc(locale)}"><button type="submit">${pt?'Buscar':'Search'}</button></div></form></div></section><section class="section"><div class="container search-results-shell"><div class="search-results-head"><h2>${pt?'Resultados':'Results'}</h2><span id="global-search-status" aria-live="polite"></span></div><div id="global-search-results" class="global-search-results"><p class="small">${pt?'Digite um termo para pesquisar todo o acervo.':'Enter a term to search the entire corpus.'}</p></div></div></section></main>${L.footer()}<script src="/assets/js/app.js"></script><script src="/assets/js/global-search.js"></script></body></html>`;
}
for(const locale of locales)write(pagePath(locale,'/search.html'),searchPage(locale));

function resolver(locale){
  const map=new Map(),add=(text,url)=>{if(text)map.set(normalize(text),pagePath(locale,url));};
  for(const [id,obj] of Object.entries(taxonomy.programs||{}))add(label(obj,locale,id),`/research/${id}/`);
  for(const [id,obj] of Object.entries(taxonomy.regions||{}))add(label(obj,locale,id),`/regions/${id}/`);
  for(const [id,obj] of Object.entries(taxonomy.topics||{}))add(label(obj,locale,id),`/topics/${id}/`);
  for(const c of countryMap.values())add(countryName(locale,c.code,c.slug),`/countries/${c.slug}/`);
  for(const [id,s] of Object.entries(taxonomy.series||{})){add(label(s,locale,id),`/series/${id}/`);for(const [domain,obj] of Object.entries(s.domains||{}))add(label(obj,locale,domain),`/series/${id}/${domain}/`);}
  return map;
}
function semanticLinks(item,locale){
  const links=[],add=(kind,text,url)=>{if(text&&url&&!links.some(x=>x.url===url))links.push({kind,text,url:pagePath(locale,url)});};
  if(item.program)add('program',label(taxonomy.programs?.[item.program],locale,item.program),`/research/${item.program}/`);
  if(item.series){const s=taxonomy.series?.[item.series];add('series',label(s,locale,item.series),`/series/${item.series}/`);if(item.series_domain)add('domain',label(s?.domains?.[item.series_domain],locale,item.series_domain),`/series/${item.series}/${item.series_domain}/`);}
  for(const c of item.geography?.countries||[])add('country',countryName(locale,c.code,c.slug),`/countries/${c.slug}/`);
  for(const id of item.geography?.regions||[])add('region',label(taxonomy.regions?.[id],locale,id),`/regions/${id}/`);
  for(const id of item.topics||[])add('topic',label(taxonomy.topics?.[id],locale,id),`/topics/${id}/`);
  return links;
}
function injectReportSemantics(){
  let changed=0;
  for(const item of reports)for(const locale of availableLocales(item).filter(l=>cfg.locales[l])){
    const file=path.join(out,reportPath(item,locale).replace(/^\//,''));if(!fs.existsSync(file))continue;
    let html=fs.readFileSync(file,'utf8');if(html.includes('semantic-navigation'))continue;
    const links=semanticLinks(item,locale);if(!links.length)continue;
    const pt=locale==='pt-BR',section=`<section class="semantic-navigation" aria-label="${pt?'Navegação relacionada':'Related navigation'}"><div class="signature-kicker">${pt?'EXPLORAR PESQUISA':'EXPLORE RESEARCH'}</div><div class="semantic-links">${links.map(x=>`<a class="semantic-chip" data-kind="${esc(x.kind)}" href="${esc(x.url)}">${esc(x.text)}</a>`).join('')}</div></section>`;
    if(html.includes('<article class="report-content">')){html=html.replace('<article class="report-content">',`${section}<article class="report-content">`);fs.writeFileSync(file,html);changed++;}
  }
  return changed;
}

function linkTagLike(html,locale){
  const map=resolver(locale),searchBase=pagePath(locale,'/search.html');
  const target=text=>map.get(normalize(stripHtml(text)))||`${searchBase}?q=${encodeURIComponent(stripHtml(text))}`;
  html=html.replace(/<span class="tag">([\s\S]*?)<\/span>/gi,(all,text)=>`<a class="tag" href="${esc(target(text))}">${text}</a>`);
  html=html.replace(/<div class="chips">([\s\S]*?)<\/div>/gi,(all,body)=>`<div class="chips">${body.replace(/<span>([\s\S]*?)<\/span>/gi,(m,text)=>`<a href="${esc(target(text))}">${text}</a>`)}</div>`);
  return html;
}
function injectGlobalDiscovery(){
  let changed=0;
  for(const file of walk(out).filter(x=>x.endsWith('.html'))){
    const rel=path.relative(out,file).split(path.sep).join('/'),locale=rel.startsWith('pt-br/')?'pt-BR':'en',pt=locale==='pt-BR';
    let html=fs.readFileSync(file,'utf8'),before=html;
    if(!html.includes('/assets/css/discovery.css'))html=html.replace('</head>','<link rel="stylesheet" href="/assets/css/discovery.css"></head>');
    if(html.includes('<div class="header-actions">')&&!html.includes('class="global-search-link"')){
      const href=pagePath(locale,'/search.html'),labelText=pt?'Busca global':'Global search';
      const control=`<a class="global-search-link" href="${href}" aria-label="${labelText}" title="${labelText}"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4.2 4.2"></path></svg><span>${pt?'Buscar':'Search'}</span></a>`;
      html=html.replace('<div class="header-actions">',`<div class="header-actions">${control}`);
    }
    if(html.includes('<div class="mobile-language">')&&!html.includes('class="mobile-search-link"'))html=html.replace('<div class="mobile-language">',`<a class="mobile-search-link" href="${pagePath(locale,'/search.html')}">${pt?'Busca global':'Global search'}</a><div class="mobile-language">`);
    html=linkTagLike(html,locale);
    if(html!==before){fs.writeFileSync(file,html);changed++;}
  }
  return changed;
}

const semanticChanged=injectReportSemantics();
const discoveryChanged=injectGlobalDiscovery();
console.log(`Discovery layer ready: ${reports.length} canonical reports indexed across ${locales.length} locales; ${semanticChanged} report pages received semantic navigation; ${discoveryChanged} HTML pages received global discovery controls.`);
