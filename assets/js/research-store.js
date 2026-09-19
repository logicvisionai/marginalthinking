// Personal notes stay on this device. No account, tracking or background sync.
const key='marginal-thinking-workspace-v1';
const validId=id=>typeof id==='string'&&/^MT-[\w-]{1,160}$/.test(id);
let state={version:1,items:{}},persistent=true;
function sanitize(value){
  const clean={version:1,items:{}};
  if(value?.version!==1||!value.items||typeof value.items!=='object')return clean;
  for(const [id,item] of Object.entries(value.items).slice(0,2000))if(validId(id)&&item&&typeof item==='object')clean.items[id]={saved:item.saved===true,read:item.read===true,note:typeof item.note==='string'?item.note.slice(0,10000):'',savedAt:typeof item.savedAt==='string'?item.savedAt.slice(0,30):''};
  return clean;
}
try{state=sanitize(JSON.parse(localStorage.getItem(key)||'null'));}catch{persistent=false;}
export const storageAvailable=()=>persistent;
export const researchState=()=>state;
export const researchItem=id=>state.items[id]||{saved:false,read:false,note:'',savedAt:''};
export function updateResearch(id,patch){
  if(!validId(id))return false;
  // Merge the latest storage snapshot so another open tab's notes are preserved.
  if(persistent)try{state=sanitize(JSON.parse(localStorage.getItem(key)||'null'));}catch{persistent=false;}
  const current=researchItem(id),next={...current};
  if(typeof patch.saved==='boolean'){next.saved=patch.saved;if(next.saved&&!current.saved)next.savedAt=new Date().toISOString();}
  if(typeof patch.read==='boolean')next.read=patch.read;
  if(typeof patch.note==='string')next.note=patch.note.slice(0,10000);
  state.items[id]=next;
  try{localStorage.setItem(key,JSON.stringify(state));persistent=true;}catch{persistent=false;}
  dispatchEvent(new CustomEvent('research:changed',{detail:{id,persistent}}));
  return true;
}
addEventListener('storage',event=>{if(event.key===key||event.key===null){try{state=sanitize(JSON.parse(event.newValue||'null'));persistent=true;dispatchEvent(new CustomEvent('research:changed',{detail:{external:true}}));}catch{}}});
