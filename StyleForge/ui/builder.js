/*
 * StyleForge (working name) — ui/builder.js : the WYSIWYG page Builder (drag blocks, layers, device previews, export)
 * Copyright (C) 2026 Zarir Madon — GNU GPL v3 or later (see LICENSE)
 */
(function () {
  const U = SF.u, { $, $$, esc } = U;
  const VOID = new Set(['img', 'input', 'hr', 'br']);
  const CONT = new Set(['div', 'section', 'nav', 'header', 'footer', 'main', 'ul', 'ol', 'form', 'article', 'aside', 'li', 'blockquote', 'figure']);
  const LEAF = new Set(['h1', 'h2', 'h3', 'h4', 'p', 'a', 'button', 'span', 'li', 'label', 'blockquote', 'small', 'strong', 'em']);
  const TAGS = ['div', 'section', 'header', 'nav', 'main', 'footer', 'article', 'aside', 'ul', 'ol', 'li', 'form', 'figure', 'h1', 'h2', 'h3', 'h4', 'p', 'a', 'button', 'span', 'label', 'blockquote', 'img', 'input', 'hr', 'small', 'strong', 'em'];
  const ATTRS = ['href', 'src', 'alt', 'placeholder', 'type', 'title', 'target', 'name', 'value', 'id', 'class', 'rel'];
  const DEV = [['Phone', 390], ['Tablet', 820], ['Laptop', 1280], ['Full', 0]];
  const N = (tag, style, text, children, attrs) => ({ id: U.uid(), tag, style: style || {}, text: text || '', attrs: attrs || {}, children: children || [] });
  const IMG = U.svgURI('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c5cff"/><stop offset="1" stop-color="#ff5c9d"/></linearGradient></defs><rect width="600" height="360" fill="url(#g)"/><path d="M0 300 L150 190 L260 270 L380 150 L600 310 V360 H0Z" fill="#ffffff55"/><circle cx="470" cy="90" r="34" fill="#ffffffaa"/></svg>');
  const P = [
    ['Layout', [
      ['Section', 'rows', 'blue', () => N('section', { padding: '48px 24px', background: '#f4f5fb' }, '', [N('div', { 'max-width': '960px', margin: '0 auto' })])],
      ['Container', 'file', 'blue', () => N('div', { 'max-width': '960px', margin: '0 auto', padding: '16px' })],
      ['Row', 'rows', 'teal', () => N('div', { display: 'flex', gap: '16px', 'flex-wrap': 'wrap', 'align-items': 'center' })],
      ['2 columns', 'grid', 'teal', () => N('div', { display: 'grid', 'grid-template-columns': 'repeat(2, 1fr)', gap: '16px' }, '', [N('div', { padding: '16px', background: '#e9ecf8', 'border-radius': '12px' }, '', [N('p', {}, 'Left column')]), N('div', { padding: '16px', background: '#e9ecf8', 'border-radius': '12px' }, '', [N('p', {}, 'Right column')])])],
      ['3 columns', 'grid', 'teal', () => N('div', { display: 'grid', 'grid-template-columns': 'repeat(3, 1fr)', gap: '16px' }, '', [1, 2, 3].map(i => N('div', { padding: '16px', background: '#e9ecf8', 'border-radius': '12px' }, '', [N('p', {}, 'Column ' + i)])))],
      ['Card', 'cube', 'purple', () => N('div', { background: '#ffffff', 'border-radius': '16px', padding: '20px', 'box-shadow': '0 10px 30px rgba(20,24,60,.15)', 'max-width': '320px' }, '', [N('h3', { margin: '0 0 8px' }, 'Card title'), N('p', { margin: '0', color: '#555' }, 'A short description goes here.')])],
      ['Spacer', 'plus', 'green', () => N('div', { height: '32px' })],
      ['Divider', 'rows', 'green', () => N('hr', { border: '0', 'border-top': '1px solid #d6d9e6', margin: '16px 0' })]]],
    ['Text', [
      ['Heading', 'text', 'pink', () => N('h2', { margin: '0 0 12px', 'font-size': '32px' }, 'A big heading')],
      ['Paragraph', 'text', 'pink', () => N('p', { margin: '0 0 12px', 'line-height': '1.6' }, 'Write something here. Double-tap it, or use the Text box on the right, to change this text.')],
      ['Link', 'text', 'amber', () => N('a', { color: '#5b3df5' }, 'A link', [], { href: '#' })],
      ['List', 'rows', 'pink', () => N('ul', { 'padding-left': '20px', 'line-height': '1.7' }, '', ['One', 'Two', 'Three'].map(t => N('li', {}, t)))],
      ['Quote', 'text', 'amber', () => N('blockquote', { margin: '0', padding: '8px 16px', 'border-left': '4px solid #7c5cff', color: '#444', 'font-style': 'italic' }, 'A thoughtful quote goes here.')]]],
    ['Media & forms', [
      ['Image', 'pic', 'green', () => N('img', { width: '100%', 'max-width': '480px', 'border-radius': '12px', display: 'block' }, '', [], { src: IMG, alt: 'A picture' })],
      ['Button', 'ctl', 'purple', () => N('button', { background: 'linear-gradient(135deg,#7c5cff,#ff5c9d)', color: '#fff', border: '0', 'border-radius': '10px', padding: '12px 24px', 'font-weight': '600', 'font-size': '16px' }, 'Click me')],
      ['Input', 'ctl', 'teal', () => N('input', { padding: '10px 12px', border: '1px solid #c5cae0', 'border-radius': '8px', width: '100%', 'max-width': '320px' }, '', [], { placeholder: 'e.g. you@email.com', type: 'text' })],
      ['Form', 'ctl', 'teal', () => N('form', { display: 'flex', gap: '8px', 'flex-wrap': 'wrap' }, '', [N('input', { padding: '10px 12px', border: '1px solid #c5cae0', 'border-radius': '8px', flex: '1', 'min-width': '180px' }, '', [], { placeholder: 'e.g. you@email.com', type: 'text' }), N('button', { background: '#7c5cff', color: '#fff', border: '0', 'border-radius': '8px', padding: '10px 18px', 'font-weight': '600' }, 'Subscribe')])]]],
    ['Ready-made', [
      ['Navbar', 'rows', 'blue', () => N('nav', { display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', padding: '14px 24px', background: '#14182a', color: '#fff' }, '', [N('strong', { 'font-size': '18px' }, 'Brand'), N('div', { display: 'flex', gap: '18px' }, '', ['Home', 'About', 'Contact'].map(t => N('a', { color: '#cfd6f0', 'text-decoration': 'none' }, t, [], { href: '#' })))])],
      ['Hero', 'sun', 'amber', () => N('section', { padding: '72px 24px', 'text-align': 'center', background: 'linear-gradient(160deg,#1b1340,#7c5cff 60%,#ff9ac1)', color: '#fff' }, '', [N('h1', { margin: '0 0 12px', 'font-size': '44px' }, 'Make something wonderful'), N('p', { margin: '0 auto 22px', 'max-width': '520px', opacity: '.9' }, 'A short line that explains what this page is about.'), N('button', { background: '#fff', color: '#3a2a8a', border: '0', 'border-radius': '99px', padding: '12px 28px', 'font-weight': '700' }, 'Get started')])],
      ['Features', 'grid', 'pink', () => N('section', { padding: '40px 24px' }, '', [N('div', { display: 'grid', 'grid-template-columns': 'repeat(3, 1fr)', gap: '16px', 'max-width': '960px', margin: '0 auto' }, '', ['Fast', 'Friendly', 'Free'].map(t => N('div', { padding: '20px', 'border-radius': '14px', background: '#f4f5fb' }, '', [N('h3', { margin: '0 0 6px' }, t), N('p', { margin: '0', color: '#555' }, 'One line about why this matters.')])))])],
      ['Footer', 'rows', 'purple', () => N('footer', { padding: '24px', 'text-align': 'center', background: '#14182a', color: '#9aa3c4', 'font-size': '13px' }, 'Made with StyleForge')]]]
  ];
  const find = (n, id, parent = null) => { if (n.id === id) return { node: n, parent, index: parent ? parent.children.indexOf(n) : 0 }; for (const c of n.children) { const r = find(c, id, n); if (r) return r; } return null; };
  const clone = n => JSON.parse(JSON.stringify(n));
  const reid = n => { n.id = U.uid(); n.children.forEach(reid); return n; };
  const isCont = n => CONT.has(n.tag) || n.tag === 'raw';
  const dec = o => Object.keys(o).map(k => `${k}: ${o[k]};`).join(' ');

  const B = SF.builder = {
    pages: [], page: null, sel: null, dev: 3, zoom: 100, preview: 0, tab: 'style', mode: 'simple', hist: [], hi: -1, ptab: 'palette'
  };
  const newPage = n => ({ id: U.uid(), n: n || 'My page', css: '', tree: N('div', { 'font-family': 'system-ui, sans-serif', color: '#1b2240', background: '#ffffff', 'min-height': '100%' }), at: Date.now() });
  const root = () => B.page.tree;
  const selNode = () => { const r = find(root(), B.sel); return r ? r.node : root(); };

  function save() { B.page.at = Date.now(); const a = U.store.get('pages', []), i = a.findIndex(p => p.id === B.page.id); if (i < 0) a.push(B.page); else a[i] = B.page; U.store.set('pages', a); const s = $('#bst'); if (s) s.textContent = 'Saved on this device ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
  function snap() { return JSON.stringify({ t: B.page.tree, c: B.page.css }); }
  function commit() { const s = snap(); if (s !== B.hist[B.hi]) { B.hist = B.hist.slice(0, B.hi + 1); B.hist.push(s); if (B.hist.length > 100) B.hist.shift(); B.hi = B.hist.length - 1; } save(); }
  function restore() { const o = JSON.parse(B.hist[B.hi]); B.page.tree = o.t; B.page.css = o.c; if (!find(root(), B.sel)) B.sel = root().id; save(); draw(); panel(); }

  /* ---------- rendering ---------- */
  function rend(n, top) {
    const st = dec(n.style), at = Object.entries(n.attrs || {}).filter(([k, v]) => ATTRS.includes(k) && v !== '' && v != null).map(([k, v]) => ` ${k === 'class' ? 'class' : k}="${esc(v)}"`).join('');
    if (n.tag === 'raw') return `<div data-id="${n.id}" style="${esc(st)}">${n.html || ''}</div>`;
    if (VOID.has(n.tag)) return `<${n.tag} data-id="${n.id}" style="${esc(st)}"${at}>`;
    const inner = n.children.length ? n.children.map(c => rend(c)).join('') : (LEAF.has(n.tag) ? esc(n.text) : (isCont(n) ? `<div class="empty-box" data-ph="1">Drop things here</div>` : esc(n.text)));
    return `<${n.tag} data-id="${n.id}" style="${esc(st)}"${at}>${inner}</${n.tag}>`;
  }
  const FRAME_CSS = '*{box-sizing:border-box}:host{display:block}.wrap{background:#fff;color:#111;font-family:system-ui,sans-serif;min-height:420px}img{max-width:100%}.sel{outline:2px solid #7c5cff!important;outline-offset:-2px}.hov{outline:1px dashed #7c5cffaa!important;outline-offset:-1px}.empty-box{min-height:40px;border:1px dashed #b9bfd6;color:#8b93ab;display:grid;place-items:center;font:12px system-ui;margin:2px}';
  function draw() {
    const fr = $('#bframe'); if (!fr) return;
    const sr = fr.shadowRoot || fr.attachShadow({ mode: 'open' });
    sr.innerHTML = `<style>${FRAME_CSS}${B.preview ? '.sel,.hov,.empty-box{outline:none!important;border:0!important;color:transparent}' : ''}</style><style>${B.page.css}</style><div class="wrap">${rend(root())}</div>`;
    const w = DEV[B.dev][1], avail = ($('#bcanvas').clientWidth || 800) - 24;
    fr.style.width = w ? w + 'px' : '100%'; fr.style.zoom = ((w && w > avail ? avail / w : 1) * B.zoom / 100);
    if (!B.preview) { const el = sr.querySelector(`[data-id="${B.sel}"]`); if (el) el.classList.add('sel'); }
    sbar(); if (B.tab === 'layers') layers(); const z = $('#bz'); if (z) z.textContent = B.zoom + '%';
  }
  const shadow = () => $('#bframe').shadowRoot;
  const elOf = id => shadow() && shadow().querySelector(`[data-id="${id}"]`);

  /* floating toolbar for the selected element */
  function sbar() {
    let b = $('#sbar'); if (B.preview || !B.sel || B.sel === root().id) { if (b) b.remove(); return; }
    const el = elOf(B.sel); if (!el) { if (b) b.remove(); return; }
    if (!b) { b = document.createElement('div'); b.id = 'sbar'; b.className = 'sbar'; b.style.position = 'fixed'; document.body.appendChild(b);
      b.innerHTML = `<button data-a="drag" title="Drag to move" style="touch-action:none;cursor:grab">${SF.ic('grid', 'blue')}</button><button data-a="up" title="Move earlier">↑</button><button data-a="down" title="Move later">↓</button><button data-a="in" title="Select the box around it">⤴</button><button data-a="dup" title="Duplicate">${SF.ic('copy', 'purple')}</button><button data-a="wrap" title="Wrap in a box">${SF.ic('file', 'teal')}</button><button data-a="edit" title="Edit text">✎</button><button data-a="del" title="Delete">${SF.ic('trash', 'red')}</button>`;
      $$('svg', b).forEach(s => s.style.cssText = 'width:17px;height:17px');
      b.onclick = e => { const a = e.target.closest('button'); if (a) act(a.dataset.a); };
      b.addEventListener('pointerdown', e => { const a = e.target.closest('button'); if (a && a.dataset.a === 'drag') startDrag(e, { kind: 'move', id: B.sel, label: 'Moving' }); }); }
    const r = el.getBoundingClientRect(), cr = $('#bcanvas').getBoundingClientRect(), bw = 8 * 31 + 14;
    let x = U.clamp(r.left, cr.left + 4, Math.max(cr.left + 4, cr.right - bw)), y = r.top - 38; if (y < cr.top + 2) y = Math.min(r.bottom + 4, cr.bottom - 40); y = U.clamp(y, cr.top + 2, cr.bottom - 40);
    b.style.left = x + 'px'; b.style.top = y + 'px';
  }
  function act(a) {
    const r = find(root(), B.sel); if (!r || !r.parent) return; const { node, parent, index } = r;
    if (a === 'up') { if (index > 0) { parent.children.splice(index, 1); parent.children.splice(index - 1, 0, node); } else return U.toast('Already first'); }
    else if (a === 'down') { if (index < parent.children.length - 1) { parent.children.splice(index, 1); parent.children.splice(index + 1, 0, node); } else return U.toast('Already last'); }
    else if (a === 'in') { B.sel = parent.id; }
    else if (a === 'dup') { const c = reid(clone(node)); parent.children.splice(index + 1, 0, c); B.sel = c.id; U.toast('Duplicated'); }
    else if (a === 'wrap') { const w = N('div', { padding: '12px' }, '', [node]); parent.children.splice(index, 1, w); B.sel = w.id; U.toast('Wrapped in a box'); }
    else if (a === 'del') { parent.children.splice(index, 1); B.sel = parent.id; U.toast('Deleted'); }
    else if (a === 'edit') { editText(); return; }
    commit(); draw(); panel();
  }
  function editText() {
    const n = selNode(), el = elOf(n.id); if (!el || !LEAF.has(n.tag) || n.children.length) { U.toast('Pick a text element (heading, paragraph, button, link…) first'); return; }
    el.contentEditable = 'true'; el.focus(); const rg = document.createRange(); rg.selectNodeContents(el); const s = shadow().getSelection ? shadow().getSelection() : getSelection(); try { s.removeAllRanges(); s.addRange(rg); } catch (e) { }
    el.onblur = () => { n.text = el.textContent; el.contentEditable = 'false'; commit(); draw(); panel(); };
    el.onkeydown = e => { if (e.key === 'Escape') el.blur(); if (e.key === 'Enter' && !e.shiftKey && n.tag !== 'p') { e.preventDefault(); el.blur(); } };
  }

  /* ---------- adding things ---------- */
  function insertNode(node, target) {
    let t = target || selNode(), parent, idx;
    if (isCont(t)) { parent = t; idx = t.children.length; } else { const r = find(root(), t.id); parent = r.parent || root(); idx = r.parent ? r.index + 1 : parent.children.length; }
    parent.children.splice(idx, 0, node); B.sel = node.id; commit(); draw(); panel();
    return parent;
  }
  function addPart(make, label) { const p = insertNode(make()); U.toast(`Added ${label}${p === root() ? ' to the page' : ' inside the selected box'}`); }

  /* ---------- drag and drop (mouse and touch) ---------- */
  let drag = null, ind = null;
  function startDrag(e, payload) { if (e.button > 0) return; drag = { ...payload, sx: e.clientX, sy: e.clientY, on: 0, t: null }; document.addEventListener('pointermove', mv); document.addEventListener('pointerup', up, { once: true }); document.addEventListener('pointercancel', up, { once: true }); }
  function target(x, y) {
    const fr = $('#bframe'), sr = fr && fr.shadowRoot; if (!sr) return null;
    const lay = document.elementsFromPoint(x, y).find(e => e.classList && e.classList.contains('lay') && e.dataset.id);
    let id, rect, vertical = true;
    if (lay) { id = lay.dataset.id; rect = lay.getBoundingClientRect(); }
    else { const fe = sr.elementFromPoint(x, y); if (!fe) return null; let el = fe.closest('[data-id]'); if (!el) return { id: root().id, pos: 'inside', rect: fr.getBoundingClientRect() }; id = el.dataset.id; rect = el.getBoundingClientRect(); if (fe.dataset && fe.dataset.ph) { const pe = fe.parentElement.closest('[data-id]'); if (pe) { id = pe.dataset.id; rect = pe.getBoundingClientRect(); } } const par = el.parentElement && el.parentElement.closest && el.parentElement.closest('[data-id]'); if (par) { const cs = getComputedStyle(par); vertical = !(cs.display.includes('flex') && cs.flexDirection.startsWith('row')); } }
    const r = find(root(), id); if (!r) return null; const n = r.node;
    if (drag.kind === 'move') { const mv0 = find(root(), drag.id); if (mv0 && (find(mv0.node, id))) return null; }
    const f = vertical ? (y - rect.top) / Math.max(1, rect.height) : (x - rect.left) / Math.max(1, rect.width);
    let pos; if (isCont(n) && (n.children.length === 0 || (f > .25 && f < .75)) || n === root()) pos = 'inside'; else pos = f < .5 ? 'before' : 'after';
    if (n === root()) pos = 'inside';
    return { id, pos, rect, vertical };
  }
  function mv(e) {
    if (!drag) return;
    if (!drag.on) { if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 6) return; drag.on = 1; drag.g = document.createElement('div'); drag.g.className = 'ghost'; drag.g.textContent = drag.label; document.body.appendChild(drag.g); document.body.style.userSelect = 'none'; }
    e.preventDefault(); drag.g.style.left = e.clientX + 12 + 'px'; drag.g.style.top = e.clientY + 12 + 'px';
    const t = target(e.clientX, e.clientY); drag.t = t; if (ind) { ind.remove(); ind = null; }
    if (!t) return; ind = document.createElement('div');
    if (t.pos === 'inside') { ind.className = 'dropin'; Object.assign(ind.style, { left: t.rect.left + 'px', top: t.rect.top + 'px', width: t.rect.width + 'px', height: t.rect.height + 'px' }); }
    else { ind.className = 'dropline'; if (t.vertical) Object.assign(ind.style, { left: t.rect.left + 'px', width: t.rect.width + 'px', height: '4px', top: (t.pos === 'before' ? t.rect.top : t.rect.bottom) - 2 + 'px' }); else Object.assign(ind.style, { top: t.rect.top + 'px', height: t.rect.height + 'px', width: '4px', left: (t.pos === 'before' ? t.rect.left : t.rect.right) - 2 + 'px' }); }
    document.body.appendChild(ind);
  }
  function up() {
    document.removeEventListener('pointermove', mv); const d = drag; drag = null; if (ind) { ind.remove(); ind = null; } if (!d) return;
    document.body.style.userSelect = ''; if (d.g) d.g.remove();
    const pl = $('#bpal'); if (pl) pl.classList.remove('open');
    if (!d.on) { if (d.kind === 'new') addPart(d.make, d.label); return; }
    const t = d.t; if (!t) { U.toast('Drop it on the page or on a layer'); return; }
    const tr = find(root(), t.id); if (!tr) return;
    let node; if (d.kind === 'new') node = d.make(); else { const m = find(root(), d.id); if (!m || !m.parent) return; node = m.node; m.parent.children.splice(m.index, 1); }
    const tr2 = find(root(), t.id); if (!tr2) return;
    if (t.pos === 'inside') tr2.node.children.push(node); else { const p = tr2.parent || root(); const i = p.children.indexOf(tr2.node); p.children.splice(t.pos === 'before' ? i : i + 1, 0, node); }
    B.sel = node.id; commit(); draw(); panel(); U.toast(d.kind === 'new' ? `${d.label} placed` : 'Moved');
  }

  /* ---------- panels ---------- */
  function palette() {
    const box = $('#bpal'); box.innerHTML = '';
    const heads = SF.lib.d.items.filter(i => i.t === 'block');
    const groups = [...P, ...(heads.length ? [['My blocks', heads.map(b => [b.n, 'file', 'amber', () => reid(clone(b.tree || N('div', {}, b.n))), b])]] : [])];
    groups.forEach(([g, list]) => {
      const h = document.createElement('h3'); h.textContent = g; box.appendChild(h); const gd = document.createElement('div'); gd.className = 'pal'; box.appendChild(gd);
      list.forEach(([label, ic, hue, make]) => { const b = document.createElement('div'); b.className = 'pi'; b.innerHTML = `<b>${SF.ic(ic, hue)}</b>${esc(label)}`; $('svg', b).style.cssText = 'width:20px;height:20px'; b.addEventListener('pointerdown', e => startDrag(e, { kind: 'new', make, label })); gd.appendChild(b); });
    });
    const raw = document.createElement('button'); raw.className = 'btn'; raw.style.cssText = 'width:100%;margin-top:10px'; raw.textContent = 'Paste my own HTML…'; raw.onclick = () => U.dlg('Your own HTML', '<h3>HTML</h3><textarea id="rh" rows="8" placeholder="e.g. <div class=&quot;box&quot;>Hello</div>"></textarea><p class="hint">Dropped in as one block. Its own styles come with it.</p>', [['Cancel'], ['Add', o => { const h = $('#rh', o).value.trim(); if (!h) return false; const n = N('raw', {}); n.html = h; insertNode(n); U.toast('Added your HTML'); }, 1]]); box.appendChild(raw);
  }

  function layers() {
    const box = $('#blay'); if (!box) return; box.innerHTML = ''; const lbl = n => n.tag === 'raw' ? 'custom html' : (n.text || (n.attrs && (n.attrs.alt || n.attrs.placeholder)) || '').slice(0, 14);
    (function walk(n, d) { const r = document.createElement('div'); r.className = 'lay' + (n.id === B.sel ? ' on' : ''); r.dataset.id = n.id; r.style.paddingLeft = 4 + d * 12 + 'px'; r.innerHTML = `<span class="grab" style="touch-action:none;cursor:grab;width:16px;text-align:center;opacity:.7">⠿</span><b style="font-weight:600">${n === root() ? 'Page' : n.tag}</b><small>${esc(lbl(n))}</small>`; r.onclick = e => { if (e.target.closest('.grab')) return; B.sel = n.id; draw(); panel(); }; if (n !== root()) $('.grab', r).addEventListener('pointerdown', e => startDrag(e, { kind: 'move', id: n.id, label: n.tag })); box.appendChild(r); n.children.forEach(c => walk(c, d + 1)); })(root(), 0);
  }

  const px = v => parseInt(v, 10) || 0;
  function panel() {
    const pb = $('#bpb'); if (!pb) return; const n = selNode(), s = n.style, isRoot = n === root();
    $$('#btabs button').forEach(b => b.classList.toggle('on', b.dataset.t === B.tab));
    if (B.tab === 'layers') { pb.innerHTML = '<div id="blay" style="padding-top:6px"></div><p class="hint">Tap a layer to select it. Drag the ⠿ handle to move it.</p>'; layers(); return; }
    if (B.tab === 'page') return pagePanel(pb);
    pb.innerHTML = '';
    const head = document.createElement('div'); head.className = 'row'; head.style.margin = '8px 0 2px'; head.innerHTML = `<b style="font-size:14px" class="grow">${isRoot ? 'Whole page' : '&lt;' + n.tag + '&gt;'}</b><button class="btn sm" id="bs-lib">Use a saved style…</button>`; pb.appendChild(head); $('#bs-lib', pb).onclick = () => pickStyle();
    const seg = document.createElement('div'); seg.className = 'seg'; seg.innerHTML = `<button data-m="simple" class="${B.mode === 'simple' ? 'on' : ''}">Simple</button><button data-m="expert" class="${B.mode === 'expert' ? 'on' : ''}">Expert</button>`; seg.onclick = e => { const b = e.target.closest('button'); if (b) { B.mode = b.dataset.m; panel(); } }; pb.appendChild(seg);
    const live = () => { draw(); }, done = () => { commit(); };
    const add = el => pb.appendChild(el);
    const fld = (label, inner) => { const d = document.createElement('div'); d.className = 'fld'; d.innerHTML = `<label>${label}</label>${inner}`; add(d); return d; };
    const setS = (k, v) => { if (v === '' || v == null) delete s[k]; else s[k] = v; };
    const colour = (label, k) => { const cur = s[k] && /^#[0-9a-f]{6}$/i.test(s[k]) ? s[k] : (s[k] ? '#888888' : '#ffffff'); const d = fld(label, `<div class="cl"><input type="color" value="${cur}"><input type="text" value="${esc(s[k] || '')}" placeholder="e.g. #7c5cff or none"><button class="btn sm" title="Remove">✕</button></div>`); const c = $('input[type=color]', d), t = $('input[type=text]', d); c.oninput = () => { t.value = c.value; setS(k, c.value); live(); }; c.onchange = done; t.onchange = () => { setS(k, t.value.trim()); draw(); done(); }; $('button', d).onclick = () => { setS(k, ''); t.value = ''; draw(); done(); }; };
    const range = (label, k, min, max, unit = 'px', def = 0) => { const v = s[k] !== undefined ? px(s[k]) : def; const d = fld(`${label}<b>${s[k] !== undefined ? v + unit : 'auto'}</b>`, `<input type="range" min="${min}" max="${max}" value="${v}">`); const r = $('input', d), b = $('b', d); r.oninput = () => { setS(k, r.value + unit); b.textContent = r.value + unit; live(); }; r.onchange = done; };
    const select = (label, k, opts) => { const cur = s[k] || ''; const d = fld(label, `<select>${opts.map(([t, v]) => `<option value="${esc(v)}" ${v === cur ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`); $('select', d).onchange = e => { setS(k, e.target.value); draw(); done(); }; };
    /* content */
    if (LEAF.has(n.tag) && !n.children.length) { const d = fld('Text', `<textarea rows="3" placeholder="Type the words here">${esc(n.text)}</textarea>`); const t = $('textarea', d); t.oninput = () => { n.text = t.value; live(); }; t.onchange = done; }
    if (n.tag === 'a') { const d = fld('Link address', `<input type="text" value="${esc(n.attrs.href || '')}" placeholder="e.g. https://example.com or #contact">`); $('input', d).onchange = e => { n.attrs.href = e.target.value.trim(); draw(); done(); }; }
    if (n.tag === 'img') { const d = fld('Picture', `<input type="text" value="${/^data:/.test(n.attrs.src || '') ? '' : esc(n.attrs.src || '')}" placeholder="e.g. https://site.com/photo.jpg"><div class="row" style="margin-top:6px"><label class="btn sm grow">${SF.ic('pic', 'green')}Choose from device<input type="file" accept="image/*" hidden></label></div><input type="text" value="${esc(n.attrs.alt || '')}" placeholder="Describe the picture, e.g. a red bicycle" style="margin-top:6px">`); const [a, b] = $$('input[type=text]', d); a.onchange = () => { n.attrs.src = a.value.trim(); draw(); done(); }; b.onchange = () => { n.attrs.alt = b.value; commit(); }; $('input[type=file]', d).onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { n.attrs.src = r.result; draw(); done(); panel(); U.toast('Picture added (it is stored inside the page)'); }; r.readAsDataURL(f); }; }
    if (n.tag === 'input' || n.tag === 'button') { const d = fld('Hint text shown inside', `<input type="text" value="${esc(n.attrs.placeholder || '')}" placeholder="e.g. Type your email">`); $('input', d).onchange = e => { n.attrs.placeholder = e.target.value; draw(); done(); }; }
    /* look */
    if (n.tag !== 'raw') { colour('Text colour', 'color'); colour('Background', 'background'); }
    if (LEAF.has(n.tag) || isRoot || n.tag === 'li') { range('Text size', 'font-size', 8, 96, 'px', 16); select('Weight', 'font-weight', [['Normal', ''], ['Medium', '500'], ['Bold', '700'], ['Extra bold', '900']]); select('Align text', 'text-align', [['Default', ''], ['Left', 'left'], ['Centre', 'center'], ['Right', 'right']]); }
    range('Space inside', 'padding', 0, 120); range('Space outside', 'margin', 0, 120); range('Round corners', 'border-radius', 0, 80);
    if (isCont(n) && n.tag !== 'raw') {
      const mode = s.display === 'grid' ? 'grid' : s.display === 'flex' ? (s['flex-direction'] === 'column' ? 'col' : 'row') : 'normal';
      const d = fld('Arrange the things inside', `<select><option value="normal" ${mode === 'normal' ? 'selected' : ''}>One under another (normal)</option><option value="row" ${mode === 'row' ? 'selected' : ''}>Side by side (row)</option><option value="col" ${mode === 'col' ? 'selected' : ''}>Stacked, aligned (column)</option><option value="grid" ${mode === 'grid' ? 'selected' : ''}>Grid</option></select>`);
      $('select', d).onchange = e => { ['display', 'flex-direction', 'flex-wrap', 'grid-template-columns'].forEach(k => delete s[k]); const v = e.target.value; if (v === 'row') Object.assign(s, { display: 'flex', 'flex-wrap': 'wrap' }); if (v === 'col') Object.assign(s, { display: 'flex', 'flex-direction': 'column' }); if (v === 'grid') Object.assign(s, { display: 'grid', 'grid-template-columns': 'repeat(3, 1fr)' }); draw(); done(); panel(); };
      if (mode === 'grid') { const cols = (s['grid-template-columns'] || '').match(/repeat\((\d+)/); const c = fld(`Columns<b>${cols ? cols[1] : '?'}</b>`, `<input type="range" min="1" max="8" value="${cols ? cols[1] : 3}">`); $('input', c).oninput = e => { s['grid-template-columns'] = `repeat(${e.target.value}, 1fr)`; $('b', c).textContent = e.target.value; live(); }; $('input', c).onchange = done; }
      if (mode !== 'normal') { range('Gap between things', 'gap', 0, 80, 'px', 0); select('Line them up', 'justify-content', [['Default', ''], ['Start', 'flex-start'], ['Centre', 'center'], ['End', 'flex-end'], ['Spread out', 'space-between'], ['Even space', 'space-evenly']]); select('Cross-line them up', 'align-items', [['Default', ''], ['Start', 'flex-start'], ['Centre', 'center'], ['End', 'flex-end'], ['Stretch', 'stretch']]); }
    }
    select('Shadow', 'box-shadow', [['None', ''], ['Soft', '0 4px 14px rgba(20,24,60,.12)'], ['Medium', '0 10px 30px rgba(20,24,60,.2)'], ['Strong', '0 18px 50px rgba(20,24,60,.35)']].concat(s['box-shadow'] && !['0 4px 14px rgba(20,24,60,.12)', '0 10px 30px rgba(20,24,60,.2)', '0 18px 50px rgba(20,24,60,.35)'].includes(s['box-shadow']) ? [['Custom (' + s['box-shadow'].slice(0, 18) + '…)', s['box-shadow']]] : []));
    const sz = fld('Width and height', `<div class="row"><input type="text" value="${esc(s.width || '')}" placeholder="width, e.g. 100% or 320px"><input type="text" value="${esc(s['max-width'] || '')}" placeholder="max, e.g. 960px"></div><input type="text" value="${esc(s.height || s['min-height'] || '')}" placeholder="height, e.g. 200px" style="margin-top:6px">`); const [w, mw, h] = $$('input', sz); w.onchange = () => { setS('width', w.value.trim()); draw(); done(); }; mw.onchange = () => { setS('max-width', mw.value.trim()); draw(); done(); }; h.onchange = () => { delete s.height; setS(isCont(n) ? 'min-height' : 'height', h.value.trim()); draw(); done(); };
    if (B.mode === 'expert') expert(pb, n, done);
  }

  function expert(pb, n, done) {
    const h3 = t => { const h = document.createElement('h3'); h.textContent = t; pb.appendChild(h); };
    if (n !== root() && n.tag !== 'raw') { h3('Tag'); const sel = document.createElement('select'); sel.innerHTML = TAGS.map(t => `<option ${t === n.tag ? 'selected' : ''}>${t}</option>`).join(''); sel.onchange = () => { n.tag = sel.value; if (VOID.has(n.tag)) n.children = []; commit(); draw(); panel(); }; pb.appendChild(sel); }
    h3('Attributes'); const ab = document.createElement('div'); pb.appendChild(ab);
    const drawA = () => { ab.innerHTML = ''; Object.entries(n.attrs).forEach(([k, v]) => { const r = document.createElement('div'); r.className = 'kv'; r.innerHTML = `<input type="text" value="${esc(k)}" readonly><input type="text" value="${esc(String(v).slice(0, 200))}" placeholder="value"><button title="Remove">✕</button>`; $$('input', r)[1].onchange = e => { n.attrs[k] = e.target.value; draw(); done(); }; $('button', r).onclick = () => { delete n.attrs[k]; draw(); done(); drawA(); }; ab.appendChild(r); }); const r = document.createElement('div'); r.className = 'kv'; r.innerHTML = `<select>${ATTRS.map(a => `<option>${a}</option>`).join('')}</select><input type="text" placeholder="value, e.g. contact-form"><button class="btn sm" style="color:var(--ok)">＋</button>`; $('button', r).onclick = () => { const k = $('select', r).value, v = $('input', r).value; if (!v) return U.toast('Type a value first'); n.attrs[k] = v; draw(); done(); drawA(); }; ab.appendChild(r); }; drawA();
    h3('Styles, one by one'); const sb = document.createElement('div'); pb.appendChild(sb);
    const drawS = () => { sb.innerHTML = ''; Object.entries(n.style).forEach(([k, v]) => { const r = document.createElement('div'); r.className = 'kv'; r.innerHTML = `<input type="text" value="${esc(k)}" readonly><input type="text" value="${esc(v)}"><button title="Remove">✕</button>`; $$('input', r)[1].onchange = e => { n.style[k] = e.target.value; draw(); done(); }; $('button', r).onclick = () => { delete n.style[k]; draw(); done(); drawS(); rawBox(); }; sb.appendChild(r); }); const r = document.createElement('div'); r.className = 'kv'; r.innerHTML = `<input type="text" placeholder="e.g. opacity" list="cssp"><input type="text" placeholder="e.g. .8"><button class="btn sm" style="color:var(--ok)">＋</button>`; $('button', r).onclick = () => { const k = $('input', r).value.trim().toLowerCase(), v = $$('input', r)[1].value.trim(); if (!k || !v) return U.toast('Type both the property and its value'); n.style[k] = v; draw(); done(); drawS(); rawBox(); }; sb.appendChild(r); }; drawS();
    if (!$('#cssp')) { const dl = document.createElement('datalist'); dl.id = 'cssp'; dl.innerHTML = Object.keys(SF.cssProps).filter(k => !k.startsWith('-')).map(k => `<option>${k}`).join(''); document.body.appendChild(dl); }
    h3('All styles as CSS (edit freely)'); const ra = document.createElement('textarea'); ra.rows = 6; ra.placeholder = 'e.g. background: #fff;\nborder-radius: 12px;'; pb.appendChild(ra);
    const rawBox = () => { ra.value = Object.entries(n.style).map(([k, v]) => `${k}: ${v};`).join('\n'); }; rawBox();
    const ap = document.createElement('button'); ap.className = 'btn sm'; ap.style.marginTop = '6px'; ap.textContent = 'Apply this CSS'; ap.onclick = () => { const ns = {}; SF.cssParse(ra.value).forEach(([k, v]) => ns[k.toLowerCase()] = v); n.style = ns; commit(); draw(); panel(); U.toast('Styles replaced with what you typed'); }; pb.appendChild(ap);
    const ex = document.createElement('button'); ex.className = 'btn sm'; ex.style.cssText = 'margin:6px 0 0 6px'; ex.textContent = 'Explain'; ex.onclick = () => U.dlg('In plain English', '<ul class="exp">' + (SF.explain(ra.value).map(l => `<li>${esc(l.text)}</li>`).join('') || '<li>Nothing to explain yet</li>') + '</ul>', [['OK', null, 1]]); pb.appendChild(ex);
  }

  function pickStyle() {
    const its = SF.lib.d.items.filter(i => (i.t === 'css' && !/[{}]/.test(i.code)) || i.t === 'color');
    if (!its.length) { U.dlg('Use a saved style', '<p>Your Library has no plain styles yet. Save some from Make, or pick them in Grab.</p>', [['OK', null, 1]]); return; }
    const o = U.dlg('Use a saved style', '<h3>Tap one to apply it to the selected thing</h3><div id="ps"></div>', [['Close']]);
    its.forEach(i => { const b = document.createElement('button'); b.className = 'btn'; b.style.cssText = 'width:100%;margin:3px 0;justify-content:flex-start'; b.innerHTML = (i.t === 'color' ? `<i style="width:14px;height:14px;border-radius:4px;background:${esc(i.code)};display:inline-block"></i>` : '') + esc(i.n); b.onclick = () => { useItem(i, 1); o.remove(); }; $('#ps', o).appendChild(b); });
  }
  function useItem(it, fromPicker) {
    if (!B.page) SF.go('build');
    if (it.t === 'css' && !/[{}]/.test(it.code)) { const n = selNode(); SF.cssParse(it.code).forEach(([k, v]) => n.style[k.toLowerCase()] = v); commit(); SF.go('build'); draw(); panel(); U.toast(`"${it.n}" applied to the selected ${n === root() ? 'page' : n.tag}`); }
    else if (it.t === 'color') { SF.go('build'); const o = U.dlg('Use this colour for…', '<div id="uc"></div>', [['Cancel']]); [['Text colour', 'color'], ['Background', 'background'], ['Border colour', 'border-color']].forEach(([l, k]) => { const b = document.createElement('button'); b.className = 'btn'; b.style.cssText = 'width:100%;margin:3px 0'; b.textContent = l; b.onclick = () => { const n = selNode(); n.style[k] = it.code; if (k === 'border-color' && !n.style.border) n.style.border = '2px solid ' + it.code; commit(); draw(); panel(); o.remove(); U.toast(`${l} set on the selected ${n === root() ? 'page' : n.tag}`); }; $('#uc', o).appendChild(b); }); }
    else if (it.t === 'svg') { const n = N('raw', {}); n.html = it.code; SF.go('build'); insertNode(n); U.toast('SVG added to the page'); }
    else if (it.t === 'block') { SF.go('build'); insertNode(reid(clone(it.tree || N('div', {}, it.n)))); U.toast('Block added'); }
    else U.toast('This kind of item cannot be placed on a page');
  }
  B.useItem = useItem;
  B.insertResult = async (res, tool) => {
    if (!B.page) { SF.go('build'); }
    if (tool.kind === 'css' && res.css && !/[{}@]/.test(res.css)) { const n = selNode(); if (n !== root()) { SF.cssParse(res.css).forEach(([k, v]) => n.style[k.toLowerCase()] = v); commit(); SF.go('build'); draw(); panel(); U.toast(`${tool.name} applied to the selected ${n.tag}`); } else { const nn = N('div', { 'min-height': '140px', 'border-radius': '16px' }); SF.cssParse(res.css).forEach(([k, v]) => nn.style[k.toLowerCase()] = v); SF.go('build'); insertNode(nn); U.toast(`${tool.name} added as a new box (select a box first to apply it to that instead)`); } return; }
    if (res.draw || res.gl) { try { const b = await SF.pv.png(res, 1600, 1000); const url = await new Promise(ok => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(b); }); SF.go('build'); insertNode(N('img', { width: '100%', 'border-radius': '12px', display: 'block' }, '', [], { src: url, alt: tool.name })); U.toast('Placed as a picture (shaders and drawings cannot stay live in a page here)', 3200); } catch (e) { U.dlg('Could not place it', `<p>${esc(e.message)}</p>`, [['OK', null, 1]]); } return; }
    const n = N('raw', {}); n.html = res.svg || SF.fxid(res.html || '', 'bx' + U.uid().slice(-5)); if (res.fxsvg && !/<defs>/.test(res.html || '')) n.html += res.fxsvg; if (res.bg && !res.svg) n.style = { background: res.bg, padding: '20px', 'border-radius': '12px', display: 'flex', 'justify-content': 'center' }; SF.go('build'); insertNode(n); U.toast(`${tool.name} added to the page`);
  };

  /* ---------- Page tab (pages, blocks, AI, background) ---------- */
  function pagePanel(pb) {
    const pages = U.store.get('pages', []);
    pb.innerHTML = `<h3>This page</h3><select id="pg-s">${pages.map(p => `<option value="${p.id}" ${p.id === B.page.id ? 'selected' : ''}>${esc(p.n)}</option>`).join('')}</select><div class="row" style="flex-wrap:wrap;margin-top:6px"><button class="btn sm" id="pg-n">New</button><button class="btn sm" id="pg-r">Rename</button><button class="btn sm" id="pg-d">Copy</button><button class="btn sm dng" id="pg-x">Delete</button></div>
      <h3>Blocks</h3><button class="btn" id="pg-sb" style="width:100%">Save the selected thing as a Block…</button><p class="hint">Blocks go in your Library and show up in the left list under "My blocks".</p>
      <h3>Extra CSS for this page</h3><textarea id="pg-c" rows="6" placeholder="e.g. .sf-box:hover { opacity: .8; }">${esc(B.page.css)}</textarea><p class="hint">Applies to the whole page, e.g. keyframes from Make. Media queries show in your exported page, not in this preview.</p>
      <h3>AI</h3><button class="btn" id="pg-ai" style="width:100%">${SF.ic('ai', 'pink')}Ask AI to build a section…</button>`;
    $('#pg-s', pb).onchange = e => open(e.target.value);
    $('#pg-n', pb).onclick = () => U.dlg('New page', '<h3>Name</h3><input type="text" id="nn" placeholder="e.g. Landing page">', [['Cancel'], ['Create', o => { const n = $('#nn', o).value.trim(); if (!n) { U.toast('Type a name first'); return false; } const p = newPage(n); const a = U.store.get('pages', []); a.push(p); U.store.set('pages', a); open(p.id); }, 1]]);
    $('#pg-r', pb).onclick = () => U.dlg('Rename page', `<h3>Name</h3><input type="text" id="nn" value="${esc(B.page.n)}" placeholder="e.g. Landing page">`, [['Cancel'], ['Rename', o => { const n = $('#nn', o).value.trim(); if (!n) return false; B.page.n = n; save(); panel(); }, 1]]);
    $('#pg-d', pb).onclick = () => { const p = clone(B.page); p.id = U.uid(); p.n += ' copy'; reid(p.tree); const a = U.store.get('pages', []); a.push(p); U.store.set('pages', a); open(p.id); U.toast('Copied to "' + p.n + '"'); };
    $('#pg-x', pb).onclick = () => U.dlg('Delete page?', `<p>"${esc(B.page.n)}" will be deleted from this device.</p>`, [['Cancel'], ['Delete', () => { let a = U.store.get('pages', []).filter(p => p.id !== B.page.id); if (!a.length) a = [newPage('My page')]; U.store.set('pages', a); open(a[0].id); U.toast('Page deleted'); }, 1]]);
    $('#pg-c', pb).onchange = e => { B.page.css = e.target.value; commit(); draw(); };
    $('#pg-sb', pb).onclick = () => { const n = selNode(); if (n === root()) { U.toast('Select something on the page first'); return; } const o = U.dlg('Save as Block', `<h3>Name</h3><input type="text" id="bn" placeholder="e.g. Pricing card" value="${esc(n.tag)}"><h3>Heading</h3><select id="bh">${SF.lib.d.heads.map(h => `<option value="${h.id}">${esc(h.n)}</option>`).join('')}</select>`, [['Cancel'], ['Save', o => { const html = gen([n], 'inline').html; SF.lib.add({ n: $('#bn', o).value.trim() || 'Block', t: 'block', head: $('#bh', o).value, code: html, html, tree: clone(n), bg: '#fff' }); palette(); U.toast('Block saved to the Library'); }, 1]]); };
    $('#pg-ai', pb).onclick = aiDlg;
  }
  const OKT = new Set(TAGS);
  function clean(o, depth = 0) {
    if (!o || typeof o !== 'object' || depth > 8) return null; const tag = String(o.tag || 'div').toLowerCase(); if (!OKT.has(tag)) return null;
    const n = N(tag, {}, typeof o.text === 'string' ? o.text.slice(0, 600) : '', [], {});
    if (o.style && typeof o.style === 'object') Object.entries(o.style).slice(0, 40).forEach(([k, v]) => { k = String(k).toLowerCase(); v = String(v); if (/^[a-z-]+$/.test(k) && v.length < 200 && !/expression|javascript:|url\(\s*["']?\s*javascript/i.test(v)) n.style[k] = v; });
    if (o.attrs && typeof o.attrs === 'object') Object.entries(o.attrs).forEach(([k, v]) => { v = String(v); if (['href', 'src', 'alt', 'placeholder', 'type', 'title'].includes(k) && !/^\s*javascript:/i.test(v) && v.length < 2000) n.attrs[k] = v; });
    if (!VOID.has(tag)) (Array.isArray(o.children) ? o.children : []).slice(0, 40).forEach(c => { const x = clean(c, depth + 1); if (x) n.children.push(x); });
    return n;
  }
  function count(n) { return 1 + n.children.reduce((a, c) => a + count(c), 0); }
  function aiDlg() {
    if (!SF.ai.ready()) { U.dlg('Ask AI', '<p>The AI helper is optional and needs your own key. Nothing is sent until you press Ask.</p>', [['Cancel'], ['Open settings', () => SF.settings(), 1]]); return; }
    U.dlg('Ask AI to build a section', '<h3>Describe it</h3><textarea id="aw" rows="3" placeholder=\'e.g. "a pricing section with three plans"\'></textarea><p class="hint">Only your description is sent. The new section is added inside the selected box, and you can undo it.</p>', [['Cancel'], ['Ask', async o => {
      const w = $('#aw', o).value.trim(); if (!w) { U.toast('Describe what you want first'); return false; } U.toast('Asking the AI…', 1500);
      try { const t = await SF.ai.call(`You build web page sections as JSON. Reply with ONLY JSON: {"nodes":[{"tag":"section","text":"","style":{"padding":"40px"},"attrs":{},"children":[]}]}. Allowed tags: ${TAGS.join(', ')}. style is CSS properties in kebab-case with string values (flex/grid allowed, no scripts, no external urls). Text goes in "text" of leaf tags only. Keep it tidy and modern.`, w); const j = SF.ai.json(t), list = (j.nodes || []).map(x => clean(x)).filter(Boolean); if (!list.length) throw new Error('The AI did not give me anything I could place.'); let c = 0; list.forEach(x => { c += count(x); insertNode(x); }); U.dlg('The AI added', `<p>${list.length} section${list.length === 1 ? '' : 's'} with ${c} elements in total. Things it asked for that are not allowed (scripts, odd tags) were dropped.</p><p class="hint">Not right? Press Undo.</p>`, [['OK', null, 1]]); } catch (e) { U.dlg('The AI did not work', `<p>${esc(e.message)}</p>`, [['OK', null, 1]]); }
    }, 1]]);
  }

  /* ---------- export ---------- */
  /* mode: 'class' (CSS classes), 'inline', 'tw' (Tailwind arbitrary classes). Returns {html, css}. */
  function gen(nodes, mode) {
    let k = 0; const css = [];
    const g = (n, ind) => {
      const pad = '  '.repeat(ind); let cls = (n.attrs && n.attrs.class) ? [n.attrs.class] : [], style = '';
      const decl = Object.entries(n.style);
      if (decl.length) {
        if (mode === 'class') { const c = 'sf-' + (++k); cls.push(c); css.push(`.${c} {\n${decl.map(([a, b]) => `  ${a}: ${b};`).join('\n')}\n}`); }
        else if (mode === 'tw') cls.push(SF.tw(decl.map(([a, b]) => `${a}: ${b}`).join(';')) || '');
        else style = ` style="${esc(dec(n.style))}"`;
      }
      const at = Object.entries(n.attrs || {}).filter(([a, v]) => a !== 'class' && ATTRS.includes(a) && v !== '').map(([a, v]) => ` ${a}="${esc(v)}"`).join('');
      const cl = cls.filter(Boolean).length ? ` class="${esc(cls.filter(Boolean).join(' '))}"` : '';
      if (n.tag === 'raw') return pad + `<div${cl}${style}>\n${pad}  ${n.html}\n${pad}</div>`;
      if (VOID.has(n.tag)) return `${pad}<${n.tag}${cl}${style}${at}>`;
      if (!n.children.length) return `${pad}<${n.tag}${cl}${style}${at}>${esc(n.text)}</${n.tag}>`;
      return `${pad}<${n.tag}${cl}${style}${at}>\n${n.children.map(c => g(c, ind + 1)).join('\n')}\n${pad}</${n.tag}>`;
    };
    return { html: nodes.map(n => g(n, 0)).join('\n'), css: css.join('\n\n') };
  }
  const RESET = '*, *::before, *::after { box-sizing: border-box; }\nbody { margin: 0; }\nimg { max-width: 100%; }';
  function pageDoc(mode) {
    const g = gen([root()], mode), extra = B.page.css ? '\n\n/* extra */\n' + B.page.css : '';
    const css = mode === 'class' ? RESET + '\n\n' + g.css + extra : RESET + extra;
    return { html: g.html, css, doc: `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>${esc(B.page.n)}</title>\n<style>\n${css}\n</style>\n</head>\n<body>\n${g.html}\n</body>\n</html>\n` };
  }
  function exportDlg() {
    const fn = B.page.n.replace(/[^\w.-]+/g, '-').toLowerCase() || 'page';
    const o = U.dlg('Export this page', `<h3>Complete page</h3><div id="e1"></div><h3>Separate HTML and CSS</h3><div id="e2"></div><h3>Tailwind</h3><div id="e3"></div><p class="hint">Tailwind output uses one-off "arbitrary property" classes like [color:#fff]. They work in Tailwind 3 and newer, which must already be set up in your project (nothing is linked from here).</p>`, [['Close']]);
    const mk = (id, label, f) => { const b = document.createElement('button'); b.className = 'btn'; b.style.cssText = 'width:100%;margin:3px 0'; b.textContent = label; b.onclick = async () => { try { U.toast(await f()); } catch (e) { U.toast('Failed: ' + e.message); } }; $(id, o).appendChild(b); };
    mk('#e1', 'Download page (.html)', () => { U.download(fn + '.html', pageDoc('class').doc, 'text/html'); return fn + '.html saved'; });
    mk('#e1', 'Copy whole page', async () => await U.copy(pageDoc('class').doc) ? 'Page copied' : 'Could not copy');
    mk('#e1', 'Download with styles inside each tag', () => { U.download(fn + '-inline.html', pageDoc('inline').doc, 'text/html'); return fn + '-inline.html saved'; });
    mk('#e2', 'Copy HTML', async () => await U.copy(pageDoc('class').html) ? 'HTML copied' : 'Could not copy');
    mk('#e2', 'Copy CSS', async () => await U.copy(pageDoc('class').css) ? 'CSS copied' : 'Could not copy');
    mk('#e2', 'Download .html and .css', () => { const d = pageDoc('class'); U.download(fn + '.css', d.css, 'text/css'); setTimeout(() => U.download(fn + '-body.html', `<link rel="stylesheet" href="${fn}.css">\n${d.html}`, 'text/html'), 300); return 'Two files saved to Downloads'; });
    mk('#e3', 'Copy Tailwind HTML', async () => await U.copy(pageDoc('tw').html) ? 'Tailwind HTML copied' : 'Could not copy');
  }

  /* ---------- screen ---------- */
  SF.screens.build = {
    init() {
      let pages = U.store.get('pages', []); if (!pages.length) { const p = newPage('My page'); const h = N('section', { padding: '64px 24px', 'text-align': 'center', background: 'linear-gradient(160deg,#1b1340,#7c5cff 60%,#ff9ac1)', color: '#fff' }, '', [N('h1', { margin: '0 0 10px', 'font-size': '40px' }, 'Welcome to your page'), N('p', { margin: '0', opacity: '.9' }, 'Pick parts on the left, or tap a part to add it. Tap anything here to change it.')]); p.tree.children.push(h); pages = [p]; U.store.set('pages', pages); }
      B.page = pages.find(p => p.id === U.store.get('page', '')) || pages[0]; B.sel = root().id; B.hist = [snap()]; B.hi = 0;
      $('#s-build').innerHTML = `<div class="bhead"><button class="btn sm railbtn" id="bb-parts">${SF.ic('grid', 'blue')}Parts</button>
        <div class="seg" style="margin:0;width:auto" id="bdev">${DEV.map((d, i) => `<button data-i="${i}" class="${i === B.dev ? 'on' : ''}" style="padding:4px 9px">${d[0]}</button>`).join('')}</div>
        <button class="btn sm" id="bb-zo">−</button><b id="bz" style="min-width:36px;text-align:center">100%</b><button class="btn sm" id="bb-zi">+</button>
        <button class="btn sm" id="bb-un">${SF.ic('undo', 'blue')}</button><button class="btn sm" id="bb-re">${SF.ic('redo', 'blue')}</button>
        <button class="btn sm" id="bb-pv">${SF.ic('eye', 'teal')}Preview</button><button class="btn sm pri" id="bb-ex">${SF.ic('out', 'pink')}Export</button><span class="hint" id="bst"></span></div>
        <div class="bbody"><aside class="bpal" id="bpal"></aside><div class="bcanvas" id="bcanvas"><div class="frame" id="bframe"></div></div>
        <aside class="bright" id="bright"><div class="ph" id="bph" style="padding:8px 10px 0"><i class="grip"></i><div class="seg grow" id="btabs" style="margin:0"><button data-t="style">Style</button><button data-t="layers">Layers</button><button data-t="page">Page</button></div></div><div class="pb" id="bpb"></div></aside></div>`;
      $('#bb-parts').onclick = () => $('#bpal').classList.toggle('open');
      $('#bdev').onclick = e => { const b = e.target.closest('button'); if (!b) return; B.dev = +b.dataset.i; $$('#bdev button').forEach(x => x.classList.toggle('on', x === b)); draw(); };
      $('#bb-zo').onclick = () => { B.zoom = Math.max(40, B.zoom - 10); draw(); }; $('#bb-zi').onclick = () => { B.zoom = Math.min(160, B.zoom + 10); draw(); };
      $('#bb-un').onclick = () => { if (B.hi > 0) { B.hi--; restore(); U.toast('Undone'); } else U.toast('Nothing to undo'); };
      $('#bb-re').onclick = () => { if (B.hi < B.hist.length - 1) { B.hi++; restore(); U.toast('Redone'); } else U.toast('Nothing to redo'); };
      $('#bb-pv').onclick = () => { B.preview = B.preview ? 0 : 1; $('#bb-pv').lastChild.textContent = B.preview ? 'Edit' : 'Preview'; $('#bpal').style.display = $('#bright').style.display = B.preview ? 'none' : ''; draw(); };
      $('#bb-ex').onclick = exportDlg;
      $('#btabs').onclick = e => { const b = e.target.closest('button'); if (b) { B.tab = b.dataset.t; panel(); $('#bright').classList.add('open'); } };
      $('#bph').onclick = e => { if (!e.target.closest('button') && matchMedia('(max-width:760px)').matches) $('#bright').classList.toggle('open'); };
      const cv = $('#bcanvas'), fr = $('#bframe'); draw();
      const sr = fr.shadowRoot;
      sr.addEventListener('click', e => { if (B.preview) return; const el = e.target.closest && e.target.closest('[data-id]'); B.sel = el ? el.dataset.id : root().id; e.preventDefault(); draw(); panel(); $('#bpal').classList.remove('open'); });
      sr.addEventListener('dblclick', e => { if (!B.preview) editText(); });
      sr.addEventListener('pointerover', e => { if (B.preview || e.pointerType === 'touch') return; sr.querySelectorAll('.hov').forEach(x => x.classList.remove('hov')); const el = e.target.closest && e.target.closest('[data-id]'); if (el && el.dataset.id !== B.sel) el.classList.add('hov'); });
      cv.addEventListener('scroll', sbar); window.addEventListener('resize', () => { if (SF.screen === 'build') draw(); });
      cv.addEventListener('click', e => { if (e.target === cv) { B.sel = root().id; draw(); panel(); } });
      palette(); panel(); SF.lib.on(() => { if (SF.screen === 'build') palette(); });
      document.addEventListener('keydown', e => { if (SF.screen !== 'build' || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable) return; if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); $('#bb-un').click(); } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); $('#bb-re').click(); } else if (e.key === 'Delete' || e.key === 'Backspace') { act('del'); } });
    },
    show() { if (B.page) { draw(); palette(); } else return; }
  };
  function open(id) { const p = U.store.get('pages', []).find(x => x.id === id); if (!p) return; B.page = p; U.store.set('page', id); B.sel = root().id; B.hist = [snap()]; B.hi = 0; draw(); panel(); }
  B.draw = draw;
  document.addEventListener('pointerdown', e => { const b = $('#sbar'); if (b && SF.screen !== 'build') b.remove(); });
  const origGo = SF.go; SF.go = n => { if (n !== 'build') { const b = $('#sbar'); if (b) b.remove(); } origGo(n); };
})();
