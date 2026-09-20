import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const file=path.join(root,'data','conflict-systems.json');
const fail=[];
if(!fs.existsSync(file))fail.push('data/conflict-systems.json ausente');
let data={};
if(!fail.length){
  try{data=JSON.parse(fs.readFileSync(file,'utf8'));}catch(e){fail.push('data/conflict-systems.json inválido: '+e.message);}
}
if(data.schema_version!==1)fail.push('schema_version deve ser 1');
if(!Array.isArray(data.country_dossier_schema)||data.country_dossier_schema.length<10)fail.push('country_dossier_schema incompleto');
if(!Array.isArray(data.interpretation_schema)||!data.interpretation_schema.includes('position_change'))fail.push('interpretation_schema deve preservar mudança de posição');
if(!Array.isArray(data.escalation_domains)||data.escalation_domains.length<5)fail.push('escalation_domains incompleto');
if(!Array.isArray(data.systems)||!data.systems.length)fail.push('systems deve conter ao menos um sistema');

const ids=new Set();
for(const system of data.systems||[]){
  const id=system.id||'system';
  if(!system.id)fail.push('sistema sem id');
  if(ids.has(id))fail.push('id de sistema duplicado: '+id);ids.add(id);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(system.evidence_cutoff||''))fail.push(id+': evidence_cutoff inválido');
  if(!system.report_id)fail.push(id+': report_id ausente');
  if(!system.title?.en||!system.title?.['pt-BR'])fail.push(id+': título bilíngue ausente');
  if(!Array.isArray(system.countries)||system.countries.length<2)fail.push(id+': countries insuficiente');
  if(!Array.isArray(system.genealogy)||system.genealogy.length<4)fail.push(id+': genealogy insuficiente');
  if(!Array.isArray(system.evidence_anchors)||system.evidence_anchors.length<4)fail.push(id+': evidence_anchors insuficiente');
  if(!Array.isArray(system.interpretive_sources)||!system.interpretive_sources.length)fail.push(id+': interpretive_sources ausente');
  for(const source of system.interpretive_sources||[]){
    for(const key of ['id','author','context','date','work','source_url','interpretation_class','central_proposition','causal_mechanism'])if(!source[key])fail.push(id+': fonte interpretativa sem '+key);
    if(!/^https:\/\//.test(source.source_url||''))fail.push(id+': source_url interpretativa deve usar HTTPS');
  }
  const monitor=system.escalation_monitor;
  if(!monitor||monitor.model!=='domain-based-observations')fail.push(id+': escalation_monitor.model inválido');
  if(monitor && monitor.probability_of_general_war!==null)fail.push(id+': probabilidade de guerra generalizada deve permanecer null sem modelo probabilístico defensável');
  if(!Array.isArray(monitor?.domains)||monitor.domains.length<5)fail.push(id+': escalation_monitor.domains insuficiente');
  if(!Array.isArray(system.falsifiers)||system.falsifiers.length<2)fail.push(id+': falsifiers insuficiente');
}
if(fail.length){console.error(fail.map(x=>'FAIL '+x).join('\n'));process.exit(1);}
console.log('Conflict Systems validation OK:',data.systems.length,'system(s).');
