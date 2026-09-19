// Camera for geographic SVGs. Data geometry stays unchanged; the viewBox moves.
export function attachSvgViewport(viewport, controls, labels) {
  const svg = viewport.querySelector('svg');
  if (!svg) return;
  const [x, y, w, h] = svg.getAttribute('viewBox').split(/\s+/).map(Number);
  const world = {x, y, w, h}, pointers = new Map();
  let zoom = 1, cx = x + w / 2, cy = y + h / 2, base, box, gesture, dragged = false;
  const button = (label, text, action) => {
    const el = document.createElement('button'); el.type = 'button'; el.textContent = text; el.setAttribute('aria-label', label);
    el.addEventListener('click', action); controls.append(el); return el;
  };
  const minus = button(labels.out, '−', () => scale(zoom / 1.4));
  const output = document.createElement('output'); output.setAttribute('aria-label', labels.scale); controls.append(output);
  const plus = button(labels.in, '+', () => scale(zoom * 1.4));
  button(labels.fit, labels.fit, () => {zoom = 1; cx = x + w / 2; cy = y + h / 2; draw();});
  function draw() {
    const rect = viewport.getBoundingClientRect(), ratio = rect.width / Math.max(1, rect.height);
    const bw = Math.max(world.w, world.h * ratio), bh = bw / Math.max(.1, ratio);
    base = {x: world.x + (world.w - bw) / 2, y: world.y + (world.h - bh) / 2, w: bw, h: bh};
    const nw = base.w / zoom, nh = base.h / zoom;
    cx = Math.max(base.x + nw / 2, Math.min(base.x + base.w - nw / 2, cx));
    cy = Math.max(base.y + nh / 2, Math.min(base.y + base.h - nh / 2, cy));
    box = {x: cx - nw / 2, y: cy - nh / 2, w: nw, h: nh};
    svg.setAttribute('viewBox', `${box.x} ${box.y} ${box.w} ${box.h}`);
    // Keep labels and touch targets readable at every zoom level and screen width.
    const markerScale = box.w / Math.max(1, rect.width) * 1.4;
    for (const pin of svg.querySelectorAll('.atlas-pin')) {
      const core = pin.querySelector('.pin-core'), px = Number(core.getAttribute('cx')), py = Number(core.getAttribute('cy'));
      pin.setAttribute('transform', `translate(${px} ${py}) scale(${markerScale}) translate(${-px} ${-py})`);
    }
    output.textContent = `${Math.round(zoom * 100)}%`; minus.disabled = zoom <= 1; plus.disabled = zoom >= 8;
    viewport.classList.toggle('is-zoomed', zoom > 1);
  }
  function scale(next, client) {
    const rect = viewport.getBoundingClientRect();
    const fx = client ? (client.x - rect.left) / rect.width : .5, fy = client ? (client.y - rect.top) / rect.height : .5;
    const wx = box.x + fx * box.w, wy = box.y + fy * box.h;
    zoom = Math.max(1, Math.min(8, next));
    cx = wx + (.5 - fx) * base.w / zoom; cy = wy + (.5 - fy) * base.h / zoom; draw();
  }
  const point = e => ({x: e.clientX, y: e.clientY});
  const distance = p => Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
  const midpoint = p => ({x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2});
  function start() {
    const p = [...pointers.values()];
    gesture = p.length > 1 ? {distance: distance(p), zoom, mid: midpoint(p)} : p.length ? {point: p[0], cx, cy} : null;
  }
  viewport.classList.add('is-interactive');
  viewport.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    if (!pointers.size) dragged = false;
    pointers.set(e.pointerId, point(e)); start();
  });
  viewport.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId) || !gesture) return;
    pointers.set(e.pointerId, point(e));
    const p = [...pointers.values()], rect = viewport.getBoundingClientRect();
    if (p.length > 1) {
      dragged = true; scale(gesture.zoom * distance(p) / Math.max(1, gesture.distance), midpoint(p));
      // Restart from the current camera to avoid cumulative anchor drift.
      start();
    } else {
      const dx = e.clientX - gesture.point.x, dy = e.clientY - gesture.point.y;
      if (Math.hypot(dx, dy) < 5 && !dragged) return;
      dragged = true; cx = gesture.cx - dx * box.w / rect.width; cy = gesture.cy - dy * box.h / rect.height; draw();
    }
    viewport.setPointerCapture(e.pointerId); viewport.classList.add('is-panning'); e.preventDefault();
  });
  const finish = e => {pointers.delete(e.pointerId); if (viewport.hasPointerCapture?.(e.pointerId)) viewport.releasePointerCapture(e.pointerId); start(); if (!pointers.size) viewport.classList.remove('is-panning');};
  window.addEventListener('pointerup', finish); window.addEventListener('pointercancel', finish);
  viewport.addEventListener('lostpointercapture', e => {pointers.delete(e.pointerId); start(); if (!pointers.size) viewport.classList.remove('is-panning');});
  viewport.addEventListener('click', e => {if (dragged) {e.preventDefault(); e.stopPropagation(); dragged = false;}}, true);
  viewport.addEventListener('wheel', e => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault(); scale(zoom * Math.exp(-e.deltaY * .003), point(e));
  }, {passive: false});
  viewport.addEventListener('keydown', e => {
    if (e.target !== viewport || e.ctrlKey || e.metaKey || e.altKey) return;
    if (['+', '='].includes(e.key)) scale(zoom * 1.4);
    else if (e.key === '-') scale(zoom / 1.4);
    else if (['0', 'Home'].includes(e.key)) {zoom = 1; draw();}
    else if (e.key === 'ArrowLeft') {cx -= box.w * .12; draw();}
    else if (e.key === 'ArrowRight') {cx += box.w * .12; draw();}
    else if (e.key === 'ArrowUp') {cy -= box.h * .12; draw();}
    else if (e.key === 'ArrowDown') {cy += box.h * .12; draw();}
    else return;
    e.preventDefault();
  });
  draw();
  if ('ResizeObserver' in window) new ResizeObserver(draw).observe(viewport);
}
