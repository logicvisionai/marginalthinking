import fs from 'node:fs';
import path from 'node:path';
import {collectReports, reportView, availableLocales} from './lib/reports.mjs';

const root = process.cwd();
const out = path.join(root, 'dist');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json'), 'utf8'));
const reports = collectReports(root);
const site = cfg.site_url.replace(/\/$/, '');
const localeCodes = Object.keys(cfg.locales || {});

const pagePath = (locale, p) => {
  const prefix = cfg.locales[locale]?.path ? `/${cfg.locales[locale].path}` : '';
  return `${prefix}${p}`.replace(/\/+/g, '/');
};
const abs = p => /^https?:\/\//i.test(String(p || '')) ? String(p) : `${site}${p}`;
const write = (p, value) => {
  const target = path.join(out, String(p).replace(/^\//, ''));
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};

function viewFor(item, locale) {
  const view = reportView(item, locale);
  if (!view?.markdown_url) return null;
  return {
    locale,
    title: view.title || item.title || item.id,
    deck: view.deck || item.deck || '',
    tags: view.tags || item.tags || [],
    keywords: view.keywords || item.keywords || [],
    regime: view.regime || item.regime || '',
    key_risk: view.key_risk || item.key_risk || '',
    watch: view.watch || item.watch || [],
    search_text: view.search_text || item.search_text || '',
    canonical_url: abs(pagePath(locale, item.url)),
    markdown_url: abs(view.markdown_url)
  };
}

const dates = reports.map(r => String(r.date || '').slice(0, 10)).filter(Boolean).sort();
const catalog = {
  schema_version: 1,
  generated_from_latest_publication: dates.at(-1) || null,
  site_url: site,
  default_locale: cfg.default_locale || 'en',
  methodology_url: `${site}/methodology.html`,
  research_archive_url: `${site}/reports.html`,
  usage: {
    citation: 'Prefer canonical_url when citing Marginal Thinking.',
    extraction: 'Prefer markdown_url when an agent needs the full report text.',
    evidence: 'Preserve distinctions among observed fact, inference, hypothesis and scenario, and verify time-sensitive claims against the report sources.'
  },
  items: reports.map(item => ({
    id: item.id,
    date: item.date || '',
    published_at: item.published_at || null,
    kind: item.kind || null,
    priority: item.priority ?? null,
    source_locale: item.source_locale || cfg.default_locale || 'en',
    taxonomy_version: item.taxonomy_version || null,
    program: item.program || null,
    related_programs: item.related_programs || [],
    dimensions: item.dimensions || [],
    geography: item.geography || {level: 'global', regions: [], subregions: [], countries: []},
    topics: item.topics || [],
    format: item.format || null,
    cadence: item.cadence || null,
    series: item.series || null,
    series_domain: item.series_domain || null,
    qa_confidence: item.qa_confidence || null,
    views: Object.fromEntries(
      availableLocales(item)
        .filter(locale => localeCodes.includes(locale))
        .map(locale => [locale, viewFor(item, locale)])
        .filter(([, value]) => value)
    )
  }))
};

if (!catalog.items.length) throw new Error('MCP catalog requires at least one published report.');
for (const item of catalog.items) {
  if (!item.id || !item.date) throw new Error(`MCP catalog item missing id/date: ${JSON.stringify(item)}`);
  if (!Object.keys(item.views).length) throw new Error(`MCP catalog item has no public views: ${item.id}`);
}

write('/data/mcp-catalog.json', catalog);
console.log(`MCP catalog ready: ${catalog.items.length} canonical research items, ${localeCodes.length} configured locales.`);
