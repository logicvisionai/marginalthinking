import fs from 'node:fs';
import path from 'node:path';
import {esc} from './lib/markdown.mjs';
import {collectReports,reportView} from './lib/reports.mjs';
import {makeLayout} from './lib/layout.mjs';

const root=process.cwd(),out=path.join(root,'dist');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const cfg=JSON.parse(read('site.config.json'));
const i18n=JSON.parse(read('data/i18n.json'));
const taxonomy=JSON.parse(read('data/taxonomy.json'));
const reports=collectReports(root);
const site=cfg.site_url.replace(/\/$/,'');
const author=cfg.default_author,social=`${site}${cfg.social_image}`,locales=Object.keys(cfg.locales||{});
const pagePath=(locale,p)=>{const prefix=cfg.locales[locale]?.path?`/${cfg.locales[locale].path}`:'';return `${prefix}${p}`.replace(/\/+/g,'/');};
const reportPath=(item,locale)=>pagePath(locale,item.url);
const layout=locale=>makeLayout({cfg,i18n,site,author,social,locale,reportPath,pagePath});
const write=(p,s)=>{const target=path.join(out,String(p).replace(/^\//,''));fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,s);};
const date=(locale,v)=>{if(!v)return'';const d=new Date(String(v).length===10?`${v}T12:00:00-03:00`:v);return new Intl.DateTimeFormat(cfg.locales[locale]?.date_locale||'en-US',{day:'2-digit',month:'long',year:'numeric',timeZone:'America/Sao_Paulo'}).format(d);};
const label=(obj,locale,fallback)=>obj?.[locale]||obj?.en||fallback;
const bestView=(item,locale)=>{const direct=reportView(item,locale);if(direct)return{view:direct,locale};const source=item.source_locale||cfg.legacy_source_locale;return{view:reportView(item,source)||item,locale:source};};
const head=(locale,title,description,canonical,alts)=>{const L=layout(locale);return `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#09131a"><meta name="description" content="${esc(description)}"><link rel="icon" href="/assets/brand/favicon.svg"><link rel="stylesheet" href="/assets/css/styles.css"><link rel="stylesheet" href="/assets/css/research-static.css">${L.baseHead(`${title} — ${cfg.site_name}`,description,canonical,'CollectionPage',alts)}<title>${esc(title)} — ${esc(cfg.site_name)}</title>`;};

function card(item,locale){
  const L=layout(locale),b=bestView(item,locale),href=reportPath(item,b.locale),lang=cfg.locales[b.locale]?.lang||b.locale,s=taxonomy.series?.[item.series],d=s?.domains?.[item.series_domain];
  const chips=(item.topics||[]).slice(0,4).map(id=>`<span>${esc(label(taxonomy.topics?.[id],locale,id))}</span>`).join('');
  return `<article class="research-card"><div class="research-card-meta"><span>${esc(label(d,locale,item.series_domain||item.program))}</span><time datetime="${esc(item.date||'')}">${esc(date(locale,item.date))}</time></div><div class="chips">${chips}</div><h3><a href="${L.safe(href)}" lang="${esc(lang)}">${esc(b.view.title||item.title||item.id)}</a></h3><p>${esc(b.view.deck||item.deck||'')}</p><div class="research-card-actions"><a href="${L.safe(href)}">${locale==='pt-BR'?'Ler pesquisa':'Read research'} <span aria-hidden="true">→</span></a></div></article>`;
}

function collection(locale,id,s,domain=null){
  const L=layout(locale),base=`/series/${id}/`,canonical=domain?`${base}${domain}/`:base,alts=Object.fromEntries(locales.map(l=>[l,pagePath(l,canonical)]));
  const seriesLabel=label(s,locale,id),domainLabel=domain?label(s.domains?.[domain],locale,domain):'';
  const title=domain?domainLabel:seriesLabel;
  const description=domain
    ?label(s.domains?.[domain]?.description,locale,locale==='pt-BR'?`Pesquisas de ${domainLabel} dentro da série ${seriesLabel}.`:`${domainLabel} research within the ${seriesLabel} series.`)
    :label(s.description,locale,locale==='pt-BR'?'Pesquisa controlada da Marginal Thinking.':'Controlled Marginal Thinking research series.');
  const items=reports.filter(r=>r.series===id&&(!domain||r.series_domain===domain));
  const domains=!domain?`<div class="research-programs">${Object.entries(s.domains||{}).map(([d,obj])=>{const n=reports.filter(r=>r.series===id&&r.series_domain===d).length,desc=label(obj.description,locale,locale==='pt-BR'?'Pesquisa neste domínio.':'Research in this domain.');return `<article class="research-program"><span>${n}</span><h3><a href="${pagePath(locale,`${base}${d}/`)}">${esc(label(obj,locale,d))}</a></h3><p>${esc(desc)}</p></article>`;}).join('')}</div>`:'';
  const body=items.length?`<div class="research-list">${items.map(x=>card(x,locale)).join('')}</div>`:`<div class="panel"><p>${locale==='pt-BR'?'Ainda não há pesquisas publicadas neste domínio.':'No research has been published in this domain yet.'}</p></div>`;
  const chain=label(s.analytical_chain,locale,'');
  const intro=!domain&&chain?`<section class="section research-standard"><div class="container research-standard-grid"><h2>${locale==='pt-BR'?'Cadeia analítica':'Analytical chain'}</h2><p>${esc(chain)}. <a href="${pagePath(locale,'/methodology.html')}">${locale==='pt-BR'?'Método':'Method'} →</a></p></div></section>`:'';
  return `<!doctype html><html lang="${esc(L.loc.lang)}"><head>${head(locale,title,description,pagePath(locale,canonical),alts)}</head><body>${L.nav('research',alts)}<main><section class="page-hero"><div class="container"><div class="eyebrow dark">${esc(domain?(locale==='pt-BR'?'DOMÍNIO':'DOMAIN'):(locale==='pt-BR'?'SÉRIE DE PESQUISA':'RESEARCH SERIES'))}</div><h1>${esc(title)}</h1><p>${esc(description)}</p></div></section>${intro}<section class="section"><div class="container">${domains}${domains?'<div class="section-head"><h2>'+esc(locale==='pt-BR'?'Pesquisas publicadas':'Published research')+'</h2></div>':''}${body}</div></section></main>${L.footer()}<script src="/assets/js/app.js"></script></body></html>`;
}

const seriesDir=path.join(out,'series');
if(fs.existsSync(seriesDir))fs.rmSync(seriesDir,{recursive:true,force:true});
for(const [id,s] of Object.entries(taxonomy.series||{}))for(const locale of locales){
  write(pagePath(locale,`/series/${id}/index.html`),collection(locale,id,s));
  for(const domain of Object.keys(s.domains||{}))write(pagePath(locale,`/series/${id}/${domain}/index.html`),collection(locale,id,s,domain));
}

const sitemap=path.join(out,'sitemap.xml');
if(fs.existsSync(sitemap)){
  let xml=fs.readFileSync(sitemap,'utf8'),extra=[];
  for(const [id,s] of Object.entries(taxonomy.series||{}))for(const locale of locales){
    extra.push(`${site}${pagePath(locale,`/series/${id}/`)}`);
    for(const domain of Object.keys(s.domains||{}))extra.push(`${site}${pagePath(locale,`/series/${id}/${domain}/`)}`);
  }
  const last=String(reports[0]?.date||new Date().toISOString()).slice(0,10);
  const entries=[...new Set(extra)].filter(u=>!xml.includes(`<loc>${esc(u)}</loc>`)).map(u=>`<url><loc>${esc(u)}</loc><lastmod>${esc(last)}</lastmod></url>`).join('');
  xml=xml.replace('</urlset>',`${entries}</urlset>`);
  fs.writeFileSync(sitemap,xml);
}
console.log(`Controlled series pages rendered: ${Object.keys(taxonomy.series||{}).length} series across ${locales.length} locales.`);
