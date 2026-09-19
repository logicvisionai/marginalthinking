import fs from 'node:fs';
import path from 'node:path';
import {collectReports} from './lib/reports.mjs';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const data=JSON.parse(read('data/strategic-actors.json'));
const reports=collectReports(root);
const reportIds=new Set(reports.map(r=>r.id));
const errors=[];
const fail=(id,msg)=>errors.push((id?id+': ':'')+msg);
const bilingual=(id,name,v)=>{if(!v||typeof v!=='object'||Array.isArray(v))return fail(id,name+' must be bilingual');for(const l of ['en','pt-BR'])if(typeof v[l]!=='string'||v[l].trim().length<2)fail(id,name+'.'+l+' missing');};
const date=v=>/^\d{4}-\d{2}-\d{2}$/.test(String(v||''));
const states=new Set(['high','medium','low','not-assessed']);
const modes=new Set(['delegated','direct-ownership','state-mandate','commercial-intermediation','production-control','technology-supply']);
const horizons=new Set(['current','immediate','1-3y','1-5y','3-5y']);

if(data.schema_version!==1)fail('', 'schema_version must be 1');
if(!date(data.updated_at))fail('', 'updated_at must be YYYY-MM-DD');
bilingual('', 'description', data.description);

const classIds=new Set(Object.keys(data.actor_classes||{}));
const channelIds=new Set(Object.keys(data.channels||{}));
for(const [id,v] of Object.entries(data.actor_classes||{}))bilingual(id,'actor_class',v);
for(const [id,v] of Object.entries(data.channels||{}))bilingual(id,'channel',v);

const targets=new Map();
for(const t of data.targets||[]){
  if(!t.id||targets.has(t.id))fail(t.id||'',targets.has(t.id)?'duplicate target':'target id required');
  targets.set(t.id,t);bilingual(t.id,'label',t.label);
}

const actors=new Map();
for(const a of data.actors||[]){
  if(!a.id||actors.has(a.id))fail(a.id||'',actors.has(a.id)?'duplicate actor':'actor id required');
  actors.set(a.id,a);
  if(!classIds.has(a.class))fail(a.id,'invalid class '+a.class);
  if(!String(a.legal_name||'').trim())fail(a.id,'legal_name required');
  if(!String(a.jurisdiction||'').trim())fail(a.id,'jurisdiction required');
  bilingual(a.id,'label',a.label);bilingual(a.id,'description',a.description);bilingual(a.id,'limits',a.limits);bilingual(a.id,'scale',a.scale);
  if(!date(a.last_verified))fail(a.id,'last_verified must be YYYY-MM-DD');
  if(!Array.isArray(a.research_ids)||!a.research_ids.length)fail(a.id,'research_ids required');
  for(const rid of a.research_ids||[])if(!reportIds.has(rid))fail(a.id,'unknown research id '+rid);
}

const relationIds=new Set();
for(const r of data.relations||[]){
  if(!r.id||relationIds.has(r.id))fail(r.id||'',relationIds.has(r.id)?'duplicate relation':'relation id required');
  relationIds.add(r.id);
  if(!actors.has(r.actor))fail(r.id,'unknown actor '+r.actor);
  if(!targets.has(r.target))fail(r.id,'unknown target '+r.target);
  if(!channelIds.has(r.channel))fail(r.id,'unknown channel '+r.channel);
  if(!modes.has(r.control_mode))fail(r.id,'invalid control_mode '+r.control_mode);
  if(!states.has(r.substitutability))fail(r.id,'invalid substitutability');
  if(!states.has(r.confidence)||r.confidence==='not-assessed')fail(r.id,'confidence must be high/medium/low');
  if(!horizons.has(r.horizon))fail(r.id,'invalid horizon '+r.horizon);
  if(!date(r.last_verified))fail(r.id,'last_verified must be YYYY-MM-DD');
  bilingual(r.id,'mechanism',r.mechanism);
  if(!Array.isArray(r.research_ids)||!r.research_ids.length)fail(r.id,'research_ids required');
  for(const rid of r.research_ids||[])if(!reportIds.has(rid))fail(r.id,'unknown research id '+rid);
}

for(const a of data.actors||[])if(!(data.relations||[]).some(r=>r.actor===a.id))fail(a.id,'actor has no documented relation');

if(errors.length){console.error('Strategic Actors validation failed:\n- '+errors.join('\n- '));process.exit(1);}
console.log('Strategic Actors valid:',actors.size,'actors,',relationIds.size,'relationships,',channelIds.size,'capability channels.');
