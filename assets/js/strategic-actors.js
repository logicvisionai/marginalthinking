(()=>{
  const page=document.querySelector('.strategic-actors-page');if(!page)return;
  const pt=(page.dataset.locale||'').toLowerCase().startsWith('pt');
  const search=document.querySelector('#actors-search');
  const classFilter=document.querySelector('#actors-class-filter');
  const channelFilter=document.querySelector('#actors-channel-filter');
  const subFilter=document.querySelector('#actors-sub-filter');
  const reset=document.querySelector('#actors-reset');
  const status=document.querySelector('#actors-filter-status');
  const inspector=document.querySelector('#actor-inspector');
  const rows=[...document.querySelectorAll('.actors-matrix tbody tr[data-actor]')];
  const relations=[...document.querySelectorAll('.actor-relation[data-relation-actor]')];
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const actorRelations=id=>relations.filter(r=>r.dataset.relationActor===id);

  function apply(){
    const q=norm(search?.value.trim()),cls=classFilter?.value||'',channel=channelFilter?.value||'',sub=subFilter?.value||'';
    for(const row of rows){
      const rels=actorRelations(row.dataset.actor);
      const matchesText=!q||norm(row.dataset.search).includes(q);
      const matchesClass=!cls||row.dataset.class===cls;
      const matchesChannel=!channel||rels.some(r=>r.dataset.relationChannel===channel);
      const matchesSub=!sub||rels.some(r=>(!channel||r.dataset.relationChannel===channel)&&r.dataset.relationSubstitutability===sub);
      row.hidden=!(matchesText&&matchesClass&&matchesChannel&&matchesSub);
    }
    const visibleActors=new Set(rows.filter(r=>!r.hidden).map(r=>r.dataset.actor));
    for(const rel of relations){
      rel.hidden=!visibleActors.has(rel.dataset.relationActor)||(channel&&rel.dataset.relationChannel!==channel)||(sub&&rel.dataset.relationSubstitutability!==sub);
    }
    for(const cell of document.querySelectorAll('.actors-matrix [data-channel]'))cell.classList.toggle('channel-muted',!!channel&&cell.dataset.channel!==channel);
    const relCount=relations.filter(r=>!r.hidden).length,n=visibleActors.size;
    if(status)status.textContent=pt?(n+' ator'+(n===1?'':'es')+' · '+relCount+' relaç'+(relCount===1?'ão':'ões')):(n+' actor'+(n===1?'':'s')+' · '+relCount+' relation'+(relCount===1?'':'s'));
  }

  function inspect(actor,channel,target){
    if(!inspector)return;
    const matches=relations.filter(r=>r.dataset.relationActor===actor&&r.dataset.relationChannel===channel&&(!target||r.dataset.relationTarget===target));
    if(!matches.length)return;
    const actorRow=rows.find(r=>r.dataset.actor===actor);
    const actorName=actorRow?.querySelector('th a')?.textContent?.trim()||actor;
    const blocks=matches.map(rel=>{
      const path=rel.querySelector('.relation-path')?.innerHTML||'';
      const mechanism=rel.querySelector('p')?.innerHTML||'';
      const meta=rel.querySelector('.relation-meta')?.innerHTML||'';
      return '<section class="actor-inspector-item"><div class="relation-path">'+path+'</div><p>'+mechanism+'</p><div class="relation-meta">'+meta+'</div></section>';
    }).join('');
    inspector.innerHTML='<div class="actor-inspector-kicker">'+(pt?'RELAÇÃO SELECIONADA':'SELECTED RELATION')+'</div><h3>'+actorName+'</h3>'+blocks+'<a class="actor-inspector-dossier" href="#actor-'+actor+'">'+(pt?'Abrir dossiê do ator':'Open actor dossier')+' →</a>';
    inspector.classList.add('has-selection');
    const first=matches[0];if(first?.id)history.replaceState(null,'','#'+first.id);
    if(innerWidth<980)inspector.scrollIntoView({behavior:'smooth',block:'start'});
  }

  for(const btn of document.querySelectorAll('[data-actor-cell]'))btn.addEventListener('click',()=>{const parts=btn.dataset.actorCell.split('|');inspect(parts[0],parts[1],'');});
  for(const btn of document.querySelectorAll('[data-inspect-relation]'))btn.addEventListener('click',()=>{const parts=btn.dataset.inspectRelation.split('|');inspect(parts[0],parts[1],parts[2]||'');});
  for(const el of [search,classFilter,channelFilter,subFilter])el?.addEventListener(el===search?'input':'change',apply);
  reset?.addEventListener('click',()=>{if(search)search.value='';if(classFilter)classFilter.value='';if(channelFilter)channelFilter.value='';if(subFilter)subFilter.value='';apply();search?.focus();});
  if(location.hash.startsWith('#relation-')){const rel=document.querySelector(location.hash);if(rel)inspect(rel.dataset.relationActor,rel.dataset.relationChannel,rel.dataset.relationTarget);}
  apply();
})();