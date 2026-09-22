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
if(due.length){
  console.error('Research-system freshness audit failed:');
  for(const a of due)console.error(`- ${a.id}: ${a.state}; last=${a.last_activity||'none'}; age=${a.age_hours??'n/a'}h; SLA=${a.freshness_sla_hours}h`);
  process.exit(1);
}
const bounded=assets.filter(a=>a.status==='active'&&a.freshness_sla_hours!=null);
console.log('Research-system freshness audit passed:',bounded.length,'SLA-bound assets; checked at',now.toISOString());
