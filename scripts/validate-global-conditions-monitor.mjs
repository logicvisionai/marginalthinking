import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const file = path.join(root, 'data/global-conditions-monitor.json');
const fail = [];
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const date = /^\d{4}-\d{2}-\d{2}$/;
const period = /^(?:\d{4}|\d{4}-\d{2}|\d{4}-Q[1-4])$/;
const bilingual = (item, name) => {
  for (const loc of ['en', 'pt-BR']) {
    if (typeof item?.[loc] !== 'string' || item[loc].trim().length < 12) {
      fail.push(name + ': missing substantive ' + loc + ' text');
    }
  }
};
if (data.schema_version !== 1) fail.push('schema_version must be 1');
if (data.status !== 'observations_not_live_quotes') fail.push('status must disclaim live quotes');
if (!date.test(data.updated_at || '')) fail.push('updated_at must be a YYYY-MM-DD date');
if (!date.test(data.evidence_cutoff || '')) fail.push('evidence_cutoff must be a YYYY-MM-DD date');
bilingual(data.method, 'method');
const ids = new Set();
const allowedStatuses = new Set(['official_final', 'official_estimate', 'agency_estimate', 'agency_estimate_rounded', 'official_projection', 'agency_projection']);
for (const o of data.observations || []) {
  if (!o.id || ids.has(o.id)) fail.push('duplicate/missing observation id ' + o.id);
  ids.add(o.id);
  if (!o.indicator || !o.geography || !o.population || !o.unit) fail.push(o.id + ': missing identification, geography, population or unit');
  if (!period.test(o.period || '')) fail.push(o.id + ': period must be YYYY, YYYY-MM or YYYY-QN');
  if (!date.test(o.released_at || '')) fail.push(o.id + ': invalid released_at');
  if (o.released_at > data.updated_at) fail.push(o.id + ': source released after registry update');
  if (typeof o.value !== 'number' || !Number.isFinite(o.value)) fail.push(o.id + ': value must be a finite number');
  if (!allowedStatuses.has(o.status)) fail.push(o.id + ': unrecognized measurement status');
  if (!/^https:\/\//.test(o.source?.url || '') || !o.source?.publisher || !o.source?.title) fail.push(o.id + ': primary publication URL, publisher and title required');
  bilingual(o.description, o.id + '.description');
  bilingual(o.caveat, o.id + '.caveat');
  if (o.comparator && (!Number.isFinite(o.comparator.value) || !o.comparator.unit || !o.comparator.period || !o.comparator.interpretation)) {
    fail.push(o.id + ': incomplete comparator provenance');
  }
}
if (!ids.size) fail.push('at least one observation required');
for (const o of data.observations || []) {
  if (/projection$/.test(o.status) && !/^(?:\d{4})$/.test(o.period)) {
    fail.push(o.id + ': annual forecast must have a stated forecast year');
  }
  if (o.data_cutoff && !date.test(o.data_cutoff)) fail.push(o.id + ': invalid source data cutoff');
}
if (fail.length) {
  console.error('Global conditions validation failed:\n- ' + fail.join('\n- '));
  process.exit(1);
}
console.log('Global conditions observations valid:', ids.size, 'source-linked measures.');
