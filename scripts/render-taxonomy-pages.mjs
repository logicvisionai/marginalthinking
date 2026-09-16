import fs from 'node:fs';
import path from 'node:path';
import {esc} from './lib/markdown.mjs';
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
const head=(locale,title,description,canonical)=>{const L=layout(locale);return `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#09131a"><meta name="description" content="${esc(description)}"><link rel="icon" href="/assets/brand/favicon.svg"><link rel="stylesheet" href="/assets/css/styles.css"><link rel="stylesheet" href="/assets/css/research-static.css">${L.baseHead(`${title} — ${cfg.site_name}`,description,canonical,'CollectionPage',Object.fromEntries(localeCodes.map(l=>[l,pagePath(l,canonical.replace(/^\/(?:pt-br\/)?/, '/'))])))}<title>${esc(title)} — ${esc(cfg.site_name)}</title>`;};

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
function hubPage(locale,type,entries,canonical,title,description){
  const L=layout(locale),alts=Object.fromEntries(localeCodes.map(l=>[l,pagePath(l,canonical)]));
  const cards=entries.map(e=>`<article class="research-program"><span>${esc(String(e.count))}</span><h3><a href="${L.safe(pagePath(locale,e.path))}">${esc(e.label)}</a></h3><p>${esc(e.text||'')}</p></article>`).join('');
  return `<!doctype html><html lang="${esc(L.loc.lang)}"><head>${head(locale,title,description,pagePath(locale,canonical))}</head><body>${L.nav('research',alts)}<main><section class="page-hero"><div class="container"><div class="eyebrow dark">${esc(type)}</div><h1>${esc(title)}</h1><p>${esc(description)}</p></div></section><section class="section"><div class="container"><div class="research-programs">${cards}</div></div></section></main>${L.footer()}<script src="/assets/js/app.js"></script></body></html>`;
}

const programEntries=Object.entries(taxonomy.programs||{}).map(([id,obj])=>({id,obj,items:reports.filter(r=>r.program===id)}));
const regionEntries=Object.entries(taxonomy.regions||{}).map(([id,obj])=>({id,obj,items:reports.filter(r=>(r.geography?.regions||[]).includes(id))}));
const countryMap=new Map();
for(const r of reports)for(const c of r.geography?.countries||[]){if(!countryMap.has(c.slug))countryMap.set(c.slug,{code:c.code,slug:c.slug,items:[]});countryMap.get(c.slug).items.push(r);}
const topicEntries=Object.entries(taxonomy.topics||{}).map(([id,obj])=>({id,obj,items:reports.filter(r=>(r.topics||[]).includes(id))}));

const topicDir=path.join(out,'topics');
if(fs.existsSync(topicDir))fs.rmSync(topicDir,{recursive:true,force:true});
for(const locale of localeCodes){
  const researchTitle=locale==='pt-BR'?'Programas de pesquisa':'Research programs';
  const researchDesc=locale==='pt-BR'?'As quatro linhas permanentes que organizam a pesquisa da Marginal Thinking.':'The four permanent programs that organize Marginal Thinking research.';
  write(pagePath(locale,'/research/index.html'),hubPage(locale,'RESEARCH',programEntries.map(e=>({label:label(e.obj,locale,e.id),count:e.items.length,path:`/research/${e.id}/`,text:locale==='pt-BR'?'Pesquisa organizada por programa editorial permanente.':'Research organized by permanent editorial program.'})),'/research/',researchTitle,researchDesc));
  for(const e of programEntries)write(pagePath(locale,`/research/${e.id}/index.html`),collectionPage(locale,{eyebrow:locale==='pt-BR'?'PROGRAMA DE PESQUISA':'RESEARCH PROGRAM',title:label(e.obj,locale,e.id),description:locale==='pt-BR'?'Pesquisas classificadas neste programa editorial.':'Research classified under this editorial program.',items:e.items,canonical:`/research/${e.id}/`}));

  const regionTitle=locale==='pt-BR'?'Países & Regiões':'Countries & Regions';
  const regionDesc=locale==='pt-BR'?'Acesso geográfico às pesquisas sem transformar países em verticais editoriais.':'Geographic access to research without turning countries into editorial verticals.';
  const geographicEntries=[...regionEntries.map(e=>({label:label(e.obj,locale,e.id),count:e.items.length,path:`/regions/${e.id}/`,text:locale==='pt-BR'?'Coleção regional.':'Regional collection.'})),...Array.from(countryMap.values()).map(c=>({label:c.slug.split('-').map(x=>x[0]?.toUpperCase()+x.slice(1)).join(' '),count:c.items.length,path:`/countries/${c.slug}/`,text:`${c.code} · ${locale==='pt-BR'?'coleção por país':'country collection'}`}))];
  write(pagePath(locale,'/regions/index.html'),hubPage(locale,locale==='pt-BR'?'GEOGRAFIA':'GEOGRAPHY',geographicEntries,'/regions/',regionTitle,regionDesc));
  for(const e of regionEntries)write(pagePath(locale,`/regions/${e.id}/index.html`),collectionPage(locale,{eyebrow:locale==='pt-BR'?'REGIÃO':'REGION',title:label(e.obj,locale,e.id),description:regionDesc,items:e.items,canonical:`/regions/${e.id}/`}));
  for(const c of countryMap.values()){
    const name=c.slug.split('-').map(x=>x[0]?.toUpperCase()+x.slice(1)).join(' ');
    write(pagePath(locale,`/countries/${c.slug}/index.html`),collectionPage(locale,{eyebrow:locale==='pt-BR'?'PAÍS':'COUNTRY',title:name,description:locale==='pt-BR'?`Pesquisas relacionadas a ${name}.`:`Research related to ${name}.`,items:c.items,canonical:`/countries/${c.slug}/`}));
  }
  for(const e of topicEntries)write(pagePath(locale,`/topics/${e.id}/index.html`),collectionPage(locale,{eyebrow:locale==='pt-BR'?'TÓPICO':'TOPIC',title:label(e.obj,locale,e.id),description:locale==='pt-BR'?'Coleção baseada na taxonomia analítica controlada da Marginal Thinking.':'Collection based on Marginal Thinking’s controlled analytical taxonomy.',items:e.items,canonical:`/topics/${e.id}/`}));
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
