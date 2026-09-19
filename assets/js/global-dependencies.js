/* Static SVG, progressively enhanced with a bounded, device-independent camera. */
(() => {
  'use strict';
  const workspace = document.querySelector('.dependency-workspace');
  if (!workspace) return;
  const $ = s => workspace.querySelector(s);
  const all = s => [...workspace.querySelectorAll(s)];
  const svg = $('.dependency-svg');
  const viewport = $('.dependency-graph-scroll');
  const stage = $('.dependency-stage');
  const detailPanel = $('.dependency-detail-panel');
  const nodes = all('.dependency-node');
  const edges = all('.dependency-edge');
  const bands = all('.dependency-band');
  const filters = all('[data-system-filter]');
  const cards = [...document.querySelectorAll('.dependency-relation-card')];
  const details = all('[data-detail-node], [data-detail-edge]');
  const jump = $('[data-node-jump]');
  const zoomOutput = $('.dependency-zoom-level');
  const modal = document.querySelector('.dependency-modal');
  const expand = $('[data-network-action="expand"]');
  const home = workspace.parentNode;
  const anchor = document.createComment('network workspace');
  home.insertBefore(anchor, workspace);
  const original = svg.viewBox.baseVal;
  const world = {x: 0, y: 0, width: original.width, height: original.height};
  let bounds = {...world};
  let camera = {x: 0, y: 0, scale: 1};
  let size = {width: 0, height: 0};
  let fitted = false, selected = null, frame = 0, previousFocus = null;
  const minScale = () => Math.min(0.25, size.width / bounds.width, size.height / bounds.height);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const visible = el => !el.hasAttribute('hidden');
  const small = () => window.matchMedia('(max-width: 980px)').matches;

  function paint() {
    if (!size.width || !size.height) return;
    const width = size.width / camera.scale, height = size.height / camera.scale;
    const constrain = (value, start, span, view) => view >= span
      ? start + span / 2 : clamp(value, start + view / 2, start + span - view / 2);
    camera.x = constrain(camera.x, bounds.x, bounds.width, width);
    camera.y = constrain(camera.y, bounds.y, bounds.height, height);
    svg.setAttribute('viewBox', `${camera.x - width / 2} ${camera.y - height / 2} ${width} ${height}`);
    zoomOutput.value = `${Math.round(camera.scale * 100)}%`;
    $('[data-network-action="out"]').disabled = camera.scale <= minScale() + 0.001;
    $('[data-network-action="in"]').disabled = camera.scale >= 3;
  }
  function schedulePaint() {
    if (!frame) frame = requestAnimationFrame(() => {frame = 0; paint();});
  }
  function fit() {
    fitted = true;
    camera = {x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2,
      scale: Math.min(1.5, size.width / bounds.width, size.height / bounds.height)};
    paint();
  }
  function readable() {
    fitted = false;
    camera.scale = 1;
    paint();
  }
  function zoom(factor, point = {x: size.width / 2, y: size.height / 2}) {
    fitted = false;
    const next = clamp(camera.scale * factor, minScale(), 3);
    camera.x += (point.x - size.width / 2) * (1 / camera.scale - 1 / next);
    camera.y += (point.y - size.height / 2) * (1 / camera.scale - 1 / next);
    camera.scale = next;
    paint();
  }
  function focusItem(item, enlarge = false) {
    const box = item.getBBox();
    fitted = false;
    if (enlarge) camera.scale = Math.max(1, camera.scale);
    camera.x = box.x + box.width / 2;
    camera.y = box.y + box.height / 2;
    paint();
  }
  function keepInView(item) {
    const box = item.getBBox(), v = svg.viewBox.baseVal;
    if (box.x < v.x || box.y < v.y || box.x + box.width > v.x + v.width || box.y + box.height > v.y + v.height)
      focusItem(item);
  }
  function updateHash(value = '') {
    try { history.replaceState(null, '', location.pathname + location.search + (value ? '#' + value : '')); } catch { /* Embedded previews may disallow history. */ }
  }
  function clearFocus() {
    nodes.concat(edges).forEach(el => {
      el.classList.remove('is-active', 'is-neighbor', 'is-muted');
      el.setAttribute('aria-pressed', 'false');
    });
  }
  function highlightNode(id, transmission = false) {
    clearFocus();
    const connected = new Set([id]), included = new Set();
    const queue = [{id, depth: 0}];
    while (queue.length) {
      const current = queue.shift();
      if (current.depth >= (transmission ? 4 : 1)) continue;
      edges.filter(visible).forEach(edge => {
        if (edge.dataset.from !== current.id && edge.dataset.to !== current.id) return;
        included.add(edge);
        const next = edge.dataset.from === current.id ? edge.dataset.to : edge.dataset.from;
        if (!connected.has(next)) {connected.add(next); queue.push({id: next, depth: current.depth + 1});}
      });
    }
    edges.forEach(e => e.classList.add(included.has(e) ? 'is-active' : 'is-muted'));
    nodes.forEach(n => {
      n.classList.add(n.dataset.nodeId === id ? 'is-active' : connected.has(n.dataset.nodeId) ? 'is-neighbor' : 'is-muted');
      n.setAttribute('aria-pressed', String(n.dataset.nodeId === id));
    });
  }
  function activateTab(panel, name) {
    const tabs = [...panel.querySelectorAll('[data-node-tab]')];
    tabs.forEach(t => {
      const active = t.dataset.nodeTab === name;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
    });
    panel.querySelectorAll('[data-node-tab-panel]').forEach(p => {p.hidden = p.dataset.nodeTabPanel !== name;});
    if (selected?.dataset.nodeId) highlightNode(selected.dataset.nodeId, name === 'transmission');
  }
  function showDetail(item, {noHash = false, noScroll = false} = {}) {
    selected = item;
    const id = item.dataset.nodeId || item.dataset.edgeId;
    const isNode = !!item.dataset.nodeId;
    detailPanel.hidden = false;
    stage.classList.add('has-selection');
    $('.dependency-detail-default').hidden = true;
    details.forEach(panel => {
      panel.hidden = (isNode ? panel.dataset.detailNode : panel.dataset.detailEdge) !== id;
      if (!panel.hidden && isNode) activateTab(panel, 'overview');
    });
    if (isNode) {highlightNode(id); jump.value = id;}
    else {
      jump.value = '';
      clearFocus();
      edges.forEach(e => e.classList.add(e === item ? 'is-active' : 'is-muted'));
      nodes.forEach(n => n.classList.add([item.dataset.from, item.dataset.to].includes(n.dataset.nodeId) ? 'is-active' : 'is-muted'));
      item.setAttribute('aria-pressed', 'true');
    }
    detailPanel.scrollTop = 0;
    if (!noHash) updateHash((isNode ? 'node-' : 'relation-') + id);
    requestAnimationFrame(() => {
      keepInView(item);
      if (small() && !noScroll && !modal.open) detailPanel.scrollIntoView({block: 'nearest', behavior: 'auto'});
    });
  }
  function closeDetail({focus = false} = {}) {
    const old = selected;
    selected = null;
    detailPanel.hidden = true;
    stage.classList.remove('has-selection');
    clearFocus();
    jump.value = '';
    updateHash();
    if (focus) {
      viewport.scrollIntoView({block: 'nearest', behavior: 'auto'});
      if (old && visible(old)) old.focus({preventScroll: true});
      else viewport.focus({preventScroll: true});
    }
  }
  function applyFilter(system, autoFit = true) {
    closeDetail();
    filters.forEach(button => {
      const on = button.dataset.systemFilter === system;
      button.classList.toggle('active', on);
      button.setAttribute('aria-pressed', String(on));
    });
    const included = new Set();
    edges.forEach(e => {
      const on = system === 'all' || e.dataset.system === system;
      // SVG elements have no HTMLElement.hidden setter.
      e.toggleAttribute('hidden', !on);
      if (on) {included.add(e.dataset.from); included.add(e.dataset.to);}
    });
    nodes.forEach(n => n.toggleAttribute('hidden', !(system === 'all' || n.dataset.system === system || included.has(n.dataset.nodeId))));
    bands.forEach(b => b.toggleAttribute('hidden', !(system === 'all' || b.dataset.system === system)));
    cards.forEach(c => {c.hidden = !(system === 'all' || c.dataset.relationSystem === system);});
    if (system === 'all') bounds = {...world};
    else {
      const boxes = nodes.concat(edges).filter(visible).map(n => n.getBBox());
      const left = Math.min(...boxes.map(b => b.x)) - 28, top = Math.min(...boxes.map(b => b.y)) - 52;
      const right = Math.max(...boxes.map(b => b.x + b.width)) + 28, bottom = Math.max(...boxes.map(b => b.y + b.height)) + 28;
      bounds = {x: left, y: top, width: right - left, height: bottom - top};
    }
    if (autoFit) fit();
  }

  // Pointer capture starts only after a drag so a tap still selects its SVG target.
  const pointers = new Map();
  let gesture = null, suppressClick = false;
  const position = event => {
    const rect = viewport.getBoundingClientRect();
    return {x: event.clientX - rect.left, y: event.clientY - rect.top};
  };
  function snapshotGesture() {
    const list = [...pointers.values()];
    if (!list.length) {gesture = null; return;}
    const center = list.length > 1 ? {x: (list[0].x + list[1].x) / 2, y: (list[0].y + list[1].y) / 2} : list[0];
    gesture = {center, camera: {...camera}, distance: list.length > 1 ? Math.hypot(list[0].x-list[1].x, list[0].y-list[1].y) : 0};
  }
  viewport.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    if (!pointers.size) suppressClick = false;
    pointers.set(event.pointerId, position(event));
    if (pointers.size > 1) suppressClick = true;
    snapshotGesture();
  });
  viewport.addEventListener('pointermove', event => {
    if (!pointers.has(event.pointerId) || !gesture) return;
    pointers.set(event.pointerId, position(event));
    const list = [...pointers.values()];
    const center = list.length > 1 ? {x: (list[0].x+list[1].x)/2, y: (list[0].y+list[1].y)/2} : list[0];
    const dx = center.x - gesture.center.x, dy = center.y - gesture.center.y;
    if (!suppressClick && Math.hypot(dx, dy) < 5) return;
    suppressClick = true;
    fitted = false;
    viewport.classList.add('is-dragging');
    if (!viewport.hasPointerCapture(event.pointerId)) viewport.setPointerCapture(event.pointerId);
    const ratio = list.length > 1 && gesture.distance ? Math.hypot(list[0].x-list[1].x, list[0].y-list[1].y) / gesture.distance : 1;
    const scale = clamp(gesture.camera.scale * ratio, minScale(), 3);
    camera = {scale,
      x: gesture.camera.x + (gesture.center.x-size.width/2)/gesture.camera.scale - (center.x-size.width/2)/scale,
      y: gesture.camera.y + (gesture.center.y-size.height/2)/gesture.camera.scale - (center.y-size.height/2)/scale};
    schedulePaint();
  });
  function endPointer(event) {
    if (!pointers.has(event.pointerId)) return;
    pointers.delete(event.pointerId);
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    paint();
    snapshotGesture();
    if (!pointers.size) viewport.classList.remove('is-dragging');
  }
  ['pointerup', 'pointercancel'].forEach(type => viewport.addEventListener(type, endPointer));
  // A touch target may lose its implicit capture when the viewport starts dragging.
  // Only losing the viewport's own capture ends the gesture.
  viewport.addEventListener('lostpointercapture', event => {if (event.target === viewport) endPointer(event);});
  viewport.addEventListener('pointerleave', event => {if (!viewport.hasPointerCapture(event.pointerId)) endPointer(event);});
  viewport.addEventListener('click', event => {
    if (suppressClick && event.detail !== 0) {event.preventDefault(); event.stopImmediatePropagation();}
  }, true);
  viewport.addEventListener('wheel', event => {
    if (!event.ctrlKey && !event.metaKey) return; // Ordinary wheel scrolling still scrolls the page.
    event.preventDefault();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? size.height : 1);
    zoom(Math.exp(-clamp(delta, -100, 100)*0.01), position(event));
  }, {passive: false});
  viewport.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const key = event.key;
    if (['+', '=', '-', '_', '0', 'Home', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)) event.preventDefault();
    if (key === '+' || key === '=') zoom(1.25);
    else if (key === '-' || key === '_') zoom(0.8);
    else if (key === '0' || key === 'Home') fit();
    else if (key.startsWith('Arrow')) {
      fitted = false;
      const step = (event.shiftKey ? 160 : 64) / camera.scale;
      if (key === 'ArrowLeft') camera.x -= step;
      if (key === 'ArrowRight') camera.x += step;
      if (key === 'ArrowUp') camera.y -= step;
      if (key === 'ArrowDown') camera.y += step;
      paint();
    }
  });
  viewport.addEventListener('focusin', event => {
    const item = event.target.closest('.dependency-node, .dependency-edge');
    if (item) keepInView(item);
  });
  nodes.concat(edges).forEach(item => {
    item.setAttribute('aria-pressed', 'false');
    item.addEventListener('click', () => showDetail(item));
    item.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {event.preventDefault(); showDetail(item);}
    });
  });
  filters.forEach(b => b.addEventListener('click', () => applyFilter(b.dataset.systemFilter)));
  $('.dependency-detail-close').addEventListener('click', () => closeDetail({focus: true}));
  jump.addEventListener('change', () => {
    const item = nodes.find(n => n.dataset.nodeId === jump.value);
    if (!item) return;
    if (!visible(item)) applyFilter('all', false);
    showDetail(item);
    requestAnimationFrame(() => focusItem(item, true));
  });
  details.filter(p => p.hasAttribute('data-detail-node')).forEach(panel => {
    panel.querySelectorAll('[data-node-tab]').forEach(t => {
      const name = t.dataset.nodeTab, id = panel.dataset.detailNode + '-' + name;
      const pane = panel.querySelector(`[data-node-tab-panel="${name}"]`);
      t.id = 'tab-' + id;
      t.setAttribute('aria-controls', 'panel-' + id);
      t.tabIndex = name === 'overview' ? 0 : -1;
      pane.id = 'panel-' + id;
      pane.setAttribute('role', 'tabpanel');
      pane.setAttribute('aria-labelledby', t.id);
    });
  });
  detailPanel.addEventListener('click', event => {
    const tab = event.target.closest('[data-node-tab]');
    if (tab) activateTab(tab.closest('[data-detail-node]'), tab.dataset.nodeTab);
    const open = event.target.closest('[data-open-edge]');
    if (open) {
      const item = edges.find(e => e.dataset.edgeId === open.dataset.openEdge);
      if (item) {if (!visible(item)) applyFilter('all', false); showDetail(item);}
    }
  });
  detailPanel.addEventListener('keydown', event => {
    const tab = event.target.closest('[data-node-tab]');
    if (!tab || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const panel = tab.closest('[data-detail-node]'), tabs = [...panel.querySelectorAll('[data-node-tab]')];
    const i = tabs.indexOf(tab), next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length-1 : (i + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    activateTab(panel, tabs[next].dataset.nodeTab);
    tabs[next].focus();
  });
  all('[data-network-action]').forEach(button => button.addEventListener('click', () => {
    switch (button.dataset.networkAction) {
      case 'in': zoom(1.25); break;
      case 'out': zoom(0.8); break;
      case 'fit': fit(); break;
      case 'readable': readable(); break;
      case 'expand':
        if (modal.open) {modal.close(); break;}
        previousFocus = document.activeElement;
        modal.append(workspace);
        modal.showModal();
        document.body.classList.add('dependency-modal-open');
        expand.textContent = expand.dataset.closeLabel;
        expand.setAttribute('aria-expanded', 'true');
        break;
    }
  }));
  modal.addEventListener('close', () => {
    anchor.after(workspace);
    document.body.classList.remove('dependency-modal-open');
    expand.textContent = expand.dataset.openLabel;
    expand.setAttribute('aria-expanded', 'false');
    previousFocus?.focus({preventScroll: true});
  });
  if (typeof modal.showModal !== 'function') expand.hidden = true;
  $('.dependency-toolbar').hidden = false;
  viewport.classList.add('is-interactive');
  filters.forEach(b => b.setAttribute('aria-pressed', String(b.classList.contains('active'))));
  new ResizeObserver(() => {
    const first = !size.width;
    size = {width: viewport.clientWidth, height: viewport.clientHeight};
    if (first) {
      // Desktop opens at readable size; a phone starts with an overview and explicit zoom controls.
      if (small()) fit();
      else {camera = {x: size.width/2, y: size.height/2, scale: 1}; paint();}
    } else if (fitted) fit();
    else paint();
  }).observe(viewport);
  try {
    const hash = decodeURIComponent(location.hash);
    const item = hash.startsWith('#node-') ? nodes.find(n => n.dataset.nodeId === hash.slice(6))
      : hash.startsWith('#relation-') ? edges.find(e => e.dataset.edgeId === hash.slice(10)) : null;
    if (item) {showDetail(item, {noHash: true, noScroll: true}); requestAnimationFrame(() => focusItem(item, true));}
  } catch { /* A malformed fragment must not disable navigation. */ }
})();
