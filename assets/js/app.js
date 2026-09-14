const MT = {
  state: { query: '', year: 'all', page: 1, pageSize: 12 },

  async loadReports() {
    try {
      const res = await fetch('./data/reports.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('reports.json unavailable');
      const reports = await res.json();
      return Array.isArray(reports)
        ? reports.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
        : [];
    } catch (err) {
      console.warn(err);
      return [];
    }
  },

  escape(value = '') {
    return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  },

  normalize(value = '') {
    return String(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
      .replace(/\s+/g, ' ')
      .trim();
  },

  formatDate(value) {
    if (!value) return '—';
    const [y, m, d] = value.split('-').map(Number);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric'
    }).format(new Date(y, m - 1, d));
  },

  reportHaystack(report) {
    return this.normalize([
      report.date,
      report.title,
      report.deck,
      report.summary,
      report.regime,
      report.key_risk,
      report.watch,
      ...(report.tags || []),
      ...(report.keywords || []),
      report.search_text
    ].filter(Boolean).join(' '));
  },

  matchesQuery(report, query) {
    if (!query) return true;
    const haystack = this.reportHaystack(report);
    const terms = this.normalize(query).split(' ').filter(Boolean);
    return terms.every(term => haystack.includes(term));
  },

  renderArchive(reports, targetId = 'archive-list', limit = null) {
    const target = document.getElementById(targetId);
    if (!target) return;
    const selected = limit ? reports.slice(0, limit) : reports;
    target.innerHTML = selected.map(r => this.reportRow(r)).join('') ||
      `<div class="empty-state">Nenhuma edição publicada ainda.</div>`;
  },

  reportRow(r) {
    const tags = (r.tags || []).slice(0, 4)
      .map(t => `<span class="tag">${this.escape(t)}</span>`).join('');
    const deck = this.escape(r.deck || r.summary || '');
    return `
      <article class="report-row">
        <div class="report-date">${this.formatDate(r.date)}</div>
        <div class="report-main">
          <a class="report-title" href="${this.escape(r.url)}">${this.escape(r.title)}</a>
          ${deck ? `<p class="report-summary">${deck}</p>` : ''}
        </div>
        <div class="report-tags">${tags}</div>
        <a class="report-link" href="${this.escape(r.url)}">Ler briefing →</a>
      </article>`;
  },

  renderLatest(reports) {
    const latest = reports[0];
    if (!latest) return;
    const bindings = {
      'latest-title': latest.title,
      'latest-deck': latest.deck || latest.summary || '',
      'latest-date': this.formatDate(latest.date),
      'latest-regime': latest.regime || '—',
      'latest-risk': latest.key_risk || '—',
      'latest-variable': latest.watch || '—'
    };
    Object.entries(bindings).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });
    const link = document.getElementById('latest-link');
    if (link) { link.href = latest.url; link.textContent = 'Ler último briefing'; }
  },

  hydrateArchiveState() {
    const p = new URLSearchParams(window.location.search);
    this.state.query = p.get('q') || '';
    this.state.year = p.get('year') || 'all';
    this.state.page = Math.max(1, Number.parseInt(p.get('page') || '1', 10) || 1);
    const q = document.getElementById('archive-search');
    const year = document.getElementById('archive-year');
    if (q) q.value = this.state.query;
    if (year) year.value = this.state.year;
  },

  buildYearFilter(reports) {
    const select = document.getElementById('archive-year');
    if (!select) return;
    const years = [...new Set(reports.map(r => String(r.date || '').slice(0, 4)).filter(Boolean))]
      .sort((a, b) => b.localeCompare(a));
    select.innerHTML = '<option value="all">Todos os anos</option>' +
      years.map(y => `<option value="${this.escape(y)}">${this.escape(y)}</option>`).join('');
    select.value = years.includes(this.state.year) ? this.state.year : 'all';
    this.state.year = select.value;
  },

  filteredReports(reports) {
    return reports.filter(r => {
      const yearOK = this.state.year === 'all' || String(r.date || '').startsWith(this.state.year);
      return yearOK && this.matchesQuery(r, this.state.query);
    });
  },

  syncURL() {
    const p = new URLSearchParams();
    if (this.state.query) p.set('q', this.state.query);
    if (this.state.year !== 'all') p.set('year', this.state.year);
    if (this.state.page > 1) p.set('page', String(this.state.page));
    const qs = p.toString();
    history.replaceState(null, '', `${location.pathname}${qs ? `?${qs}` : ''}`);
  },

  renderResearchArchive(reports) {
    const target = document.getElementById('archive-full');
    if (!target) return;
    const filtered = this.filteredReports(reports);
    const totalPages = Math.max(1, Math.ceil(filtered.length / this.state.pageSize));
    if (this.state.page > totalPages) this.state.page = totalPages;
    const start = (this.state.page - 1) * this.state.pageSize;
    const pageRows = filtered.slice(start, start + this.state.pageSize);
    target.innerHTML = pageRows.map(r => this.reportRow(r)).join('') ||
      `<div class="empty-state"><strong>Nenhum relatório encontrado.</strong><br>Tente remover filtros ou usar termos mais amplos.</div>`;

    const summary = document.getElementById('results-summary');
    if (summary) {
      if (!filtered.length) summary.textContent = '0 relatórios';
      else summary.textContent = `${start + 1}–${Math.min(start + this.state.pageSize, filtered.length)} de ${filtered.length} relatórios`;
    }
    this.renderPagination(totalPages);
    this.syncURL();
  },

  renderPagination(totalPages) {
    const target = document.getElementById('pagination');
    if (!target) return;
    if (totalPages <= 1) { target.innerHTML = ''; return; }

    const current = this.state.page;
    const pages = [];
    const push = p => { if (p >= 1 && p <= totalPages && !pages.includes(p)) pages.push(p); };
    push(1); push(current - 2); push(current - 1); push(current); push(current + 1); push(current + 2); push(totalPages);
    pages.sort((a, b) => a - b);

    let html = `<button class="page-button" data-page="${current - 1}" ${current === 1 ? 'disabled' : ''}>Anterior</button>`;
    let previous = 0;
    for (const p of pages) {
      if (previous && p - previous > 1) html += '<span class="page-ellipsis">…</span>';
      html += `<button class="page-button ${p === current ? 'is-active' : ''}" data-page="${p}" aria-current="${p === current ? 'page' : 'false'}">${p}</button>`;
      previous = p;
    }
    html += `<button class="page-button" data-page="${current + 1}" ${current === totalPages ? 'disabled' : ''}>Próxima</button>`;
    target.innerHTML = html;
  },

  initArchiveControls(reports) {
    const form = document.getElementById('archive-search-form');
    const search = document.getElementById('archive-search');
    const year = document.getElementById('archive-year');
    const clear = document.getElementById('archive-clear');
    const pagination = document.getElementById('pagination');
    if (!form) return;

    const rerender = () => { this.state.page = 1; this.renderResearchArchive(reports); };
    form.addEventListener('submit', e => {
      e.preventDefault();
      this.state.query = search.value.trim();
      this.state.year = year.value;
      rerender();
    });
    year.addEventListener('change', () => {
      this.state.year = year.value;
      this.state.query = search.value.trim();
      rerender();
    });
    clear.addEventListener('click', () => {
      search.value = '';
      year.value = 'all';
      this.state.query = '';
      this.state.year = 'all';
      rerender();
      search.focus();
    });
    pagination.addEventListener('click', e => {
      const button = e.target.closest('[data-page]');
      if (!button || button.disabled) return;
      this.state.page = Number(button.dataset.page);
      this.renderResearchArchive(reports);
      document.getElementById('research-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  const reports = await MT.loadReports();
  MT.renderLatest(reports);
  MT.renderArchive(reports, 'archive-list', 6);
  MT.hydrateArchiveState();
  MT.buildYearFilter(reports);
  MT.renderResearchArchive(reports);
  MT.initArchiveControls(reports);
  document.querySelectorAll('[data-current-year]').forEach(el => el.textContent = new Date().getFullYear());
});
