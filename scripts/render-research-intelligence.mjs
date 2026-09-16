import fs from 'node:fs';
import path from 'node:path';
import {esc} from './lib/markdown.mjs';
import {collectReports,availableLocales} from './lib/reports.mjs';
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
const label=(obj,locale,fallback)=>obj?.[locale]||obj?.en||fallback;
const countBy=(values)=>{const map=new Map();for(const value of values.filter(Boolean))map.set(value,(map.get(value)||0)+1);return map;};
const sortedCounts=map=>[...map.entries()].map(([id,count])=>({id,count})).sort((a,b)=>b.count-a.count||String(a.id).localeCompare(String(b.id)));
const slugTitle=s=>String(s||'').split('-').filter(Boolean).map(x=>x[0]?.toUpperCase()+x.slice(1)).join(' ');
const countryName=(locale,code,slug)=>{try{return new Intl.DisplayNames([locale],{type:'region'}).of(code)||slugTitle(slug);}catch{return slugTitle(slug);}};
const dateLabel=(locale,value)=>{const [y,m]=String(value).split('-').map(Number);return new Intl.DateTimeFormat(cfg.locales[locale]?.date_locale||locale,{month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(y,m-1,1)));};

if(!reports.length)throw new Error('Research intelligence requires at least one published report.');

const programCounts=countBy(reports.map(r=>r.program));
const regionCounts=countBy(reports.flatMap(r=>r.geography?.regions||[]));
const topicCounts=countBy(reports.flatMap(r=>r.topics||[]));
const formatCounts=countBy(reports.map(r=>r.format));
const cadenceCounts=countBy(reports.map(r=>r.cadence));
const monthlyCounts=countBy(reports.map(r=>String(r.date||'').slice(0,7)).filter(x=>/^\d{4}-\d{2}$/.test(x)));
const countryMap=new Map();
for(const r of reports)for(const c of r.geography?.countries||[]){
  const key=c.code||c.slug;
  if(!key)continue;
  if(!countryMap.has(key))countryMap.set(key,{code:c.code||'',slug:c.slug||String(c.code||'').toLowerCase(),count:0});
  countryMap.get(key).count++;
}
const countries=[...countryMap.values()].sort((a,b)=>b.count-a.count||a.slug.localeCompare(b.slug));
const languageAvailability=Object.fromEntries(localeCodes.map(locale=>[locale,reports.filter(r=>availableLocales(r).includes(locale)).length]));
const multilingualCount=reports.filter(r=>localeCodes.every(locale=>availableLocales(r).includes(locale))).length;
const dates=reports.map(r=>String(r.date||'').slice(0,10)).filter(Boolean).sort();

const intelligence={
  schema_version:1,
  taxonomy_version:taxonomy.version||null,
  generated_from_latest_publication:dates.at(-1)||null,
  counting_rule:'One canonical research item equals one publication regardless of the number of language versions.',
  totals:{
    publications:reports.length,
    countries:countries.length,
    active_topics:sortedCounts(topicCounts).filter(x=>x.count>0).length,
    programs:Object.keys(taxonomy.programs||{}).length,
    multilingual_publications:multilingualCount,
    earliest_publication:dates[0]||null,
    latest_publication:dates.at(-1)||null
  },
  language_availability:languageAvailability,
  programs:Object.entries(taxonomy.programs||{}).map(([id,obj])=>({id,count:programCounts.get(id)||0,label:Object.fromEntries(localeCodes.map(locale=>[locale,label(obj,locale,id)]))})),
  regions:Object.entries(taxonomy.regions||{}).map(([id,obj])=>({id,count:regionCounts.get(id)||0,label:Object.fromEntries(localeCodes.map(locale=>[locale,label(obj,locale,id)]))})),
  countries:countries.map(c=>({...c,label:Object.fromEntries(localeCodes.map(locale=>[locale,countryName(locale,c.code,c.slug)]))})),
  topics:Object.entries(taxonomy.topics||{}).map(([id,obj])=>({id,count:topicCounts.get(id)||0,label:Object.fromEntries(localeCodes.map(locale=>[locale,label(obj,locale,id)]))})),
  formats:sortedCounts(formatCounts),
  cadences:sortedCounts(cadenceCounts),
  activity_by_month:sortedCounts(monthlyCounts).sort((a,b)=>a.id.localeCompare(b.id))
};
write('/data/research-intelligence.json',JSON.stringify(intelligence,null,2));

function bars(locale,entries,{href,limit=12}={}){
  const visible=entries.filter(x=>x.count>0).slice(0,limit),max=Math.max(1,...visible.map(x=>x.count));
  return visible.map(x=>{const text=x.label?.[locale]||x.label?.en||x.id,link=href?.(x);return `<div class="coverage-row"><div class="coverage-row-head">${link?`<a href="${esc(pagePath(locale,link))}">${esc(text)}</a>`:`<span>${esc(text)}</span>`}<strong>${x.count}</strong></div><div class="coverage-track" aria-hidden="true"><i style="width:${Math.max(4,Math.round((x.count/max)*100))}%"></i></div></div>`;}).join('');
}
function activityBars(locale){
  const entries=intelligence.activity_by_month,max=Math.max(1,...entries.map(x=>x.count));
  return entries.map(x=>`<div class="activity-col"><div class="activity-value">${x.count}</div><div class="activity-bar" aria-hidden="true"><i style="height:${Math.max(8,Math.round((x.count/max)*100))}%"></i></div><div class="activity-label">${esc(dateLabel(locale,x.id))}</div></div>`).join('');
}
function page(locale){
  const L=layout(locale),pt=locale==='pt-BR',canonical=pagePath(locale,'/research/coverage/'),alts=Object.fromEntries(localeCodes.map(l=>[l,pagePath(l,'/research/coverage/')]));
  const title=pt?'Cobertura de pesquisa':'Research coverage';
  const description=pt?'Visão derivada do acervo publicado: atividade, cobertura geográfica e temática e disponibilidade por idioma, sem duplicar pesquisas traduzidas.':'A derived view of the published corpus: activity, geographic and thematic coverage, and language availability without double-counting translated research.';
  const head=`<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#09131a"><meta name="description" content="${esc(description)}"><link rel="icon" href="/assets/brand/favicon.svg"><link rel="stylesheet" href="/assets/css/styles.css"><link rel="stylesheet" href="/assets/css/research-static.css"><link rel="stylesheet" href="/assets/css/research-intelligence.css">${L.baseHead(`${title} — ${cfg.site_name}`,description,canonical,'CollectionPage',alts)}<title>${esc(title)} — ${esc(cfg.site_name)}</title>`;
  const programEntries=intelligence.programs.slice().sort((a,b)=>b.count-a.count);
  const regionEntries=intelligence.regions.slice().sort((a,b)=>b.count-a.count);
  const countryEntries=intelligence.countries;
  const topicEntries=intelligence.topics.slice().sort((a,b)=>b.count-a.count);
  const langRows=localeCodes.map(code=>{const n=languageAvailability[code]||0,pct=Math.round((n/reports.length)*100),name=cfg.locales[code]?.label||code;return `<div class="language-row"><span>${esc(name)}</span><strong>${n}/${reports.length}</strong><div class="coverage-track"><i style="width:${pct}%"></i></div></div>`;}).join('');
  const summary=[
    [reports.length,pt?'pesquisas':'research items'],
    [countries.length,pt?'países cobertos':'countries covered'],
    [intelligence.totals.active_topics,pt?'tópicos ativos':'active topics'],
    [`${multilingualCount}/${reports.length}`,pt?'disponíveis em todos os idiomas':'available in every language']
  ].map(([value,text])=>`<div class="intelligence-stat"><strong>${esc(value)}</strong><span>${esc(text)}</span></div>`).join('');
  return `<!doctype html><html lang="${esc(L.loc.lang)}"><head>${head}</head><body>${L.nav('research',alts)}<main><section class="page-hero"><div class="container"><div class="eyebrow dark">${pt?'INTELIGÊNCIA DO ACERVO':'CORPUS INTELLIGENCE'}</div><h1>${title}</h1><p>${description}</p></div></section><section class="section"><div class="container"><div class="intelligence-stats">${summary}</div><div class="intelligence-grid"><section class="intelligence-panel intelligence-wide"><div class="section-head"><h2>${pt?'Atividade de pesquisa':'Research activity'}</h2><span>${esc(intelligence.totals.earliest_publication)} → ${esc(intelligence.totals.latest_publication)}</span></div><div class="activity-chart">${activityBars(locale)}</div></section><section class="intelligence-panel"><div class="section-head"><h2>${pt?'Programas':'Programs'}</h2></div>${bars(locale,programEntries,{href:x=>`/research/${x.id}/`})}</section><section class="intelligence-panel"><div class="section-head"><h2>${pt?'Regiões':'Regions'}</h2></div>${bars(locale,regionEntries,{href:x=>`/regions/${x.id}/`})}</section><section class="intelligence-panel"><div class="section-head"><h2>${pt?'Países com maior cobertura':'Most-covered countries'}</h2></div>${bars(locale,countryEntries,{href:x=>`/countries/${x.slug}/`,limit:10})}</section><section class="intelligence-panel"><div class="section-head"><h2>${pt?'Tópicos com maior cobertura':'Most-covered topics'}</h2></div>${bars(locale,topicEntries,{href:x=>`/topics/${x.id}/`,limit:10})}</section><section class="intelligence-panel intelligence-wide"><div class="section-head"><h2>${pt?'Disponibilidade por idioma':'Language availability'}</h2></div><div class="language-grid">${langRows}</div><p class="intelligence-note">${pt?'As traduções não aumentam o número total de pesquisas. Cada ID canônico é contado uma única vez.':'Translations do not increase the research total. Each canonical ID is counted once.'}</p></section><section class="intelligence-panel intelligence-wide methodology-note"><h2>${pt?'Como ler esta página':'How to read this page'}</h2><p>${pt?'Todos os números são derivados automaticamente dos metadados canônicos durante o build. Não há classificação manual adicional, banco de dados separado ou chamada a agentes para manter estes indicadores. Os gráficos mostram cobertura editorial, não importância, qualidade ou prioridade dos países e temas.':'All figures are derived automatically from canonical metadata during the build. There is no extra manual classification, separate database, or agent call required to maintain these indicators. Charts describe editorial coverage, not the importance, quality, or priority of countries and topics.'}</p><p class="small">${pt?'Taxonomia':'Taxonomy'} v${esc(taxonomy.version||'—')} · ${pt?'última publicação incluída':'latest publication included'} ${esc(intelligence.totals.latest_publication||'—')}</p></section></div></div></section></main>${L.footer()}<script src="/assets/js/app.js"></script></body></html>`;
}

for(const locale of localeCodes)write(pagePath(locale,'/research/coverage/index.html'),page(locale));

// Localize country display names after the taxonomy renderer has created its pages.
for(const c of countries){
  for(const locale of localeCodes){
    const oldName=slugTitle(c.slug),newName=countryName(locale,c.code,c.slug);
    if(!newName||oldName===newName)continue;
    for(const rel of [pagePath(locale,'/regions/index.html'),pagePath(locale,`/countries/${c.slug}/index.html`)]){
      const file=path.join(out,rel.replace(/^\//,''));
      if(!fs.existsSync(file))continue;
      const html=fs.readFileSync(file,'utf8').split(oldName).join(newName);
      fs.writeFileSync(file,html);
    }
  }
}

// Add a single derived-intelligence entry to the research hub; no new top-level navigation item.
for(const locale of localeCodes){
  const file=path.join(out,pagePath(locale,'/research/index.html').replace(/^\//,''));
  if(!fs.existsSync(file))continue;
  let html=fs.readFileSync(file,'utf8');
  if(html.includes('research-intelligence-entry'))continue;
  const pt=locale==='pt-BR',entry=`<article class="research-program research-intelligence-entry"><span>${reports.length}</span><h3><a href="${esc(pagePath(locale,'/research/coverage/'))}">${pt?'Cobertura de pesquisa':'Research coverage'}</a></h3><p>${pt?'Métricas derivadas do acervo, sem duplicar versões traduzidas.':'Derived corpus metrics without double-counting translated versions.'}</p></article>`;
  html=html.replace(/(<div class="research-programs">)([\s\S]*?)(<\/div>)/,`$1$2${entry}$3`);
  fs.writeFileSync(file,html);
}

const sitemap=path.join(out,'sitemap.xml');
if(fs.existsSync(sitemap)){
  let xml=fs.readFileSync(sitemap,'utf8');
  const entries=localeCodes.map(locale=>`${site}${pagePath(locale,'/research/coverage/')}`).filter(url=>!xml.includes(`<loc>${url}</loc>`)).map(url=>`<url><loc>${esc(url)}</loc><lastmod>${esc(intelligence.totals.latest_publication||'')}</lastmod></url>`).join('');
  if(entries)xml=xml.replace('</urlset>',`${entries}</urlset>`);
  fs.writeFileSync(sitemap,xml);
}

console.log(`Research intelligence rendered: ${reports.length} canonical publications, ${countries.length} countries, ${multilingualCount} fully multilingual.`);
