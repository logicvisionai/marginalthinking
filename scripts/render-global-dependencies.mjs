import fs from 'node:fs';
import path from 'node:path';
import {esc} from './lib/markdown.mjs';
import {makeLayout} from './lib/layout.mjs';
import {collectReports,reportView} from './lib/reports.mjs';

const root=process.cwd();
const out=path.join(root,'dist');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(p,s)=>{const t=path.join(out,String(p).replace(/^[/]+/,''));fs.mkdirSync(path.dirname(t),{recursive:true});fs.writeFileSync(t,s);};
const cfg=JSON.parse(read('site.config.json'));
const i18n=JSON.parse(read('data/i18n.json'));
const graph=JSON.parse(read('data/global-dependencies.json'));
const history=JSON.parse(read('data/global-dependency-history.json'));
const reports=collectReports(root);
const reportById=new Map(reports.map(r=>[r.id,r]));
const site=cfg.site_url.replace(/\/$/,'');
const author=cfg.default_author;
const social=site+cfg.social_image;
const locales=Object.keys(cfg.locales);
const pagePath=(locale,p)=>{const prefix=cfg.locales[locale]&&cfg.locales[locale].path?'/'+cfg.locales[locale].path:'';return (prefix+p).replace(/\/+/g,'/');};
const pick=(v,l)=>v&&typeof v==='object'&&!Array.isArray(v)?(v[l]||v.en||Object.values(v)[0]||''):(v||'');
const reportPath=(item,locale)=>pagePath(locale,item&&item.url?item.url:'/reports.html');
const layout=locale=>makeLayout({cfg,i18n,site,author,social,locale,reportPath,pagePath});
const groupById=new Map(graph.groups.map(g=>[g.id,g]));
const nodeById=new Map(graph.nodes.map(n=>[n.id,n]));
const edgeById=new Map(graph.edges.map(e=>[e.id,e]));
const groupOrder=graph.groups.map(g=>g.id);
const groupIndex=new Map(groupOrder.map((g,i)=>[g,i]));
const layerX=[132,376,620,864,1108];
const nodeWidth=208, nodeHeight=78, rowGap=90;
const graphWidth=1240;
// Size each band from its actual occupancy; three-node stacks used to overlap.
let graphBottom=16;
const bandLayout=new Map(graph.groups.map(g=>{
  const rows=Math.max(1,...layerX.map((_,layer)=>graph.nodes.filter(n=>n.group===g.id&&n.layer===layer).length));
  const band={y:graphBottom,height:52+rows*rowGap};
  graphBottom+=band.height+12;
  return [g.id,band];
}));
const graphHeight=graphBottom+4;
const stateLabel=(v,l)=>({high:{en:'High','pt-BR':'Alta'},medium:{en:'Medium','pt-BR':'Média'},low:{en:'Low','pt-BR':'Baixa'}}[v]?.[l]||v);
const substLabel=(v,l)=>({high:{en:'High','pt-BR':'Alta'},medium:{en:'Medium','pt-BR':'Média'},low:{en:'Low','pt-BR':'Baixa'}}[v]?.[l]||v);
const horizonLabel=(v,l)=>{if(l!=='pt-BR')return v==='current'?'Current':v;return ({current:'Atual','immediate':'Imediato','1-3y':'1–3 anos','1-5y':'1–5 anos','3-5y':'3–5 anos'}[v]||v);};
const fmtDate=(d,l)=>{try{return new Intl.DateTimeFormat(l==='pt-BR'?'pt-BR':'en-US',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(d+'T12:00:00Z')).replace(/\./g,'');}catch{return d;}};
function bestView(item,locale){if(!item)return null;const direct=reportView(item,locale);if(direct)return {view:direct,locale};const source=item.source_locale||cfg.legacy_source_locale;return {view:reportView(item,source)||item,locale:source};}
function researchLinks(ids,locale){return (ids||[]).map(id=>{const r=reportById.get(id);if(!r)return '';const b=bestView(r,locale);const href=pagePath(b.locale,r.url);return '<a href="'+esc(href)+'">'+esc(b.view.title||id)+' <span aria-hidden="true">↗</span></a>';}).join('');}
function head(locale,title,description,canonical,type='CollectionPage'){const L=layout(locale);const target=canonical.includes('/history/')?'/dependencies/history/':'/dependencies/';const alternates=Object.fromEntries(locales.map(x=>[x,pagePath(x,target)]));return '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#09131a"><meta name="description" content="'+esc(description)+'"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1"><link rel="canonical" href="'+esc(site+canonical)+'"><link rel="icon" href="/assets/brand/favicon.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&display=swap" rel="stylesheet"><link rel="stylesheet" href="/assets/css/styles.css"><link rel="stylesheet" href="/assets/css/global-dependencies.css">'+L.baseHead(title,description,canonical,type,alternates)+'<title>'+esc(title)+'</title>';}
function localNav(locale,active){const pt=locale==='pt-BR';return '<nav class="dependency-local-nav" aria-label="'+esc(pt?'Navegação da rede':'Network navigation')+'"><a class="'+(active==='network'?'active':'')+'" href="'+pagePath(locale,'/dependencies/')+'">'+(pt?'Rede':'Network')+'</a><a class="'+(active==='history'?'active':'')+'" href="'+pagePath(locale,'/dependencies/history/')+'">'+(pt?'Histórico':'History')+'</a></nav>';}
function positions(){
  const map=new Map();
  for(const g of graph.groups){
    const band=bandLayout.get(g.id);
    for(let layer=0;layer<layerX.length;layer++){
      const ns=graph.nodes.filter(n=>n.group===g.id&&n.layer===layer).sort((a,b)=>(a.order||0)-(b.order||0));
      ns.forEach((n,i)=>map.set(n.id,{x:layerX[layer],y:band.y+34+(band.height-34)/2+(i-(ns.length-1)/2)*rowGap}));
    }
  }
  return map;
}
const pos=positions();
function edgePath(e){
  const a=pos.get(e.from),b=pos.get(e.to);if(!a||!b)return '';
  const startX=a.x+(b.x>=a.x?nodeWidth/2:-nodeWidth/2),endX=b.x+(b.x>=a.x?-nodeWidth/2:nodeWidth/2);
  const dx=Math.max(24,Math.abs(endX-startX)*.44);
  return `M ${startX} ${a.y} C ${startX+(endX>=startX?dx:-dx)} ${a.y}, ${endX-(endX>=startX?dx:-dx)} ${b.y}, ${endX} ${b.y}`;
}
function wrapLabel(label,limit=25){
  const lines=[''];
  for(const word of label.split(/\s+/)){
    const i=lines.length-1;
    if(lines[i]&&lines[i].length+word.length+1>limit)lines.push(word);
    else lines[i]+=(lines[i]?' ':'')+word;
  }
  return lines;
}
function graphSvg(locale){
  const pt=locale==='pt-BR';
  const bands=graph.groups.map(g=>{
    const {y,height}=bandLayout.get(g.id);
    return `<g class="dependency-band" data-system="${esc(g.id)}"><rect x="8" y="${y}" width="${graphWidth-16}" height="${height}" rx="8"/><text x="26" y="${y+24}">${esc(pick(g.label,locale))}</text></g>`;
  }).join('');
  const edges=graph.edges.map(e=>{
    const d=edgePath(e),rel=pick(graph.relation_types[e.relation],locale);
    const label=pick(nodeById.get(e.from).label,locale)+' → '+pick(nodeById.get(e.to).label,locale)+' · '+rel;
    return `<g class="dependency-edge criticality-${esc(e.criticality)} relation-${esc(e.relation)}" data-edge-id="${esc(e.id)}" data-system="${esc(e.group)}" data-from="${esc(e.from)}" data-to="${esc(e.to)}" tabindex="0" role="button" aria-label="${esc(label)}"><path class="edge-line" d="${d}"/><path class="edge-hit" d="${d}"/><title>${esc(label)}</title></g>`;
  }).join('');
  const nodes=graph.nodes.map(n=>{
    const p=pos.get(n.id),label=pick(n.label,locale),type=pick(graph.node_types[n.type],locale),lines=wrapLabel(label);
    const text=lines.map((line,i)=>`<tspan x="${p.x}" y="${p.y-9-(lines.length-1)*8+i*16}">${esc(line)}</tspan>`).join('');
    return `<g class="dependency-node node-type-${esc(n.type)}" data-node-id="${esc(n.id)}" data-system="${esc(n.group)}" tabindex="0" role="button" aria-label="${esc(label)}"><rect x="${p.x-nodeWidth/2}" y="${p.y-nodeHeight/2}" width="${nodeWidth}" height="${nodeHeight}" rx="6"/><text class="node-label">${text}</text><text class="node-type" x="${p.x}" y="${p.y+27}">${esc(type)}</text><title>${esc(label+' · '+type)}</title></g>`;
  }).join('');
  return `<svg class="dependency-svg" viewBox="0 0 ${graphWidth} ${graphHeight}" width="${graphWidth}" height="${graphHeight}" role="group" aria-label="${esc(pt?'Rede de dependências estruturais validadas':'Validated structural dependency network')}"><defs><marker id="dependency-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#8bdcee"/></marker></defs>${bands}${edges}${nodes}</svg>`;
}
function networkControls(locale){
  const pt=locale==='pt-BR';
  const options=graph.groups.map(g=>`<optgroup label="${esc(pick(g.label,locale))}">${graph.nodes.filter(n=>n.group===g.id).map(n=>`<option value="${esc(n.id)}">${esc(pick(n.label,locale))}</option>`).join('')}</optgroup>`).join('');
  return `<div class="dependency-toolbar" hidden>
    <div class="dependency-zoom-controls" role="group" aria-label="${pt?'Zoom da rede':'Network zoom'}">
      <button type="button" data-network-action="out" aria-label="${pt?'Diminuir zoom':'Zoom out'}">−</button>
      <output class="dependency-zoom-level" aria-label="${pt?'Nível de zoom':'Zoom level'}">100%</output>
      <button type="button" data-network-action="in" aria-label="${pt?'Aumentar zoom':'Zoom in'}">+</button>
    </div>
    <button type="button" data-network-action="fit">${pt?'Ajustar à tela':'Fit to view'}</button>
    <button type="button" data-network-action="readable">${pt?'Tamanho legível':'Readable size'}</button>
    <label class="dependency-node-jump"><span>${pt?'Ir para um nó':'Go to a node'}</span><select data-node-jump><option value="">${pt?'Selecionar nó…':'Select a node…'}</option>${options}</select></label>
    <button type="button" class="dependency-expand" data-network-action="expand" aria-haspopup="dialog" aria-expanded="false" data-open-label="${pt?'Expandir':'Expand'}" data-close-label="${pt?'Fechar tela expandida':'Close expanded view'}">${pt?'Expandir':'Expand'}</button>
  </div>`;
}
function connectedEdges(nodeId){
  const incoming=graph.edges.filter(e=>e.to===nodeId);
  const outgoing=graph.edges.filter(e=>e.from===nodeId);
  return {incoming,outgoing,all:[...incoming,...outgoing]};
}
function criticalRank(v){return ({high:3,medium:2,low:1}[v]||0);}
function pathChains(startId,direction,maxDepth=4,maxPaths=6){
  const results=[];
  const walk=(nodeId,pathNodes,pathEdges,depth)=>{
    if(depth>=maxDepth){
      if(pathEdges.length)results.push({nodes:[...pathNodes],edges:[...pathEdges]});
      return;
    }
    const candidates=graph.edges.filter(e=>direction==='out'?e.from===nodeId:e.to===nodeId)
      .sort((a,b)=>criticalRank(b.criticality)-criticalRank(a.criticality)||String(a.id).localeCompare(String(b.id)));
    let advanced=false;
    for(const e of candidates){
      const next=direction==='out'?e.to:e.from;
      if(pathNodes.includes(next))continue;
      advanced=true;
      walk(next,direction==='out'?[...pathNodes,next]:[next,...pathNodes],direction==='out'?[...pathEdges,e]:[e,...pathEdges],depth+1);
      if(results.length>=maxPaths)return;
    }
    if(!advanced&&pathEdges.length)results.push({nodes:[...pathNodes],edges:[...pathEdges]});
  };
  walk(startId,[startId],[],0);
  return results.sort((a,b)=>b.edges.length-a.edges.length).slice(0,maxPaths);
}
function relationMini(e,nodeId,locale){
  const pt=locale==='pt-BR';
  const incoming=e.to===nodeId;
  const other=nodeById.get(incoming?e.from:e.to);
  return '<article class="node-relation-item">'+
    '<div class="node-relation-head"><strong>'+esc(pick(other.label,locale))+'</strong><span>'+esc(pick(graph.relation_types[e.relation],locale))+'</span></div>'+
    '<p>'+esc(pick(e.mechanism,locale))+'</p>'+
    '<div class="node-relation-meta"><span>'+(pt?'Criticidade':'Criticality')+': <b>'+esc(stateLabel(e.criticality,locale))+'</b></span><span>'+(pt?'Substituibilidade':'Substitutability')+': <b>'+esc(substLabel(e.substitutability,locale))+'</b></span><button type="button" data-open-edge="'+esc(e.id)+'">'+(pt?'Abrir relação':'Open relationship')+' →</button></div>'+
  '</article>';
}
function pathHtml(path,locale){
  const chunks=[];
  path.nodes.forEach((nodeId,i)=>{
    const node=nodeById.get(nodeId);
    chunks.push('<span class="path-node">'+esc(pick(node?.label,locale)||nodeId)+'</span>');
    if(i<path.edges.length){
      const e=path.edges[i];
      chunks.push('<span class="path-relation">— '+esc(pick(graph.relation_types[e.relation],locale))+' →</span>');
    }
  });
  return '<div class="node-path">'+chunks.join('')+'</div>';
}
function nodeHistoryEvents(nodeId){
  const incident=new Set(graph.edges.filter(e=>e.from===nodeId||e.to===nodeId).map(e=>e.id));
  return history.events.filter(ev=>(ev.entity_type==='node'&&ev.entity_id===nodeId)||(ev.entity_type==='edge'&&incident.has(ev.entity_id||ev.edge_id)))
    .sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.event_id).localeCompare(String(a.event_id)));
}
function nodeResearchIds(nodeId){
  const n=nodeById.get(nodeId);
  const c=connectedEdges(nodeId);
  return [...new Set([...(n?.research_ids||[]),...c.all.flatMap(e=>e.research_ids||[])])];
}
function nodePanels(locale){
  const pt=locale==='pt-BR';
  return graph.nodes.map(n=>{
    const g=groupById.get(n.group);
    const c=connectedEdges(n.id);
    const critical=c.all.filter(e=>e.criticality==='high').length;
    const lowSub=c.all.filter(e=>e.substitutability==='low').length;
    const redundancies=c.all.filter(e=>e.relation==='redundancy');
    const last=c.all.map(e=>e.last_verified).filter(Boolean).sort().at(-1)||graph.updated_at;
    const upstream=pathChains(n.id,'in');
    const downstream=pathChains(n.id,'out');
    const events=nodeHistoryEvents(n.id);
    const research=nodeResearchIds(n.id);
    const empty=s=>'<p class="node-empty">'+s+'</p>';
    const incomingHtml=c.incoming.length?c.incoming.sort((a,b)=>criticalRank(b.criticality)-criticalRank(a.criticality)).map(e=>relationMini(e,n.id,locale)).join(''):empty(pt?'Nenhuma dependência a montante registrada no conjunto atual.':'No upstream dependency is recorded in the current dataset.');
    const outgoingHtml=c.outgoing.length?c.outgoing.sort((a,b)=>criticalRank(b.criticality)-criticalRank(a.criticality)).map(e=>relationMini(e,n.id,locale)).join(''):empty(pt?'Nenhuma dependência a jusante registrada no conjunto atual.':'No downstream dependency is recorded in the current dataset.');
    const redundancyHtml=redundancies.length?redundancies.map(e=>relationMini(e,n.id,locale)).join(''):empty(pt?'Nenhuma redundância explícita foi validada para este nó.':'No explicit redundancy has been validated for this node.');
    const upstreamPaths=upstream.length?upstream.map(p=>pathHtml(p,locale)).join(''):empty(pt?'Não há cadeia a montante além das relações diretas registradas.':'No upstream chain beyond the recorded direct relationships.');
    const downstreamPaths=downstream.length?downstream.map(p=>pathHtml(p,locale)).join(''):empty(pt?'Não há cadeia a jusante além das relações diretas registradas.':'No downstream chain beyond the recorded direct relationships.');
    const histHtml=events.length?events.slice(0,10).map(ev=>{
      const type=pick(history.event_types[ev.type],locale)||ev.type;
      let subject=pick(n.label,locale);
      if(ev.entity_type==='edge'){
        const e=edgeById.get(ev.entity_id||ev.edge_id);
        const from=e?.from||ev.snapshot?.from,to=e?.to||ev.snapshot?.to;
        const a=nodeById.get(from),b=nodeById.get(to);
        subject=(a&&b)?pick(a.label,locale)+' → '+pick(b.label,locale):(ev.entity_id||ev.edge_id);
      }
      return '<article class="node-history-item"><div><span>'+esc(type)+'</span><time>'+esc(fmtDate(ev.date,locale))+'</time></div><strong>'+esc(subject)+'</strong><p>'+esc(pick(ev.summary,locale))+'</p></article>';
    }).join(''):empty(pt?'Ainda não há eventos históricos associados.':'No associated historical events yet.');
    return '<section class="dependency-detail dependency-node-dossier" data-detail-node="'+esc(n.id)+'" hidden>'+
      '<div class="node-detail-header"><span class="detail-kicker">'+esc(pick(graph.node_types[n.type],locale))+'</span><h3>'+esc(pick(n.label,locale))+'</h3><p>'+esc(pick(n.description,locale))+'</p><div class="node-detail-meta"><span>'+esc(pick(g.label,locale))+'</span><span>'+(pt?'Verificado ':'Verified ')+esc(fmtDate(last,locale))+'</span></div></div>'+
      '<div class="node-tabs" role="tablist" aria-label="'+esc(pt?'Informações do nó':'Node information')+'"><button type="button" class="active" role="tab" data-node-tab="overview" aria-selected="true">'+(pt?'Visão geral':'Overview')+'</button><button type="button" role="tab" data-node-tab="dependencies" aria-selected="false">'+(pt?'Dependências':'Dependencies')+'</button><button type="button" role="tab" data-node-tab="transmission" aria-selected="false">'+(pt?'Transmissão':'Transmission')+'</button><button type="button" role="tab" data-node-tab="history" aria-selected="false">'+(pt?'Histórico':'History')+'</button><button type="button" role="tab" data-node-tab="research" aria-selected="false">'+(pt?'Pesquisa':'Research')+'</button></div>'+
      '<div class="node-tab-panel" data-node-tab-panel="overview"><div class="node-profile-grid"><div><strong>'+c.all.length+'</strong><span>'+(pt?'relações diretas':'direct relations')+'</span></div><div><strong>'+c.incoming.length+'</strong><span>'+(pt?'a montante':'upstream')+'</span></div><div><strong>'+c.outgoing.length+'</strong><span>'+(pt?'a jusante':'downstream')+'</span></div><div><strong>'+critical+'</strong><span>'+(pt?'críticas':'critical')+'</span></div><div><strong>'+lowSub+'</strong><span>'+(pt?'baixa substituibilidade':'low substitutability')+'</span></div><div><strong>'+events.length+'</strong><span>'+(pt?'eventos históricos':'history events')+'</span></div></div><div class="node-network-role"><strong>'+(pt?'Posição na rede':'Network position')+'</strong><p>'+esc(pick(g.description,locale))+'</p></div>'+(redundancies.length?'<div class="node-alert"><strong>'+(pt?'Redundância validada':'Validated redundancy')+'</strong><span>'+redundancies.length+' '+(pt?(redundancies.length===1?'relação':'relações'):(redundancies.length===1?'relationship':'relationships'))+'</span></div>':'')+'</div>'+
      '<div class="node-tab-panel" data-node-tab-panel="dependencies" hidden><div class="node-two-col"><section><h4>'+(pt?'A montante':'Upstream')+'</h4>'+incomingHtml+'</section><section><h4>'+(pt?'A jusante':'Downstream')+'</h4>'+outgoingHtml+'</section></div><section class="node-redundancy-block"><h4>'+(pt?'Alternativas e redundâncias explicitamente validadas':'Explicitly validated alternatives and redundancies')+'</h4>'+redundancyHtml+'</section></div>'+
      '<div class="node-tab-panel" data-node-tab-panel="transmission" hidden><p class="node-tab-note">'+(pt?'As cadeias abaixo conectam apenas relações já validadas individualmente. Elas ajudam a seguir a transmissão pelo sistema, mas não constituem previsão nem provam que todos os efeitos ocorrerão com a mesma intensidade.':'The chains below connect only relationships already validated individually. They trace transmission through the system but are not forecasts and do not imply equal effect magnitude.')+'</p><div class="node-path-columns"><section><h4>'+(pt?'Dependências de origem':'Upstream chains')+'</h4>'+upstreamPaths+'</section><section><h4>'+(pt?'Efeitos sobre outros elementos':'Downstream chains')+'</h4>'+downstreamPaths+'</section></div></div>'+
      '<div class="node-tab-panel" data-node-tab-panel="history" hidden><div class="node-history-list">'+histHtml+'</div><a class="detail-history-link" href="'+pagePath(locale,'/dependencies/history/?node='+encodeURIComponent(n.id))+'">'+(pt?'Abrir histórico completo do nó':'Open full node history')+' →</a></div>'+
      '<div class="node-tab-panel" data-node-tab-panel="research" hidden><p class="node-tab-note">'+(pt?'As pesquisas abaixo são a camada de evidência do nó e de suas relações diretas. O grafo não substitui as fontes e os argumentos do material original.':'The research below is the evidence layer for the node and its direct relationships. The graph does not replace the sources and arguments in the original research.')+'</p><div class="node-research-list">'+researchLinks(research,locale)+'</div></div>'+
    '</section>';
  }).join('');
}

function edgePanels(locale){const pt=locale==='pt-BR';return graph.edges.map(e=>{const a=nodeById.get(e.from),b=nodeById.get(e.to);const events=history.events.filter(x=>x.edge_id===e.id).length;return '<section class="dependency-detail" data-detail-edge="'+esc(e.id)+'" hidden><span class="detail-kicker">'+esc(pick(graph.relation_types[e.relation],locale))+'</span><h3>'+esc(pick(a.label,locale))+' → '+esc(pick(b.label,locale))+'</h3><p>'+esc(pick(e.mechanism,locale))+'</p><dl><div><dt>'+(pt?'Criticidade':'Criticality')+'</dt><dd>'+esc(stateLabel(e.criticality,locale))+'</dd></div><div><dt>'+(pt?'Substituibilidade':'Substitutability')+'</dt><dd>'+esc(substLabel(e.substitutability,locale))+'</dd></div><div><dt>'+(pt?'Confiança':'Confidence')+'</dt><dd>'+esc(stateLabel(e.confidence,locale))+'</dd></div><div><dt>'+(pt?'Horizonte':'Horizon')+'</dt><dd>'+esc(horizonLabel(e.horizon,locale))+'</dd></div><div><dt>'+(pt?'Verificação':'Verified')+'</dt><dd>'+esc(fmtDate(e.last_verified,locale))+'</dd></div></dl><div class="detail-research"><strong>'+(pt?'Pesquisa relacionada':'Related research')+'</strong>'+researchLinks(e.research_ids,locale)+'</div><a class="detail-history-link" href="'+pagePath(locale,'/dependencies/history/#edge-'+e.id)+'">'+(pt?'Histórico da relação':'Relationship history')+' · '+events+' →</a></section>';}).join('');}
function relationCards(locale){const pt=locale==='pt-BR';return graph.edges.map(e=>{const a=nodeById.get(e.from),b=nodeById.get(e.to),g=groupById.get(e.group);return '<article class="dependency-relation-card" data-relation-system="'+esc(e.group)+'"><div class="relation-card-top"><span>'+esc(pick(g.label,locale))+'</span><em>'+esc(pick(graph.relation_types[e.relation],locale))+'</em></div><h3>'+esc(pick(a.label,locale))+' → '+esc(pick(b.label,locale))+'</h3><p>'+esc(pick(e.mechanism,locale))+'</p><div class="relation-card-meta"><span>'+(pt?'Criticidade':'Criticality')+': <strong>'+esc(stateLabel(e.criticality,locale))+'</strong></span><span>'+(pt?'Substituibilidade':'Substitutability')+': <strong>'+esc(substLabel(e.substitutability,locale))+'</strong></span></div></article>';}).join('');}
function filters(locale){const pt=locale==='pt-BR';return '<div class="dependency-filters" role="group" aria-label="'+esc(pt?'Filtrar por sistema':'Filter by system')+'"><button class="active" data-system-filter="all">'+(pt?'Todos':'All')+' <span>'+graph.edges.length+'</span></button>'+graph.groups.map(g=>'<button data-system-filter="'+esc(g.id)+'">'+esc(pick(g.label,locale))+' <span>'+graph.edges.filter(e=>e.group===g.id).length+'</span></button>').join('')+'</div>';}
function metrics(locale){const pt=locale==='pt-BR';const critical=graph.edges.filter(e=>e.criticality==='high').length;const items=[[graph.nodes.length,pt?'nós validados':'validated nodes'],[graph.edges.length,pt?'relações':'relationships'],[graph.groups.length,pt?'sistemas conectados':'connected systems'],[critical,pt?'relações críticas':'critical relationships']];return '<div class="dependency-metrics">'+items.map(x=>'<div><strong>'+esc(x[0])+'</strong><span>'+esc(x[1])+'</span></div>').join('')+'</div>';}
function networkPage(locale){const L=layout(locale),pt=locale==='pt-BR';const title=pt?'Rede Global de Dependências':'Global Dependency Network';const deck=pt?'Recursos, rotas, infraestrutura, capacidade produtiva, tecnologia, instituições e capital conectados pelos mecanismos que transmitem choques e condicionam a capacidade econômica.':'Resources, routes, infrastructure, productive capacity, technology, institutions and capital connected by the mechanisms that transmit shocks and condition economic capacity.';const canonical=pagePath(locale,'/dependencies/');const legend=Object.entries(graph.node_types).map(([id,label])=>'<span class="dependency-legend-item node-type-'+esc(id)+'"><i></i>'+esc(pick(label,locale))+'</span>').join('');const defaultDetail='<section class="dependency-detail dependency-detail-default"><span class="detail-kicker">'+(pt?'Sobre a rede':'About the network')+'</span><h3>'+(pt?'Selecione um nó ou uma relação':'Select a node or relationship')+'</h3><p>'+(pt?'A rede registra mecanismos validados em pesquisas publicadas. Uma relação indica dependência, transmissão, restrição ou redundância — não uma medida automática de fluxo ou probabilidade.':'The network records mechanisms validated in published research. A relationship indicates dependence, transmission, constraint or redundancy — not an automatic measure of flow or probability.')+'</p><a href="'+pagePath(locale,'/dependencies/history/')+'">'+(pt?'Abrir histórico':'Open history')+' →</a></section>';return '<!doctype html><html lang="'+esc(L.loc.lang)+'"><head>'+head(locale,title+' — Marginal Thinking',deck,canonical)+'</head><body class="dependency-network-page" data-locale="'+esc(locale)+'"><div class="utility-bar"><div class="container utility-row"><span>'+(pt?'Economia · Política · Sociedade':'Economics · Politics · Society')+'</span><a href="'+pagePath(locale,'/reports.html')+'">'+(pt?'Arquivo de pesquisa':'Research archive')+'</a></div></div>'+L.nav('',Object.fromEntries(locales.map(x=>[x,pagePath(x,'/dependencies/')])) )+'<main><section class="dependency-hero"><div class="container">'+localNav(locale,'network')+'<div class="dependency-hero-grid"><div><div class="eyebrow">'+(pt?'RELAÇÕES ECONÔMICAS':'ECONOMIC RELATIONSHIPS')+'</div><h1>'+esc(title)+'</h1><p>'+esc(deck)+'</p></div><aside><strong>'+(pt?'Unidade de análise':'Unit of analysis')+'</strong><p>'+(pt?'A relação entre dois elementos. A rede cresce somente quando pesquisa publicada sustenta um mecanismo explícito. Ausência da rede não significa ausência de dependência.':'The relationship between two elements. The network expands only when published research supports an explicit mechanism. Absence from the network does not imply absence of dependency.')+'</p></aside></div>'+metrics(locale)+'</div></section><section class="section dependency-network-section"><div class="container"><div class="dependency-section-head"><div><div class="section-kicker">'+(pt?'ESTADO ATUAL':'CURRENT STATE')+'</div><h2>'+(pt?'Relações documentadas':'Documented relationships')+'</h2></div><p>'+(pt?'Selecione um elemento para consultar suas dependências, efeitos, alternativas e fontes. A espessura das linhas indica a criticidade da relação; confiança e possibilidade de substituição são avaliações qualitativas.':'Select an element to view its dependencies, effects, alternatives and sources. Line thickness indicates relationship criticality; confidence and substitutability are qualitative assessments.')+'</p></div>'+ '<div class="dependency-workspace">'+filters(locale)+networkControls(locale)+'<div class="dependency-stage"><div class="dependency-graph-scroll" tabindex="0" role="region" aria-label="'+(pt?'Explorar rede':'Explore network')+'" aria-describedby="dependency-help">'+graphSvg(locale)+'</div><aside class="dependency-detail-panel" hidden><button class="dependency-detail-close" type="button">'+(pt?'Voltar à rede':'Back to network')+' ×</button>'+defaultDetail+nodePanels(locale)+edgePanels(locale)+'</aside></div><p class="dependency-help" id="dependency-help">'+(pt?'Arraste para navegar. Use + e − ou dois dedos para ampliar. No computador: Ctrl + rolagem; teclado: setas, +, − e 0 para ajustar.':'Drag to navigate. Use + and − or pinch to zoom. On desktop: Ctrl + scroll; keyboard: arrows, +, − and 0 to fit.')+'</p></div><dialog class="dependency-modal" aria-label="'+esc(title)+'"></dialog><div class="dependency-legend">'+legend+'</div></div></section><section class="section dependency-index-section"><div class="container"><div class="dependency-section-head"><div><div class="section-kicker">'+(pt?'MECANISMOS':'MECHANISMS')+'</div><h2>'+(pt?'Índice de relações':'Relationship index')+'</h2></div><p>'+(pt?'Todas as relações da rede, com mecanismo econômico, fontes e pesquisas associadas.':'All network relationships, with economic mechanisms, sources and associated research.')+'</p></div><div class="dependency-relation-grid">'+relationCards(locale)+'</div></div></section><section class="section dependency-method"><div class="container dependency-method-grid"><div><div class="section-kicker">'+(pt?'EVOLUÇÃO':'EVOLUTION')+'</div><h2>'+(pt?'Histórico de revisões':'Revision history')+'</h2></div><div><p>'+(pt?'Mudanças de mecanismo, criticidade, substituibilidade ou evidência recebem um evento histórico. O grafo atual permanece compacto e o histórico preserva o estado anterior.':'Changes in mechanism, criticality, substitutability or evidence receive a history event. The current graph remains compact while history preserves the previous state.')+'</p><p><a href="'+pagePath(locale,'/dependencies/history/')+'">'+(pt?'Histórico da rede':'Network history')+' →</a> · <a href="'+pagePath(locale,'/methodology.html')+'">'+(pt?'Metodologia geral':'General methodology')+' →</a></p></div></div></section></main>'+L.footer()+'<script src="/assets/js/app.js"></script><script defer src="/assets/js/global-dependencies.js"></script></body></html>';}
function historyPage(locale){
  const L=layout(locale),pt=locale==='pt-BR';
  const title=pt?'Histórico da Rede de Dependências':'Dependency Network History';
  const deck=pt?'Registro cronológico de inclusão, revisão, reclassificação e encerramento de nós e relações estruturais monitoradas.':'Chronological record of additions, revisions, reclassifications and retirement of monitored structural nodes and relationships.';
  const canonical=pagePath(locale,'/dependencies/history/');
  const events=[...history.events].sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.event_id).localeCompare(String(a.event_id)));
  const rows=events.map(ev=>{
    const isNode=ev.entity_type==='node';
    const entityId=ev.entity_id||ev.node_id||ev.edge_id;
    let titleText=entityId,nodeIds=[];
    if(isNode){
      const n=nodeById.get(entityId);
      titleText=pick(n?.label||ev.snapshot?.label,locale)||entityId;
      nodeIds=[entityId];
    }else{
      const e=edgeById.get(entityId);
      const from=e?.from||ev.snapshot?.from||ev.from,to=e?.to||ev.snapshot?.to||ev.to;
      const a=nodeById.get(from),b=nodeById.get(to);
      titleText=(pick(a?.label,locale)||from)+' → '+(pick(b?.label,locale)||to);
      nodeIds=[from,to].filter(Boolean);
    }
    const type=pick(history.event_types[ev.type],locale)||ev.type;
    const state=ev.snapshot||{};
    const stateHtml=isNode?'<span>'+(pt?'Tipo':'Type')+': <strong>'+esc(pick(graph.node_types[state.type],locale)||state.type||'—')+'</strong></span>':'<span>'+(pt?'Criticidade':'Criticality')+': <strong>'+esc(stateLabel(state.criticality,locale))+'</strong></span><span>'+(pt?'Substituibilidade':'Substitutability')+': <strong>'+esc(substLabel(state.substitutability,locale))+'</strong></span>';
    return '<article class="dependency-history-event" data-history-entity="'+esc(ev.entity_type||'edge')+'" data-history-nodes="'+esc(nodeIds.join(' '))+'" id="event-'+esc(ev.event_id)+'"><div class="history-event-rail"><span></span></div><div class="dependency-history-body"><div class="dependency-history-meta"><span>'+esc(type)+'</span><time>'+esc(fmtDate(ev.date,locale))+'</time></div><div class="history-entity-row"><span>'+(isNode?(pt?'Nó':'Node'):(pt?'Relação':'Relationship'))+'</span><h3>'+esc(titleText)+'</h3></div><p>'+esc(pick(ev.summary,locale))+'</p><div class="dependency-history-state">'+stateHtml+'</div><div class="detail-research">'+researchLinks(ev.research_ids||[],locale)+'</div></div></article>';
  }).join('');
  const filters='<div class="dependency-history-filters"><button type="button" class="active" data-history-filter="all">'+(pt?'Todos':'All')+' <span>'+events.length+'</span></button><button type="button" data-history-filter="node">'+(pt?'Nós':'Nodes')+' <span>'+events.filter(e=>e.entity_type==='node').length+'</span></button><button type="button" data-history-filter="edge">'+(pt?'Relações':'Relationships')+' <span>'+events.filter(e=>e.entity_type!=='node').length+'</span></button></div>';
  return '<!doctype html><html lang="'+esc(L.loc.lang)+'"><head>'+head(locale,title+' — Marginal Thinking',deck,canonical)+'</head><body class="dependency-network-page dependency-history-page"><div class="utility-bar"><div class="container utility-row"><span>'+(pt?'Economia · Política · Sociedade':'Economics · Politics · Society')+'</span><a href="'+pagePath(locale,'/reports.html')+'">'+(pt?'Arquivo de pesquisa':'Research archive')+'</a></div></div>'+L.nav('',Object.fromEntries(locales.map(x=>[x,pagePath(x,'/dependencies/history/')])) )+'<main><section class="dependency-hero dependency-history-hero"><div class="container">'+localNav(locale,'history')+'<div class="dependency-hero-grid"><div><div class="eyebrow">'+(pt?'EVOLUÇÃO DA REDE':'NETWORK EVOLUTION')+'</div><h1>'+esc(title)+'</h1><p>'+esc(deck)+'</p></div><aside><strong>'+(pt?'Regra de auditoria':'Audit rule')+'</strong><p>'+(pt?'O histórico preserva as versões anteriores de cada relação. Correções indicam qual registro foi substituído.':'The history preserves previous versions of each relationship. Corrections identify the record they replace.')+'</p></aside></div>'+metrics(locale)+'</div></section><section class="section dependency-history-section"><div class="container"><div class="dependency-section-head"><div><div class="section-kicker">'+(pt?'ARQUIVO':'ARCHIVE')+'</div><h2>'+(pt?'Alterações registradas':'Recorded changes')+'</h2></div><p>'+(pt?'Cada evento preserva o tipo de entidade, o estado aplicável e as pesquisas que sustentavam a leitura naquele momento.':'Each event preserves the entity type, applicable state and research supporting the assessment at that time.')+'</p></div>'+filters+'<div class="dependency-history-list">'+rows+'</div><div class="empty-state dependency-history-empty" hidden>'+(pt?'Nenhum evento corresponde ao filtro selecionado.':'No events match the selected filter.')+'</div></div></section></main>'+L.footer()+'<script src="/assets/js/app.js"></script><script>(function(){var events=[].slice.call(document.querySelectorAll(".dependency-history-event"));var buttons=[].slice.call(document.querySelectorAll("[data-history-filter]"));var empty=document.querySelector(".dependency-history-empty");var params=new URLSearchParams(location.search);var node=params.get("node");function apply(type){var visible=0;events.forEach(function(e){var nodeMatch=!node||(e.dataset.historyNodes||"").split(" ").indexOf(node)>=0;var typeMatch=type==="all"||e.dataset.historyEntity===type;var show=nodeMatch&&typeMatch;e.hidden=!show;if(show)visible++;});empty.hidden=visible>0;}buttons.forEach(function(b){b.addEventListener("click",function(){buttons.forEach(function(x){x.classList.remove("active")});b.classList.add("active");apply(b.dataset.historyFilter);});});apply("all");})();</script></body></html>';
}


for(const locale of locales){write(pagePath(locale,'/dependencies/index.html'),networkPage(locale));write(pagePath(locale,'/dependencies/history/index.html'),historyPage(locale));}
write('/data/global-dependencies.json',JSON.stringify(graph,null,2)+'\n');
write('/data/global-dependency-history.json',JSON.stringify(history,null,2)+'\n');
const sitemap=path.join(out,'sitemap.xml');
if(fs.existsSync(sitemap)){let xml=fs.readFileSync(sitemap,'utf8');const urls=[];for(const l of locales){urls.push(site+pagePath(l,'/dependencies/'));urls.push(site+pagePath(l,'/dependencies/history/'));}const add=urls.filter(u=>!xml.includes('<loc>'+u+'</loc>')).map(u=>'<url><loc>'+u+'</loc><lastmod>'+graph.updated_at+'</lastmod></url>').join('');if(add)xml=xml.replace('</urlset>',add+'</urlset>');fs.writeFileSync(sitemap,xml);}
console.log('Global Dependency Network rendered:',graph.nodes.length,'nodes,',graph.edges.length,'relationships.');