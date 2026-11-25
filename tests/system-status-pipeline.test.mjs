import test from 'node:test';
import assert from 'node:assert/strict';
import {derivePipelineQueue} from '../scripts/lib/system-status-pipeline.mjs';
import {computeSystemFreshness} from '../scripts/lib/system-freshness.mjs';

const report = (id, slug, revision = 0) => ({_bundle: true, id, slug, revision});
const pending = (id, slug, revision = 0, schema_version = 2) => ({id, slug, revision, schema_version});
const approval = (id, revision = 0) => ({id, qa_status: 'approved', revision, publication: {revision}});
const rejection = id => ({id});

test('does not list a translated/legacy sidecar slug when its report ID is already public', () => {
  const result = derivePipelineQueue({
    reports: [report('MT-SA-MAUA', 'maua-industrialization-finance-brazil', 4)],
    pending: [pending('MT-SA-MAUA', 'maua-industrializacao-capital-imperial', 0)],
    approved: [], rejected: []
  });
  assert.deepEqual(result.pending_unpublished, []);
  assert.deepEqual(result.queue, []);
});

test('keeps a genuinely unpublished ID even when its slug collides with a public slug', () => {
  const result = derivePipelineQueue({
    reports: [report('MT-PUBLIC', 'shared-slug', 1)],
    pending: [pending('MT-NEW', 'shared-slug', 0)],
    approved: [], rejected: []
  });
  assert.deepEqual(result.pending_unpublished, ['shared-slug']);
  assert.equal(result.queue[0].id, 'MT-NEW');
  assert.equal(result.queue[0].state, 'awaiting-qa');
});

test('queues only a staged revision newer than the canonical public revision', () => {
  const result = derivePipelineQueue({
    reports: [report('MT-REV', 'report', 2)],
    pending: [pending('MT-REV', 'report', 3)],
    approved: [], rejected: []
  });
  assert.deepEqual(result.pending_unpublished, ['report']);
});

test('marks an exact approved unpublished revision as approved', () => {
  const result = derivePipelineQueue({
    reports: [],
    pending: [pending('MT-NEW', 'new-report', 1)],
    approved: [approval('MT-NEW', 1)], rejected: []
  });
  assert.deepEqual(result.approved_unpublished, ['MT-NEW']);
  assert.equal(result.queue[0].state, 'approved');
});

test('marks a pending ID with rejection history as needing revision', () => {
  const result = derivePipelineQueue({
    reports: [],
    pending: [pending('MT-REJECTED', 'rejected-report', 2)],
    approved: [], rejected: [rejection('MT-REJECTED')]
  });
  assert.equal(result.queue[0].state, 'needs-revision');
});

test('does not count a legacy pending sidecar for an already public ID as unpublished', () => {
  const result = derivePipelineQueue({
    reports: [report('MT-LEGACY', 'legacy-report', 0)],
    pending: [pending('MT-LEGACY', 'legacy-report', 1, 1)],
    approved: [], rejected: []
  });
  assert.deepEqual(result.pending_unpublished, []);
});

test('ignores reconciliation runs whose reviewed IDs are not canonical public reports', () => {
  const result = computeSystemFreshness({
    root: process.cwd(),
    registry: {assets: [{
      id: 'global-dependency-network',
      type: 'cumulative-tool',
      status: 'active',
      update_mode: 'publication-reconciliation',
      reconciliation_required: true,
      freshness_sla_hours: 36
    }]},
    ledger: {runs: [
      {
        id: 'canonical-review',
        reconciled_at: '2026-11-23T16:52:00-03:00',
        report_ids_reviewed: ['MT-PUBLIC'],
        decisions: [{asset_id: 'global-dependency-network', decision: 'verified_no_change', note: 'Reviewed against canonical public research.'}]
      },
      {
        id: 'staged-only-review',
        reconciled_at: '2026-11-25T08:37:33-03:00',
        report_ids_reviewed: ['MT-STAGED'],
        decisions: [{asset_id: 'global-dependency-network', decision: 'deferred_evidence_gap', note: 'Candidate remains staged and is not public.'}]
      }
    ]},
    reports: [{id: 'MT-PUBLIC', _bundle: true}],
    now: new Date('2026-11-25T12:00:00Z')
  })[0];

  assert.equal(result.last_reconciled, '2026-11-23T16:52:00-03:00');
  assert.equal(result.decision, 'verified_no_change');
  assert.equal(result.state, 'review_due');
});

test('does not treat a legacy index-only entry as a canonical reconciliation report', () => {
  const result = computeSystemFreshness({
    root: process.cwd(),
    registry: {assets: [{
      id: 'global-dependency-network',
      type: 'cumulative-tool',
      status: 'active',
      update_mode: 'publication-reconciliation',
      reconciliation_required: true,
      freshness_sla_hours: 36
    }]},
    ledger: {runs: [{
      id: 'legacy-index-review',
      reconciled_at: '2026-11-25T08:37:33-03:00',
      report_ids_reviewed: ['MT-LEGACY'],
      decisions: [{asset_id: 'global-dependency-network', decision: 'verified_no_change', note: 'Legacy index record only.'}]
    }]},
    reports: [{id: 'MT-LEGACY', _legacy: true}],
    now: new Date('2026-11-25T12:00:00Z')
  })[0];

  assert.equal(result.last_reconciled, null);
  assert.equal(result.decision, null);
  assert.equal(result.state, 'missing_activity');
});
