// Local-first annotations for Marginal Thinking. No account, tracking or background sync.
const key='marginal-thinking-annotations-v1';
const colors=new Set(['yellow','cyan','green','rose']);
let state={version:1,annotations:[]},persistent=true;

const cleanString=(value,max='')=>typeof value==='string'?value.slice(0,max||value.length):'';
const validId=id=>typeof id==='string'&&/^ann-[\w-]{6,120}$/.test(id);
const cleanPath=value=>{
  const path=cleanString(value,700);
  return path.startsWith('/')?path:'/';
};
function sanitize(value){
  const clean={version:1,annotations:[]};
  if(value?.version!==1||!Array.isArray(value.annotations))return clean;
  for(const raw of value.annotations.slice(-4000)){
    if(!raw||!validId(raw.id))continue;
    const type=raw.type==='page'?'page':'highlight';
    const quote=cleanString(raw.quote,2400);
    if(type==='highlight'&&!quote.trim())continue;
    clean.annotations.push({
      id:raw.id,
      type,
      pagePath:cleanPath(raw.pagePath),
      pageTitle:cleanString(raw.pageTitle,320),
      locale:cleanString(raw.locale,16),
      quote,
      prefix:cleanString(raw.prefix,260),
      suffix:cleanString(raw.suffix,260),
      note:cleanString(raw.note,20000),
      color:colors.has(raw.color)?raw.color:'yellow',
      createdAt:cleanString(raw.createdAt,40),
      updatedAt:cleanString(raw.updatedAt,40)
    });
  }
  return clean;
}
function readLatest(){
  if(!persistent)return state;
  try{state=sanitize(JSON.parse(localStorage.getItem(key)||'null'));}catch{persistent=false;}
  return state;
}
function write(){
  try{localStorage.setItem(key,JSON.stringify(state));persistent=true;return true;}
  catch{persistent=false;return false;}
}
function emit(detail){dispatchEvent(new CustomEvent('annotations:changed',{detail:{...detail,persistent}}));}
function id(){
  if(globalThis.crypto?.randomUUID)return 'ann-'+crypto.randomUUID();
  return 'ann-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12);
}
try{readLatest();}catch{persistent=false;}

export const annotationStorageAvailable=()=>persistent;
export const annotationList=()=>[...readLatest().annotations].sort((a,b)=>(b.updatedAt||b.createdAt).localeCompare(a.updatedAt||a.createdAt));
export const pageAnnotations=(pagePath=location.pathname)=>annotationList().filter(a=>a.pagePath===cleanPath(pagePath));
export const annotationById=annotationId=>annotationList().find(a=>a.id===annotationId)||null;

export function createAnnotation(input={}){
  readLatest();
  const now=new Date().toISOString(),type=input.type==='page'?'page':'highlight',quote=cleanString(input.quote,2400);
  if(type==='highlight'&&!quote.trim())return null;
  const item={
    id:id(),
    type,
    pagePath:cleanPath(input.pagePath||location.pathname),
    pageTitle:cleanString(input.pageTitle||document.title,320),
    locale:cleanString(input.locale||document.documentElement.lang,16),
    quote,
    prefix:cleanString(input.prefix,260),
    suffix:cleanString(input.suffix,260),
    note:cleanString(input.note,20000),
    color:colors.has(input.color)?input.color:'yellow',
    createdAt:now,
    updatedAt:now
  };
  state.annotations.push(item);
  if(state.annotations.length>4000)state.annotations=state.annotations.slice(-4000);
  write();emit({id:item.id,action:'create'});
  return item;
}
export function updateAnnotation(annotationId,patch={}){
  readLatest();
  const index=state.annotations.findIndex(a=>a.id===annotationId);if(index<0)return false;
  const next={...state.annotations[index]};
  if(typeof patch.note==='string')next.note=patch.note.slice(0,20000);
  if(colors.has(patch.color))next.color=patch.color;
  if(typeof patch.pageTitle==='string')next.pageTitle=patch.pageTitle.slice(0,320);
  next.updatedAt=new Date().toISOString();
  state.annotations[index]=next;
  write();emit({id:annotationId,action:'update'});
  return true;
}
export function removeAnnotation(annotationId){
  readLatest();
  const before=state.annotations.length;
  state.annotations=state.annotations.filter(a=>a.id!==annotationId);
  if(state.annotations.length===before)return false;
  write();emit({id:annotationId,action:'remove'});
  return true;
}
addEventListener('storage',event=>{
  if(event.key!==key&&event.key!==null)return;
  try{state=sanitize(JSON.parse(event.newValue||'null'));persistent=true;emit({external:true,action:'sync'});}catch{}
});
