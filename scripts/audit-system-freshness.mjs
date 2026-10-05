import fs from 'node:fs';
import path from 'node:path';
import {collectReports} from './lib/reports.mjs';
import {computeSystemFreshness} from './lib/system-freshness.mjs';

const root=process.cwd();
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const registry=read('data/system-registry.json'),ledger=read('data/reconciliation-ledger.json'),reports=collectReports(root);
const now=process.env.MT_AUDIT_NOW?new Date(process.env.MT_AUDIT_NOW):new Date();
const assets=computeSystemFreshness({root,registry,ledger,reports,now});
const due=assets.filter(a=>a.status==='active'&&['review_due','missing_activity'].includes(a.state));

const publishedIds=new Set(reports.map(r=>r.id).filter(Boolean));
const approvedDir=path.join(root,'data','approved');
const unpublishedApprovals=[];
if(fs.existsSync(approvedDir)){
  for(const name of fs.readdirSync(approvedDir).filter(n=>n.endsWith('.json')).sort()){
    const rel=path.join('data','approved',name);
    const approval=read(rel);
    if(approval.schema_version!==2||approval.qa_status!=='approved')continue;
    if(!approval.id||publishedIds.has(approval.id))continue;
    unpublishedApprovals.push({file:rel,id:approval.id,reviewed_at:approval.reviewed_at||null});
  }
}

if(due.length||unpublishedApprovals.length){
  if(due.length){
    console.error('Research-system freshness audit failed:');
    for(const a of due)console.error(`- ${a.id}: ${a.state}; last=${a.last_activity||'none'}; age=${a.age_hours??'n/a'}h; SLA=${a.freshness_sla_hours}h`);
  }
  if(unpublishedApprovals.length){
    console.error('Approved research is waiting for public materialization:');
    for(const a of unpublishedApprovals)console.error(`- ${a.id}: ${a.file}; reviewed=${a.reviewed_at||'unknown'}`);
  }
  process.exit(1);
}
const bounded=assets.filter(a=>a.status==='active'&&a.freshness_sla_hours!=null);
console.log('Research-system freshness audit passed:',bounded.length,'SLA-bound assets; checked at',now.toISOString(),'; approved/public sync OK');
