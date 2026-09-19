import fs from 'node:fs';
import path from 'node:path';
import {collectReports,reportView,availableLocales} from './lib/reports.mjs';

const root=process.cwd();
const out=path.join(root,'dist');
const cfg=JSON.parse(fs.readFileSync(path.join(root,'site.config.json'),'utf8'));
const atlas=JSON.parse(fs.readFileSync(path.join(root,'data/structural-opportunities.json'),'utf8'));
const dependency=JSON.parse(fs.readFileSync(path.join(root,'data/global-dependencies.json'),'utf8'));
const technologySignals=JSON.parse(fs.readFileSync(path.join(root,'data/technology-signals.json'),'utf8'));
const reports=collectReports(root);
const stateOrder=['blocking_inefficiency','exploitable_inefficiency','blocking_efficiency','leverageable_efficiency'];

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pick=(v,l)=>v&&typeof v==='object'&&!Array.isArray(v)?(v[l]||v.en||Object.values(v)[0]||''):(v||'');
const stateClass=s=>String(s||'').replace(/_/g,'-');
const pagePath=(locale,p)=>{
  const prefix=cfg.locales[locale]&&cfg.locales[locale].path?'/'+cfg.locales[locale].path:'';
  return (prefix+p).replace(/\/+/g,'/');
};
const bestView=(item,locale)=>{
  if(!item)return null;
  const direct=reportView(item,locale);
  if(direct)return {view:direct,locale:locale};
  const source=item.source_locale||cfg.legacy_source_locale;
  return {view:reportView(item,source)||item,locale:source};
};
const reportHref=(item,locale)=>{
  const b=bestView(item,locale);
  if(!b)return pagePath(locale,'/reports.html');
  return pagePath(b.locale,item.url);
};

function labels(locale){
  return locale==='pt-BR'?{
    title:'Sistemas analíticos',
    dependency:'Rede Global de Dependências',
    dependencyKicker:'INTERDEPENDÊNCIAS SISTÊMICAS',
    dependencyDeck:'Recursos, rotas, infraestrutura, tecnologia e capital conectados pelos mecanismos que transmitem choques e condicionam capacidade econômica.',
    dependencyOpen:'Explorar rede',
    dependencyNodes:'nós',
    dependencyEdges:'relações',
    dependencyCritical:'relações críticas',
    deck:'A pesquisa é acumulada em estruturas reutilizáveis: sinais, contexto e condições econômicas que podem bloquear valor ou criar alavancagem.',
    kicker:'INTELIGÊNCIA ACUMULADA',
    atlas:'Atlas de Oportunidades Estruturais',
    structural:'Camada estrutural',
    atlasDeck:'Onde ineficiências impedem valor ou podem ser exploradas — e onde eficiências funcionam como barreira ou como infraestrutura aproveitável.',
    open:'Abrir Atlas',
    countries:'países mapeados',
    conditions:'condições estruturais',
    transitions:'transições em observação',
    verified:'última verificação',
    radar:'Agora no radar',
    signals:'SINAIS ESTRUTURAIS',
    all:'Explorar todos os casos',
    tech:'SINAIS DE TECNOLOGIA',
    techFallback:'Mudanças tecnológicas com capacidade de alterar produção e sociedade',
    techDeck:'Acompanha pesquisadores, laboratórios, implantação, escala, restrições físicas e transmissão econômica — não hype.',
    techLink:'Explorar sinais',
    context:'CONTEXTO DE PAÍSES',
    contextFallback:'Política, economia e sociedade ligadas ao mecanismo da pesquisa',
    contextDeck:'Dossiês orientados por eventos explicam instituições, estrutura produtiva, relações externas e dependências quando isso muda a interpretação de uma pesquisa.',
    contextLink:'Explorar países e regiões',
    high:'confiança alta',
    states:{
      blocking_inefficiency:'Ineficiência impeditiva',
      exploitable_inefficiency:'Ineficiência explorável',
      blocking_efficiency:'Eficiência impeditiva',
      leverageable_efficiency:'Eficiência aproveitável'
    }
  }:{
    title:'Analytical systems',
    dependency:'Global Dependency Network',
    dependencyKicker:'SYSTEMIC INTERDEPENDENCIES',
    dependencyDeck:'Resources, routes, infrastructure, technology and capital connected by the mechanisms that transmit shocks and condition economic capacity.',
    dependencyOpen:'Explore network',
    dependencyNodes:'nodes',
    dependencyEdges:'relationships',
    dependencyCritical:'critical relationships',
    deck:'Research accumulates into reusable structures: signals, context and economic conditions that can block value or create leverage.',
    kicker:'CUMULATIVE INTELLIGENCE',
    atlas:'Structural Opportunity Atlas',
    structural:'Structural layer',
    atlasDeck:'Where inefficiencies block value or can be exploited — and where efficiencies function as barriers or reusable infrastructure.',
    open:'Open Atlas',
    countries:'countries mapped',
    conditions:'structural conditions',
    transitions:'transitions under watch',
    verified:'last verified',
    radar:'Now on the radar',
    signals:'STRUCTURAL SIGNALS',
    all:'Explore all cases',
    tech:'TECHNOLOGY SIGNALS',
    techFallback:'Technology changes with the capacity to alter production and society',
    techDeck:'Tracks researchers, laboratories, deployment, scale, physical constraints and economic transmission — not hype.',
    techLink:'Explore signals',
    context:'COUNTRY CONTEXT',
    contextFallback:'Politics, economics and society connected to the research mechanism',
    contextDeck:'Event-driven dossiers explain institutions, productive structure, external relations and dependencies when they change how research should be interpreted.',
    contextLink:'Explore countries & regions',
    high:'high confidence',
    states:{
      blocking_inefficiency:'Blocking inefficiency',
      exploitable_inefficiency:'Exploitable inefficiency',
      blocking_efficiency:'Blocking efficiency',
      leverageable_efficiency:'Leverageable efficiency'
    }
  };
}

function dependencyPreview(locale,L){
  const href=pagePath(locale,'/dependencies/');
  const nodes=(dependency.nodes||[]).filter(n=>n.home_preview);
  const ids=new Set(nodes.map(n=>n.id));
  const edges=(dependency.edges||[]).filter(e=>e.home_preview&&ids.has(e.from)&&ids.has(e.to));
  const nodeById=new Map(nodes.map(n=>[n.id,n]));
  const critical=(dependency.edges||[]).filter(e=>e.criticality==='high').length;
  const mobilePosition=p=>({x:p.y>60?75:25,y:p.x});
  const paths=mobile=>edges.map(e=>{
    let a=nodeById.get(e.from).home_preview,b=nodeById.get(e.to).home_preview;
    if(mobile){a=mobilePosition(a);b=mobilePosition(b);}
    const bend=Math.max(4,Math.abs(mobile?b.y-a.y:b.x-a.x)*.28);
    const skipsNode=nodes.some(n=>n.id!==e.from&&n.id!==e.to&&n.home_preview.y===nodeById.get(e.from).home_preview.y&&n.home_preview.x>nodeById.get(e.from).home_preview.x&&n.home_preview.x<nodeById.get(e.to).home_preview.x);
    const d=skipsNode?(mobile?`M ${a.x} ${a.y} C 103 ${a.y}, 103 ${b.y}, ${b.x} ${b.y}`:`M ${a.x} ${a.y} C ${a.x} 103, ${b.x} 103, ${b.x} ${b.y}`):mobile?`M ${a.x} ${a.y} C ${a.x} ${a.y+bend}, ${b.x} ${b.y-bend}, ${b.x} ${b.y}`:`M ${a.x} ${a.y} C ${a.x+bend} ${a.y}, ${b.x-bend} ${b.y}, ${b.x} ${b.y}`;
    return '<path class="home-dependency-edge '+(e.criticality==='high'?'critical':'')+'" d="'+d+'"/>';
  }).join('');
  const nodeHtml=nodes.map(n=>{
    const p=n.home_preview,m=mobilePosition(p);
    return `<span class="home-dependency-node node-${esc(n.type)}" style="--node-x:${p.x}%;--node-y:${p.y}%;--mobile-x:${m.x}%;--mobile-y:${m.y}%"><b>${esc(pick(n.label,locale))}</b></span>`;
  }).join('');
  return '<article class="home-dependency-feature"><div class="home-dependency-copy"><span class="home-dependency-kicker">'+esc(L.dependencyKicker)+'</span><h3>'+esc(L.dependency)+'</h3><p>'+esc(L.dependencyDeck)+'</p><div class="home-dependency-metrics"><span><strong>'+dependency.nodes.length+'</strong>'+esc(L.dependencyNodes)+'</span><span><strong>'+dependency.edges.length+'</strong>'+esc(L.dependencyEdges)+'</span><span><strong>'+critical+'</strong>'+esc(L.dependencyCritical)+'</span></div><a href="'+esc(href)+'">'+esc(L.dependencyOpen)+' <span aria-hidden="true">→</span></a></div><a class="home-dependency-canvas" href="'+esc(href)+'" aria-label="'+esc(L.dependencyOpen)+'"><svg class="home-dependency-horizontal" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">'+paths(false)+'</svg><svg class="home-dependency-vertical" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">'+paths(true)+'</svg>'+nodeHtml+'</a></article>';

}

function technologySignalForReport(report){
  if(!report)return null;
  return (technologySignals.signals||[]).find(s=>(s.related_research_ids||[]).includes(report.id))||
    (technologySignals.signals||[]).find(s=>String(report.id||'').endsWith('-'+s.slug))||null;
}
function technologyStage(signal,report){
  const raw=String(signal&&signal.evidence_stage||report&&report.technology_maturity||'').toLowerCase();
  if(/scale|scaled|mature/.test(raw))return 3;
  if(/deploy|service|operational/.test(raw))return 2;
  if(/demonstrat|prototype|pilot|experimental/.test(raw))return 1;
  return 0;
}
function technologyVisual(report,locale){
  const pt=locale==='pt-BR';
  const signal=technologySignalForReport(report);
  const current=technologyStage(signal,report);
  const stages=pt?['Pesquisa','Demonstração','Implantação','Escala']:['Research','Demonstration','Deployment','Scale'];
  const constraint=(report&&Array.isArray(report.key_constraints)&&report.key_constraints[0])||
    (signal&&Array.isArray(signal.constraints)&&signal.constraints[0])||
    (pt?'restrição ainda em validação':'constraint under validation');
  const maturity=(signal&&signal.evidence_stage)||report&&report.technology_maturity||'';
  return '<div class="home-semantic-visual home-tech-visual" aria-hidden="true">'+
    '<div class="home-tech-stage-label">'+(pt?'MATURIDADE':'MATURITY')+(maturity?' · '+esc(String(maturity).replace(/-/g,' ')):'')+'</div>'+
    '<div class="home-tech-rail">'+stages.map((label,i)=>'<div class="home-tech-stage '+(i<current?'is-reached ':'')+(i===current?'is-current':'')+'"><i></i><span>'+esc(label)+'</span></div>').join('')+'</div>'+
    '<div class="home-tech-constraint"><span>'+(pt?'RESTRIÇÃO ATUAL':'CURRENT CONSTRAINT')+'</span><strong>'+esc(constraint)+'</strong></div>'+
  '</div>';
}
function contextVisual(context,locale){
  const pt=locale==='pt-BR';
  const dims=new Set((context&&context.dimensions)||[]);
  const topics=new Set((context&&context.topics)||[]);
  const generic=!context;
  const active={
    politics:generic||dims.has('politics'),
    economy:generic||dims.has('economy'),
    society:generic||dims.has('society'),
    external:generic||topics.has('trade-investment')||topics.has('geopolitics-security')||topics.has('infrastructure-logistics')
  };
  const labels=pt?{politics:'POLÍTICA',economy:'ECONOMIA',society:'SOCIEDADE',external:'EXTERNO',core:'PAÍS'}:{politics:'POLITICS',economy:'ECONOMY',society:'SOCIETY',external:'EXTERNAL',core:'COUNTRY'};
  return '<div class="home-semantic-visual home-context-visual" aria-hidden="true">'+
    '<svg class="home-context-links" viewBox="0 0 100 100" preserveAspectRatio="none"><line x1="50" y1="50" x2="50" y2="17"/><line x1="50" y1="50" x2="83" y2="50"/><line x1="50" y1="50" x2="50" y2="83"/><line x1="50" y1="50" x2="17" y2="50"/></svg>'+
    '<span class="context-axis context-politics '+(active.politics?'is-active':'')+'"><i></i><b>'+labels.politics+'</b></span>'+
    '<span class="context-axis context-economy '+(active.economy?'is-active':'')+'"><i></i><b>'+labels.economy+'</b></span>'+
    '<span class="context-axis context-society '+(active.society?'is-active':'')+'"><i></i><b>'+labels.society+'</b></span>'+
    '<span class="context-axis context-external '+(active.external?'is-active':'')+'"><i></i><b>'+labels.external+'</b></span>'+
    '<strong class="context-core">'+labels.core+'</strong>'+
  '</div>';
}

function matrixCell(entry,state,count,locale,L){
  const country=entry?pick(entry.country&&entry.country.name,locale):'';
  const feature=entry?pick(entry.feature,locale):'';
  return '<a class="home-matrix-cell matrix-'+stateClass(state)+'" href="'+esc(pagePath(locale,'/opportunities/'))+'">'+
    '<span class="home-matrix-label">'+esc(L.states[state])+'</span>'+
    '<strong>'+esc(count)+'</strong>'+
    (entry?'<small>'+esc(country)+' · '+esc(feature)+'</small>':'')+
    '<i aria-hidden="true">↗</i></a>';
}

function signalCard(e,locale,L){
  const href=pagePath(locale,'/opportunities/')+'#entry-'+encodeURIComponent(e.id);
  const confidence=e.confidence==='high'?L.high:e.confidence;
  return '<a class="home-signal" href="'+esc(href)+'">'+
    '<span>'+esc(pick(e.country&&e.country.name,locale))+'</span>'+
    '<strong>'+esc(pick(e.feature,locale))+'</strong>'+
    '<em>'+esc(L.states[e.state]||e.state)+' · '+esc(confidence)+'</em></a>';
}

function section(locale){
  const L=labels(locale),entries=atlas.entries||[];
  const counts=Object.fromEntries(stateOrder.map(s=>[s,entries.filter(e=>e.state===s).length]));
  const countries=new Set(entries.map(e=>e.country&&e.country.code).filter(Boolean)).size;
  const transitions=entries.filter(e=>e.transition).length;
  const last=atlas.updated_at||entries.map(e=>e.last_verified).filter(Boolean).sort().at(-1)||'—';
  const priority={exploitable_inefficiency:4,blocking_efficiency:3,blocking_inefficiency:2,leverageable_efficiency:1};
  const signals=[...entries].sort((a,b)=>(b.transition?1:0)-(a.transition?1:0)||(priority[b.state]||0)-(priority[a.state]||0)||String(b.last_verified||'').localeCompare(String(a.last_verified||''))).slice(0,3);
  const matrix=stateOrder.map(s=>matrixCell(entries.find(e=>e.state===s),s,counts[s]||0,locale,L)).join('');
  const tech=reports.find(r=>r.kind==='weekly-technology-signal'||String(r.id||'').startsWith('MT-TS-'));
  const techB=bestView(tech,locale);
  const context=reports.find(r=>r.kind==='country-context'||r.context_role==='country-context');
  const contextB=bestView(context,locale);
  const techTitle=techB&&techB.view&&techB.view.title?techB.view.title:L.techFallback;
  const contextTitle=contextB&&contextB.view&&contextB.view.title?contextB.view.title:L.contextFallback;
  const techHref=tech?reportHref(tech,locale):pagePath(locale,'/reports.html');
  const contextHref=context?reportHref(context,locale):pagePath(locale,'/regions/');
  const atlasHref=pagePath(locale,'/opportunities/');
  return '<section class="section home-analytical" aria-labelledby="analytical-systems-title">'+
    '<div class="container">'+
      '<div class="home-analytical-head"><div><div class="home-analytical-kicker">'+esc(L.kicker)+'</div><h2 id="analytical-systems-title">'+esc(L.title)+'</h2></div><p>'+esc(L.deck)+'</p></div>'+dependencyPreview(locale,L)+
      '<article class="home-atlas-feature">'+
        '<div class="home-atlas-main">'+
          '<div class="home-atlas-title-row"><div><span>'+esc(L.structural)+'</span><h3>'+esc(L.atlas)+'</h3></div><a class="home-atlas-open" href="'+esc(atlasHref)+'">'+esc(L.open)+' <span aria-hidden="true">→</span></a></div>'+
          '<p class="home-atlas-deck">'+esc(L.atlasDeck)+'</p>'+
          '<div class="home-atlas-metrics">'+
            '<div><strong>'+countries+'</strong><span>'+esc(L.countries)+'</span></div>'+
            '<div><strong>'+entries.length+'</strong><span>'+esc(L.conditions)+'</span></div>'+
            '<div><strong>'+transitions+'</strong><span>'+esc(L.transitions)+'</span></div>'+
            '<div><strong>'+esc(last)+'</strong><span>'+esc(L.verified)+'</span></div>'+
          '</div>'+
          '<div class="home-matrix" aria-label="'+esc(locale==='pt-BR'?'Matriz estrutural 2 por 2':'Structural 2 by 2 matrix')+'">'+matrix+'</div>'+
        '</div>'+
        '<aside class="home-atlas-signals"><div class="home-signals-head"><span>'+esc(L.signals)+'</span><strong>'+esc(L.radar)+'</strong></div>'+signals.map(e=>signalCard(e,locale,L)).join('')+'<a class="home-signal-all" href="'+esc(atlasHref)+'">'+esc(L.all)+' →</a></aside>'+
      '</article>'+
      '<div class="home-layer-grid">'+
        '<a class="home-layer-card home-layer-tech" href="'+esc(techHref)+'">'+technologyVisual(tech,locale)+'<div><span>'+esc(L.tech)+'</span><h3>'+esc(techTitle)+'</h3><p>'+esc(L.techDeck)+'</p><em>'+esc(L.techLink)+' →</em></div></a>'+
        '<a class="home-layer-card home-layer-context" href="'+esc(contextHref)+'">'+contextVisual(context,locale)+'<div><span>'+esc(L.context)+'</span><h3>'+esc(contextTitle)+'</h3><p>'+esc(L.contextDeck)+'</p><em>'+esc(L.contextLink)+' →</em></div></a>'+
      '</div>'+
    '</div>'+
  '</section>';
}

function inject(locale,file){
  let html=fs.readFileSync(file,'utf8');
  if(html.includes('home-analytical'))return;
  html=html.replace('</head>','<link rel="stylesheet" href="/assets/css/home-analytics.css"></head>');
  const re=/<section class="section"><div class="container"><div class="section-head"><h2>[^<]+<\/h2><\/div><div class="research-programs">/;
  const match=html.match(re);
  if(!match)throw new Error('Could not locate research-programs section in '+file);
  html=html.replace(match[0],section(locale)+match[0]);
  fs.writeFileSync(file,html);
}

inject('en',path.join(out,'index.html'));
inject('pt-BR',path.join(out,'pt-br/index.html'));
console.log('Homepage analytical systems injected from canonical Atlas data.');
