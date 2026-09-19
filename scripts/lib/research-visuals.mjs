import {esc, inline} from './markup.mjs';

const pt = locale => locale === 'pt-BR';
const format = (value, locale) => new Intl.NumberFormat(pt(locale) ? 'pt-BR' : 'en-US', {maximumFractionDigits: 20}).format(value);

// Accept a complete number, never extract digits from prose, ranges or dates.
export function visualNumber(raw = '') {
  let s = String(raw).trim().replace(/\u2212/g, '-');
  if (/^[+-]?\d{1,3}(?:,\d{3})+\.\d+$/.test(s)) s = s.replace(/,/g, '');
  else if (/^[+-]?\d{1,3}(?:\.\d{3})+,\d+$/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^[+-]?\d+,\d+$/.test(s)) s = s.replace(',', '.');
  if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(s)) return null;
  const value = Number(s);
  return Number.isFinite(value) ? value : null;
}

function figure(kind, title, body, {unit = '', classes = ''} = {}) {
  return `<figure class="visual-figure ${classes}" data-research-visual="${kind}"><figcaption>${inline(title)}${unit ? `<small class="visual-unit">${esc(unit)}</small>` : ''}</figcaption>${body}</figure>`;
}

function dataTable(headers, rows, locale, title) {
  const numeric = headers.map((_, i) => i > 0 && rows.length > 0 && rows.every(r => visualNumber(String(r[i] || '').replace(/%$/, '').trim()) !== null));
  return `<div class="md-table-wrap" role="region" aria-label="${esc(title)}" tabindex="0"><table class="md-table" style="--table-columns:${headers.length}"><caption class="sr-only">${esc(title)}</caption><thead><tr>${headers.map((h, i) => `<th scope="col"${numeric[i] ? ' class="numeric"' : ''}>${inline(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${headers.map((_, i) => `<${i ? 'td' : 'th scope="row"'}${numeric[i] ? ' class="numeric"' : ''}>${inline(row[i] ?? '')}</${i ? 'td' : 'th'}>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

export function renderTable(headers, rows, locale = 'en', title = '') {
  title ||= pt(locale) ? 'Dados da pesquisa' : 'Research data';
  // Only an explicitly authored chart can establish compatible units and periods.
  return figure('table', title, dataTable(headers, rows, locale, title), {classes: 'research-table'});
}

function chartData(rows, unit, locale, title) {
  const headers = [pt(locale) ? 'Indicador / período' : 'Indicator / period', (pt(locale) ? 'Valor' : 'Value') + (unit ? ` (${unit})` : '')];
  return `<details class="visual-data"><summary>${pt(locale) ? 'Ver dados' : 'View data'}</summary>${dataTable(headers, rows.map(([l, v]) => [l, format(v, locale)]), locale, title)}</details>`;
}

function barChart(title, unit, rows, locale) {
  const positive = rows.some(([, v]) => v > 0), negative = rows.some(([, v]) => v < 0);
  const mixed = positive && negative, mode = mixed ? 'mixed' : negative ? 'negative' : 'positive';
  const max = (Math.max(...rows.map(([, v]) => Math.abs(v))) || 1);
  const zero = mixed ? 50 : negative ? 100 : 0;
  const body = `<div class="chart-rows">${rows.map(([label, value]) => {
    const width = Math.abs(value) / max * (mixed ? 50 : 100);
    const left = value < 0 ? zero - width : zero;
    return `<div class="chart-row is-${value < 0 ? 'negative' : value > 0 ? 'positive' : 'zero'}" data-value="${value}"><div class="chart-label">${inline(label)}</div><div class="chart-track" aria-hidden="true" style="--chart-zero:${zero}%"><span class="chart-zero"></span><span class="chart-bar ${value < 0 ? 'negative' : 'positive'}" style="left:${left}%;width:${width}%"${value === 0 ? ' hidden' : ''}></span></div><div class="chart-value">${value > 0 && mixed ? '+' : ''}${esc(format(value, locale))}</div></div>`;
  }).join('')}</div>${chartData(rows, unit, locale, title)}`;
  return figure('chart', title, body, {unit, classes: `research-chart scale-${mode}`});
}

function lineChart(title, unit, rows, locale) {
  if (rows.length < 2) return barChart(title, unit, rows, locale);
  const min = Math.min(...rows.map(([, v]) => v)), max = Math.max(...rows.map(([, v]) => v));
  const pad = min === max ? Math.max(Math.abs(min) * .1, 1) : (max - min) * .1;
  const lo = min - pad, hi = max + pad;
  const ticks = Array.from({length: 5}, (_, i) => lo + (hi - lo) * i / 4);
  const tickText = v => new Intl.NumberFormat(pt(locale) ? 'pt-BR' : 'en-US', {maximumSignificantDigits: 5}).format(v);
  const left = Math.max(64, ...ticks.map(v => tickText(v).length * 8 + 22)), right = 56;
  const w = Math.max(640, rows.length * 100 + left + right), h = 330, top = 24, bottom = 92;
  const dates = rows.map(([l]) => /^\d{4}$/.test(l) ? Number(l) : /^\d{4}-\d{2}-\d{2}$/.test(l) ? Date.parse(l) : NaN);
  const timeAxis = dates.every((n, i) => Number.isFinite(n) && (!i || n > dates[i - 1]));
  const x = i => left + (timeAxis ? (dates[i] - dates[0]) / (dates.at(-1) - dates[0]) : i / (rows.length - 1)) * (w - left - right);
  const y = v => h - bottom - (v - lo) / (hi - lo) * (h - top - bottom);
  const grid = ticks.map(v => `<line x1="${left}" y1="${y(v)}" x2="${w - right}" y2="${y(v)}"/><text x="${left - 12}" y="${y(v) + 4}" text-anchor="end">${esc(tickText(v))}</text>`).join('');
  const labels = rows.map(([label, value], i) => {
    // Endpoint labels and spaced interior labels; the data table retains every observation.
    const show = i === 0 || i === rows.length - 1 || (x(i) - x(i - 1) >= 80 && x(rows.length - 1) - x(i) >= 80);
    const words = label.match(/.{1,16}(?:\s|$)|\S{1,16}/g) || [label];
    return `<g class="chart-dot"><circle cx="${x(i)}" cy="${y(value)}" r="4"/><title>${esc(label)}: ${esc(format(value, locale))}${unit ? ` ${esc(unit)}` : ''}</title></g>${show ? `<text class="chart-axis-label" x="${x(i)}" y="${h - bottom + 23}" text-anchor="middle">${words.slice(0, 4).map((part, j) => `<tspan x="${x(i)}" dy="${j ? 15 : 0}">${esc(part.trim())}</tspan>`).join('')}</text>` : ''}`;
  }).join('');
  return figure('chart', title, `<div class="line-chart-scroll" tabindex="0" role="region" aria-label="${esc(title)}"><svg viewBox="0 0 ${w} ${h}" style="min-width:${w}px" role="img" aria-label="${esc(title)}"><g class="chart-grid">${grid}</g><polyline class="chart-line" fill="none" points="${rows.map(([, v], i) => `${x(i)},${y(v)}`).join(' ')}"/>${labels}</svg></div>${chartData(rows, unit, locale, title)}`, {unit, classes: 'research-chart line-chart'});
}

function chainHtml(steps) {
  return `<ol class="flow-steps">${steps.map((step, i) => `<li class="flow-step"><span class="flow-index" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><div>${inline(step)}</div></li>`).join('')}</ol>`;
}

export function renderFlow(raw, locale = 'en', title = '') {
  const chains = [], notes = [];
  for (const line of raw.filter(x => x.trim())) {
    if (/^title\s*:/i.test(line)) { title = line.replace(/^title\s*:/i, '').trim(); continue; }
    const parts = line.split(/\s*(?:→|->)\s*/).filter(x => x.trim());
    if (parts.length > 1) chains.push(parts); else notes.push(line);
  }
  if (!chains.length) return textDiagram(raw, locale);
  title ||= pt(locale) ? 'Cadeia de transmissão' : 'Transmission chain';
  return figure('flow', title, `<div class="flow-chains">${chains.map(chainHtml).join('')}</div>${notes.map(s => `<p class="visual-note">${inline(s)}</p>`).join('')}`, {classes: 'flow-diagram'});
}

function mindmap(raw, locale) {
  const lines = raw.filter(x => x.trim()), root = lines.shift()?.trim().replace(/^[-*]\s*/, '');
  if (!root) return '';
  const tree = [], stack = [{indent: -1, children: tree}];
  for (const line of lines) {
    const indent = line.match(/^\s*/)[0].replace(/\t/g, '    ').length;
    const node = {text: line.trim().replace(/^[-*]\s*/, ''), children: [], indent};
    while (stack.length > 1 && stack.at(-1).indent >= indent) stack.pop();
    stack.at(-1).children.push(node); stack.push(node);
  }
  const leaves = items => `<ul>${items.map(n => `<li>${inline(n.text)}${n.children.length ? leaves(n.children) : ''}</li>`).join('')}</ul>`;
  if (!tree.length) return textDiagram(raw, locale);
  return figure('mindmap', root, `<div class="mindmap-grid">${tree.map(n => `<section class="mind-branch"><h4>${inline(n.text)}</h4>${n.children.length ? leaves(n.children) : ''}</section>`).join('')}</div>`, {classes: 'mindmap'});
}

function geographicSummary(raw, locale) {
  let title = pt(locale) ? 'Contexto geográfico' : 'Geographic context', unit = '';
  const rows = [], routes = [], notes = [];
  for (const line of raw.filter(x => x.trim())) {
    if (/^title\s*:/i.test(line)) { title = line.replace(/^title\s*:/i, '').trim(); continue; }
    if (/^unit\s*:/i.test(line)) { unit = line.replace(/^unit\s*:/i, '').trim(); continue; }
    const cells = line.split('|').map(x => x.trim());
    if (cells.length >= 2) rows.push(cells);
    else if (/(?:→|->)/.test(line)) routes.push(line);
    else notes.push(line);
  }
  const cards = rows.length ? `<div class="geo-map-board">${rows.map(([region, value, ...note]) => `<article class="geo-card"><div class="geo-region">${inline(region)}</div><h4 class="geo-value">${inline(value)}</h4>${note.length ? `<p>${inline(note.join(' | '))}</p>` : ''}</article>`).join('')}</div>` : '';
  const chains = routes.length ? `<div class="flow-chains">${routes.map(l => chainHtml(l.split(/\s*(?:→|->)\s*/))).join('')}</div>` : '';
  // These are regional comparisons or routes, not coordinates. Never invent map positions.
  return figure('geography', title, cards + chains + notes.map(s => `<p class="visual-note">${inline(s)}</p>`).join(''), {unit, classes: 'geo-map'});
}

function cleanDiagramLine(line=''){return line.replace(/\*\*/g,'').replace(/__/g,'');}
function dependencyMap(raw,locale='en'){
  const stages=[];let current=null;
  const heading=s=>{const x=s.replace(/[│├└┬┴┼─►▼→]/g,'').trim();return x.length>2&&x.length<90&&/[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(x)&&x===x.toUpperCase()&&!/\d/.test(x);};
  for(const source of raw){const rawLine=cleanDiagramLine(source),trim=rawLine.trim();if(!trim||/^[│▼]+$/.test(trim))continue;
    if(heading(trim)){current={title:trim.replace(/[│├└┬┴┼─►▼→]/g,'').trim(),relations:[],notes:[]};stages.push(current);continue;}
    if(!current)continue;
    if(/[►→]/.test(trim)){const parts=trim.split(/[►→]/);const left=(parts.shift()||'').replace(/^[│├└┬┴┼─\s]+/,'').replace(/[─\s]+$/,'').trim();const right=parts.join('→').replace(/^[─\s]+/,'').trim();if(left&&right)current.relations.push([left,right]);continue;}
    const note=trim.replace(/^[│├└┬┴┼─\s]+/,'').trim();if(note&&!/^[-─]+$/.test(note))current.notes.push(note);
  }
  if(stages.length<2)return'';
  const label=locale==='pt-BR'?'Mapa de dependências':'Dependency map';
  return `<figure class="visual-figure dependency-map" data-research-visual="diagram"><figcaption>${label}</figcaption><div class="structure-stages">${stages.map((s,i)=>`<section class="structure-stage"><div class="structure-stage-index">${String(i+1).padStart(2,'0')}</div><h4>${inline(s.title)}</h4>${s.relations.length?`<div class="dependency-links">${s.relations.map(([a,b])=>`<div class="dependency-rel"><span>${inline(a)}</span><b aria-hidden="true">→</b><strong>${inline(b)}</strong></div>`).join('')}</div>`:''}${s.notes.length?`<div class="dependency-notes">${s.notes.map(n=>`<span>${inline(n)}</span>`).join('')}</div>`:''}</section>${i<stages.length-1?'<div class="dependency-arrow" aria-hidden="true">↓</div>':''}`).join('')}</div></figure>`;
}

function textDiagram(raw, locale) {
  const dependency = dependencyMap(raw, locale); if (dependency) return dependency;
  return figure('diagram', pt(locale) ? 'Estrutura de relações' : 'Relationship structure', `<pre class="text-diagram-pre" tabindex="0">${esc(raw.join('\n'))}</pre>`, {classes: 'text-diagram'});
}

export function renderVisual(lang, content, locale = 'en') {
  if (lang === 'flow') return renderFlow(content, locale);
  if (lang === 'mindmap') return mindmap(content, locale);
  if (lang === 'map') return geographicSummary(content, locale);
  if (['text', 'diagram', 'ascii'].includes(lang)) return textDiagram(content, locale);
  if (lang !== 'chart') return `<pre class="code-block"><code>${esc(content.join('\n'))}</code></pre>`;
  let title = pt(locale) ? 'Dados da pesquisa' : 'Research data', unit = '', type = 'bar';
  const rows = [];
  for (const raw of content) {
    const line = raw.trim(); if (!line) continue;
    const meta = line.match(/^(title|unit|type)\s*:\s*(.*)$/i);
    if (meta) { if (meta[1].toLowerCase() === 'title') title = meta[2]; else if (meta[1].toLowerCase() === 'unit') unit = meta[2]; else type = meta[2].toLowerCase(); continue; }
    const cells = line.split('|').map(s => s.trim()), value = visualNumber(cells[1]);
    // Invalid authoring fails visibly and the publishing validator rejects it.
    if (cells.length !== 2 || !cells[0] || value === null) return textDiagram(content, locale);
    rows.push([cells[0], value]);
  }
  if (!rows.length) return textDiagram(content, locale);
  return type === 'line' ? lineChart(title, unit, rows, locale) : barChart(title, unit, rows, locale);
}
