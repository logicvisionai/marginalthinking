import fs from 'node:fs';
import path from 'node:path';

const parseDate=(value)=>{
  if(!value)return null;
  const s=String(value);
  const d=new Date(/^\d{4}-\d{2}-\d{2}$/.test(s)?s+'T12:00:00Z':s);
  return Number.isNaN(d.getTime())?null:d;
};
const latestReport=(reports,pred)=>reports.filter(pred).slice().sort((a,b)=>String(b.published_at||b.date||'').localeCompare(String(a.published_at||a.date||'')))[0]||null;

export function computeSystemFreshness({root,registry,ledger,reports,now=new Date()}){
  const runs=Array.isArray(ledger.runs)?ledger.runs:[];
  const latestRun=runs.slice().sort((a,b)=>String(b.reconciled_at||'').localeCompare(String(a.reconciled_at||'')))[0]||null;
  const decisions=new Map((latestRun?.decisions||[]).map(d=>[d.asset_id,d]));
  return (registry.assets||[]).map(a=>{
    let sourceReport=null,lastActivity=null,modified=null,lastReconciled=null;
    if(a.type==='editorial-line'){
      sourceReport=latestReport(reports,r=>(!a.kind||r.kind===a.kind)&&(!a.series_id||r.series===a.series_id)&&(!a.program||r.program===a.program));
      lastActivity=sourceReport?.published_at||sourceReport?.date||null;
    }else if(a.type==='research-program'){
      sourceReport=latestReport(reports,r=>r.program===a.taxonomy_id);
      lastActivity=sourceReport?.published_at||sourceReport?.date||null;
    }else if(a.type==='editorial-series'){
      sourceReport=latestReport(reports,r=>r.series===a.taxonomy_id);
      lastActivity=sourceReport?.published_at||sourceReport?.date||null;
    }else if(a.reconciliation_required){
      lastReconciled=latestRun?.reconciled_at||null;
      lastActivity=lastReconciled;
    }
    if(a.freshness_source&&fs.existsSync(path.join(root,a.freshness_source))){
      const d=JSON.parse(fs.readFileSync(path.join(root,a.freshness_source),'utf8'));
      modified=d.updated_at||null;
    }
    const at=parseDate(lastActivity),ageHours=at?Math.max(0,(now-at)/36e5):null,hasSla=a.freshness_sla_hours!=null;
    const state=!hasSla?'no_sla':(!at?'missing_activity':(ageHours>a.freshness_sla_hours?'review_due':'current'));
    return {
      id:a.id,type:a.type,status:a.status,public_route:a.public_route||null,update_mode:a.update_mode,
      reconciliation_required:!!a.reconciliation_required,freshness_sla_hours:a.freshness_sla_hours??null,
      last_activity:lastActivity,last_reconciled:lastReconciled,last_modified:modified,
      latest_report_id:sourceReport?.id||null,decision:decisions.get(a.id)?.decision||null,
      age_hours:ageHours==null?null:Math.round(ageHours*10)/10,state
    };
  });
}
