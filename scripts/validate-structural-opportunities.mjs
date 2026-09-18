import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const atlas=JSON.parse(fs.readFileSync(path.join(root,'data/structural-opportunities.json'),'utf8'));
const history=JSON.parse(fs.readFileSync(path.join(root,'data/structural-opportunity-history.json'),'utf8'));
const states=new Set(['blocking_inefficiency','exploitable_inefficiency','blocking_efficiency','leverageable_efficiency']);
const confidence=new Set(['high','medium','low']);
const eventTypes=new Set(['baseline','evidence_update','state_change','material_update','correction']);
const errors=[];
const ids=new Set();
const eventIds=new Set();
const fail=(id,msg)=>errors.push((id?id+': ':'')+msg);
const bilingual=(id,name,v)=>{
  if(!v||typeof v!=='object'||Array.isArray(v))return fail(id,name+' must be a bilingual object');
  for(const l of ['en','pt-BR'])if(typeof v[l]!=='string'||v[l].trim().length<4)fail(id,name+'.'+l+' is missing or too short');
};
const sourceList=(id,name,list)=>{
  if(!Array.isArray(list)||!list.length)return fail(id,name+' must contain at least one source');
  for(const [i,s] of list.entries()){
    if(typeof s.name!=='string'||!s.name.trim())fail(id,name+'['+i+'].name is required');
    try{const u=new URL(s.url);if(u.protocol!=='https:')fail(id,name+'['+i+'].url must use https');}catch{fail(id,name+'['+i+'].url is invalid');}
    if(typeof s.date!=='string'||!s.date.trim())fail(id,name+'['+i+'].date is required');
  }
};
if(atlas.schema_version!==1)fail('',"atlas schema_version must be 1");
if(atlas.history_file!=='data/structural-opportunity-history.json')fail('',"atlas.history_file must point to the canonical history file");
if(!atlas.states||typeof atlas.states!=='object')fail('',"states are missing");
if(!Array.isArray(atlas.entries)||!atlas.entries.length)fail('',"entries must be a non-empty array");
if(!/^\d{4}-\d{2}-\d{2}$/.test(String(atlas.updated_at||'')))fail('',"atlas.updated_at must be YYYY-MM-DD");
for(const e of atlas.entries||[]){
  const id=e&&e.id;
  if(typeof id!=='string'||!id.trim())fail('',"entry id is required");else if(ids.has(id))fail(id,"duplicate id");else ids.add(id);
  if(!states.has(e.state))fail(id,"invalid state "+String(e.state));
  if(!e.country||typeof e.country.code!=='string'||!e.country.code)fail(id,"country.code is required");else bilingual(id,'country.name',e.country.name);
  if(typeof e.country?.lat!=='number'||e.country.lat < -90||e.country.lat > 90)fail(id,"country.lat must be -90..90");
  if(typeof e.country?.lon!=='number'||e.country.lon < -180||e.country.lon > 180)fail(id,"country.lon must be -180..180");
  for(const f of ['feature','perspective','mechanism','implication','constraints'])bilingual(id,f,e[f]);
  if(!confidence.has(e.confidence))fail(id,"confidence must be high, medium or low");
  if(typeof e.horizon!=='string'||!e.horizon)fail(id,"horizon is required");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(e.last_verified||'')))fail(id,"last_verified must be YYYY-MM-DD");
  if(!Array.isArray(e.sectors)||!e.sectors.length)fail(id,"at least one sector is required");
  sourceList(id,'sources',e.sources);
  if(e.catalysts!=null&&!Array.isArray(e.catalysts))fail(id,"catalysts must be an array");
  for(const [i,c] of (e.catalysts||[]).entries())bilingual(id,'catalysts['+i+']',c);
  if(e.transition!=null){bilingual(id,'transition',e.transition);if(e.transition.to_state!=null&&!states.has(e.transition.to_state))fail(id,"transition.to_state is invalid");if(typeof e.transition.status!=='string'||!e.transition.status)fail(id,"transition.status is required");}
}
for(const s of states)if(!atlas.states?.[s])fail('',"missing state label "+s);
if(history.schema_version!==1)fail('',"history schema_version must be 1");
if(!/^\d{4}-\d{2}-\d{2}$/.test(String(history.updated_at||'')))fail('',"history.updated_at must be YYYY-MM-DD");
if(!history.event_types||typeof history.event_types!=='object')fail('',"history.event_types is required");
for(const t of eventTypes){if(!history.event_types?.[t])fail('',"missing history event type "+t);else bilingual('',"history.event_types."+t,history.event_types[t]);}
if(!Array.isArray(history.events))fail('',"history.events must be an array");
for(const ev of history.events||[]){
  const id=ev&&ev.event_id;
  if(typeof id!=='string'||!id.trim())fail('',"history event_id is required");else if(eventIds.has(id))fail(id,"duplicate history event_id");else eventIds.add(id);
  if(typeof ev.entry_id!=='string'||!ev.entry_id)fail(id,"entry_id is required");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(ev.date||'')))fail(id,"date must be YYYY-MM-DD");
  if(!eventTypes.has(ev.type))fail(id,"invalid history event type "+String(ev.type));
  if(!ev.country||typeof ev.country.code!=='string'||!ev.country.code)fail(id,"country snapshot is required");else bilingual(id,'country.name',ev.country.name);
  bilingual(id,'feature',ev.feature);bilingual(id,'summary',ev.summary);
  if(ev.state!=null&&!states.has(ev.state))fail(id,"event state is invalid");
  if(ev.type==='state_change'&&(!states.has(ev.from_state)||!states.has(ev.to_state)||ev.from_state===ev.to_state))fail(id,"state_change requires distinct valid from_state and to_state");
  if(ev.type==='correction'&&(typeof ev.supersedes_event_id!=='string'||!ev.supersedes_event_id))fail(id,"correction requires supersedes_event_id");
  sourceList(id,'sources',ev.sources);
}
for(const id of ids)if(!(history.events||[]).some(ev=>ev.entry_id===id))fail(id,"current entry has no history record");
if(errors.length){console.error("Structural Opportunity Atlas validation failed:\n- "+errors.join("\n- "));process.exit(1);}
console.log("Structural Opportunity Atlas valid:",atlas.entries.length,"entries,",eventIds.size,"history events.");
