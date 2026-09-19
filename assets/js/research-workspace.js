import {researchItem,updateResearch,storageAvailable} from './research-store.js';
import {announce} from './research-actions.js';

const catalog=JSON.parse(document.getElementById('research-catalog').textContent),{items,locale}=catalog,pt=locale==='pt-BR';
const byId=new Map(items.map(r=>[r.id,r])),prefix=pt?'/pt-br':'',form=document.getElementById('workspace-filters');
const $=id=>document.getElementById(id),esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=(en,br)=>pt?br:en;
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const date=value=>new Intl.DateTimeFormat(locale,{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(`${String(value).slice(0,10)}T12:00:00Z`));
const fields=['q','program','topic','country','kind','from','to','sort'],perPage=12;
const searchText=new Map(items.map(r=>[r.id,normalize([r.title,r.deck,r.regime,r.risk,...r.watch,r.keywords,r.programLabel,...r.topics.map(x=>x.label),...r.countries.map(x=>x.label)].join(' '))]));
let view='all',page=1,compared=[],sharedIds=[],filtered=[],inputTimer;
const inNotebook=r=>{const s=researchItem(r.id);return s.saved||s.read||s.note.length>0;};
const ids=value=>[...new Set(String(value||'').split(','))].filter(id=>byId.has(id));
function hydrate(){
  const params=new URLSearchParams(location.search);
  view=['all','saved','watch'].includes(params.get('view'))?params.get('view'):'all';
  for(const name of fields){const input=form.elements.namedItem(name);input.value=params.get(name)||(name==='sort'?'newest':'');if(name==='q')input.value=input.value.slice(0,300);}
  compared=ids(params.get('compare')).slice(0,3);sharedIds=ids(params.get('ids')).slice(0,200);page=Math.max(1,Math.min(10000,Number(params.get('page'))||1));
  if(['kind','from','to'].some(name=>form.elements.namedItem(name).value)||form.elements.sort.value==='oldest')form.querySelector('details').open=true;
}
function paramsFor(){
  const params=new URLSearchParams();
  for(const name of fields){const value=form.elements.namedItem(name).value.trim();if(value&&!(name==='sort'&&value==='newest'))params.set(name,value);}
  if(view!=='all')params.set('view',view);if(compared.length)params.set('compare',compared.join(','));if(sharedIds.length)params.set('ids',sharedIds.join(','));if(page>1)params.set('page',String(page));
  return params;
}
function updateUrl(replace=false){
  const query=paramsFor().toString(),url=`${location.pathname}${query?'?'+query:''}${location.hash}`;
  if(url!==location.pathname+location.search+location.hash)history[replace?'replaceState':'pushState'](null,'',url);
  for(const a of document.querySelectorAll('.language-switch a')){const target=new URL(a.href,location.origin);target.search=query;a.href=target.pathname+target.search;}
}
function query(){
  const values=Object.fromEntries(fields.map(name=>[name,form.elements.namedItem(name).value.trim()]));
  const terms=normalize(values.q).split(/\s+/).filter(Boolean),invalidRange=values.from&&values.to&&values.from>values.to;
  filtered=items.filter(r=>!invalidRange&&(view!=='saved'||inNotebook(r))&&(!sharedIds.length||sharedIds.includes(r.id))&&(!values.program||r.program===values.program)&&(!values.topic||r.topics.some(t=>t.id===values.topic))&&(!values.country||r.countries.some(c=>c.id===values.country))&&(!values.kind||r.kind===values.kind)&&(!values.from||r.date>=values.from)&&(!values.to||r.date<=values.to)&&terms.every(t=>searchText.get(r.id).includes(t)));
  if(values.sort==='oldest')filtered.sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
  return invalidRange;
}
function savedButton(r){return `<button type="button" class="research-save" data-save-research="${esc(r.id)}" data-research-title="${esc(r.title)}" aria-pressed="${researchItem(r.id).saved}"><span>${text('Save','Salvar')}</span></button>`;}
function compareButton(r){const on=compared.includes(r.id);return `<button type="button" data-compare="${esc(r.id)}" aria-pressed="${on}" aria-label="${esc(text('Compare research: ','Comparar pesquisa: ')+r.title)}">${on?text('Selected','Selecionada'):text('Compare','Comparar')}</button>`;}
function notes(r){const state=researchItem(r.id);return `<details class="workspace-card-notes"><summary>${state.note?text('Your notes','Suas notas'):text('Notes and reading','Notas e leitura')}</summary><label for="note-${esc(r.id)}">${text('Private note · up to 10,000 characters','Nota pessoal · até 10.000 caracteres')}<textarea id="note-${esc(r.id)}" data-note="${esc(r.id)}" maxlength="10000" placeholder="${text('What supports or challenges this thesis?','O que sustenta ou contraria esta tese?')}">${esc(state.note)}</textarea></label><span class="note-status" data-note-status="${esc(r.id)}" role="status"></span><label class="workspace-read"><input type="checkbox" data-read="${esc(r.id)}" ${state.read?'checked':''}>${text('Mark as read','Marcar como lida')}</label></details>`;}
function card(r){
  const watch=view==='watch';
  return `<article class="workspace-card" data-research-id="${esc(r.id)}"><div class="editorial-meta"><span>${esc(r.kindLabel)}</span><time datetime="${esc(r.date)}">${esc(date(r.date))} · ${r.minutes} min</time></div><h2><a href="${esc(r.url)}">${esc(r.title)}</a></h2>${watch?`<ul class="watch-list">${r.watch.map(w=>`<li>${esc(w)}</li>`).join('')||`<li>${text('No watch items published.','Sem sinais de acompanhamento publicados.')}</li>`}</ul>${r.risk?`<div class="watch-risk"><strong>${text('Published risk','Risco da pesquisa')}</strong>${esc(r.risk)}</div>`:''}`:`<p>${esc(r.deck)}</p><div class="workspace-card-tags">${r.topics.slice(0,3).map(t=>`<a href="${prefix}/workspace/?topic=${encodeURIComponent(t.id)}">${esc(t.label)}</a>`).join('')}</div>`}<div class="workspace-card-actions"><a href="${esc(r.url)}">${text('Read research','Ler pesquisa')} ↗</a>${savedButton(r)}${compareButton(r)}</div>${notes(r)}</article>`;
}
function renderResults(){
  const invalidRange=query(),pages=Math.max(1,Math.ceil(filtered.length/perPage));page=Math.min(page,pages);
  const start=(page-1)*perPage;
  $('workspace-count').textContent=invalidRange?text('Start date must precede the end date.','A data inicial deve ser anterior à data final.'):`${filtered.length} ${text('publications','pesquisas')}${filtered.length?` · ${start+1}–${Math.min(start+perPage,filtered.length)}`:''}`;
  for(const button of document.querySelectorAll('[data-view]'))button.setAttribute('aria-pressed',String(button.dataset.view===view));
  $('workspace-view-note').textContent=view==='watch'?text('Watch items quoted from the filtered publications, with their publication dates. These are research questions, not live alerts. Use My workspace to narrow the corpus to your saved reading.','Sinais extraídos das pesquisas filtradas, com a data de cada publicação. São pontos de observação, sem alertas em tempo real. Use Meu caderno para consultar suas leituras salvas.'):view==='saved'?text('Saved publications, notes and reading status on this browser. Export your workspace to keep a copy.','Pesquisas salvas, notas e leituras marcadas neste navegador. Exporte o caderno para guardar uma cópia.'):sharedIds.length?text('This link contains a shared reading selection. Personal notes are never included.','Este link contém uma seleção de leituras compartilhada. Notas pessoais não são incluídas.'):text('Combine filters and select up to three publications to compare theses, risks and watch items. Reading time is an estimate.','Combine filtros e selecione até três pesquisas para comparar teses, riscos e sinais. O tempo de leitura é uma estimativa.');
  $('workspace-results').innerHTML=filtered.length?filtered.slice(start,start+perPage).map(card).join(''):`<div class="workspace-empty"><h2>${view==='saved'?text('Your next investigation starts here.','Sua próxima investigação começa aqui.'):text('No research matches these filters.','Nenhuma pesquisa corresponde a estes filtros.')}</h2><p>${view==='saved'?text('Use Save on any publication. You can also add notes and mark your reading here. If you already have saved items, try clearing the filters.','Use Salvar em qualquer publicação. Você também pode registrar notas e marcar suas leituras aqui. Se já há pesquisas no caderno, tente limpar os filtros.'):text('Try a broader topic or date range, or clear the filters to see all publications.','Tente um tema ou período mais amplo, ou limpe os filtros para ver todo o acervo.')}</p><button type="button" data-empty-reset>${view==='saved'?text('Explore research','Explorar acervo'):text('Reset filters','Limpar filtros')}</button></div>`;
  $('workspace-pagination').innerHTML=pages>1?`<button type="button" data-page="${page-1}" ${page===1?'disabled':''}>← ${text('Previous','Anterior')}</button><span>${page} / ${pages}</span><button type="button" data-page="${page+1}" ${page===pages?'disabled':''}>${text('Next','Próxima')} →</button>`:'';
  $('workspace-export').textContent=view==='saved'?text('Export workspace','Exportar caderno'):text('Export results','Exportar resultados');
  $('workspace-export').disabled=view==='saved'?!items.some(inNotebook):!filtered.length;
  document.dispatchEvent(new Event('research:rendered'));
  syncPersonal();
}
function syncPersonal(){
  $('saved-count').textContent=items.filter(inNotebook).length;
  $('storage-status').textContent=storageAvailable()?text('Saved reading and notes stay in this browser. Export your workspace to keep a copy.','Leituras salvas e notas ficam apenas neste navegador. Exporte o caderno para guardar uma cópia.'):text('Storage is unavailable. Changes last only while this page is open. Export your workspace before leaving.','O armazenamento está indisponível. Alterações duram apenas enquanto esta página estiver aberta. Exporte o caderno antes de sair.');
}
function renderComparison(){
  const selected=compared.map(id=>byId.get(id));$('comparison').hidden=!selected.length;$('comparison-tray').hidden=!selected.length;
  $('comparison-count').textContent=`${selected.length}/3 ${text('selected','selecionadas')}`;
  const list=values=>values?.length?`<ul>${values.map(v=>`<li>${esc(v.label||v)}</li>`).join('')}</ul>`:text('Not specified','Não informado');
  const rows=[
    [text('Thesis / context','Tese / contexto'),r=>esc(r.deck)||'—'],
    [text('Regime','Regime'),r=>esc(r.regime)||text('Not specified','Não informado')],
    [text('Key risk','Risco principal'),r=>esc(r.risk)||text('Not specified','Não informado')],
    [text('What to watch','O que acompanhar'),r=>list(r.watch)],
    [text('Research topics','Temas'),r=>list(r.topics)],
    [text('Countries in metadata','Países nos metadados'),r=>list(r.countries)],
    [text('Documented connections','Conexões documentadas'),r=>r.connections.length?`<ul>${r.connections.map(x=>`<li><a href="${esc(x.url)}">${esc(x.label)} ↗</a></li>`).join('')}</ul>`:text('No explicit link registered.','Sem vínculo explícito registrado.')],
    [text('Original publication','Publicação original'),r=>`<a href="${esc(r.url)}">${text('Read research','Ler pesquisa')} ↗</a> · <a href="${esc(r.markdown)}">Markdown</a>`]
  ];
  $('comparison-content').innerHTML=selected.length?`${selected.length===1?`<p class="workspace-view-note">${text('Select another publication above to compare.','Selecione outra pesquisa acima para comparar.')}</p>`:''}<div class="comparison-scroll" role="region" tabindex="0" aria-label="${text('Research comparison. Scroll horizontally on small screens.','Comparação de pesquisas. Role horizontalmente em telas pequenas.')}"><table class="comparison-table"><thead><tr><th scope="col">${text('Reading dimensions','Dimensões de leitura')}</th>${selected.map(r=>`<th scope="col"><span>${esc(date(r.date))}</span><a href="${esc(r.url)}">${esc(r.title)}</a><button type="button" data-remove-compare="${esc(r.id)}" aria-label="${esc(text('Remove from comparison: ','Remover da comparação: ')+r.title)}">${text('Remove','Remover')} ×</button></th>`).join('')}</tr></thead><tbody>${rows.map(([name,value])=>`<tr><th scope="row">${name}</th>${selected.map(r=>`<td>${value(r)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'';
  for(const button of document.querySelectorAll('[data-compare]')){const active=compared.includes(button.dataset.compare);button.setAttribute('aria-pressed',String(active));button.textContent=active?text('Selected','Selecionada'):text('Compare','Comparar');}
}
function render(){renderResults();renderComparison();}
function reset(){form.reset();sharedIds=[];page=1;render();updateUrl();}
form.addEventListener('submit',event=>{event.preventDefault();clearTimeout(inputTimer);page=1;renderResults();updateUrl();});
form.addEventListener('input',event=>{if(event.target.name!=='q')return;clearTimeout(inputTimer);inputTimer=setTimeout(()=>{page=1;renderResults();updateUrl(true);},180);});
form.addEventListener('change',event=>{if(event.target.name==='q')return;page=1;renderResults();updateUrl();});
document.addEventListener('click',event=>{
  const target=event.target.closest('button');if(!target)return;
  if(target.hasAttribute('data-view')){view=target.dataset.view;page=1;renderResults();updateUrl();}
  if(target.hasAttribute('data-page')){page=Number(target.dataset.page);renderResults();updateUrl();$('workspace-count').scrollIntoView({block:'start'});$('workspace-count').setAttribute('tabindex','-1');$('workspace-count').focus({preventScroll:true});}
  if(target.hasAttribute('data-empty-reset')){if(view==='saved')view='all';reset();}
  const id=target.dataset.compare||target.dataset.removeCompare;
  if(id&&byId.has(id)){
    if(compared.includes(id))compared=compared.filter(x=>x!==id);
    else if(compared.length<3)compared.push(id);
    else {announce(text('Compare up to three publications. Remove one to add another.','Compare até três pesquisas. Remova uma para incluir outra.'));return;}
    renderComparison();updateUrl();
    if(target.hasAttribute('data-remove-compare')){const next=$('comparison').querySelector('button');if(!$('comparison').hidden)next?.focus();else document.querySelector('[data-compare]')?.focus();}
  }
});
$('workspace-reset').addEventListener('click',reset);
$('comparison-clear').addEventListener('click',()=>{compared=[];renderComparison();updateUrl();document.querySelector('[data-compare]')?.focus();});
document.addEventListener('input',event=>{
  const id=event.target.dataset.note;if(!id||!byId.has(id))return;
  updateResearch(id,{note:event.target.value,saved:true});
  const status=document.querySelector(`[data-note-status="${id}"]`);if(status)status.textContent=storageAvailable()?text('Saved in this browser','Salvo neste navegador'):text('Unsaved on device — export before leaving','Não salvo no dispositivo — exporte antes de sair');
});
document.addEventListener('change',event=>{const id=event.target.dataset.read;if(id&&byId.has(id))updateResearch(id,{read:event.target.checked,saved:true});});
addEventListener('research:changed',event=>{
  syncPersonal();
  if(event.detail?.external){if(!document.activeElement?.matches('[data-note]'))renderResults();else announce(text('Your workspace changed in another tab. The open note was kept on screen.','Seu caderno mudou em outra aba. A nota aberta foi mantida na tela.'));}
  else if(view==='saved'&&document.activeElement?.matches('[data-save-research]')){const id=event.detail.id;if(!inNotebook(byId.get(id))){renderResults();document.querySelector('[data-save-research]')?.focus();}}
});
addEventListener('popstate',()=>{clearTimeout(inputTimer);hydrate();render();updateUrl(true);});
$('workspace-share').addEventListener('click',async()=>{
  const params=paramsFor();params.delete('page');
  if(view==='saved'){if(!filtered.length){announce(text('There are no publications to share.','Não há pesquisas para compartilhar.'));return;}params.delete('view');params.set('ids',filtered.map(r=>r.id).join(','));}
  const url=new URL(location.pathname,location.origin);url.search=params.toString();
  try{await navigator.clipboard.writeText(url.href);announce(text('Link copied. Personal notes are not included.','Link copiado. Notas pessoais não são incluídas.'));}
  catch{$('share-fallback').hidden=false;$('workspace-share-url').value=url.href;$('workspace-share-url').focus();$('workspace-share-url').select();}
});
function exportMarkdown(selection,{personal=false,comparison=false}={}){
  if(!selection.length)return;
  const mdSafe=value=>String(value??'').replace(/([\\`*_{}\[\]<>])/g,'\\$1');
  const lines=[`# ${comparison?text('Research comparison','Comparação de pesquisas'):personal?text('Research workspace','Caderno de pesquisa'):text('Research selection','Seleção de pesquisas')}`,'','Marginal Thinking','',`${text('Exported','Exportado')}: ${new Date().toISOString().slice(0,10)}`,''];
  for(const r of selection){
    lines.push(`## ${mdSafe(r.title)}`,'',`${r.date} · ${mdSafe(r.kindLabel)}`,'',new URL(r.url,location.origin).href,'',mdSafe(r.deck),'',`### ${text('Regime','Regime')}`,mdSafe(r.regime)||'—','',`### ${text('Key risk','Risco principal')}`,mdSafe(r.risk)||'—','',`### ${text('What to watch','O que acompanhar')}`,...r.watch.map(x=>`- ${mdSafe(x)}`),'');
    if(r.connections.length)lines.push(`### ${text('Documented connections','Conexões documentadas')}`,...r.connections.map(x=>`- ${mdSafe(x.label)}: ${new URL(x.url,location.origin).href}`),'');
    if(personal){const state=researchItem(r.id);lines.push(`### ${text('Personal notes','Notas pessoais')}`,state.read?text('Read','Lida'):text('Not marked as read','Não marcada como lida'),'',mdSafe(state.note)||'—','');}
  }
  const blob=new Blob([lines.join('\n')],{type:'text/markdown;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`marginal-thinking-${comparison?'comparison':personal?'workspace':'research'}-${new Date().toISOString().slice(0,10)}.md`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  announce(personal?text('Workspace exported, including personal notes.','Caderno exportado com suas notas pessoais.'):text('Published research exported. Personal notes are not included.','Pesquisas exportadas. Notas pessoais não são incluídas.'));
}
$('workspace-export').addEventListener('click',()=>exportMarkdown(view==='saved'?items.filter(inNotebook):filtered,{personal:view==='saved'}));
$('comparison-export').addEventListener('click',()=>exportMarkdown(compared.map(id=>byId.get(id)),{comparison:true}));
hydrate();$('workspace-controls').hidden=false;render();updateUrl(true);
