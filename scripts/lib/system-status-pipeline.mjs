const revisionOf = value => Number.isInteger(value) ? value : 0;

const recordKey = record => String(record.id || '') + '\0' + String(revisionOf(record.publication?.revision ?? record.revision));

export function derivePipelineQueue({reports, pending, approved, rejected}) {
  const publicById = new Map();
  for (const report of reports.filter(item => item?._bundle && item.id)) {
    const previous = publicById.get(report.id);
    if (!previous || revisionOf(report.revision) > revisionOf(previous.revision)) {
      publicById.set(report.id, report);
    }
  }

  const approvedKeys = new Set(approved
    .filter(item => item?.qa_status === 'approved' && item.id)
    .map(recordKey));
  const rejectedIds = new Set(rejected.filter(item => item?.id).map(item => item.id));

  const pendingUnpublished = pending.filter(item => {
    if (!item?.id) return true;
    const published = publicById.get(item.id);
    if (!published) return true;
    return (item.schema_version || 1) >= 2 && revisionOf(item.revision) > revisionOf(published.revision);
  });

  const approvedUnpublished = approved.filter(item => {
    if (item?.qa_status !== 'approved') return false;
    const published = item.id ? publicById.get(item.id) : null;
    return !published || revisionOf(item.publication?.revision ?? item.revision) > revisionOf(published.revision);
  });

  const queue = pendingUnpublished.map(item => {
    const state = approvedKeys.has(String(item.id || '') + '\0' + String(revisionOf(item.revision)))
      ? 'approved'
      : rejectedIds.has(item.id) ? 'needs-revision' : 'awaiting-qa';
    return {
      id: item.id || null,
      slug: item.slug || item.filename || item.id || 'unknown',
      revision: revisionOf(item.revision),
      state
    };
  });

  return {
    pending_unpublished: pendingUnpublished.map(item => item.slug || item.filename || item.id || 'unknown'),
    approved_unpublished: approvedUnpublished.map(item => item.id || item.filename || 'unknown'),
    queue
  };
}
