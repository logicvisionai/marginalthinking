import {annotationList,updateAnnotation,removeAnnotation,annotationStorageAvailable} from './annotations-store.js';

const pt=document.documentElement.lang.toLowerCase().startsWith('pt');
const text=(en,br)=>pt?br:en;
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const page=document.querySelector('.workspace-page'),toggle=document.getElementById('annotations-view'),count=document.getElementById('annotation-count');
const panel=document.getElementById('workspace-annotations'),results=document.getElementById('annotation-results'),query=document.getElementById('annotation-q'),type=document.getElementById('annotation-type'),exportButton=document.getElementById('annotation-export');
let timers=new Map();

if(!page||!toggle||!panel||!results)throw new Error('Workspace annotation surface is incomplete.');

function formatDate(value){try{return new Intl.DateTimeFormat(pt?'pt-BR':'en-US',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(value));}catch{return'';}}
function all(){return annotationList();}
function isActive(){return page.classList.contains('annotations-mode');}
function setActive(active,{historyMode='replace'}={}){
  page.classList.toggle('annotations-mode',active);
  toggle.setAttribute('aria-pressed',String(active));
  if(active){
    for(const button of document.querySelectorAll('.workspace-views [data-view]'))button.setAttribute('aria-pressed','false');
    render();requestAnimationFrame(()=>query?.focus({preventScroll:true}));
  }
  const hash=active?'#annotations':'';
  if(location.hash!==hash){
    const url=location.pathname+location.search+hash;
    history[historyMode==='push'?'pushState':'replaceState'](null,'',url);
  }
}
function filtered(){
  const term=normalize(query?.value),kind=type?.value||'';
  return all().filter(a=>(!kind||a.type===kind)&&(!term||normalize([a.pageTitle,a.pagePath,a.quote,a.note].join(' ')).includes(term)));
}
function colorButtons(a){
  if(a.type!=='highlight')return '';
  return '<div class="annotation-card-colors" aria-label="'+esc(text('Highlight color','Cor do grifo'))+'">'+['yellow','cyan','green','rose'].map(color=>'<button type="button" class="annotation-color annotation-color-'+color+'" data-workspace-color="'+color+'" data-id="'+esc(a.id)+'" aria-pressed="'+String(a.color===color)+'" aria-label="'+color+'"></button>').join('')+'</div>';
}
function card(a){
  const href=a.pagePath+(a.type==='highlight'?'#annotation-'+encodeURIComponent(a.id):'');
  return '<article class="annotation-card" data-workspace-annotation="'+esc(a.id)+'">'+
    '<div class="annotation-card-meta"><span>'+(a.type==='highlight'?esc(text('Highlight','Grifo')):esc(text('Page note','Nota da página')))+'</span><time datetime="'+esc(a.updatedAt||a.createdAt)+'">'+esc(formatDate(a.updatedAt||a.createdAt))+'</time></div>'+
    (a.quote?'<blockquote>'+esc(a.quote)+'</blockquote>':'')+
    colorButtons(a)+
    '<label>'+esc(text('Private note','Nota pessoal'))+'<textarea maxlength="20000" data-workspace-note="'+esc(a.id)+'" placeholder="'+esc(text('Add context, a question or follow-up…','Adicione contexto, uma dúvida ou acompanhamento…'))+'">'+esc(a.note)+'</textarea></label>'+
    '<div class="annotation-card-actions"><a href="'+esc(href)+'">'+esc(a.type==='highlight'?text('Open at highlight','Abrir no grifo'):text('Open page','Abrir página'))+' ↗</a><button type="button" data-workspace-delete="'+esc(a.id)+'">'+esc(text('Delete','Excluir'))+'</button></div>'+
  '</article>';
}
function render(){
  const items=filtered(),total=all().length;
  count.textContent=String(total);
  document.getElementById('annotation-result-count').textContent=items.length+' '+(items.length===1?text('annotation','anotação'):text('annotations','anotações'));
  if(!annotationStorageAvailable())document.getElementById('annotation-storage-note').textContent=text('Browser storage is unavailable. Export important notes before leaving.','O armazenamento do navegador está indisponível. Exporte notas importantes antes de sair.');
  const groups=new Map();
  for(const a of items){const key=a.pagePath;if(!groups.has(key))groups.set(key,{title:a.pageTitle||a.pagePath,path:a.pagePath,items:[]});groups.get(key).items.push(a);}
  results.innerHTML=groups.size?[...groups.values()].map(group=>
    '<section class="annotation-page-group"><header><div><span>'+esc(group.path)+'</span><h2><a href="'+esc(group.path)+'">'+esc(group.title)+'</a></h2></div><strong>'+group.items.length+'</strong></header><div class="annotation-page-items">'+group.items.map(card).join('')+'</div></section>'
  ).join(''):'<div class="workspace-empty"><h2>'+esc(text('No annotations match this view.','Nenhuma anotação corresponde a esta seleção.'))+'</h2><p>'+esc(text('Highlight text or create page notes anywhere on Marginal Thinking. They will appear here automatically.','Grife trechos ou crie notas de página em qualquer área da Marginal Thinking. Elas aparecerão aqui automaticamente.'))+'</p></div>';
  exportButton.disabled=!total;
}
function exportMarkdown(){
  const items=all();if(!items.length)return;
  const safe=value=>String(value??'').replace(/([\\`*_{}\[\]<>])/g,'\\$1');
  const lines=['# '+text('Marginal Thinking annotations','Anotações da Marginal Thinking'),'',''+text('Exported','Exportado')+': '+new Date().toISOString().slice(0,10),''];
  let last='';
  for(const a of items){
    if(a.pagePath!==last){last=a.pagePath;lines.push('## '+safe(a.pageTitle||a.pagePath),'',location.origin+a.pagePath,'');}
    lines.push('### '+(a.type==='highlight'?text('Highlight','Grifo'):text('Page note','Nota da página'))+' · '+(a.updatedAt||a.createdAt).slice(0,10),'');
    if(a.quote)lines.push('> '+safe(a.quote).replace(/\n/g,'\n> '),'');
    lines.push(safe(a.note)||'—','');
  }
  const blob=new Blob([lines.join('\n')],{type:'text/markdown;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='marginal-thinking-annotations-'+new Date().toISOString().slice(0,10)+'.md';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
toggle.addEventListener('click',()=>setActive(true,{historyMode:'push'}));
document.querySelector('.workspace-views')?.addEventListener('click',event=>{if(event.target.closest('[data-view]')&&isActive())setActive(false,{historyMode:'replace'});});
query?.addEventListener('input',render);type?.addEventListener('change',render);exportButton?.addEventListener('click',exportMarkdown);
panel.addEventListener('input',event=>{
  const id=event.target.dataset.workspaceNote;if(!id)return;clearTimeout(timers.get(id));
  timers.set(id,setTimeout(()=>{updateAnnotation(id,{note:event.target.value});timers.delete(id);},220));
});
panel.addEventListener('click',event=>{
  const color=event.target.closest('[data-workspace-color]');
  if(color){updateAnnotation(color.dataset.id,{color:color.dataset.workspaceColor});render();return;}
  const del=event.target.closest('[data-workspace-delete]');
  if(del){removeAnnotation(del.dataset.workspaceDelete);render();}
});
addEventListener('annotations:changed',event=>{if(event.detail?.action==='update'&&document.activeElement?.matches('[data-workspace-note]'))return;render();});
addEventListener('hashchange',()=>{if(location.hash==='#annotations'&&!isActive())setActive(true);else if(location.hash!=='#annotations'&&isActive())setActive(false);});
render();if(location.hash==='#annotations')setActive(true);
