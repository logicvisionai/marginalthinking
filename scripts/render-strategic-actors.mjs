import fs from 'node:fs';
import path from 'node:path';
import {esc} from './lib/markdown.mjs';
import {makeLayout} from './lib/layout.mjs';
import {collectReports,reportView} from './lib/reports.mjs';

const root=process.cwd(),out=path.join(root,'dist');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(p,s)=>{const t=path.join(out,String(p).replace(/^\//,''));fs.mkdirSync(path.dirname(t),{recursive:true});fs.writeFileSync(t,s);};
const cfg=JSON.parse(read('site.config.json')),i18n=JSON.parse(read('data/i18n.json')),data=JSON.parse(read('data/strategic-actors.json'));
const reports=collectReports(root),reportById=new Map(reports.map(r=>[r.id,r]));
const site=cfg.site_url.replace(/\/$/,''),author=cfg.default_author,social=site+cfg.social_image,locales=Object.keys(cfg.locales);
const pagePath=(locale,p)=>{const prefix=cfg.locales[locale]?.path?'/'+cfg.locales[locale].path:'';return (prefix+p).replace(/\/+/g,'/');};
const reportPath=(item,locale)=>pagePath(locale,item?.url||'/reports.html');
const layout=locale=>makeLayout({cfg,i18n,site,author,social,locale,reportPath,pagePath});
const pick=(v,l)=>v&&typeof v==='object'&&!Array.isArray(v)?(v[l]||v.en||Object.values(v)[0]||''):(v||'');
const actorById=new Map(data.actors.map(a=>[a.id,a])),targetById=new Map(data.targets.map(t=>[t.id,t]));
const stateLabel=(v,l)=>({high:{en:'High','pt-BR':'Alta'},medium:{en:'Medium','pt-BR':'Média'},low:{en:'Low','pt-BR':'Baixa'},'not-assessed':{en:'Not assessed','pt-BR':'Não avaliada'}}[v]?.[l]||v);
const modeLabel=(v,l)=>({
  delegated:{en:'Delegated authority','pt-BR':'Autoridade delegada'},
  'direct-ownership':{en:'Direct ownership','pt-BR':'Propriedade direta'},
  'state-mandate':{en:'State mandate','pt-BR':'Mandato estatal'},
  'commercial-intermediation':{en:'Commercial intermediation','pt-BR':'Intermediação comercial'},
  'production-control':{en:'Production control','pt-BR':'Controle produtivo'},
  'technology-supply':{en:'Technology supply','pt-BR':'Fornecimento tecnológico'}
}[v]?.[l]||v);

function bestView(item,locale){if(!item)return null;const v=reportView(item,locale);if(v)return{view:v,locale};const source=item.source_locale||cfg.legacy_source_locale;return{view:reportView(item,source)||item,locale:source};}
function researchLinks(ids,locale){return [...new Set(ids||[])].map(id=>{const r=reportById.get(id);if(!r)return'';const b=bestView(r,locale);return '<a href="'+esc(pagePath(b.locale,r.url))+'">'+esc(b.view.title||id)+' <span aria-hidden="true">↗</span></a>';}).join('');}
function head(locale,title,description,canonical){const L=layout(locale),alts=Object.fromEntries(locales.map(l=>[l,pagePath(l,'/actors/')]));return '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#09131a"><meta name="description" content="'+esc(description)+'"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1"><link rel="canonical" href="'+esc(site+canonical)+'"><link rel="icon" href="/assets/brand/favicon.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&display=swap" rel="stylesheet"><link rel="stylesheet" href="/assets/css/styles.css"><link rel="stylesheet" href="/assets/css/strategic-actors.css">'+L.baseHead(title,description,canonical,'Dataset',alts)+'<title>'+esc(title)+'</title>';}

function matrix(locale){
  const pt=locale==='pt-BR',channels=Object.keys(data.channels);
  const h=channels.map(c=>'<th scope="col" data-channel="'+esc(c)+'">'+esc(pick(data.channels[c],locale))+'</th>').join('');
  const rows=data.actors.map(a=>{
    const actorRelations=data.relations.filter(r=>r.actor===a.id);
    const cells=channels.map(c=>{
      const rs=actorRelations.filter(r=>r.channel===c);
      if(!rs.length)return '<td class="is-empty" data-actor="'+esc(a.id)+'" data-channel="'+esc(c)+'"><span aria-label="'+esc(pt?'Não estabelecido':'Not established')+'">—</span></td>';
      const label=pick(a.label,locale)+' · '+pick(data.channels[c],locale)+' · '+rs.length+' '+(pt?(rs.length===1?'relação documentada':'relações documentadas'):(rs.length===1?'documented relation':'documented relations'));
      return '<td class="is-documented" data-actor="'+esc(a.id)+'" data-channel="'+esc(c)+'"><button class="matrix-cell-button" type="button" data-actor-cell="'+esc(a.id)+'|'+esc(c)+'" aria-label="'+esc(label)+'"><span aria-hidden="true">●</span><small>'+rs.length+'</small></button></td>';
    }).join('');
    const search=[pick(a.label,locale),a.legal_name,a.jurisdiction,pick(data.actor_classes[a.class],locale)].join(' ');
    return '<tr data-actor="'+esc(a.id)+'" data-class="'+esc(a.class)+'" data-search="'+esc(search.toLowerCase())+'"><th scope="row"><a href="#actor-'+esc(a.id)+'">'+esc(pick(a.label,locale))+'</a><small>'+esc(pick(data.actor_classes[a.class],locale))+'</small></th>'+cells+'</tr>';
  }).join('');
  return '<div class="actors-table-wrap" tabindex="0" aria-label="'+esc(pt?'Matriz interativa de capacidades':'Interactive capability matrix')+'"><table class="actors-matrix"><thead><tr><th scope="col">'+(pt?'Ator':'Actor')+'</th>'+h+'</tr></thead><tbody>'+rows+'</tbody></table></div>';
}
function mechanismRows(locale){
  const pt=locale==='pt-BR';
  return data.relations.map(r=>{
    const a=actorById.get(r.actor),t=targetById.get(r.target),rid='relation-'+r.actor+'-'+r.channel+'-'+r.target;
    return '<article class="actor-relation" id="'+esc(rid)+'" data-relation-actor="'+esc(r.actor)+'" data-relation-channel="'+esc(r.channel)+'" data-relation-target="'+esc(r.target)+'" data-relation-substitutability="'+esc(r.substitutability)+'"><div class="relation-path"><a href="#actor-'+esc(a.id)+'">'+esc(pick(a.label,locale))+'</a><span>→</span><strong>'+esc(pick(data.channels[r.channel],locale))+'</strong><span>→</span><b>'+esc(pick(t.label,locale))+'</b></div><p>'+esc(pick(r.mechanism,locale))+'</p><div class="relation-meta"><span>'+esc(modeLabel(r.control_mode,locale))+'</span><span>'+(pt?'Substituibilidade':'Substitutability')+': <b>'+esc(stateLabel(r.substitutability,locale))+'</b></span><span>'+(pt?'Confiança':'Confidence')+': <b>'+esc(stateLabel(r.confidence,locale))+'</b></span></div><button class="relation-inspect" type="button" data-inspect-relation="'+esc(r.actor)+'|'+esc(r.channel)+'|'+esc(r.target)+'">'+(pt?'Ver detalhes':'Inspect relation')+'</button></article>';
  }).join('');
}
function explorerControls(locale){
  const pt=locale==='pt-BR';
  const classes=Object.keys(data.actor_classes).map(k=>'<option value="'+esc(k)+'">'+esc(pick(data.actor_classes[k],locale))+'</option>').join('');
  const channels=Object.keys(data.channels).map(k=>'<option value="'+esc(k)+'">'+esc(pick(data.channels[k],locale))+'</option>').join('');
  return '<div class="actors-explorer" aria-label="'+esc(pt?'Filtros da matriz':'Matrix filters')+'"><label class="actors-search"><span>'+(pt?'Buscar ator':'Search actor')+'</span><input id="actors-search" type="search" autocomplete="off" placeholder="'+esc(pt?'Nome, jurisdição ou tipo':'Name, jurisdiction or type')+'"></label><label><span>'+(pt?'Tipo de ator':'Actor type')+'</span><select id="actors-class-filter"><option value="">'+(pt?'Todos os tipos':'All types')+'</option>'+classes+'</select></label><label><span>'+(pt?'Canal':'Channel')+'</span><select id="actors-channel-filter"><option value="">'+(pt?'Todos os canais':'All channels')+'</option>'+channels+'</select></label><label><span>'+(pt?'Substituibilidade':'Substitutability')+'</span><select id="actors-sub-filter"><option value="">'+(pt?'Qualquer nível':'Any level')+'</option><option value="low">'+(pt?'Baixa':'Low')+'</option><option value="medium">'+(pt?'Média':'Medium')+'</option><option value="high">'+(pt?'Alta':'High')+'</option></select></label><button id="actors-reset" class="actors-reset" type="button">'+(pt?'Limpar':'Reset')+'</button><div class="actors-filter-status" id="actors-filter-status" aria-live="polite"></div></div>';
}
function relationInspector(locale){
  const pt=locale==='pt-BR';
  return '<aside class="actor-inspector" id="actor-inspector" aria-live="polite"><div class="actor-inspector-kicker">'+(pt?'RELAÇÃO SELECIONADA':'SELECTED RELATION')+'</div><h3>'+(pt?'Explore uma célula documentada':'Inspect a documented cell')+'</h3><p>'+(pt?'Clique em um ponto da matriz ou em “Ver detalhes” para abrir o mecanismo, a substituibilidade e o nível de confiança sem perder o contexto da comparação.':'Click a dot in the matrix or “Inspect relation” to open the mechanism, substitutability and confidence without losing the comparison context.')+'</p></aside>';
}
function dossiers(locale){
  const pt=locale==='pt-BR';
  return data.actors.map(a=>{
    const rs=data.relations.filter(r=>r.actor===a.id),research=[...new Set([...(a.research_ids||[]),...rs.flatMap(r=>r.research_ids||[])])];
    return '<article class="actor-dossier" id="actor-'+esc(a.id)+'"><div class="actor-dossier-head"><div><span class="actor-class">'+esc(pick(data.actor_classes[a.class],locale))+'</span><h3>'+esc(pick(a.label,locale))+'</h3><p class="actor-legal">'+esc(a.legal_name)+' · '+esc(a.jurisdiction)+'</p></div><div class="actor-scale"><span>'+(pt?'Escala observada':'Observed scale')+'</span><strong>'+esc(pick(a.scale,locale))+'</strong></div></div><p class="actor-description">'+esc(pick(a.description,locale))+'</p><div class="actor-capabilities">'+rs.map(r=>'<span>'+esc(pick(data.channels[r.channel],locale))+'</span>').join('')+'</div><div class="actor-limit"><strong>'+(pt?'Limite da interpretação':'Interpretive limit')+'</strong><p>'+esc(pick(a.limits,locale))+'</p></div><div class="actor-research"><strong>'+(pt?'Pesquisa que sustenta o registro':'Supporting research')+'</strong>'+researchLinks(research,locale)+'</div></article>';
  }).join('');
}
function page(locale){
  const L=layout(locale),pt=locale==='pt-BR';
  const title=pt?'Atores Estratégicos':'Strategic Actors';
  const deck=pt?'Quem consegue alterar estruturas — e por qual mecanismo. Capital, propriedade, governança, fluxos físicos, capacidade produtiva e tecnologia são separados para evitar confundir escala com controle.':'Who can alter structures — and through which mechanism. Capital, ownership, governance, physical flows, productive capacity and technology are separated to avoid confusing scale with control.';
  const canonical=pagePath(locale,'/actors/');
  const low=data.relations.filter(r=>r.substitutability==='low').length;
  const classes=new Set(data.actors.map(a=>a.class)).size;
  return '<!doctype html><html lang="'+esc(L.loc.lang)+'"><head>'+head(locale,title+' — Marginal Thinking',deck,canonical)+'</head><body class="strategic-actors-page" data-locale="'+esc(locale)+'"><div class="utility-bar"><div class="container utility-row"><span>'+(pt?'Economia · Política · Sociedade':'Economics · Politics · Society')+'</span><a href="'+pagePath(locale,'/dependencies/')+'">'+(pt?'Rede de dependências':'Dependency network')+'</a></div></div>'+L.nav('actors',Object.fromEntries(locales.map(l=>[l,pagePath(l,'/actors/')])) )+'<main><section class="actors-hero"><div class="container actors-hero-grid"><div><div class="eyebrow">'+(pt?'CAPITAL · CONTROLE · DEPENDÊNCIA':'CAPITAL · CONTROL · DEPENDENCY')+'</div><h1>'+title+'</h1><p>'+deck+'</p></div><aside><strong>'+(pt?'Regra de leitura':'Reading rule')+'</strong><p>'+(pt?'AUM, propriedade, autoridade de voto, controle operacional, influência política e poder estatal são relações diferentes. Cada registro explicita apenas o mecanismo sustentado pela evidência.':'AUM, ownership, voting authority, operational control, political influence and state power are different relationships. Each record states only the mechanism supported by evidence.')+'</p></aside></div><div class="container actors-metrics"><div><strong>'+data.actors.length+'</strong><span>'+(pt?'atores documentados':'documented actors')+'</span></div><div><strong>'+data.relations.length+'</strong><span>'+(pt?'mecanismos':'mechanisms')+'</span></div><div><strong>'+classes+'</strong><span>'+(pt?'tipos de ator':'actor classes')+'</span></div><div><strong>'+low+'</strong><span>'+(pt?'relações de baixa substituição':'low-substitutability links')+'</span></div></div></section>'+
  '<section class="section actors-matrix-section"><div class="container"><div class="actors-section-head"><div><div class="section-kicker">'+(pt?'CAPACIDADES':'CAPABILITIES')+'</div><h2>'+(pt?'Matriz de capacidade estrutural':'Structural capability matrix')+'</h2></div><p>'+(pt?'Filtre por ator, tipo, canal ou substituibilidade. Os pontos abrem relações documentadas; células vazias significam apenas ausência de evidência suficiente neste conjunto.':'Filter by actor, type, channel or substitutability. Dots open documented relations; empty cells mean only that this dataset has not established sufficient evidence for that mechanism.')+'</p></div>'+explorerControls(locale)+'<div class="actors-matrix-layout">'+matrix(locale)+relationInspector(locale)+'</div></div></section>'+
  '<section class="section actors-mechanisms"><div class="container"><div class="actors-section-head"><div><div class="section-kicker">'+(pt?'MECANISMOS':'MECHANISMS')+'</div><h2>'+(pt?'Quem altera o quê — e como':'Who can alter what — and how')+'</h2></div><p>'+(pt?'Cada relação explicita o modo de controle ou intermediação e a possibilidade de substituição no horizonte analisado.':'Each relationship states the mode of control or intermediation and its substitutability over the stated horizon.')+'</p></div><div class="actor-relations">'+mechanismRows(locale)+'</div></div></section>'+
  '<section class="section actors-dossiers-section"><div class="container"><div class="actors-section-head"><div><div class="section-kicker">'+(pt?'ENTIDADES':'ENTITIES')+'</div><h2>'+(pt?'Dossiês dos atores':'Actor dossiers')+'</h2></div><p>'+(pt?'Somente entidades juridicamente ou operacionalmente identificáveis entram no sistema. Sobrenomes, dinastias e redes vagas não são tratados como atores sem um veículo institucional específico.':'Only legally or operationally identifiable entities enter the system. Surnames, dynasties and vague networks are not treated as actors without a specific institutional vehicle.')+'</p></div><div class="actor-dossiers">'+dossiers(locale)+'</div></div></section>'+
  '<section class="section actors-method"><div class="container actors-method-grid"><div><div class="section-kicker">'+(pt?'MÉTODO':'METHOD')+'</div><h2>'+(pt?'Escala não é controle':'Scale is not control')+'</h2></div><div><p>'+(pt?'A seleção prioriza capacidade, dependência, substituibilidade, alcance e persistência. Essas dimensões não são somadas em um ranking. O objetivo é reconstruir cadeias causais auditáveis: ator → capacidade → dependência → transmissão → mudança estrutural.':'Selection prioritizes capacity, dependency, substitutability, reach and persistence. These dimensions are not added into a ranking. The objective is to reconstruct auditable causal chains: actor → capability → dependency → transmission → structural change.')+'</p><p><a href="'+pagePath(locale,'/dependencies/')+'">'+(pt?'Abrir Rede Global de Dependências':'Open Global Dependency Network')+' →</a> · <a href="'+pagePath(locale,'/methodology.html')+'">'+(pt?'Método geral':'General method')+' →</a></p></div></div></section></main>'+L.footer()+'<script src="/assets/js/app.js"></script><script src="/assets/js/strategic-actors.js"></script></body></html>';
}
for(const locale of locales)write(pagePath(locale,'/actors/index.html'),page(locale));
write('/data/strategic-actors.json',JSON.stringify(data,null,2)+'\n');
const sitemap=path.join(out,'sitemap.xml');
if(fs.existsSync(sitemap)){let xml=fs.readFileSync(sitemap,'utf8');for(const l of locales){const u=site+pagePath(l,'/actors/');if(!xml.includes('<loc>'+u+'</loc>'))xml=xml.replace('</urlset>','<url><loc>'+u+'</loc><lastmod>'+data.updated_at+'</lastmod></url></urlset>');}fs.writeFileSync(sitemap,xml);}
console.log('Strategic Actors rendered:',data.actors.length,'actors,',data.relations.length,'mechanisms.');
