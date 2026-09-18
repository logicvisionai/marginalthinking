import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const graph=JSON.parse(fs.readFileSync(path.join(root,'data/global-dependencies.json'),'utf8'));
const history=JSON.parse(fs.readFileSync(path.join(root,'data/global-dependency-history.json'),'utf8'));
const reports=JSON.parse(fs.readFileSync(path.join(root,'data/reports.json'),'utf8'));
const reportIds=new Set((Array.isArray(reports)?reports:reports.reports||[]).map(r=>r.id).filter(Boolean));
const errors=[];
const fail=(id,msg)=>errors.push((id?id+': ':'')+msg);
const bilingual=(id,name,v)=>{if(!v||typeof v!=='object'||Array.isArray(v))return fail(id,name+' must be bilingual');for(const l of ['en','pt-BR'])if(typeof v[l]!=='string'||v[l].trim().length<3)fail(id,name+'.'+l+' missing or too short');};
const date=v=>/^\d{4}-\d{2}-\d{2}$/.test(String(v||''));
const allowedState=new Set(['high','medium','low']);
const allowedHorizon=new Set(['current','immediate','1-3y','1-5y','3-5y']);
if(graph.schema_version!==1)fail('',"graph schema_version must be 1");
if(graph.history_file!=='data/global-dependency-history.json')fail('',"graph.history_file must point to canonical history");
if(!date(graph.updated_at))fail('',"graph.updated_at must be YYYY-MM-DD");
bilingual('',"description",graph.description);
const typeIds=new Set(Object.keys(graph.node_types||{}));
const relationIds=new Set(Object.keys(graph.relation_types||{}));
const groupIds=new Set((graph.groups||[]).map(g=>g.id));
for(const [id,v] of Object.entries(graph.node_types||{}))bilingual(id,'node_type',v);
for(const [id,v] of Object.entries(graph.relation_types||{}))bilingual(id,'relation_type',v);
const groupSeen=new Set();
for(const g of graph.groups||[]){if(!g.id||groupSeen.has(g.id))fail(g.id||'',groupSeen.has(g.id)?'duplicate group':'group id required');groupSeen.add(g.id);bilingual(g.id,'label',g.label);bilingual(g.id,'description',g.description);}
const nodes=new Map();
for(const n of graph.nodes||[]){if(!n.id||nodes.has(n.id))fail(n.id||'',nodes.has(n.id)?'duplicate node id':'node id required');nodes.set(n.id,n);if(!typeIds.has(n.type))fail(n.id,'invalid node type '+n.type);if(!groupIds.has(n.group))fail(n.id,'invalid group '+n.group);if(!Number.isInteger(n.layer)||n.layer<0||n.layer>4)fail(n.id,'layer must be integer 0..4');if(!Number.isInteger(n.order)||n.order<0)fail(n.id,'order must be a non-negative integer');bilingual(n.id,'label',n.label);bilingual(n.id,'description',n.description);if(n.research_ids!=null){if(!Array.isArray(n.research_ids)||!n.research_ids.length)fail(n.id,'research_ids must be non-empty when present');for(const rid of n.research_ids||[])if(!reportIds.has(rid))fail(n.id,'unknown research id '+rid);}if(n.home_preview){if(typeof n.home_preview.x!=='number'||typeof n.home_preview.y!=='number'||n.home_preview.x<0||n.home_preview.x>100||n.home_preview.y<0||n.home_preview.y>100)fail(n.id,'home_preview x/y must be percentages 0..100');}}
const edges=new Map();
for(const e of graph.edges||[]){if(!e.id||edges.has(e.id))fail(e.id||'',edges.has(e.id)?'duplicate edge id':'edge id required');edges.set(e.id,e);if(!nodes.has(e.from)||!nodes.has(e.to)||e.from===e.to)fail(e.id,'edge must connect two distinct existing nodes');if(!relationIds.has(e.relation))fail(e.id,'invalid relation '+e.relation);if(!groupIds.has(e.group))fail(e.id,'invalid group '+e.group);if(!allowedState.has(e.criticality))fail(e.id,'criticality must be high/medium/low');if(!allowedState.has(e.substitutability))fail(e.id,'substitutability must be high/medium/low');if(!allowedState.has(e.confidence))fail(e.id,'confidence must be high/medium/low');if(!allowedHorizon.has(e.horizon))fail(e.id,'invalid horizon');if(!date(e.last_verified))fail(e.id,'last_verified must be YYYY-MM-DD');bilingual(e.id,'mechanism',e.mechanism);if(!Array.isArray(e.research_ids)||!e.research_ids.length)fail(e.id,'research_ids must be non-empty');for(const rid of e.research_ids||[])if(!reportIds.has(rid))fail(e.id,'unknown research id '+rid);if(e.home_preview&&(!nodes.get(e.from)?.home_preview||!nodes.get(e.to)?.home_preview))fail(e.id,'home_preview edge requires preview positions on both nodes');}
if(history.schema_version!==1)fail('',"history schema_version must be 1");
if(!date(history.updated_at))fail('',"history.updated_at must be YYYY-MM-DD");
const eventTypes=new Set(['baseline','edge_added','evidence_update','mechanism_change','criticality_change','substitutability_change','edge_retired','correction']);
for(const t of eventTypes){if(!history.event_types?.[t])fail('',"missing history event type "+t);else bilingual(t,'history label',history.event_types[t]);}
const eventIds=new Set();
for(const ev of history.events||[]){if(!ev.event_id||eventIds.has(ev.event_id))fail(ev.event_id||'',eventIds.has(ev.event_id)?'duplicate history event':'event_id required');eventIds.add(ev.event_id);if(!edges.has(ev.edge_id))fail(ev.event_id,'history event references unknown current edge '+ev.edge_id);if(!date(ev.date))fail(ev.event_id,'date must be YYYY-MM-DD');if(!eventTypes.has(ev.type))fail(ev.event_id,'invalid event type '+ev.type);bilingual(ev.event_id,'summary',ev.summary);if(!Array.isArray(ev.research_ids)||!ev.research_ids.length)fail(ev.event_id,'research_ids required');for(const rid of ev.research_ids||[])if(!reportIds.has(rid))fail(ev.event_id,'unknown research id '+rid);if(ev.type==='correction'&&!ev.supersedes_event_id)fail(ev.event_id,'correction requires supersedes_event_id');}
for(const id of edges.keys())if(!(history.events||[]).some(ev=>ev.edge_id===id))fail(id,'current edge has no history record');
if(errors.length){console.error('Global Dependency Network validation failed:\n- '+errors.join('\n- '));process.exit(1);}
console.log('Global Dependency Network valid:',nodes.size,'nodes,',edges.size,'relationships,',eventIds.size,'history events.');