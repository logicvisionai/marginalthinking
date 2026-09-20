import {attachSvgViewport} from './svg-viewport.js';

const pt = document.documentElement.lang.toLowerCase().startsWith('pt');
const labels = pt ? {expand:'Ampliar',close:'Fechar',csv:'Baixar CSV',svg:'Baixar SVG',link:'Copiar link do visual',copied:'Link copiado',view:'Visualização ampliada',scroll:'Deslize ou use as setas para ver todas as colunas.',in:'Aumentar zoom',out:'Diminuir zoom',scale:'Nível de zoom',fit:'Ajustar mapa',map:'Arraste para mover o mapa. Use + e − ou dois dedos para ampliar; Ctrl + rolagem no computador.'} : {expand:'Expand',close:'Close',csv:'Download CSV',svg:'Download SVG',link:'Copy figure link',copied:'Link copied',view:'Expanded view',scroll:'Scroll or use the arrow keys to see all columns.',in:'Zoom in',out:'Zoom out',scale:'Zoom level',fit:'Fit map',map:'Drag to move the map. Use + and − or pinch to zoom; Ctrl + scroll on desktop.'};
const enhanced = new WeakSet();
let modal, restore;

export function csvCell(value) {
  let text = String(value).trim();
  // Treat text as text in spreadsheet apps, without changing signed numeric data.
  if (/^[=+@\-\t\r]/.test(text) && !/^[+-]?\d+(?:[.,]\d+)?$/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
function download(figure, title) {
  const table = figure.querySelector('table');
  const rows = [...table.rows].map(row => [...row.cells].map(cell => csvCell(cell.textContent)).join(','));
  const blob = new Blob(['\ufeff' + rows.join('\r\n') + '\r\n'], {type:'text/csv;charset=utf-8'});
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = `${title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/gi, '-').slice(0, 90) || 'research'}.csv`;
  a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function slug(value) {
  return String(value || 'visual').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 72) || 'visual';
}
async function copyFigureLink(figure, button) {
  const url = new URL(location.href); url.hash = figure.id;
  try {
    await navigator.clipboard.writeText(url.href);
    const before = button.textContent; button.textContent = labels.copied;
    setTimeout(() => {button.textContent = before;}, 1400);
  } catch {
    const input = document.createElement('textarea'); input.value = url.href; input.setAttribute('readonly', ''); input.style.position = 'fixed'; input.style.opacity = '0';
    document.body.append(input); input.select(); document.execCommand('copy'); input.remove();
  }
}
function downloadSvg(figure, title) {
  const source = figure.querySelector('svg'); if (!source) return;
  const clone = source.cloneNode(true), original = [source, ...source.querySelectorAll('*')], copied = [clone, ...clone.querySelectorAll('*')];
  const props = ['fill','stroke','stroke-width','stroke-linecap','stroke-linejoin','opacity','font-family','font-size','font-weight','font-style','text-anchor'];
  original.forEach((node, i) => {
    const style = getComputedStyle(node), target = copied[i]; if (!target) return;
    const values = props.map(p => p + ':' + style.getPropertyValue(p)).join(';');
    target.setAttribute('style', (target.getAttribute('style') || '') + ';' + values);
  });
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const blob = new Blob([new XMLSerializer().serializeToString(clone)], {type:'image/svg+xml;charset=utf-8'});
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = slug(title) + '.svg'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function expand(figure, trigger) {
  if (!modal) {
    modal = document.createElement('dialog'); modal.className = 'visual-dialog'; modal.setAttribute('aria-label', labels.view);
    const bar = document.createElement('div'); bar.className = 'visual-dialog-bar';
    const heading = document.createElement('span'); heading.textContent = labels.view;
    const close = document.createElement('button'); close.type = 'button'; close.className = 'visual-dialog-close'; close.textContent = `${labels.close} ×`; close.setAttribute('aria-label', labels.close);
    close.addEventListener('click', () => modal.close()); bar.append(heading, close); modal.append(bar); document.body.append(modal);
    modal.addEventListener('close', () => {restore?.(); restore = null;});
    modal.addEventListener('click', e => {if (e.target === modal || e.target.closest('a[href^="#"]')) modal.close();});
  }
  if (modal.open) return;
  const marker = document.createComment('visual position'); figure.before(marker);
  const overflow = document.documentElement.style.overflow;
  restore = () => {marker.replaceWith(figure); document.documentElement.style.overflow = overflow; trigger.focus({preventScroll:true});};
  modal.append(figure); document.documentElement.style.overflow = 'hidden'; modal.showModal();
  modal.querySelector('.visual-dialog-close').focus();
}

function enhance() {
  const figures = [...document.querySelectorAll('[data-research-visual]')];
  for (const [index, figure] of figures.entries()) {
    if (enhanced.has(figure)) continue; enhanced.add(figure);
    const title = figure.querySelector('figcaption')?.childNodes[0]?.textContent?.trim() || labels.view;
    if (!figure.id) figure.id = 'figure-' + slug(title) + '-' + (index + 1);
    const controls = document.createElement('div'); controls.className = 'visual-actions';
    const add = (text, action, name = text, className = '') => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = text; b.className = className; b.setAttribute('aria-label', name); b.addEventListener('click', action); controls.append(b); return b;
    };
    const viewport = figure.querySelector('.map-viewport');
    if (viewport) {
      attachSvgViewport(viewport, controls, labels);
      const help = document.createElement('p'); help.className = 'visual-scroll-note'; help.textContent = labels.map; viewport.after(help);
    }
    if (figure.querySelector('table')) add(labels.csv, () => download(figure, title));
    if (figure.querySelector('svg')) add(labels.svg, () => downloadSvg(figure, title));
    let linkButton; linkButton = add(labels.link, () => copyFigureLink(figure, linkButton), labels.link);
    if (typeof HTMLDialogElement !== 'undefined' && 'showModal' in HTMLDialogElement.prototype) {
      const button = add(`${labels.expand} ↗`, () => expand(figure, button), `${labels.expand}: ${title}`, 'visual-expand');
    }
    if (controls.children.length) figure.append(controls);
    for (const scroller of figure.querySelectorAll('.md-table-wrap,.line-chart-scroll')) {
      const note = document.createElement('p'); note.className = 'visual-scroll-note'; note.textContent = labels.scroll; note.hidden = true; scroller.after(note);
      const update = () => {note.hidden = scroller.scrollWidth <= scroller.clientWidth + 1;};
      if ('ResizeObserver' in window) new ResizeObserver(update).observe(scroller); update();
    }
  }
}
enhance();
if (location.hash?.startsWith('#figure-')) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({block:'center'}));
document.addEventListener('research:rendered', enhance);
