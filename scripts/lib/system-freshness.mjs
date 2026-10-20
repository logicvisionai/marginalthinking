import fs from 'node:fs';
import path from 'node:path';

const parseDate = value => {
  if (!value) return null;
  const s = String(value);
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(s) ? s + 'T12:00:00Z' : s);
  return Number.isNaN(d.getTime()) ? null : d;
};
const hoursSince = (value, now) => {
  const at = parseDate(value);
  return at ? Math.max(0, (now - at) / 36e5) : null;
};
const latestReport = (reports, pred) =>
  reports.filter(pred).slice().sort((a,b) =>
    String(b.published_at || b.date || '').localeCompare(String(a.published_at || a.date || '')) ||
    String(b.id || '').localeCompare(String(a.id || '')))[0] || null;
const latestAssetRun = (runs, id) => {
  // Never substitute the global reconciliation timestamp for an asset-specific review.
  let best = null;
  for (const run of Array.isArray(runs) ? runs : []) {
    const decision = (run.decisions || []).find(d => d.asset_id === id);
    if (!decision) continue;
    if (!best || String(run.reconciled_at || '') >= String(best.run.reconciled_at || '')) {
      best = {run, decision};
    }
  }
  return best;
};

export function computeSystemFreshness({root, registry, ledger, reports, now = new Date()}) {
  return (registry.assets || []).map(a => {
    let sourceReport = null, lastActivity = null, modified = null, lastReconciled = null, decision = null;
    if (a.type === 'editorial-line') {
      sourceReport = latestReport(reports, r =>
        (!a.kind || r.kind === a.kind) &&
        (!a.series_id || r.series === a.series_id) &&
        (!a.program || r.program === a.program));
      lastActivity = sourceReport?.published_at || sourceReport?.date || null;
    } else if (a.type === 'research-program') {
      sourceReport = latestReport(reports, r => r.program === a.taxonomy_id);
      lastActivity = sourceReport?.published_at || sourceReport?.date || null;
    } else if (a.type === 'editorial-series') {
      sourceReport = latestReport(reports, r => r.series === a.taxonomy_id);
      lastActivity = sourceReport?.published_at || sourceReport?.date || null;
    }
    if (a.freshness_source && fs.existsSync(path.join(root, a.freshness_source))) {
      const d = JSON.parse(fs.readFileSync(path.join(root, a.freshness_source), 'utf8'));
      modified = d.updated_at || null;
    }
    if (a.reconciliation_required) {
      const review = latestAssetRun(ledger.runs, a.id);
      lastReconciled = review?.run.reconciled_at || null;
      lastActivity = lastReconciled;
      decision = review?.decision || null;
    } else if (!lastActivity && modified && a.freshness_sla_hours != null) {
      // Standalone source-backed observation sets are governed by real data edits.
      lastActivity = modified;
    }
    const ageHours = hoursSince(lastActivity, now);
    const dataAgeHours = hoursSince(modified, now);
    const hasSla = a.freshness_sla_hours != null;
    const state = !hasSla ? 'no_sla' :
      (!lastActivity ? 'missing_activity' :
        ageHours > a.freshness_sla_hours ? 'review_due' : 'current');
    const datasetState = !modified ? null :
      (!hasSla || dataAgeHours <= a.freshness_sla_hours ? 'updated_within_sla' :
        a.reconciliation_required && state === 'current' && decision?.decision === 'verified_no_change'
          ? 'reviewed_no_material_change' : 'source_update_overdue');
    return {
      id:a.id, type:a.type, status:a.status, public_route:a.public_route || null,
      update_mode:a.update_mode, reconciliation_required:!!a.reconciliation_required,
      freshness_sla_hours:a.freshness_sla_hours ?? null,
      last_activity:lastActivity, last_reconciled:lastReconciled, last_modified:modified,
      latest_report_id:sourceReport?.id || null, latest_report_date:sourceReport?.date || null,
      decision:decision?.decision || null, decision_note:decision?.note || null,
      age_hours:ageHours == null ? null : Math.round(ageHours * 10) / 10,
      dataset_age_hours:dataAgeHours == null ? null : Math.round(dataAgeHours * 10) / 10,
      dataset_state:datasetState,
      state
    };
  });
}
