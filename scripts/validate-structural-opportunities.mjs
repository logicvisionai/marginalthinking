import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const file=path.join(root,'data/structural-opportunities.json');
const atlas=JSON.parse(fs.readFileSync(file,'utf8'));
const states=new Set(['blocking_inefficiency','exploitable_inefficiency','blocking_efficiency','leverageable_efficiency']);
const confidence=new Set(['high','medium','low']);
const errors=[];
const ids=new Set();

const fail=(id,msg)=>errors.push((id?id+': ':'')+msg);
const bilingual=(id,name,v)=>{
  if(!v||typeof v!=='object'||Array.isArray(v))return fail(id,name+' must be a bilingual object');
  for(const l of ['en','pt-BR'])if(typeof v[l]!=='string'||v[l].trim().length<4)fail(id,name+'.'+l+' is missing or too short');
};
if(atlas.schema_version!==1)fail('',"schema_version must be 1");
if(!atlas.states||typeof atlas.states!=='object')fail('',"states are missing");
if(!Array.isArray(atlas.entries)||!atlas.entries.length)fail('',"entries must be a non-empty array");

for(const e of atlas.entries||[]){
  const id=e&&e.id;
  if(typeof id!=='string'||!id.trim())fail('',"entry id is required");
  else if(ids.has(id))fail(id,"duplicate id");
  else ids.add(id);

  if(!states.has(e.state))fail(id,"invalid state "+String(e.state));
  if(!e.country||typeof e.country.code!=='string'||!e.country.code)fail(id,"country.code is required");
  else bilingual(id,'country.name',e.country.name);
  if(typeof e.country?.lat!=='number'||e.country.lat < -90||e.country.lat > 90)fail(id,"country.lat must be -90..90");
  if(typeof e.country?.lon!=='number'||e.country.lon < -180||e.country.lon > 180)fail(id,"country.lon must be -180..180");

  for(const f of ['feature','perspective','mechanism','implication','constraints'])bilingual(id,f,e[f]);

  if(!confidence.has(e.confidence))fail(id,"confidence must be high, medium or low");
  if(typeof e.horizon!=='string'||!e.horizon)fail(id,"horizon is required");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(e.last_verified||'')))fail(id,"last_verified must be YYYY-MM-DD");
  if(!Array.isArray(e.sectors)||!e.sectors.length)fail(id,"at least one sector is required");

  if(!Array.isArray(e.sources)||!e.sources.length)fail(id,"at least one public source is required");
  for(const [i,s] of (e.sources||[]).entries()){
    if(typeof s.name!=='string'||!s.name.trim())fail(id,"sources["+i+"].name is required");
    try{
      const u=new URL(s.url);
      if(u.protocol!=='https:')fail(id,"sources["+i+"].url must use https");
    }catch{fail(id,"sources["+i+"].url is invalid");}
    if(typeof s.date!=='string'||!s.date.trim())fail(id,"sources["+i+"].date is required");
  }

  if(e.catalysts!=null&&!Array.isArray(e.catalysts))fail(id,"catalysts must be an array");
  for(const [i,c] of (e.catalysts||[]).entries())bilingual(id,'catalysts['+i+']',c);

  if(e.transition!=null){
    bilingual(id,'transition',e.transition);
    if(e.transition.to_state!=null&&!states.has(e.transition.to_state))fail(id,"transition.to_state is invalid");
    if(typeof e.transition.status!=='string'||!e.transition.status)fail(id,"transition.status is required");
  }
}

for(const s of states)if(!atlas.states?.[s])fail('',"missing state label "+s);
if(errors.length){
  console.error("Structural Opportunity Atlas validation failed:\n- "+errors.join("\n- "));
  process.exit(1);
}
console.log("Structural Opportunity Atlas valid:",atlas.entries.length,"entries,",ids.size,"unique IDs.");
