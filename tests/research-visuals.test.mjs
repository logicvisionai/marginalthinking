import test from 'node:test';
import assert from 'node:assert/strict';
import {renderMarkdown} from '../scripts/lib/markdown.mjs';
import {renderVisual, renderTable, visualNumber} from '../scripts/lib/research-visuals.mjs';

test('numbers retain decimal precision and reject prose, dates and ranges', () => {
  for (const [raw, value] of [['0.125', .125], ['−23.21', -23.21], ['1.234,56', 1234.56], ['1,234.56', 1234.56], ['6,26', 6.26]]) assert.equal(visualNumber(raw), value);
  for (const raw of ['', 'US$ 12', '2019: 30', '30–40', '12%', '2026-09-19', 'n/a', '1e309']) assert.equal(visualNumber(raw), null);
});

test('signed bars use one proportional scale, without minimum decorative widths', () => {
  const html = renderVisual('chart', ['unit: US$ bilhões', 'A | -100', 'B | 1', 'C | 0', 'D | 0.125'], 'pt-BR');
  assert.match(html, /scale-mixed/); assert.match(html, /left:0%;width:50%/);
  assert.match(html, /left:50%;width:0.5%/); assert.match(html, /width:0.0625%/);
  assert.match(html, />\+0,125<\/div>/); assert.match(html, /width:0%" hidden/);
  assert.match(html, /<small class="visual-unit">US\$ bilhões/);
});

test('all-negative and positive-only scales use the whole track', () => {
  assert.match(renderVisual('chart', ['A | -8', 'B | -4']), /left:50%;width:50%/);
  assert.match(renderVisual('chart', ['A | 8', 'B | 4']), /left:0%;width:50%/);
});

test('geographic cards preserve all regions, with no guessed coordinates or grid areas', () => {
  const html = renderVisual('map', ['title: Rotas do Golfo', 'Arábia Saudita | Leste-Oeste | Mar Vermelho', 'Omã | Sohar | Transbordo', 'China | Indústria | Demanda', 'Japão | Indústria | Demanda'], 'pt-BR');
  assert.equal((html.match(/class="geo-card"/g) || []).length, 4);
  for (const label of ['Arábia Saudita', 'Omã', 'China', 'Japão']) assert(html.includes(label));
  assert(!html.includes('region-as')); assert(!html.includes('grid-area'));
});

test('route maps and multiline flows retain independent chains and unparsed notes', () => {
  const html = renderVisual('map', ['title: Rotas', 'Produção → Golfo → Hormuz', 'Produção → Leste-Oeste → Mar Vermelho', 'Nota de contexto'], 'pt-BR');
  assert.equal((html.match(/class="flow-steps"/g) || []).length, 2);
  assert(html.includes('Nota de contexto'));
  assert.equal((renderVisual('flow', ['A → B', 'C → D']).match(/class="flow-steps"/g) || []).length, 2);
});

test('mind maps retain nested hierarchy', () => {
  const html = renderVisual('mindmap', ['Sistema', '- Produção', '  - Equipamento', '    - Fornecedor', '- Finanças']);
  assert.match(html, /Equipamento<ul><li>Fornecedor/);
  assert.equal((html.match(/class="mind-branch"/g) || []).length, 2);
});

test('tables never infer a chart from incomparable prose and expose row and column headers', () => {
  const html = renderTable(['Indicador', 'Taxa'], [['A', '2019: 30'], ['B', '30–40%'], ['C', 'mais de 10']], 'pt-BR', 'Comparação');
  assert(!html.includes('research-chart')); assert(!html.includes('class="numeric"'));
  assert.match(html, /<th scope="row">A/); assert.match(html, /<th scope="col">Taxa/);
});

test('line series preserve constant values, align irregular years and include readable data', () => {
  const html = renderVisual('chart', ['type: line', 'unit: %', '2020 | 5', '2021 | 5', '2030 | 5']);
  assert(!/NaN|Infinity/.test(html));
  const points = html.match(/points="([^"]+)"/)[1].split(' ').map(p => p.split(',').map(Number));
  assert.equal(points[0][1], points[2][1]);
  assert(Math.abs((points[1][0] - points[0][0]) / (points[2][0] - points[0][0]) - .1) < .00001);
  assert.match(html, /<summary>View data<\/summary>/);
});

test('invalid chart authoring remains visible and HTML is escaped', () => {
  const invalid = renderVisual('chart', ['A | 30–40', 'B | 12']); assert.match(invalid, /30–40/);
  const html = renderMarkdown('```map\n<script>alert(1)</script> | <img src=x> | note\n```').html;
  assert(!html.includes('<script>')); assert(!html.includes('<img ')); assert(html.includes('&lt;script&gt;'));
});
