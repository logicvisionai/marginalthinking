import fs from 'node:fs';
import path from 'node:path';
import {collectReports} from './lib/reports.mjs';

const root=process.cwd(),fail=[],read=p=>fs.readFileSync(path.join(root,p),'utf8');
const atlas=JSON.parse(read('data/resource-control-atlas.json'));
const actors=JSON.parse(read('data/strategic-actors.json'));
const reports=collectReports(root);
const actorIds=new Set((actors.actors||[]).map(x=>x.id));
const reportIds=new Set(reports.map(x=>x.id));
const classes=new Set(Object.keys(atlas.resource_classes||{}));
const natures=new Set(Object.keys(atlas.controller_natures||{}));
const modes=new Set(Object.keys(atlas.control_modes||{}));
const ids=new Set(),dateRx=/^\d{4}-\d{2}-\d{2}$/;
const bilingual=(v,k)=>{if(!v||typeof v!=='object'||!String(v.en||'').trim()||!String(v['pt-BR']||'').trim())fail.push(k+': bilingual EN/PT-BR text required');};

if(atlas.schema_version!==1)fail.push('schema_version must be 1');
if(atlas.status!=='active')fail.push('atlas status must be active');
if(!dateRx.test(atlas.updated_at||''))fail.push('updated_at must be YYYY-MM-DD');
bilingual(atlas.description,'description');
bilingual(atlas.coverage_note,'coverage_note');
if(!(atlas.entries||[]).length)fail.push('at least one entry required');

for(const e of atlas.entries||[]){
  if(!e.id||ids.has(e.id))fail.push('entry id missing/duplicate '+String(e.id));else ids.add(e.id);
  if(!classes.has(e.resource_class))fail.push(e.id+': invalid resource_class');
  bilingual(e.subject,e.id+'.subject');
  bilingual(e.scale,e.id+'.scale');
  bilingual(e.mechanism,e.id+'.mechanism');
  bilingual(e.limits,e.id+'.limits');
  if(!e.controller?.name)fail.push(e.id+': controller name required');
  if(!natures.has(e.controller?.nature))fail.push(e.id+': invalid controller nature');
  if(!e.controller?.jurisdiction?.code)fail.push(e.id+': controller jurisdiction code required');
  bilingual(e.controller?.jurisdiction?.name,e.id+'.controller.jurisdiction.name');
  const lat=e.controller?.jurisdiction?.lat,lon=e.controller?.jurisdiction?.lon;
  if(typeof lat!=='number'||lat < -90||lat > 90||typeof lon!=='number'||lon < -180||lon > 180)fail.push(e.id+': valid controller jurisdiction coordinates required');
  if(!Array.isArray(e.control_modes)||!e.control_modes.length)fail.push(e.id+': at least one control mode required');
  for(const m of e.control_modes||[])if(!modes.has(m))fail.push(e.id+': invalid control mode '+m);
  if(!e.asset_geography?.scope)fail.push(e.id+': asset geography scope required');
  if(e.asset_geography?.name)bilingual(e.asset_geography.name,e.id+'.asset_geography.name');
  if(!dateRx.test(e.last_verified||''))fail.push(e.id+': last_verified must be YYYY-MM-DD');
  if(String(e.last_verified)>String(atlas.updated_at))fail.push(e.id+': last_verified after dataset updated_at');
  if(e.actor_id&&!actorIds.has(e.actor_id))fail.push(e.id+': unknown actor_id '+e.actor_id);
  for(const r of e.research_ids||[])if(!reportIds.has(r))fail.push(e.id+': unknown research_id '+r);
  if(!Array.isArray(e.sources)||!e.sources.length)fail.push(e.id+': sources required');
  for(const s of e.sources||[])if(!s.name||!/^https:\/\//.test(s.url||''))fail.push(e.id+': invalid source');
}
if(fail.length){console.error('Resource Control Atlas validation failed:\n- '+fail.join('\n- '));process.exit(1)}
console.log('Resource Control Atlas valid:',atlas.entries.length,'entries,',new Set(atlas.entries.map(x=>x.controller.jurisdiction.code)).size,'controller jurisdictions.');
