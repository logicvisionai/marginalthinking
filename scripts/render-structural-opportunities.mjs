import fs from 'node:fs';
import path from 'node:path';
import {esc} from './lib/markdown.mjs';
import {makeLayout} from './lib/layout.mjs';

const root=process.cwd();
const out=path.join(root,'dist');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(p,s)=>{const t=path.join(out,String(p).replace(/^\/+/,''));fs.mkdirSync(path.dirname(t),{recursive:true});fs.writeFileSync(t,s);};
const cfg=JSON.parse(read('site.config.json'));
const i18n=JSON.parse(read('data/i18n.json'));
const atlas=JSON.parse(read('data/structural-opportunities.json'));
const site=cfg.site_url.replace(/\/$/,'');
const author=cfg.default_author;
const social=site+cfg.social_image;
const pagePath=(locale,p)=>{const prefix=cfg.locales[locale]&&cfg.locales[locale].path?'/'+cfg.locales[locale].path:'';return (prefix+p).replace(/\/+/g,'/');};
const reportPath=(item,locale)=>pagePath(locale,item&&item.url?item.url:'/reports.html');
const pick=(value,locale)=>value&&typeof value==='object'&&!Array.isArray(value)?(value[locale]||value.en||Object.values(value)[0]||''):(value||'');
const stateOrder=['blocking_inefficiency','exploitable_inefficiency','blocking_efficiency','leverageable_efficiency'];
const stateClass=s=>'state-'+String(s||'').replace(/_/g,'-');
const stateText=(s,l)=>pick(atlas.states[s],l);
const layout=locale=>makeLayout({cfg,i18n,site,author,social,locale,reportPath,pagePath});

function head(locale,title,description,canonical){
  const L=layout(locale);
  return '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#09131a"><meta name="description" content="'+esc(description)+'"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1"><link rel="canonical" href="'+esc(site+canonical)+'"><link rel="icon" href="/assets/brand/favicon.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&display=swap" rel="stylesheet"><link rel="stylesheet" href="/assets/css/styles.css"><link rel="stylesheet" href="/assets/css/structural-opportunities.css">'+L.baseHead(title,description,canonical,'CollectionPage',Object.fromEntries(Object.keys(cfg.locales).map(x=>[x,pagePath(x,'/opportunities/')])))+'<title>'+esc(title)+'</title>';
}

const project=([lon,lat])=>[(lon+180)/360*1000,(90-lat)/180*500];
const continents=[
  [[-168,70],[-130,72],[-105,58],[-80,50],[-55,45],[-70,25],[-95,15],[-120,25],[-150,55]],
  [[-82,12],[-70,8],[-50,-5],[-35,-20],[-50,-55],[-70,-50],[-80,-15]],
  [[-10,36],[5,58],[35,70],[75,70],[120,58],[150,45],[135,10],[100,5],[80,22],[45,30],[25,38]],
  [[-18,35],[15,37],[40,15],[50,-15],[30,-35],[10,-35],[-5,-5]],
  [[112,-12],[153,-10],[150,-40],[115,-35]],
  [[-55,82],[-20,82],[-25,60],[-50,60]]
];
function polygon(points){return points.map(p=>{const q=project(p);return q[0].toFixed(1)+','+q[1].toFixed(1);}).join(' ');}
function mapSvg(locale){
  const countries=new Map();
  for(const e of atlas.entries){
    const c=e.country;
    if(!countries.has(c.code))countries.set(c.code,{country:c,count:0,states:new Set()});
    const x=countries.get(c.code);x.count++;x.states.add(e.state);
  }
  const grid=[-120,-60,0,60,120].map(l=>{const p=project([l,0]);return '<line x1="'+p[0]+'" y1="0" x2="'+p[0]+'" y2="500"/>';}).join('')+
    [-60,-30,0,30,60].map(l=>{const p=project([0,l]);return '<line x1="0" y1="'+p[1]+'" x2="1000" y2="'+p[1]+'"/>';}).join('');
  const land=continents.map(c=>'<polygon points="'+polygon(c)+'"/>').join('');
  const pins=[...countries.values()].map(x=>{
    const p=project([x.country.lon,x.country.lat]);
    return '<a href="#country-'+esc(x.country.code)+'"><g class="atlas-pin"><circle cx="'+p[0]+'" cy="'+p[1]+'" r="9"/><circle class="pin-core" cx="'+p[0]+'" cy="'+p[1]+'" r="3"/><title>'+esc(pick(x.country.name,locale))+' — '+x.count+'</title></g></a>';
  }).join('');
  return '<svg class="atlas-map" viewBox="0 0 1000 500" role="img" aria-label="'+esc(locale==='pt-BR'?'Mapa esquemático da primeira leva do atlas':'Schematic map of the Atlas first wave')+'"><g class="map-grid">'+grid+'</g><g class="map-land">'+land+'</g><g class="map-pins">'+pins+'</g></svg>';
}

function stateDefinitions(locale){
  const copy={
    blocking_inefficiency:{
      en:'A structural deficiency destroys, delays or materially constrains value creation. A problem is not automatically an opportunity.',
      'pt-BR':'Uma deficiência estrutural destrói, atrasa ou restringe materialmente a criação de valor. Um problema não é automaticamente uma oportunidade.'
    },
    exploitable_inefficiency:{
      en:'A measurable gap has a plausible and accessible mechanism through which an actor can capture value by reducing or working around it.',
      'pt-BR':'Uma lacuna mensurável possui mecanismo plausível e acessível pelo qual um agente pode capturar valor ao reduzi-la ou contorná-la.'
    },
    blocking_efficiency:{
      en:'An efficient system compresses margins, removes arbitrage or raises the hurdle for a specific entrant or business model.',
      'pt-BR':'Um sistema eficiente comprime margens, remove arbitragem ou eleva a barreira para um entrante ou modelo de negócio específico.'
    },
    leverageable_efficiency:{
      en:'An existing efficient capability can be reused as infrastructure or productive leverage by another actor.',
      'pt-BR':'Uma capacidade eficiente existente pode ser reutilizada como infraestrutura ou alavancagem produtiva por outro agente.'
    }
  };
  return '<div class="state-matrix">'+stateOrder.map(s=>'<article class="state-definition '+stateClass(s)+'"><span>'+esc(stateText(s,locale))+'</span><p>'+esc(copy[s][locale])+'</p></article>').join('')+'</div>';
}

function entryCard(e,locale){
  const t=locale==='pt-BR'?{
    perspective:'Perspectiva',mechanism:'Mecanismo',implication:'Valor potencial / implicação',constraints:'Limites',catalysts:'Catalisadores',transition:'Transição em observação',sources:'Evidência',confidence:'Confiança',verified:'Verificado',horizon:'Horizonte'
  }:{
    perspective:'Perspective',mechanism:'Mechanism',implication:'Potential value / implication',constraints:'Limits',catalysts:'Catalysts',transition:'Transition watch',sources:'Evidence',confidence:'Confidence',verified:'Verified',horizon:'Horizon'
  };
  const catalysts=(e.catalysts||[]).length?'<div class="entry-block"><h4>'+t.catalysts+'</h4><ul>'+e.catalysts.map(x=>'<li>'+esc(pick(x,locale))+'</li>').join('')+'</ul></div>':'';
  const transition=e.transition?'<div class="transition-watch"><strong>'+t.transition+'</strong><p>'+esc(pick(e.transition,locale))+'</p></div>':'';
  const sources=(e.sources||[]).map(s=>'<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.name)+' <span>↗</span></a>').join('');
  return '<article class="opportunity-entry '+stateClass(e.state)+'" data-state="'+esc(e.state)+'" data-country="'+esc(e.country.code)+'" id="entry-'+esc(e.id)+'"><div class="entry-top"><div><div class="entry-country">'+esc(pick(e.country.name,locale))+' · '+esc(e.id)+'</div><h3>'+esc(pick(e.feature,locale))+'</h3></div><span class="state-badge">'+esc(stateText(e.state,locale))+'</span></div><div class="entry-facts"><span>'+t.confidence+': <strong>'+esc(e.confidence)+'</strong></span><span>'+t.horizon+': <strong>'+esc(e.horizon)+'</strong></span><span>'+t.verified+': <strong>'+esc(e.last_verified)+'</strong></span></div><div class="entry-grid"><div class="entry-block"><h4>'+t.perspective+'</h4><p>'+esc(pick(e.perspective,locale))+'</p></div><div class="entry-block"><h4>'+t.mechanism+'</h4><p>'+esc(pick(e.mechanism,locale))+'</p></div><div class="entry-block"><h4>'+t.implication+'</h4><p>'+esc(pick(e.implication,locale))+'</p></div><div class="entry-block"><h4>'+t.constraints+'</h4><p>'+esc(pick(e.constraints,locale))+'</p></div>'+catalysts+'</div>'+transition+'<div class="source-row"><strong>'+t.sources+'</strong>'+sources+'</div></article>';
}

function page(locale){
  const L=layout(locale);
  const pt=locale==='pt-BR';
  const title=pt?'Atlas de Oportunidades Estruturais':'Structural Opportunity Atlas';
  const deck=pt?'Onde ineficiências impedem valor, onde podem ser exploradas e onde eficiências funcionam como barreira ou alavanca.':'Where inefficiencies block value, where they can be exploited, and where efficiencies act as barriers or leverage.';
  const counts=Object.fromEntries(stateOrder.map(s=>[s,atlas.entries.filter(e=>e.state===s).length]));
  const filters='<button class="active" data-filter="all">'+(pt?'Todos':'All')+' <span>'+atlas.entries.length+'</span></button>'+stateOrder.map(s=>'<button data-filter="'+s+'">'+esc(stateText(s,locale))+' <span>'+counts[s]+'</span></button>').join('');
  const countryCodes=[...new Set(atlas.entries.map(e=>e.country.code))];
  const groups=countryCodes.map(code=>{
    const items=atlas.entries.filter(e=>e.country.code===code);
    const name=pick(items[0].country.name,locale);
    return '<section class="country-group" id="country-'+esc(code)+'"><div class="country-heading"><span>'+esc(code)+'</span><h2>'+esc(name)+'</h2><em>'+items.length+' '+(pt?(items.length===1?'condição':'condições'):(items.length===1?'condition':'conditions'))+'</em></div>'+items.map(e=>entryCard(e,locale)).join('')+'</section>';
  }).join('');
  const methodology=pt?'A classificação é relacional: a mesma estrutura pode ser uma eficiência aproveitável para um agente e uma eficiência impeditiva para outro. O estado nunca é um julgamento geral sobre o país.':'Classification is relational: the same structure can be leverageable for one actor and blocking for another. A state is never a general judgment about a country.';
  const cadence=pt?'O scanner diário procura mudanças materiais; a validação semanal decide se o sinal altera o atlas; a revisão mensal testa se a própria classificação mudou.':'The daily scanner looks for material changes; weekly validation decides whether a signal changes the Atlas; monthly reassessment tests whether the classification itself has moved.';
  const canonical=pagePath(locale,'/opportunities/');
  return '<!doctype html><html lang="'+esc(L.loc.lang)+'"><head>'+head(locale,title+' — Marginal Thinking',deck,canonical)+'</head><body class="structural-opportunity-atlas" data-locale="'+esc(locale)+'"><div class="utility-bar"><div class="container utility-row"><span>'+(pt?'Economia · Política · Sociedade':'Economics · Politics · Society')+'</span><a href="'+pagePath(locale,'/reports.html')+'">'+(pt?'Arquivo de pesquisa':'Research archive')+'</a></div></div>'+L.nav('opportunities',Object.fromEntries(Object.keys(cfg.locales).map(x=>[x,pagePath(x,'/opportunities/')])) )+'<main><section class="atlas-hero"><div class="container atlas-hero-grid"><div><div class="eyebrow">'+(pt?'Camada analítica transversal':'Cross-cutting analytical layer')+'</div><h1>'+esc(title)+'</h1><p>'+esc(deck)+'</p></div><aside><strong>'+(pt?'Princípio':'Principle')+'</strong><p>'+esc(methodology)+'</p></aside></div></section><section class="section"><div class="container"><div class="atlas-intro"><div><div class="section-kicker">'+(pt?'Modelo 2 × 2':'2 × 2 model')+'</div><h2>'+(pt?'Estrutura econômica não é sinônimo de oportunidade':'Economic structure is not synonymous with opportunity')+'</h2></div><p>'+esc(atlas.disclaimer[locale])+'</p></div>'+stateDefinitions(locale)+'</div></section><section class="section map-section"><div class="container"><div class="atlas-intro"><div><div class="section-kicker">'+(pt?'Primeira leva · 18 set 2026':'First wave · 18 Sep 2026')+'</div><h2>'+(pt?'Sinais estruturais validados':'Validated structural signals')+'</h2></div><p>'+esc(cadence)+'</p></div><div class="map-panel">'+mapSvg(locale)+'<div class="map-caption">'+(pt?'Visualização geográfica esquemática; clique em um ponto para ir ao país.':'Schematic geographic view; select a point to jump to the country.')+'</div></div><div class="atlas-filters" role="group" aria-label="'+(pt?'Filtrar estado':'Filter state')+'">'+filters+'</div></div></section><section class="section entries-section"><div class="container" id="atlas-entries">'+groups+'<div class="empty-state" hidden>'+(pt?'Nenhuma condição neste filtro.':'No conditions in this filter.')+'</div></div></section><section class="section atlas-method"><div class="container atlas-method-grid"><div><div class="section-kicker">'+(pt?'Governança':'Governance')+'</div><h2>'+(pt?'Sinal diário, mudança estrutural apenas quando a evidência sustenta':'Daily signal, structural change only when evidence supports it')+'</h2></div><div><p>'+esc(cadence)+'</p><p><a href="'+pagePath(locale,'/methodology.html')+'">'+(pt?'Metodologia geral':'General methodology')+' →</a></p></div></div></section></main>'+L.footer()+'<script src="/assets/js/app.js"></script><script>(function(){var buttons=[].slice.call(document.querySelectorAll(".atlas-filters button"));var cards=[].slice.call(document.querySelectorAll(".opportunity-entry"));var groups=[].slice.call(document.querySelectorAll(".country-group"));var empty=document.querySelector(".empty-state");buttons.forEach(function(b){b.addEventListener("click",function(){buttons.forEach(function(x){x.classList.remove("active")});b.classList.add("active");var f=b.getAttribute("data-filter");var visible=0;cards.forEach(function(c){var show=f==="all"||c.getAttribute("data-state")===f;c.hidden=!show;if(show)visible++});groups.forEach(function(g){g.hidden=!g.querySelector(".opportunity-entry:not([hidden])")});empty.hidden=visible>0;});});})();</script></body></html>';
}

for(const locale of Object.keys(cfg.locales))write(pagePath(locale,'/opportunities/index.html'),page(locale));
write('/data/structural-opportunities.json',JSON.stringify(atlas,null,2)+'\n');

const sitemap=path.join(out,'sitemap.xml');
if(fs.existsSync(sitemap)){
  let xml=fs.readFileSync(sitemap,'utf8');
  const urls=Object.keys(cfg.locales).map(l=>site+pagePath(l,'/opportunities/'));
  const additions=urls.filter(u=>!xml.includes('<loc>'+u+'</loc>')).map(u=>'<url><loc>'+u+'</loc><lastmod>'+atlas.updated_at+'</lastmod></url>').join('');
  if(additions)xml=xml.replace('</urlset>',additions+'</urlset>');
  fs.writeFileSync(sitemap,xml);
}
console.log('Structural Opportunity Atlas rendered:',atlas.entries.length,'entries.');
