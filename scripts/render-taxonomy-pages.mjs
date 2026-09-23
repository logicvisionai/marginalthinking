import fs from 'node:fs';
import path from 'node:path';
import {esc,slug} from './lib/markdown.mjs';
import {collectReports,reportView,availableLocales} from './lib/reports.mjs';
import {makeLayout} from './lib/layout.mjs';

const root=process.cwd();
const out=path.join(root,'dist');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const cfg=JSON.parse(read('site.config.json'));
const i18n=JSON.parse(read('data/i18n.json'));
const taxonomy=JSON.parse(read('data/taxonomy.json'));
const reports=collectReports(root);
const site=cfg.site_url.replace(/\/$/,'');
const author=cfg.default_author;
const social=`${site}${cfg.social_image}`;
const localeCodes=Object.keys(cfg.locales);
const pagePath=(locale,p)=>{const prefix=cfg.locales[locale]?.path?`/${cfg.locales[locale].path}`:'';return `${prefix}${p}`.replace(/\/+/g,'/');};
const reportPath=(item,locale)=>pagePath(locale,item.url);
const layout=locale=>makeLayout({cfg,i18n,site,author,social,locale,reportPath,pagePath});
const write=(p,s)=>{const target=path.join(out,String(p).replace(/^\//,''));fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,s);};
const iso=v=>String(v||'').slice(0,10);
const date=(locale,v)=>{if(!v)return'';const d=new Date(String(v).length===10?`${v}T12:00:00-03:00`:v);return new Intl.DateTimeFormat(cfg.locales[locale]?.date_locale||'en-US',{day:'2-digit',month:'long',year:'numeric',timeZone:'America/Sao_Paulo'}).format(d);};
const label=(obj,locale,fallback)=>obj?.[locale]||obj?.en||fallback;
const bestView=(item,locale)=>{const direct=reportView(item,locale);if(direct)return{view:direct,locale};const source=item.source_locale||cfg.legacy_source_locale;return{view:reportView(item,source)||item,locale:source};};
const head=(locale,title,description,canonical)=>{const L=layout(locale);return `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#09131a"><meta name="description" content="${esc(description)}"><link rel="icon" href="/assets/brand/favicon.svg"><link rel="stylesheet" href="/assets/css/styles.css"><link rel="stylesheet" href="/assets/css/research-static.css"><link rel="stylesheet" href="/assets/css/geography-atlas.css">${L.baseHead(`${title} — ${cfg.site_name}`,description,canonical,'CollectionPage',Object.fromEntries(localeCodes.map(l=>[l,pagePath(l,canonical.replace(/^\/(?:pt-br\/)?/, '/'))])))}<title>${esc(title)} — ${esc(cfg.site_name)}</title>`;};

function card(item,locale){
  const L=layout(locale),b=bestView(item,locale),href=reportPath(item,b.locale),lang=cfg.locales[b.locale]?.lang||b.locale;
  const chips=(item.topics||[]).slice(0,4).map(id=>`<span>${esc(label(taxonomy.topics?.[id],locale,id))}</span>`).join('');
  return `<article class="research-card"><div class="research-card-meta"><span>${esc(label(taxonomy.programs?.[item.program],locale,item.program||item.kind))}</span><time datetime="${esc(item.date||'')}">${esc(date(locale,item.date))}</time></div><div class="chips">${chips}</div><h3><a href="${L.safe(href)}" lang="${esc(lang)}">${esc(b.view.title||item.title||item.id)}</a></h3><p>${esc(b.view.deck||item.deck||'')}</p><div class="research-card-actions"><a href="${L.safe(href)}">${locale==='pt-BR'?'Ler pesquisa':'Read research'} <span aria-hidden="true">→</span></a></div></article>`;
}
function collectionPage(locale,{eyebrow,title,description,items,canonical,active='research'}){
  const L=layout(locale),alts=Object.fromEntries(localeCodes.map(l=>[l,pagePath(l,canonical)]));
  const body=items.length?`<div class="research-list">${items.map(x=>card(x,locale)).join('')}</div>`:`<div class="panel"><p>${locale==='pt-BR'?'Ainda não há pesquisas publicadas nesta coleção.':'No research has been published in this collection yet.'}</p></div>`;
  return `<!doctype html><html lang="${esc(L.loc.lang)}"><head>${head(locale,title,description,pagePath(locale,canonical))}</head><body>${L.nav(active,alts)}<main><section class="page-hero"><div class="container"><div class="eyebrow dark">${esc(eyebrow)}</div><h1>${esc(title)}</h1><p>${esc(description)}</p></div></section><section class="section"><div class="container">${body}</div></section></main>${L.footer()}<script src="/assets/js/app.js"></script></body></html>`;
}
function hubPage(locale,type,entries,canonical,title,description,active='research'){
  const L=layout(locale),alts=Object.fromEntries(localeCodes.map(l=>[l,pagePath(l,canonical)]));
  const cards=entries.map(e=>`<article class="research-program"><span>${esc(String(e.count))}</span><h3><a href="${L.safe(pagePath(locale,e.path))}">${esc(e.label)}</a></h3><p>${esc(e.text||'')}</p></article>`).join('');
  return `<!doctype html><html lang="${esc(L.loc.lang)}"><head>${head(locale,title,description,pagePath(locale,canonical))}</head><body>${L.nav(active,alts)}<main><section class="page-hero"><div class="container"><div class="eyebrow dark">${esc(type)}</div><h1>${esc(title)}</h1><p>${esc(description)}</p></div></section><section class="section"><div class="container"><div class="research-programs">${cards}</div></div></section></main>${L.footer()}<script src="/assets/js/app.js"></script></body></html>`;
}


const countryName=(c,locale)=>{
  try{return new Intl.DisplayNames([locale==='pt-BR'?'pt-BR':'en'],{type:'region'}).of(c.code)||c.slug;}
  catch{return c.slug.split('-').map(x=>x[0]?.toUpperCase()+x.slice(1)).join(' ');}
};
const sortedItems=items=>[...(items||[])].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||(a.priority??99)-(b.priority??99));
const latestDossier=c=>sortedItems(c.items).find(x=>x.format==='country-dossier'||x.context_role==='country-context')||null;
const countryRegions=c=>[...new Set(c.items.flatMap(x=>x.geography?.regions||[]))];
const countryTopics=c=>[...new Set(c.items.flatMap(x=>x.topics||[]))];
const countryOutline=(item,locale)=>{
  if(!item)return[];
  const b=bestView(item,locale),md=String(b.view?.markdown_url||'').replace(/^\\//,'');
  if(!md||!fs.existsSync(path.join(root,md)))return[];
  return read(md).split(/\\r?\\n/).map(x=>x.match(/^##\\s+(.+)$/)?.[1]).filter(Boolean).filter(x=>!/^(?:Sources|Fontes)$/i.test(x)).slice(0,14);
};

function atlasCountryCard(c,locale){
  const L=layout(locale),name=countryName(c,locale),dossier=latestDossier(c),regions=countryRegions(c);
  const regionText=regions.map(id=>label(taxonomy.regions?.[id],locale,id)).join(' · ');
  const search=[name,c.code,regionText,...countryTopics(c).map(id=>label(taxonomy.topics?.[id],locale,id))].join(' ').toLowerCase();
  const deck=dossier?(bestView(dossier,locale).view.deck||''):(locale==='pt-BR'?'Cobertura relacionada no corpus da Marginal Thinking.':'Related coverage in the Marginal Thinking corpus.');
  const status=dossier?(locale==='pt-BR'?'Dossiê de país':'Country dossier'):(locale==='pt-BR'?'Cobertura de pesquisa':'Research coverage');
  const href=pagePath(locale,'/countries/'+c.slug+'/');
  return `<article class="atlas-country-card${dossier?' has-dossier':''}" data-atlas-card data-country-search="${esc(search)}" data-country-regions="${esc(regions.join(' '))}">
    <div class="atlas-country-card-top"><span class="atlas-country-code">${esc(c.code)}</span><span class="atlas-country-status">${esc(status)}</span></div>
    <h2><a href="${L.safe(href)}">${esc(name)}</a></h2>
    <p class="atlas-country-region">${esc(regionText||(locale==='pt-BR'?'Cobertura global':'Global coverage'))}</p>
    <p class="atlas-country-deck">${esc(deck)}</p>
    <div class="atlas-country-card-bottom"><span>${c.items.length} ${locale==='pt-BR'?(c.items.length===1?'publicação':'publicações'):(c.items.length===1?'publication':'publications')}</span><a href="${L.safe(href)}">${locale==='pt-BR'?'Abrir país':'Open country'} <span aria-hidden="true">→</span></a></div>
  </article>`;
}
function atlasIndexPage(locale){
  const L=layout(locale),canonical='/regions/',alts=Object.fromEntries(localeCodes.map(l=>[l,pagePath(l,canonical)]));
  const countries=[...countryMap.values()].sort((a,b)=>countryName(a,locale).localeCompare(countryName(b,locale),locale==='pt-BR'?'pt-BR':'en'));
  const dossierCount=countries.filter(c=>latestDossier(c)).length;
  const regionOptions=regionEntries.filter(e=>e.items.length).map(e=>`<option value="${esc(e.id)}">${esc(label(e.obj,locale,e.id))}</option>`).join('');
  const countryCards=countries.map(c=>atlasCountryCard(c,locale)).join('');
  const regionCards=regionEntries.filter(e=>e.items.length).map(e=>{
    const href=pagePath(locale,'/regions/'+e.id+'/');
    return `<a class="atlas-region-card" href="${L.safe(href)}"><span>${esc(String(e.items.length))}</span><strong>${esc(label(e.obj,locale,e.id))}</strong><small>${locale==='pt-BR'?'publicações relacionadas':'related publications'}</small></a>`;
  }).join('');
  const title=locale==='pt-BR'?'Atlas de Países & Regiões':'Country & Region Atlas';
  const description=locale==='pt-BR'?'Dossiês estruturais e pesquisas organizados geograficamente, com separação clara entre países com dossiê completo e cobertura contextual.':'Structural country dossiers and research organized geographically, separating full country dossiers from contextual coverage.';
  return `<!doctype html><html lang="${esc(L.loc.lang)}"><head>${head(locale,title,description,pagePath(locale,canonical))}</head><body>${L.nav('geography',alts)}<main>
  <section class="page-hero atlas-hero"><div class="container"><div class="eyebrow dark">${locale==='pt-BR'?'GEOGRAFIA · ATLAS':'GEOGRAPHY · ATLAS'}</div><h1>${esc(title)}</h1><p>${esc(description)}</p>
    <div class="atlas-stats" aria-label="${locale==='pt-BR'?'Cobertura do atlas':'Atlas coverage'}"><div><strong>${countries.length}</strong><span>${locale==='pt-BR'?'países com pesquisa':'countries with research'}</span></div><div><strong>${dossierCount}</strong><span>${locale==='pt-BR'?'dossiês completos':'full country dossiers'}</span></div><div><strong>${regionEntries.filter(e=>e.items.length).length}</strong><span>${locale==='pt-BR'?'regiões cobertas':'covered regions'}</span></div></div>
  </div></section>
  <section class="section atlas-section"><div class="container">
    <div class="atlas-section-head"><div><div class="eyebrow">${locale==='pt-BR'?'PAÍSES':'COUNTRIES'}</div><h2>${locale==='pt-BR'?'Dossiês e cobertura por país':'Country dossiers and coverage'}</h2><p>${locale==='pt-BR'?'Busque pelo país ou filtre por região. Países com dossiê possuem análise histórica, econômica, política e social própria.':'Search by country or filter by region. Countries with a dossier have dedicated historical, economic, political and social analysis.'}</p></div><output id="atlas-results-count" aria-live="polite">${countries.length}</output></div>
    <div class="atlas-toolbar"><label><span>${locale==='pt-BR'?'Buscar país':'Search country'}</span><input id="atlas-country-search" type="search" placeholder="${locale==='pt-BR'?'Ex.: Brasil, Índia, África...':'e.g. Brazil, India, Africa...'}" autocomplete="off"></label><label><span>${locale==='pt-BR'?'Região':'Region'}</span><select id="atlas-region-filter"><option value="">${locale==='pt-BR'?'Todas as regiões':'All regions'}</option>${regionOptions}</select></label></div>
    <div class="atlas-country-grid" id="atlas-country-grid">${countryCards}</div>
    <div class="atlas-empty" id="atlas-empty" hidden>${locale==='pt-BR'?'Nenhum país corresponde aos filtros atuais.':'No country matches the current filters.'}</div>
  </div></section>
  <section class="section atlas-regions"><div class="container"><div class="atlas-section-head"><div><div class="eyebrow">${locale==='pt-BR'?'REGIÕES':'REGIONS'}</div><h2>${locale==='pt-BR'?'Navegar por região':'Browse by region'}</h2><p>${locale==='pt-BR'?'Coleções regionais agregam pesquisas sem substituir os dossiês de país.':'Regional collections aggregate research without replacing country dossiers.'}</p></div></div><div class="atlas-region-grid">${regionCards}</div></div></section>
  </main>${L.footer()}<script src="/assets/js/app.js"></script><script src="/assets/js/geography-atlas.js"></script></body></html>`;
}
function countryHubPage(locale,c){
  const L=layout(locale),name=countryName(c,locale),canonical='/countries/'+c.slug+'/',alts=Object.fromEntries(localeCodes.map(l=>[l,pagePath(l,canonical)]));
  const items=sortedItems(c.items),dossier=latestDossier(c),regions=countryRegions(c),topics=countryTopics(c);
  const regionLinks=regions.map(id=>`<a href="${L.safe(pagePath(locale,'/regions/'+id+'/'))}">${esc(label(taxonomy.regions?.[id],locale,id))}</a>`).join(' · ');
  const outline=dossier?countryOutline(dossier,locale):[];
  const dossierBlock=dossier?(()=>{
    const b=bestView(dossier,locale),href=reportPath(dossier,b.locale);
    return `<section class="country-dossier-feature"><div class="country-dossier-kicker">${locale==='pt-BR'?'DOSSIÊ ESTRUTURAL MAIS RECENTE':'LATEST STRUCTURAL DOSSIER'} · ${esc(date(locale,dossier.date))}</div><h2><a href="${L.safe(href)}">${esc(b.view.title||dossier.title)}</a></h2><p>${esc(b.view.deck||dossier.deck||'')}</p><div class="country-dossier-actions"><a class="atlas-primary-link" href="${L.safe(href)}">${locale==='pt-BR'?'Ler dossiê completo':'Read full dossier'} <span aria-hidden="true">→</span></a><span>${outline.length} ${locale==='pt-BR'?'seções analíticas':'analytical sections'}</span></div>${outline.length?`<div class="country-outline"><h3>${locale==='pt-BR'?'O que o dossiê cobre':'What the dossier covers'}</h3><ol>${outline.map(h=>`<li><a href="${L.safe(href)}#${slug(h)}">${esc(h)}</a></li>`).join('')}</ol></div>`:''}</section>`;
  })():`<section class="country-dossier-feature is-coverage"><div class="country-dossier-kicker">${locale==='pt-BR'?'COBERTURA CONTEXTUAL':'CONTEXTUAL COVERAGE'}</div><h2>${locale==='pt-BR'?'Dossiê estrutural ainda não publicado':'Structural dossier not yet published'}</h2><p>${locale==='pt-BR'?'Este país aparece em pesquisas canônicas, mas ainda não possui um dossiê de país dedicado.':'This country appears in canonical research but does not yet have a dedicated country dossier.'}</p></section>`;
  const topicChips=topics.slice(0,10).map(id=>`<span>${esc(label(taxonomy.topics?.[id],locale,id))}</span>`).join('');
  const description=dossier?(bestView(dossier,locale).view.deck||''):(locale==='pt-BR'?('Pesquisas da Marginal Thinking relacionadas a '+name+'.'):('Marginal Thinking research related to '+name+'.'));
  return `<!doctype html><html lang="${esc(L.loc.lang)}"><head>${head(locale,name,description,pagePath(locale,canonical))}</head><body>${L.nav('geography',alts)}<main>
    <section class="page-hero country-hero"><div class="container"><div class="country-hero-meta"><span class="atlas-country-code large">${esc(c.code)}</span><span>${regionLinks}</span></div><h1>${esc(name)}</h1><p>${esc(description)}</p><div class="country-hero-stats"><span><strong>${items.length}</strong> ${locale==='pt-BR'?(items.length===1?'publicação':'publicações'):(items.length===1?'publication':'publications')}</span><span><strong>${dossier?'1':'0'}</strong> ${locale==='pt-BR'?'dossiê estrutural':'structural dossier'}</span></div></div></section>
    <section class="section country-hub"><div class="container"><div class="country-hub-grid"><div>${dossierBlock}</div><aside class="country-context-panel"><div class="eyebrow">${locale==='pt-BR'?'EIXOS DE COBERTURA':'COVERAGE AXES'}</div><div class="country-topic-chips">${topicChips}</div></aside></div>
    <div class="country-research-archive"><div class="atlas-section-head"><div><div class="eyebrow">CORPUS</div><h2>${locale==='pt-BR'?'Pesquisa relacionada':'Related research'}</h2><p>${locale==='pt-BR'?'Publicações canônicas em que o país é material para a análise.':'Canonical publications where the country is material to the analysis.'}</p></div></div><div class="research-list">${items.map(x=>card(x,locale)).join('')}</div></div>
    </div></section>
  </main>${L.footer()}<script src="/assets/js/app.js"></script></body></html>`;
}

const programEntries=Object.entries(taxonomy.programs||{}).map(([id,obj])=>({id,obj,items:reports.filter(r=>r.program===id)}));
const regionEntries=Object.entries(taxonomy.regions||{}).map(([id,obj])=>({id,obj,items:reports.filter(r=>(r.geography?.regions||[]).includes(id))}));
const countryMap=new Map();
for(const r of reports)for(const c of r.geography?.countries||[]){if(!countryMap.has(c.slug))countryMap.set(c.slug,{code:c.code,slug:c.slug,items:[]});countryMap.get(c.slug).items.push(r);}
const topicEntries=Object.entries(taxonomy.topics||{}).map(([id,obj])=>({id,obj,items:reports.filter(r=>(r.topics||[]).includes(id))}));

const topicDir=path.join(out,'topics');
if(fs.existsSync(topicDir))fs.rmSync(topicDir,{recursive:true,force:true});
for(const locale of localeCodes){
  const researchTitle=locale==='pt-BR'?'Linhas de pesquisa':'Research programs';
  const researchDesc=locale==='pt-BR'?'As quatro linhas permanentes que organizam a pesquisa da Marginal Thinking.':'The four permanent programs that organize Marginal Thinking research.';
  write(pagePath(locale,'/research/index.html'),hubPage(locale,'RESEARCH',programEntries.map(e=>({label:label(e.obj,locale,e.id),count:e.items.length,path:`/research/${e.id}/`,text:locale==='pt-BR'?'Publicações desta linha de pesquisa.':'Publications in this research program.'})),'/research/',researchTitle,researchDesc));
  for(const e of programEntries)write(pagePath(locale,`/research/${e.id}/index.html`),collectionPage(locale,{eyebrow:locale==='pt-BR'?'LINHA DE PESQUISA':'RESEARCH PROGRAM',title:label(e.obj,locale,e.id),description:locale==='pt-BR'?'Pesquisas desta linha, organizadas por data.':'Research in this program, organized by date.',items:e.items,canonical:`/research/${e.id}/`}));

  const regionDesc=locale==='pt-BR'?'Pesquisas organizadas por país e região.':'Research organized by country and region.';
  write(pagePath(locale,'/regions/index.html'),atlasIndexPage(locale));
  for(const e of regionEntries)write(pagePath(locale,`/regions/${e.id}/index.html`),collectionPage(locale,{eyebrow:locale==='pt-BR'?'REGIÃO':'REGION',title:label(e.obj,locale,e.id),description:regionDesc,items:e.items,canonical:`/regions/${e.id}/`,active:'geography'}));
  for(const c of countryMap.values())write(pagePath(locale,`/countries/${c.slug}/index.html`),countryHubPage(locale,c));
  for(const e of topicEntries)write(pagePath(locale,`/topics/${e.id}/index.html`),collectionPage(locale,{eyebrow:locale==='pt-BR'?'TEMA':'TOPIC',title:label(e.obj,locale,e.id),description:locale==='pt-BR'?'Pesquisas relacionadas a este tema.':'Research related to this topic.',items:e.items,canonical:`/topics/${e.id}/`}));
}

function shared(a,b){const bs=new Set(b||[]);return (a||[]).filter(x=>bs.has(x)).length;}
function relatedFor(item){
  return reports.filter(x=>x.id!==item.id).map(x=>{
    let score=0;
    if(x.program&&x.program===item.program)score+=100;
    score+=40*shared(item.geography?.countries?.map(c=>c.code),x.geography?.countries?.map(c=>c.code));
    score+=20*shared(item.geography?.regions,x.geography?.regions);
    score+=10*shared(item.topics,x.topics);
    if((item.related_programs||[]).includes(x.program)||(x.related_programs||[]).includes(item.program))score+=5;
    score+=shared(item.tags,x.tags);
    return{x,score};
  }).filter(v=>v.score>0).sort((a,b)=>b.score-a.score||String(b.x.date||'').localeCompare(String(a.x.date||''))).slice(0,3).map(v=>v.x);
}
for(const item of reports){
  const relItems=relatedFor(item);
  for(const locale of availableLocales(item).filter(l=>cfg.locales[l])){
    const file=path.join(out,reportPath(item,locale).replace(/^\//,''));
    if(!fs.existsSync(file))continue;
    let html=fs.readFileSync(file,'utf8');
    const L=layout(locale),title=locale==='pt-BR'?'Pesquisas relacionadas':'Related research';
    const section=relItems.length?`<section class="related-research"><div class="section-head"><h2>${title}</h2><a href="${pagePath(locale,'/reports.html')}">${locale==='pt-BR'?'Arquivo completo':'Full archive'}</a></div><div class="related-grid">${relItems.map(x=>{const b=bestView(x,locale),href=reportPath(x,b.locale);return `<article class="related-card"><div class="small">${esc(label(taxonomy.programs?.[x.program],locale,x.kind))} · ${esc(date(locale,x.date))}</div><h3><a href="${L.safe(href)}">${esc(b.view.title||x.title)}</a></h3><p>${esc(b.view.deck||x.deck||'')}</p></article>`;}).join('')}</div></section>`:'';
    if(/<section class="related-research">[\s\S]*?<\/section>/.test(html))html=html.replace(/<section class="related-research">[\s\S]*?<\/section>/,section);
    else if(section)html=html.replace('</main><aside class="report-side">',`${section}</main><aside class="report-side">`);
    fs.writeFileSync(file,html);
  }
}

const sitemap=path.join(out,'sitemap.xml');
if(fs.existsSync(sitemap)){
  let xml=fs.readFileSync(sitemap,'utf8');
  xml=xml.replace(/<url><loc>[^<]*\/topics\/[^<]*<\/loc>[\s\S]*?<\/url>/g,'');
  const extra=[];
  for(const locale of localeCodes){
    for(const p of ['/research/','/regions/'])extra.push(`${site}${pagePath(locale,p)}`);
    for(const e of programEntries)extra.push(`${site}${pagePath(locale,`/research/${e.id}/`)}`);
    for(const e of regionEntries)extra.push(`${site}${pagePath(locale,`/regions/${e.id}/`)}`);
    for(const c of countryMap.values())extra.push(`${site}${pagePath(locale,`/countries/${c.slug}/`)}`);
    for(const e of topicEntries)extra.push(`${site}${pagePath(locale,`/topics/${e.id}/`)}`);
  }
  const entries=[...new Set(extra)].map(u=>`<url><loc>${esc(u)}</loc><lastmod>${iso(reports[0]?.date)}</lastmod></url>`).join('');
  xml=xml.replace('</urlset>',`${entries}</urlset>`);
  fs.writeFileSync(sitemap,xml);
}
console.log(`Controlled taxonomy collections rendered: ${programEntries.length} programs, ${regionEntries.length} regions, ${countryMap.size} countries, ${topicEntries.length} topics.`);
