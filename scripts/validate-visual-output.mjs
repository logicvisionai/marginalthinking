import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {collectReports, availableLocales, reportView} from './lib/reports.mjs';
import {renderMarkdown} from './lib/markdown.mjs';

const root = process.cwd(), reports = collectReports(root);
const cfg = JSON.parse(fs.readFileSync('site.config.json', 'utf8'));
let figures = 0, editions = 0;
const kinds = html => [...html.matchAll(/data-research-visual="([^"]+)"/g)].map(m => m[1]);
for (const report of reports) for (const locale of availableLocales(report)) {
  const view = reportView(report, locale), prefix = cfg.locales[locale].path || '';
  const md = fs.readFileSync(path.join(root, view.markdown_url), 'utf8');
  const expected = renderMarkdown(md, {locale}).html;
  const output = fs.readFileSync(path.join(root, 'dist', prefix, report.url.replace(/^\//, '')), 'utf8');
  assert.deepEqual(kinds(output), kinds(expected), `${report.id}/${locale}: rendered figures must survive the publication pipeline`);
  const numbers = html => [...html.matchAll(/class="chart-row[^\"]*" data-value="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(numbers(output), numbers(expected), `${report.id}/${locale}: chart observations changed`);
  for (const marker of ['class="geo-card"', 'class="flow-steps"', 'class="mind-branch"']) {
    assert.equal(output.split(marker).length, expected.split(marker).length, `${report.id}/${locale}: missing visual content: ${marker}`);
  }
  assert(!/class="geo-card region-/.test(output), `${report.id}: fixed geographic placement must not return`);
  if (kinds(expected).length) {
    assert(output.includes('href="/assets/css/research-visuals.css"'), `${report.id}: missing visual stylesheet`);
    assert(output.includes('src="/assets/js/research-visuals.js"'), `${report.id}: missing visual controls`);
  }
  figures += kinds(expected).length; editions++;
}
const banned = ['Entender o presente. Investigar o que muda.', 'Profundidade exige contexto.', 'Conecte mecanismos, explore estruturas e organize suas hipóteses.', 'Your next investigation starts here.', 'Sua próxima investigação começa aqui.'];
for (const prefix of ['', 'pt-br/']) {
  for (const page of ['index.html', 'workspace/index.html', 'opportunities/index.html', 'research/coverage/index.html']) {
    const output = fs.readFileSync(`dist/${prefix}${page}`, 'utf8');
    for (const text of banned) assert(!output.includes(text), `${prefix}${page}: retired interface copy`);
    if (page === 'opportunities/index.html') {
      assert(output.includes('data-research-visual="atlas"'));
      assert(output.includes('class="map-viewport"'));
      assert(output.includes('class="map-country-links"'));
    }
  }
}
console.log(`Visual output validation OK: ${figures} figures across ${editions} editions; observations, geographic cards, routes, controls and interface copy preserved.`);
