import {annotationById,pageAnnotations,createAnnotation,updateAnnotation,removeAnnotation,annotationStorageAvailable} from './annotations-store.js';

const pt=document.documentElement.lang.toLowerCase().startsWith('pt');
const text=(en,br)=>pt?br:en;
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const root=document.querySelector('main')||document.body;
const pagePath=location.pathname;
const pageTitle=(document.querySelector('h1')?.textContent||document.title||'Marginal Thinking').trim().slice(0,320);
const ignored='[data-annotation-ui],.site-header,.footer,.mobile-menu,script,style,noscript,textarea,input,select,button,svg,canvas';
let currentSelection=null,noteTimers=new Map();

if(!document.querySelector('link[data-annotation-styles]')){
  const link=document.createElement('link');link.rel='stylesheet';link.href='/assets/css/annotations.css';link.dataset.annotationStyles='true';document.head.appendChild(link);
}

function eligibleTextNodes(){
  const nodes=[],walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){
    const parent=node.parentElement;
    if(!parent||!node.nodeValue||!node.nodeValue.length||parent.closest(ignored))return NodeFilter.FILTER_REJECT;
    return NodeFilter.FILTER_ACCEPT;
  }});
  let node;while((node=walker.nextNode()))nodes.push(node);
  return nodes;
}
function flatText(nodes=eligibleTextNodes()){return nodes.map(n=>n.nodeValue).join('');}
function offsets(nodes){const map=new Map();let pos=0;for(const node of nodes){map.set(node,pos);pos+=node.nodeValue.length;}return map;}
function selectionAnchor(){
  const selection=getSelection();if(!selection||selection.rangeCount!==1||selection.isCollapsed)return null;
  const range=selection.getRangeAt(0);if(!root.contains(range.commonAncestorContainer))return null;
  const startEl=range.startContainer.nodeType===Node.TEXT_NODE?range.startContainer.parentElement:range.startContainer;
  const endEl=range.endContainer.nodeType===Node.TEXT_NODE?range.endContainer.parentElement:range.endContainer;
  if(startEl?.closest?.(ignored)||endEl?.closest?.(ignored))return null;
  for(const mark of document.querySelectorAll('mark.mt-highlight'))if(range.intersectsNode(mark))return null;
  const nodes=eligibleTextNodes(),map=offsets(nodes);
  if(!map.has(range.startContainer)||!map.has(range.endContainer))return null;
  let start=map.get(range.startContainer)+range.startOffset,end=map.get(range.endContainer)+range.endOffset;if(end<=start)return null;
  const full=flatText(nodes),raw=full.slice(start,end),left=(raw.match(/^\s+/)||[''])[0].length,right=(raw.match(/\s+$/)||[''])[0].length;
  start+=left;end-=right;const quote=full.slice(start,end);if(!quote||quote.length<2||quote.length>2400)return null;
  return {quote,prefix:full.slice(Math.max(0,start-180),start),suffix:full.slice(end,end+180),range};
}
function findAnchor(annotation){
  const nodes=eligibleTextNodes(),full=flatText(nodes),quote=annotation.quote;if(!quote)return null;
  let index=-1,best=-Infinity,from=0;
  while((from=full.indexOf(quote,from))!==-1){
    let score=0;
    if(annotation.prefix){const before=full.slice(Math.max(0,from-annotation.prefix.length),from);let i=1;while(i<=Math.min(before.length,annotation.prefix.length)&&before.at(-i)===annotation.prefix.at(-i)){score++;i++;}}
    if(annotation.suffix){const after=full.slice(from+quote.length,from+quote.length+annotation.suffix.length);let i=0;while(i<Math.min(after.length,annotation.suffix.length)&&after[i]===annotation.suffix[i]){score++;i++;}}
    if(score>best){best=score;index=from;}from+=Math.max(1,quote.length);
  }
  return index<0?null:{nodes,start:index,end:index+quote.length};
}
function wrapAnchor(annotation){
  if(annotation.type!=='highlight'||document.querySelector('mark[data-annotation-id="'+CSS.escape(annotation.id)+'"]'))return;
  const found=findAnchor(annotation);if(!found)return;
  let pos=0,first=null;
  for(const node of found.nodes){
    const nodeStart=pos,nodeEnd=pos+node.nodeValue.length;pos=nodeEnd;
    if(nodeEnd<=found.start||nodeStart>=found.end||node.parentElement?.closest('mark.mt-highlight'))continue;
    const localStart=Math.max(0,found.start-nodeStart),localEnd=Math.min(node.nodeValue.length,found.end-nodeStart);if(localEnd<=localStart)continue;
    let segment=node;if(localStart>0)segment=node.splitText(localStart);const length=localEnd-localStart;if(length<segment.nodeValue.length)segment.splitText(length);
    const mark=document.createElement('mark');mark.className='mt-highlight mt-highlight-'+annotation.color;mark.dataset.annotationId=annotation.id;mark.tabIndex=0;
    mark.setAttribute('aria-label',text('Saved highlight. Open notes.','Trecho grifado. Abrir anotações.'));
    segment.parentNode.insertBefore(mark,segment);mark.appendChild(segment);if(!first){first=mark;mark.id='annotation-'+annotation.id;}
  }
  return first;
}
function unwrap(annotationId){
  for(const mark of [...document.querySelectorAll('mark[data-annotation-id="'+CSS.escape(annotationId)+'"]')]){
    const parent=mark.parentNode;while(mark.firstChild)parent.insertBefore(mark.firstChild,mark);mark.remove();parent.normalize();
  }
}
function recolor(annotationId,color){
  for(const mark of document.querySelectorAll('mark[data-annotation-id="'+CSS.escape(annotationId)+'"]')){
    mark.classList.remove('mt-highlight-yellow','mt-highlight-cyan','mt-highlight-green','mt-highlight-rose');mark.classList.add('mt-highlight-'+color);
  }
}
function applyAll(){for(const annotation of pageAnnotations(pagePath))wrapAnchor(annotation);}

const ui=document.createElement('div');ui.dataset.annotationUi='true';
ui.innerHTML=
  '<div class="mt-selection-tools" id="mt-selection-tools" hidden role="toolbar" aria-label="'+esc(text('Text annotation tools','Ferramentas de anotação'))+'">'+
    '<button type="button" data-annotation-action="highlight">'+esc(text('Highlight','Grifar'))+'</button>'+
    '<button type="button" data-annotation-action="note">'+esc(text('Add note','Anotar'))+'</button>'+
  '</div>'+
  '<button class="mt-notes-launcher" id="mt-notes-launcher" type="button" aria-controls="mt-notes-drawer" aria-expanded="false" title="'+esc(text('Page notes','Notas da página'))+'">'+
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5h14v15H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg><span id="mt-notes-count">0</span>'+
  '</button>'+
  '<aside class="mt-notes-drawer" id="mt-notes-drawer" role="dialog" aria-modal="false" aria-labelledby="mt-notes-title" aria-hidden="true" hidden>'+
    '<div class="mt-notes-head"><div><span>'+esc(text('PERSONAL LAYER','CAMADA PESSOAL'))+'</span><h2 id="mt-notes-title">'+esc(text('Notes on this page','Notas desta página'))+'</h2></div><button type="button" class="mt-notes-close" data-annotation-close aria-label="'+esc(text('Close notes','Fechar notas'))+'">×</button></div>'+
    '<div class="mt-notes-meta"><p>'+esc(text('Highlights and notes stay in this browser and appear in your workspace.','Grifos e anotações ficam neste navegador e aparecem no seu caderno.'))+'</p><button type="button" data-page-note>'+esc(text('New page note','Nova nota da página'))+'</button></div>'+
    '<div class="mt-notes-list" id="mt-notes-list"></div>'+
    '<a class="mt-notes-workspace" href="'+(pt?'/pt-br':'')+'/workspace/#annotations">'+esc(text('Open all annotations in workspace','Abrir todas as anotações no caderno'))+' →</a>'+
  '</aside>';
document.body.appendChild(ui);

const toolbar=document.getElementById('mt-selection-tools'),drawer=document.getElementById('mt-notes-drawer'),launcher=document.getElementById('mt-notes-launcher'),list=document.getElementById('mt-notes-list'),count=document.getElementById('mt-notes-count');
let drawerHideTimer;
function hideToolbar(){toolbar.hidden=true;currentSelection=null;}
function showToolbar(){
  const anchor=selectionAnchor();if(!anchor){hideToolbar();return;}currentSelection=anchor;
  const rect=anchor.range.getBoundingClientRect();if(!rect.width&&!rect.height){hideToolbar();return;}toolbar.hidden=false;
  requestAnimationFrame(()=>{const box=toolbar.getBoundingClientRect(),pad=10;let left=rect.left+rect.width/2-box.width/2,top=rect.top-box.height-10;left=Math.max(pad,Math.min(innerWidth-box.width-pad,left));if(top<pad)top=Math.min(innerHeight-box.height-pad,rect.bottom+10);toolbar.style.left=Math.round(left)+'px';toolbar.style.top=Math.round(top)+'px';});
}
function syncDrawerTop(){const header=document.querySelector('.site-header');drawer.style.top=innerWidth<=640&&header?Math.max(0,Math.round(header.getBoundingClientRect().bottom))+'px':'0px';}
function openDrawer(annotationId=''){
  clearTimeout(drawerHideTimer);drawer.hidden=false;syncDrawerTop();renderDrawer();
  requestAnimationFrame(()=>{drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');launcher.setAttribute('aria-expanded','true');if(annotationId)drawer.querySelector('[data-annotation-card="'+CSS.escape(annotationId)+'"] textarea')?.focus();});
}
function closeDrawer(){
  drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');launcher.setAttribute('aria-expanded','false');
  clearTimeout(drawerHideTimer);
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  drawerHideTimer=setTimeout(()=>{if(!drawer.classList.contains('open'))drawer.hidden=true;},reduce?0:220);
}
function annotationCard(a){
  const colors=['yellow','cyan','green','rose'];
  const colorButtons=a.type==='highlight'?'<div class="mt-note-colors" aria-label="'+esc(text('Highlight color','Cor do grifo'))+'">'+colors.map(color=>'<button type="button" data-annotation-color="'+color+'" data-id="'+esc(a.id)+'" aria-pressed="'+String(a.color===color)+'" class="mt-color-'+color+'" aria-label="'+color+'"></button>').join('')+'</div>':'';
  return '<article class="mt-note-card" data-annotation-card="'+esc(a.id)+'">'+
    '<div class="mt-note-card-head"><span>'+(a.type==='highlight'?esc(text('Highlight','Grifo')):esc(text('Page note','Nota da página')))+'</span><time datetime="'+esc(a.updatedAt||a.createdAt)+'">'+esc(new Intl.DateTimeFormat(pt?'pt-BR':'en-US',{day:'2-digit',month:'short'}).format(new Date(a.updatedAt||a.createdAt)))+'</time></div>'+
    (a.quote?'<blockquote>'+esc(a.quote)+'</blockquote>':'')+colorButtons+
    '<label>'+esc(text('Private note','Nota pessoal'))+'<textarea data-annotation-note="'+esc(a.id)+'" maxlength="20000" placeholder="'+esc(text('Add context, a question or a follow-up…','Adicione contexto, uma dúvida ou acompanhamento…'))+'">'+esc(a.note)+'</textarea></label>'+
    '<div class="mt-note-actions">'+(a.type==='highlight'?'<button type="button" data-annotation-locate="'+esc(a.id)+'">'+esc(text('Locate','Localizar'))+'</button>':'')+'<button type="button" data-annotation-delete="'+esc(a.id)+'">'+esc(text('Delete','Excluir'))+'</button></div>'+
  '</article>';
}
function renderDrawer(){
  const items=pageAnnotations(pagePath);count.textContent=String(items.length);count.hidden=!items.length;
  list.innerHTML=items.length?items.map(annotationCard).join(''):'<div class="mt-notes-empty">'+esc(text('Select text to highlight or annotate it, or create a page note.','Selecione um trecho para grifar ou anotar, ou crie uma nota da página.'))+'</div>';
  if(!annotationStorageAvailable())list.insertAdjacentHTML('afterbegin','<p class="mt-notes-warning">'+esc(text('Browser storage is unavailable. Export important notes from the workspace before leaving.','O armazenamento do navegador está indisponível. Exporte notas importantes pelo caderno antes de sair.'))+'</p>');
}
function createFromSelection(withNote=false){
  const anchor=currentSelection||selectionAnchor();if(!anchor)return;
  const item=createAnnotation({type:'highlight',pagePath,pageTitle,locale:document.documentElement.lang,quote:anchor.quote,prefix:anchor.prefix,suffix:anchor.suffix,color:'yellow'});if(!item)return;
  hideToolbar();getSelection()?.removeAllRanges();wrapAnchor(item);renderDrawer();if(withNote)openDrawer(item.id);
}
function locate(annotationId){
  const annotation=annotationById(annotationId);if(!annotation)return;let target=document.getElementById('annotation-'+annotationId)||wrapAnchor(annotation);closeDrawer();
  if(target){target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});target.focus({preventScroll:true});}
}
document.addEventListener('mouseup',event=>{if(event.target.closest('[data-annotation-ui]'))return;setTimeout(showToolbar,0);});
document.addEventListener('touchend',event=>{if(event.target.closest('[data-annotation-ui]'))return;setTimeout(showToolbar,120);},{passive:true});
document.addEventListener('keyup',event=>{if(event.key==='Shift'||event.key.startsWith('Arrow'))setTimeout(showToolbar,0);});
document.addEventListener('pointerdown',event=>{if(!event.target.closest('#mt-selection-tools')&&!event.target.closest('mark.mt-highlight'))hideToolbar();});
toolbar.addEventListener('click',event=>{const action=event.target.closest('[data-annotation-action]')?.dataset.annotationAction;if(action==='highlight')createFromSelection(false);if(action==='note')createFromSelection(true);});
launcher.addEventListener('click',()=>drawer.classList.contains('open')?closeDrawer():openDrawer());
drawer.addEventListener('click',event=>{
  if(event.target.closest('[data-annotation-close]')){closeDrawer();return;}
  if(event.target.closest('[data-page-note]')){const item=createAnnotation({type:'page',pagePath,pageTitle,locale:document.documentElement.lang,note:''});if(item)openDrawer(item.id);return;}
  const color=event.target.closest('[data-annotation-color]');if(color){updateAnnotation(color.dataset.id,{color:color.dataset.annotationColor});recolor(color.dataset.id,color.dataset.annotationColor);renderDrawer();return;}
  const locateButton=event.target.closest('[data-annotation-locate]');if(locateButton){locate(locateButton.dataset.annotationLocate);return;}
  const del=event.target.closest('[data-annotation-delete]');if(del){const id=del.dataset.annotationDelete;unwrap(id);removeAnnotation(id);renderDrawer();}
});
drawer.addEventListener('input',event=>{const id=event.target.dataset.annotationNote;if(!id)return;clearTimeout(noteTimers.get(id));noteTimers.set(id,setTimeout(()=>{updateAnnotation(id,{note:event.target.value});noteTimers.delete(id);},220));});
document.addEventListener('click',event=>{const mark=event.target.closest('mark.mt-highlight');if(mark)openDrawer(mark.dataset.annotationId);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){hideToolbar();if(drawer.classList.contains('open'))closeDrawer();}if((event.key==='Enter'||event.key===' ')&&event.target.matches('mark.mt-highlight')){event.preventDefault();openDrawer(event.target.dataset.annotationId);}});
addEventListener('annotations:changed',event=>{const item=event.detail?.id?annotationById(event.detail.id):null;if(event.detail?.action==='remove'&&event.detail.id)unwrap(event.detail.id);if(item?.pagePath===pagePath&&item.type==='highlight'){recolor(item.id,item.color);wrapAnchor(item);}if(event.detail?.action==='update'&&document.activeElement?.matches('[data-annotation-note]'))return;renderDrawer();});
addEventListener('resize',()=>{if(drawer.classList.contains('open'))syncDrawerTop();},{passive:true});
addEventListener('hashchange',()=>{const id=location.hash.startsWith('#annotation-')?location.hash.slice(12):'';if(id)locate(id);});
applyAll();renderDrawer();const deepId=location.hash.startsWith('#annotation-')?location.hash.slice(12):'';if(deepId)setTimeout(()=>locate(deepId),120);
