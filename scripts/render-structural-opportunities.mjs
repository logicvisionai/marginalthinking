import fs from 'node:fs';
import path from 'node:path';
import {esc} from './lib/markdown.mjs';
import {makeLayout} from './lib/layout.mjs';
import {geoEqualEarth, geoGraticule10, geoPath} from 'd3-geo';
import {feature, mesh} from 'topojson-client';

const root=process.cwd();
const out=path.join(root,'dist');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(p,s)=>{const t=path.join(out,String(p).replace(/^\/+/,''));fs.mkdirSync(path.dirname(t),{recursive:true});fs.writeFileSync(t,s);};
const cfg=JSON.parse(read('site.config.json'));
const i18n=JSON.parse(read('data/i18n.json'));
const atlas=JSON.parse(read('data/structural-opportunities.json'));
const history=JSON.parse(read('data/structural-opportunity-history.json'));
const world=JSON.parse(read('node_modules/world-atlas/countries-110m.json'));
const worldCountries=feature(world,world.objects.countries);
const worldBorders=mesh(world,world.objects.countries,(a,b)=>a!==b);
const worldGraticule=geoGraticule10();
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
const localeDate=(date,locale)=>{
  try{return new Intl.DateTimeFormat(locale==='pt-BR'?'pt-BR':'en-US',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(String(date)+'T12:00:00Z')).replace(/\./g,'');}
  catch{return String(date||'');}
};
const confidenceText=(v,locale)=>{
  const m={high:{en:'High','pt-BR':'Alta'},medium:{en:'Medium','pt-BR':'Média'},low:{en:'Low','pt-BR':'Baixa'}};
  return m[v]?m[v][locale]||m[v].en:String(v||'');
};
const horizonText=(v,locale)=>{
  if(locale!=='pt-BR')return v==='current'?'Current':String(v||'');
  if(v==='current')return 'Atual';
  return String(v||'').replace(/y$/,' anos').replace(/(\d)-(\d+)/,'$1–$2');
};

function head(locale,title,description,canonical,type='CollectionPage'){
  const L=layout(locale);
  const altPath=canonical.endsWith('/history/')?'/opportunities/history/':'/opportunities/';
  const alternates=Object.fromEntries(Object.keys(cfg.locales).map(x=>[x,pagePath(x,altPath)]));
  return '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#09131a"><meta name="description" content="'+esc(description)+'"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1"><link rel="canonical" href="'+esc(site+canonical)+'"><link rel="icon" href="/assets/brand/favicon.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&display=swap" rel="stylesheet"><link rel="stylesheet" href="/assets/css/styles.css"><link rel="stylesheet" href="/assets/css/structural-opportunities.css">'+L.baseHead(title,description,canonical,type,alternates)+'<title>'+esc(title)+'</title>';
}

const mapWidth=1000;
const mapHeight=500;
const mapProjection=geoEqualEarth().fitExtent([[28,22],[mapWidth-28,mapHeight-22]],{type:'Sphere'});
const mapPath=geoPath(mapProjection);
const mapSpherePath=mapPath({type:'Sphere'});
const mapGraticulePath=mapPath(worldGraticule);
const mapCountryPaths=worldCountries.features.map(f=>'<path d="'+esc(mapPath(f)||'')+'"/>').join('');
const mapBorderPath=mapPath(worldBorders)||'';

function localNav(locale,active){
  const pt=locale==='pt-BR';
  return '<nav class="atlas-local-nav" aria-label="'+esc(pt?'Navegação do Atlas':'Atlas navigation')+'"><a class="'+(active==='atlas'?'active':'')+'" href="'+pagePath(locale,'/opportunities/')+'">Atlas</a><a class="'+(active==='history'?'active':'')+'" href="'+pagePath(locale,'/opportunities/history/')+'">'+(pt?'Histórico':'History')+'</a></nav>';
}
function metrics(locale){
  const pt=locale==='pt-BR';
  const countries=new Set(atlas.entries.map(e=>e.country.code)).size;
  const transitions=atlas.entries.filter(e=>e.transition).length;
  const items=[
    [String(atlas.entries.length),pt?'condições ativas':'active conditions'],
    [String(countries),pt?'países':'countries'],
    [String(transitions),pt?'mudanças monitoradas':'transitions monitored'],
    [localeDate(atlas.updated_at,locale),pt?'atualização do conjunto':'dataset update']
  ];
  return '<div class="atlas-metrics">'+items.map(x=>'<div><strong>'+esc(x[0])+'</strong><span>'+esc(x[1])+'</span></div>').join('')+'</div>';
}
function mapSvg(locale){
  const countries=new Map();
  for(const e of atlas.entries){
    const c=e.country;
    if(!countries.has(c.code))countries.set(c.code,{country:c,count:0,states:new Set()});
    const x=countries.get(c.code);x.count++;x.states.add(e.state);
  }
  const pins=[...countries.values()].map(x=>{
    const p=mapProjection([x.country.lon,x.country.lat]);
    if(!p)return '';
    const states=[...x.states].join(' ');
    const title=pick(x.country.name,locale)+' — '+x.count+' '+(locale==='pt-BR'?(x.count===1?'condição':'condições'):(x.count===1?'condition':'conditions'));
    return '<a class="atlas-pin-link" data-country="'+esc(x.country.code)+'" data-states="'+esc(states)+'" href="#country-'+esc(x.country.code)+'"><g class="atlas-pin"><circle class="pin-hit" cx="'+p[0].toFixed(2)+'" cy="'+p[1].toFixed(2)+'" r="20"/><circle class="pin-halo" cx="'+p[0].toFixed(2)+'" cy="'+p[1].toFixed(2)+'" r="13"/><circle class="pin-core" cx="'+p[0].toFixed(2)+'" cy="'+p[1].toFixed(2)+'" r="9"/><text x="'+p[0].toFixed(2)+'" y="'+(p[1]+3.4).toFixed(2)+'">'+x.count+'</text><title>'+esc(title)+'</title></g></a>';
  }).join('');
  const aria=locale==='pt-BR'?'Mapa-múndi do Atlas com condições agregadas por país':'World map of the Atlas with conditions aggregated by country';
  return '<svg class="atlas-map" viewBox="0 0 '+mapWidth+' '+mapHeight+'" preserveAspectRatio="xMidYMid meet" role="img" aria-label="'+esc(aria)+'"><path class="map-sphere" d="'+esc(mapSpherePath)+'"/><path class="map-graticule" d="'+esc(mapGraticulePath)+'"/><g class="map-land">'+mapCountryPaths+'</g><path class="map-borders" d="'+esc(mapBorderPath)+'"/><g class="map-pins">'+pins+'</g></svg>';
}
function stateDefinitions(locale){
  const copy={
    blocking_inefficiency:{en:'A structural deficiency destroys, delays or materially constrains value creation. The existence of the deficiency does not imply that it is commercially accessible.','pt-BR':'Uma deficiência estrutural destrói, atrasa ou restringe materialmente a criação de valor. A existência da deficiência não implica acesso econômico à sua solução.'},
    exploitable_inefficiency:{en:'A measurable structural gap has an accessible mechanism through which an actor can capture value by reducing or working around it.','pt-BR':'Uma lacuna estrutural mensurável possui mecanismo acessível de captura de valor por redução, substituição ou contorno da restrição.'},
    blocking_efficiency:{en:'An efficient incumbent system compresses margins, removes arbitrage or raises the hurdle for a specific entrant or business model.','pt-BR':'Um sistema eficiente comprime margens, elimina arbitragem ou eleva a barreira para um entrante ou modelo de negócio específico.'},
    leverageable_efficiency:{en:'An existing efficient capability can be reused as infrastructure or productive leverage by another actor.','pt-BR':'Uma capacidade eficiente existente pode ser reutilizada como infraestrutura ou alavancagem produtiva por outro agente.'}
  };
  const pt=locale==='pt-BR';
  const columnLabels=pt?['Restringe valor','Permite captura ou uso']:['Restricts value','Enables capture or use'];
  const rowLabel=s=>(s==='blocking_inefficiency'||s==='exploitable_inefficiency')?(pt?'Ineficiência':'Inefficiency'):(pt?'Eficiência':'Efficiency');
  return '<div class="state-matrix-shell"><div class="state-matrix-axis"><span>'+esc(columnLabels[0])+'</span><span>'+esc(columnLabels[1])+'</span></div><div class="state-matrix">'+stateOrder.map(s=>'<article class="state-definition '+stateClass(s)+'"><b class="state-row-label">'+esc(rowLabel(s))+'</b><span>'+esc(stateText(s,locale))+'</span><p>'+esc(copy[s][locale])+'</p></article>').join('')+'</div></div>';
}
function historyFor(entryId){
  return (history.events||[]).filter(e=>e.entry_id===entryId).sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.event_id).localeCompare(String(a.event_id)));
}
function entryCard(e,locale){
  const pt=locale==='pt-BR';
  const t=pt?{perspective:'Perspectiva',mechanism:'Mecanismo',implication:'Implicação econômica',constraints:'Restrições',catalysts:'Catalisadores',transition:'Mudança monitorada',sources:'Fontes',confidence:'Confiança',verified:'Verificação',horizon:'Horizonte',history:'Histórico'}:{perspective:'Perspective',mechanism:'Mechanism',implication:'Economic implication',constraints:'Constraints',catalysts:'Catalysts',transition:'Transition under watch',sources:'Sources',confidence:'Confidence',verified:'Verified',horizon:'Horizon',history:'History'};
  const catalysts=(e.catalysts||[]).length?'<div class="entry-block"><h4>'+t.catalysts+'</h4><ul>'+e.catalysts.map(x=>'<li>'+esc(pick(x,locale))+'</li>').join('')+'</ul></div>':'';
  const transition=e.transition?'<div class="transition-watch"><div><strong>'+t.transition+'</strong>'+(e.transition.to_state?'<span>'+esc(stateText(e.state,locale))+' → '+esc(stateText(e.transition.to_state,locale))+'</span>':'')+'</div><p>'+esc(pick(e.transition,locale))+'</p></div>':'';
  const sources=(e.sources||[]).map(s=>'<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.name)+' <span>↗</span></a>').join('');
  const events=historyFor(e.id);
  const hist='<a class="entry-history-link" href="'+pagePath(locale,'/opportunities/history/#entry-'+e.id)+'">'+t.history+' · '+events.length+' '+(pt?(events.length===1?'registro':'registros'):(events.length===1?'record':'records'))+' →</a>';
  return '<article class="opportunity-entry '+stateClass(e.state)+'" data-state="'+esc(e.state)+'" data-country="'+esc(e.country.code)+'" id="entry-'+esc(e.id)+'"><div class="entry-top"><div><div class="entry-country">'+esc(pick(e.country.name,locale))+' · '+esc(e.id)+'</div><h3>'+esc(pick(e.feature,locale))+'</h3></div><span class="state-badge">'+esc(stateText(e.state,locale))+'</span></div><div class="entry-facts"><span>'+t.confidence+': <strong>'+esc(confidenceText(e.confidence,locale))+'</strong></span><span>'+t.horizon+': <strong>'+esc(horizonText(e.horizon,locale))+'</strong></span><span>'+t.verified+': <strong>'+esc(localeDate(e.last_verified,locale))+'</strong></span>'+hist+'</div><div class="entry-grid"><div class="entry-block"><h4>'+t.perspective+'</h4><p>'+esc(pick(e.perspective,locale))+'</p></div><div class="entry-block"><h4>'+t.mechanism+'</h4><p>'+esc(pick(e.mechanism,locale))+'</p></div><div class="entry-block"><h4>'+t.implication+'</h4><p>'+esc(pick(e.implication,locale))+'</p></div><div class="entry-block"><h4>'+t.constraints+'</h4><p>'+esc(pick(e.constraints,locale))+'</p></div>'+catalysts+'</div>'+transition+'<div class="source-row"><strong>'+t.sources+'</strong>'+sources+'</div></article>';
}
function historySummary(locale){
  const pt=locale==='pt-BR';
  return '<div class="history-summary"><div><span class="section-kicker">'+(pt?'Evolução':'Evolution')+'</span><strong>'+(pt?'Histórico de alterações':'Change history')+'</strong><p>'+(pt?'Inclusões, reclassificações, revisões materiais e correções permanecem registradas sem apagar o estado anterior.':'Inclusions, reclassifications, material revisions and corrections remain recorded without erasing the previous state.')+'</p></div><div class="history-summary-count"><b>'+history.events.length+'</b><span>'+(pt?'registros':'records')+'</span><a href="'+pagePath(locale,'/opportunities/history/')+'">'+(pt?'Abrir histórico':'Open history')+' →</a></div></div>';
}
function atlasPage(locale){
  const L=layout(locale);
  const pt=locale==='pt-BR';
  const title=pt?'Atlas de Oportunidades Estruturais':'Structural Opportunity Atlas';
  const deck=pt?'Mapeamento de restrições, capacidades e mecanismos de captura de valor que alteram custos, acesso, produtividade e estrutura competitiva.':'Mapping constraints, capabilities and value-capture mechanisms that alter costs, access, productivity and competitive structure.';
  const counts=Object.fromEntries(stateOrder.map(s=>[s,atlas.entries.filter(e=>e.state===s).length]));
  const filters='<button class="active" data-filter="all">'+(pt?'Todos':'All')+' <span>'+atlas.entries.length+'</span></button>'+stateOrder.map(s=>'<button data-filter="'+s+'">'+esc(stateText(s,locale))+' <span>'+counts[s]+'</span></button>').join('');
  const countryCodes=[...new Set(atlas.entries.map(e=>e.country.code))];
  const groups=countryCodes.map(code=>{const items=atlas.entries.filter(e=>e.country.code===code);const name=pick(items[0].country.name,locale);return '<section class="country-group" id="country-'+esc(code)+'"><div class="country-heading"><span>'+esc(code)+'</span><h2>'+esc(name)+'</h2><em>'+items.length+' '+(pt?(items.length===1?'condição':'condições'):(items.length===1?'condition':'conditions'))+'</em></div>'+items.map(e=>entryCard(e,locale)).join('')+'</section>';}).join('');
  const principle=pt?'Cada registro representa uma condição estrutural observada a partir de uma perspectiva econômica explícita. A classificação descreve o mecanismo, não o país.':'Each record represents a structural condition observed from an explicit economic perspective. The classification describes the mechanism, not the country.';
  const canonical=pagePath(locale,'/opportunities/');
  const mapCountries=countryCodes.length;
  return '<!doctype html><html lang="'+esc(L.loc.lang)+'"><head>'+head(locale,title+' — Marginal Thinking',deck,canonical)+'</head><body class="structural-opportunity-atlas" data-locale="'+esc(locale)+'"><div class="utility-bar"><div class="container utility-row"><span>'+(pt?'Economia · Política · Sociedade':'Economics · Politics · Society')+'</span><a href="'+pagePath(locale,'/reports.html')+'">'+(pt?'Arquivo de pesquisa':'Research archive')+'</a></div></div>'+L.nav('opportunities',Object.fromEntries(Object.keys(cfg.locales).map(x=>[x,pagePath(x,'/opportunities/')])) )+'<main><section class="atlas-hero"><div class="container">'+localNav(locale,'atlas')+'<div class="atlas-hero-grid"><div><div class="eyebrow">'+(pt?'Inteligência estrutural':'Structural intelligence')+'</div><h1>'+esc(title)+'</h1><p>'+esc(deck)+'</p></div><aside><strong>'+(pt?'Unidade de análise':'Unit of analysis')+'</strong><p>'+esc(principle)+'</p></aside></div>'+metrics(locale)+'</div></section><section class="section"><div class="container"><div class="atlas-intro"><div><div class="section-kicker">'+(pt?'Classificação':'Classification')+'</div><h2>'+(pt?'Quatro estados estruturais':'Four structural states')+'</h2></div><p>'+(pt?'Cada estado é específico à perspectiva analisada e vinculado ao mecanismo econômico documentado.':'Each state is specific to the perspective being analysed and tied to the documented economic mechanism.')+'</p></div>'+stateDefinitions(locale)+'</div></section><section class="section map-section"><div class="container"><div class="atlas-intro"><div><div class="section-kicker">'+(pt?'Cobertura atual':'Current coverage')+'</div><h2>'+(pt?'Condições monitoradas':'Monitored structural conditions')+'</h2></div><p>'+(pt?'Localização, classificação atual, última verificação e histórico de cada condição.':'Location, current classification, latest verification and history for every condition.')+'</p></div><div class="map-panel">'+mapSvg(locale)+'<div class="map-caption"><span data-map-summary>'+mapCountries+' '+(pt?(mapCountries===1?'país':'países'):(mapCountries===1?'country':'countries'))+' · '+atlas.entries.length+' '+(pt?'condições ativas':'active conditions')+'</span><span>'+(pt?'O número em cada marcador indica quantas condições estão associadas ao país. Base cartográfica: Natural Earth 1:110m · projeção Equal Earth.':'The number in each marker shows how many conditions are associated with the country. Cartographic base: Natural Earth 1:110m · Equal Earth projection.')+'</span></div></div><div class="atlas-filters" role="group" aria-label="'+(pt?'Filtrar por estado':'Filter by state')+'">'+filters+'</div>'+historySummary(locale)+'</div></section><section class="section entries-section"><div class="container" id="atlas-entries">'+groups+'<div class="empty-state" hidden>'+(pt?'Nenhuma condição corresponde ao filtro selecionado.':'No conditions match the selected filter.')+'</div></div></section><section class="section atlas-method"><div class="container atlas-method-grid"><div><div class="section-kicker">'+(pt?'Rastreabilidade':'Traceability')+'</div><h2>'+(pt?'Alterações materiais preservam o estado anterior':'Material changes preserve the previous state')+'</h2></div><div><p>'+(pt?'Reclassificações, mudanças de mecanismo, revisões de evidência e correções recebem um novo registro histórico. O conjunto atual permanece compacto; a evolução fica disponível em arquivo separado.':'Reclassifications, mechanism changes, evidence revisions and corrections receive a new history record. The current dataset remains compact while evolution is preserved in a separate archive.')+'</p><p><a href="'+pagePath(locale,'/opportunities/history/')+'">'+(pt?'Histórico do Atlas':'Atlas history')+' →</a> · <a href="'+pagePath(locale,'/methodology.html')+'">'+(pt?'Metodologia geral':'General methodology')+' →</a></p></div></div></section></main>'+L.footer()+'<script src="/assets/js/app.js"></script><script>(function(){var buttons=[].slice.call(document.querySelectorAll(".atlas-filters button"));var cards=[].slice.call(document.querySelectorAll(".opportunity-entry"));var groups=[].slice.call(document.querySelectorAll(".country-group"));var pins=[].slice.call(document.querySelectorAll(".atlas-pin-link"));var empty=document.querySelector(".empty-state");var summary=document.querySelector("[data-map-summary]");var locale=document.body.getAttribute("data-locale");buttons.forEach(function(b){b.addEventListener("click",function(){buttons.forEach(function(x){x.classList.remove("active")});b.classList.add("active");var f=b.getAttribute("data-filter");var visible=0;cards.forEach(function(c){var show=f==="all"||c.getAttribute("data-state")===f;c.hidden=!show;if(show)visible++});groups.forEach(function(g){g.hidden=!g.querySelector(".opportunity-entry:not([hidden])")});var visibleCountries=0;pins.forEach(function(p){var states=(p.getAttribute("data-states")||"").split(" ");var show=f==="all"||states.indexOf(f)>=0;p.classList.toggle("is-filtered-out",!show);if(show)visibleCountries++});if(summary){summary.textContent=visibleCountries+" "+(locale==="pt-BR"?(visibleCountries===1?"país":"países"):(visibleCountries===1?"country":"countries"))+" · "+visible+" "+(locale==="pt-BR"?"condições ativas":"active conditions")}empty.hidden=visible>0;});});})();</script></body></html>';
}
function eventCard(event,locale){
  const pt=locale==='pt-BR';
  const current=atlas.entries.find(e=>e.id===event.entry_id);
  const type=pick(history.event_types[event.type],locale);
  const state=event.to_state||event.state||null;
  const transition=event.type==='state_change'&&event.from_state&&event.to_state?'<div class="history-state-change"><span>'+esc(stateText(event.from_state,locale))+'</span><b>→</b><span>'+esc(stateText(event.to_state,locale))+'</span></div>':'';
  const sources=(event.sources||[]).map(s=>'<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.name)+' ↗</a>').join('');
  return '<article class="history-event" id="entry-'+esc(event.entry_id)+'" data-event-type="'+esc(event.type)+'"><div class="history-event-rail"><span></span></div><div class="history-event-body"><div class="history-event-meta"><span>'+esc(type)+'</span><time datetime="'+esc(event.date)+'">'+esc(localeDate(event.date,locale))+'</time></div><div class="history-event-head"><div><div class="entry-country">'+esc(pick(event.country?.name,locale)||event.country?.code||'')+' · '+esc(event.entry_id)+'</div><h3>'+esc(pick(event.feature,locale))+'</h3></div>'+(state?'<span class="state-badge">'+esc(stateText(state,locale))+'</span>':'')+'</div>'+transition+'<p class="history-event-summary">'+esc(pick(event.summary,locale))+'</p><div class="history-event-footer"><div class="history-event-sources">'+sources+'</div>'+(current?'<a class="history-current-link" href="'+pagePath(locale,'/opportunities/#entry-'+event.entry_id)+'">'+(pt?'Ver condição atual':'View current condition')+' →</a>':'')+'</div></div></article>';
}
function historyPage(locale){
  const L=layout(locale);
  const pt=locale==='pt-BR';
  const title=pt?'Histórico do Atlas':'Atlas history';
  const deck=pt?'Registro cronológico de inclusões, reclassificações, revisões materiais e correções das condições estruturais monitoradas.':'Chronological record of inclusions, reclassifications, material revisions and corrections to monitored structural conditions.';
  const canonical=pagePath(locale,'/opportunities/history/');
  const events=[...(history.events||[])].sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.event_id).localeCompare(String(a.event_id)));
  const activeTypes=[...new Set(events.map(e=>e.type))];
  const filters=activeTypes.length>1?'<div class="history-filters" role="group" aria-label="'+(pt?'Filtrar histórico':'Filter history')+'"><button class="active" data-event-filter="all">'+(pt?'Todos':'All')+' <span>'+events.length+'</span></button>'+activeTypes.map(type=>'<button data-event-filter="'+esc(type)+'">'+esc(pick(history.event_types[type],locale))+' <span>'+events.filter(e=>e.type===type).length+'</span></button>').join('')+'</div>':'';
  const byDate=new Map();
  for(const e of events){if(!byDate.has(e.date))byDate.set(e.date,[]);byDate.get(e.date).push(e);}
  const groups=[...byDate.entries()].map(([date,items])=>'<section class="history-date-group" data-history-date="'+esc(date)+'"><div class="history-date-heading"><time datetime="'+esc(date)+'">'+esc(localeDate(date,locale))+'</time><span>'+items.length+' '+(pt?(items.length===1?'registro':'registros'):(items.length===1?'record':'records'))+'</span></div><div class="history-timeline">'+items.map(e=>eventCard(e,locale)).join('')+'</div></section>').join('');
  return '<!doctype html><html lang="'+esc(L.loc.lang)+'"><head>'+head(locale,title+' — Marginal Thinking',deck,canonical)+'</head><body class="structural-opportunity-atlas atlas-history-page" data-locale="'+esc(locale)+'"><div class="utility-bar"><div class="container utility-row"><span>'+(pt?'Economia · Política · Sociedade':'Economics · Politics · Society')+'</span><a href="'+pagePath(locale,'/reports.html')+'">'+(pt?'Arquivo de pesquisa':'Research archive')+'</a></div></div>'+L.nav('opportunities',Object.fromEntries(Object.keys(cfg.locales).map(x=>[x,pagePath(x,'/opportunities/history/')])) )+'<main><section class="atlas-hero atlas-history-hero"><div class="container">'+localNav(locale,'history')+'<div class="atlas-hero-grid"><div><div class="eyebrow">'+(pt?'Evolução do Atlas':'Atlas evolution')+'</div><h1>'+esc(title)+'</h1><p>'+esc(deck)+'</p></div><aside><strong>'+(pt?'Princípio':'Principle')+'</strong><p>'+(pt?'O estado atual é compacto; o histórico preserva cada alteração material. Mudanças não substituem silenciosamente o registro anterior.':'The current state stays compact while history preserves every material change. Changes do not silently overwrite the previous record.')+'</p></aside></div>'+metrics(locale)+'</div></section><section class="section history-section"><div class="container"><div class="atlas-intro"><div><div class="section-kicker">'+(pt?'Arquivo':'Archive')+'</div><h2>'+(pt?'Alterações registradas':'Recorded changes')+'</h2></div><p>'+(pt?'Cada evento preserva a data, a condição, a classificação aplicável e as fontes utilizadas naquele momento.':'Each event preserves the date, condition, applicable classification and the sources used at that time.')+'</p></div>'+filters+groups+'<div class="empty-state history-empty" hidden>'+(pt?'Nenhum registro corresponde ao filtro selecionado.':'No records match the selected filter.')+'</div></div></section></main>'+L.footer()+'<script src="/assets/js/app.js"></script><script>(function(){var buttons=[].slice.call(document.querySelectorAll("[data-event-filter]"));var events=[].slice.call(document.querySelectorAll(".history-event"));var dateGroups=[].slice.call(document.querySelectorAll(".history-date-group"));var empty=document.querySelector(".history-empty");buttons.forEach(function(b){b.addEventListener("click",function(){buttons.forEach(function(x){x.classList.remove("active")});b.classList.add("active");var f=b.getAttribute("data-event-filter");var visible=0;events.forEach(function(e){var show=f==="all"||e.getAttribute("data-event-type")===f;e.hidden=!show;if(show)visible++});dateGroups.forEach(function(g){g.hidden=!g.querySelector(".history-event:not([hidden])")});empty.hidden=visible>0;});});})();</script></body></html>';
}
for(const locale of Object.keys(cfg.locales)){
  write(pagePath(locale,'/opportunities/index.html'),atlasPage(locale));
  write(pagePath(locale,'/opportunities/history/index.html'),historyPage(locale));
}
write('/data/structural-opportunities.json',JSON.stringify(atlas,null,2)+'\n');
write('/data/structural-opportunity-history.json',JSON.stringify(history,null,2)+'\n');
const sitemap=path.join(out,'sitemap.xml');
if(fs.existsSync(sitemap)){
  let xml=fs.readFileSync(sitemap,'utf8');
  const urls=[];
  for(const l of Object.keys(cfg.locales)){urls.push(site+pagePath(l,'/opportunities/'));urls.push(site+pagePath(l,'/opportunities/history/'));}
  const additions=urls.filter(u=>!xml.includes('<loc>'+u+'</loc>')).map(u=>'<url><loc>'+u+'</loc><lastmod>'+atlas.updated_at+'</lastmod></url>').join('');
  if(additions)xml=xml.replace('</urlset>',additions+'</urlset>');
  fs.writeFileSync(sitemap,xml);
}
console.log('Structural Opportunity Atlas rendered:',atlas.entries.length,'entries,',history.events.length,'history events.');
