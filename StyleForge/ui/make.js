/*
 * StyleForge (working name) — ui/make.js : the Make screen (tool rail, live preview, plain-English settings panel)
 * Copyright (C) 2026 Zarir Madon — GNU GPL v3 or later (see LICENSE)
 */
(function () {
  const U = SF.u, { $, $$, esc } = U;
  const M = SF.make = { tool: null, vals: {}, mode: 'simple', hist: [], hi: -1, res: null, cat: 'All', q: '' };

  M.init = () => {
    const root = $('#s-make');
    root.innerHTML = `
    <aside class="rail" id="rail">
      <div class="rh"><input type="search" id="tq" placeholder="Search tools, e.g. shadow, wave, glass" aria-label="Search tools"><select id="tc" aria-label="Category"></select></div>
      <div class="rtools" id="rtools"></div>
    </aside>
    <div class="center">
      <div class="stage" id="stage"><div class="pv" id="pv"></div></div>
      <div class="bar" id="bar">
        <button class="btn railbtn" id="b-tools">${SF.ic('grid', 'blue')}Tools</button>
        <button class="btn" id="b-dice" title="Surprise me: shuffle every setting">${SF.ic('dice', 'amber')}Surprise me</button>
        <button class="btn" id="b-undo" title="Undo">${SF.ic('undo', 'blue')}</button>
        <button class="btn" id="b-redo" title="Redo">${SF.ic('redo', 'blue')}</button>
        <span class="sp"></span>
        <button class="btn pri" id="b-save">${SF.ic('save', 'pink')}Save to Library</button>
        <button class="btn" id="b-copy">${SF.ic('copy', 'purple')}Copy code</button>
        <button class="btn" id="b-tw">${SF.ic('copy', 'teal')}Copy Tailwind</button>
        <button class="btn" id="b-as">${SF.ic('copy', 'amber')}Copy as…</button>
        <button class="btn" id="b-exp">${SF.ic('out', 'green')}Export…</button>
        <button class="btn" id="b-ai">${SF.ic('ai', 'pink')}Ask AI</button>
        <button class="btn" id="b-bld">${SF.ic('build', 'purple')}Use in Builder</button>
      </div>
    </div>
    <aside class="panel" id="panel">
      <div class="ph" id="ph"><i class="grip"></i><b id="ptitle">Tool</b><button class="btn sm" id="p-learn">What is this?</button></div>
      <div class="pb" id="pb"></div>
    </aside>`;
    const sel = $('#tc'); sel.innerHTML = '<option>All</option>' + SF.cats.map(c => `<option>${esc(c)}</option>`).join('');
    sel.onchange = () => { M.cat = sel.value; M.rail(); };
    $('#tq').oninput = e => { M.q = e.target.value.trim().toLowerCase(); M.rail(); };
    $('#b-tools').onclick = () => $('#rail').classList.toggle('open');
    $('#stage').addEventListener('pointerdown', () => { $('#panel').classList.remove('open'); $('#rail').classList.remove('open'); });
    $('#ph').onclick = e => { if (e.target.closest('#p-learn')) return; if (matchMedia('(max-width:760px)').matches) $('#panel').classList.toggle('open'); };
    $('#p-learn').onclick = () => { const l = $('.learn'); if (l) l.style.display = l.style.display === 'none' ? '' : 'none'; };
    $('#b-dice').onclick = M.dice; $('#b-undo').onclick = M.undo; $('#b-redo').onclick = M.redo;
    $('#b-save').onclick = M.saveDlg; $('#b-copy').onclick = M.copyCode; $('#b-tw').onclick = M.copyTw; $('#b-as').onclick = M.copyAs; $('#b-exp').onclick = M.exportDlg; $('#b-ai').onclick = M.aiDlg; $('#b-bld').onclick = M.toBuilder;
    document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && SF.screen === 'make' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { if (e.key === 'z') { e.preventDefault(); M.undo(); } if (e.key === 'y') { e.preventDefault(); M.redo(); } } });
    M.rail();
    M.select(U.store.get('last', 'gradient') && SF.get(U.store.get('last', 'gradient')) ? U.store.get('last', 'gradient') : SF.tools[0].id);
  };

  M.rail = () => {
    const box = $('#rtools'); box.innerHTML = '';
    const match = t => (M.cat === 'All' || t.cat === M.cat) && (!M.q || (t.name + ' ' + t.cat + ' ' + (t.learn || '')).toLowerCase().includes(M.q));
    let any = 0;
    SF.cats.forEach(c => {
      const ts = SF.tools.filter(t => t.cat === c && match(t)); if (!ts.length) return; any += ts.length;
      const h = document.createElement('div'); h.className = 'cat'; h.innerHTML = SF.catIcon(c) + esc(c) + ` <span class="mu">${ts.length}</span>`; box.appendChild(h);
      ts.forEach(t => {
        const b = document.createElement('button'); b.className = 'tcard' + (M.tool && M.tool.id === t.id ? ' on' : ''); b.dataset.id = t.id; b.innerHTML = `<div class="th"></div><span>${esc(t.name)}</span>`;
        b.onclick = () => { M.select(t.id); $('#rail').classList.remove('open'); };
        box.appendChild(b); SF.pv.toolThumb(b.firstChild, t);
      });
    });
    if (!any) box.innerHTML = '<div class="empty" style="grid-column:1/-1"><b>Nothing matches</b>Try a shorter word, like "glow" or "wave".</div>';
  };

  M.select = (id, vals) => {
    const t = SF.get(id); if (!t) return;
    M.tool = t; M.vals = Object.assign(SF.defaults(t), vals || {}); M.hist = [JSON.stringify(M.vals)]; M.hi = 0; U.store.set('last', id);
    $$('.tcard').forEach(b => b.classList.toggle('on', b.dataset.id === id));
    M.panel(); M.render();
  };
  M.open = (id, vals) => { SF.go('make'); M.cat = 'All'; M.select(id, vals); };

  function field(p) {
    const v = M.vals[p.k], d = document.createElement('div');
    if (p.t === 'b') { d.className = 'tg'; d.innerHTML = `<span>${esc(p.l)}</span><input type="checkbox" ${v ? 'checked' : ''}>`; const i = $('input', d); i.onchange = () => { M.vals[p.k] = i.checked ? 1 : 0; M.commit(); }; return d; }
    d.className = 'fld';
    if (p.t === 'c') { d.innerHTML = `<label>${esc(p.l)}</label><div class="cl"><input type="color" value="${v}"><input type="text" value="${v}" maxlength="7" placeholder="#7c5cff"></div>`; const c = $('input[type=color]', d), t = $('input[type=text]', d); c.oninput = () => { t.value = c.value; M.vals[p.k] = c.value; M.live(); }; c.onchange = M.commit; t.onchange = () => { let x = t.value.trim(); if (/^#?[0-9a-f]{6}$/i.test(x)) { if (x[0] !== '#') x = '#' + x; M.vals[p.k] = x.toLowerCase(); c.value = x; M.commit(); } else { U.toast('Colours look like #7c5cff'); t.value = M.vals[p.k]; } }; return d; }
    if (p.t === 's') { d.innerHTML = `<label>${esc(p.l)}</label><select>${p.o.map(o => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`; $('select', d).onchange = e => { M.vals[p.k] = e.target.value; M.commit(); }; return d; }
    if (p.t === 'x') { d.innerHTML = `<label>${esc(p.l)}</label><textarea rows="${p.rows || 3}" placeholder="Type or paste here">${esc(v)}</textarea>`; const t = $('textarea', d); t.oninput = () => { M.vals[p.k] = t.value; M.live(); }; t.onchange = M.commit; return d; }
    d.innerHTML = `<label>${esc(p.l)}<b>${v}${p.u || ''}</b></label><input type="range" min="${p.min}" max="${p.max}" step="${p.step || 1}" value="${v}">`;
    const r = $('input', d), b = $('b', d); r.oninput = () => { M.vals[p.k] = +r.value; b.textContent = r.value + (p.u || ''); M.live(); }; r.onchange = M.commit; return d;
  }

  M.panel = () => {
    const t = M.tool, pb = $('#pb'); $('#ptitle').textContent = t.name; pb.innerHTML = '';
    const seg = document.createElement('div'); seg.className = 'seg'; seg.innerHTML = `<button data-m="simple" class="${M.mode === 'simple' ? 'on' : ''}">Simple</button><button data-m="expert" class="${M.mode === 'expert' ? 'on' : ''}">Expert</button>`;
    seg.onclick = e => { const b = e.target.closest('button'); if (!b) return; M.mode = b.dataset.m; M.panel(); M.render(); }; pb.appendChild(seg);
    const l = document.createElement('div'); l.className = 'learn'; l.textContent = t.learn || ''; pb.appendChild(l);
    if (t.presets && t.presets.length) { const pr = document.createElement('div'); pr.className = 'presets'; t.presets.forEach(p => { const b = document.createElement('button'); b.className = 'chip'; b.textContent = p.n; b.onclick = () => { Object.assign(M.vals, p.v); M.commit(); M.panel(); }; pr.appendChild(b); }); pb.appendChild(pr); }
    if (t.usesImage) { const d = document.createElement('div'); d.className = 'row'; d.style.margin = '6px 0'; d.innerHTML = `<label class="btn sm grow">${SF.ic('pic', 'green')}Try on my picture<input type="file" accept="image/*" hidden></label><button class="btn sm">Sample</button>`; $('input', d).onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { SF.userImg = r.result; U.toast('Using your picture (it stays on this device)'); M.render(); SF.make.rail(); }; r.readAsDataURL(f); }; $('button', d).onclick = () => { SF.userImg = null; U.toast('Back to the sample picture'); M.render(); }; pb.appendChild(d); }
    const ps = t.p.filter(p => M.mode === 'expert' || !p.adv);
    ps.forEach(p => pb.appendChild(field(p)));
    if (M.mode === 'simple' && t.p.some(p => p.adv)) { const h = document.createElement('div'); h.className = 'hint'; h.style.marginTop = '8px'; h.textContent = `${t.p.filter(p => p.adv).length} more fine-tuning settings are in the Expert tab.`; pb.appendChild(h); }
    if (M.mode === 'expert') { const x = document.createElement('div'); x.id = 'xp'; pb.appendChild(x); }
  };

  /* live = fast preview while dragging; commit = also remember for undo */
  let raf = 0;
  M.live = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; M.render(); }); };
  M.commit = () => { const s = JSON.stringify(M.vals); if (s !== M.hist[M.hi]) { M.hist = M.hist.slice(0, M.hi + 1); M.hist.push(s); if (M.hist.length > 80) M.hist.shift(); M.hi = M.hist.length - 1; } M.render(); };
  M.undo = () => { if (M.hi > 0) { M.hi--; M.vals = JSON.parse(M.hist[M.hi]); M.panel(); M.render(); U.toast('Undone'); } else U.toast('Nothing to undo'); };
  M.redo = () => { if (M.hi < M.hist.length - 1) { M.hi++; M.vals = JSON.parse(M.hist[M.hi]); M.panel(); M.render(); U.toast('Redone'); } else U.toast('Nothing to redo'); };

  M.render = () => {
    const t = M.tool; if (!t) return;
    let res; try { res = t.r(M.vals); M.res = res; M.err = null; } catch (e) { M.err = e; $('#pv').innerHTML = ''; const pv = $('#pv'); pv.style.cssText = 'display:grid;place-items:center;color:#ff8fa3;padding:16px;text-align:center'; pv.textContent = 'This combination could not be drawn: ' + e.message; return; }
    const pv = $('#pv'); pv.style.cssText = ''; SF.pv.mount(pv, res, { zoom: t.zoom });
    const x = $('#xp'); if (x) {
      const code = res.code || res.css || res.svg || res.js || '', cssish = res.css || (res.code && !res.js && !/^</.test(res.code) ? res.code : '');
      let ex = ''; if (cssish) { const ls = SF.explain(cssish); if (ls.length) ex = '<h3>In plain English</h3><ul class="exp">' + ls.slice(0, 40).map(l => `<li>${esc(l.text)}</li>`).join('') + '</ul>'; }
      x.innerHTML = ex + `<h3>Code</h3><div class="code">${esc(code)}</div>`;
    }
  };

  M.dice = () => {
    const t = M.tool, h = Math.random() * 360, v = {};
    let ci = 0;
    t.p.forEach(p => {
      if (p.t === 'x') return;
      if (p.t === 'c') { const dark = /^bg|back|sky|track|dark|paper/i.test(p.k) && /Background|Band|Sky|Track|Dark/i.test(p.l); v[p.k] = dark ? U.hsl2hex(h + 200, 30 + Math.random() * 30, 8 + Math.random() * 10) : U.hsl2hex(h + (ci++) * (30 + Math.random() * 50), 55 + Math.random() * 30, 45 + Math.random() * 22); }
      else if (p.t === 's') v[p.k] = p.o[Math.floor(Math.random() * p.o.length)];
      else if (p.t === 'b') v[p.k] = p.adv ? M.vals[p.k] : (Math.random() > .4 ? 1 : 0);
      else { const st = p.step || 1, n = Math.round((p.max - p.min) / st); v[p.k] = +(p.min + Math.round(Math.random() * n) * st).toFixed(4); }
    });
    Object.assign(M.vals, v); M.commit(); M.panel(); U.toast('Shuffled — keep pressing for more ideas');
  };

  /* ---- actions ---- */
  const codeOf = () => { const r = M.res; return r ? (r.code || r.css || r.svg || r.js || '') : ''; };
  M.copyCode = async () => { const c = codeOf(); U.toast(c && await U.copy(c) ? 'Code copied' : 'Could not copy. Your browser blocked the clipboard.'); };
  M.copyTw = async () => { const r = M.res, css = r && r.css; const tw = css && SF.tw(css); if (!tw) { U.toast('This one needs real CSS rules (not just properties), so there is no Tailwind class form. Use "Copy code".', 3400); return; } U.toast(await U.copy(tw) ? 'Tailwind classes copied' : 'Could not copy'); };
  M.copyAs = () => {
    const r = M.res, css = r.css || '', rows = [['CSS', codeOf()], ['Tailwind classes', css && SF.tw(css)], ['SCSS', css && SF.scss(css)], ['React style object', css && SF.jsStyle(css)], ['HTML snippet', r.html && !r.draw && !r.gl && SF.fxid(r.html, 'sf-fx-' + M.tool.id)], ['SVG', r.svg]].filter(x => x[1]);
    const o = U.dlg('Copy as…', '<h3>Choose a format</h3><div id="ca"></div><p class="hint">Formats that cannot represent this effect are left out.</p>', [['Close']]);
    rows.forEach(([n, c]) => { const b = document.createElement('button'); b.className = 'btn'; b.style.cssText = 'width:100%;margin:3px 0'; b.textContent = n; b.onclick = async () => { U.toast(await U.copy(c) ? n + ' copied' : 'Could not copy'); o.remove(); }; $('#ca', o).appendChild(b); });
  };
  M.exportDlg = () => {
    const r = M.res, name = M.tool.id, svg = SF.pv.svgFile(r);
    const items = [
      ['PNG picture (1600×1000)', async () => { const b = await SF.pv.png(r); U.download(name + '.png', b); return name + '.png saved'; }],
      svg && ['SVG file' + (r.svg ? '' : ' (preview drawn inside an SVG)'), () => { U.download(name + '.svg', svg, 'image/svg+xml'); return name + '.svg saved'; }],
      ['Web page (.html) — open it in any browser', () => { U.download(name + '.html', pageOf(r), 'text/html'); return name + '.html saved'; }],
      ['Code file', () => { const c = codeOf(); const ext = r.js || r.gl ? 'js.txt' : r.svg ? 'svg' : /@keyframes|\{/.test(c) ? 'css' : 'css'; U.download(name + '.' + ext, c); return name + '.' + ext + ' saved'; }]
    ].filter(Boolean);
    const o = U.dlg('Export', '<h3>Save a file</h3><div id="ex"></div><p class="hint">Files go to your normal Downloads place.</p>', [['Close']]);
    items.forEach(([n, f]) => { const b = document.createElement('button'); b.className = 'btn'; b.style.cssText = 'width:100%;margin:3px 0'; b.textContent = n; b.onclick = async () => { try { U.toast(await f()); } catch (e) { U.dlg('That did not work', `<p>${esc(e.message)}</p>`, [['OK', null, 1]]); } o.remove(); }; $('#ex', o).appendChild(b); });
  };
  function pageOf(r) {
    if (r.gl || r.js) return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(M.tool.name)}</title><body style="margin:0;background:${r.bg || '#000'}">${r.gl ? SF.gl.standalone(r.gl) : '<canvas width="1200" height="750" style="width:100%"></canvas><script>' + r.js + '<\/script>'}</body>`;
    return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(M.tool.name)}</title><style>html,body{margin:0;height:100%}body{display:flex;align-items:center;justify-content:center;background:${r.bg || '#0f1320'}}.fill{width:80%;height:78%;max-width:620px;border-radius:18px;position:relative}</style>${SF.fxid(r.html || '', 'sf-fx-1')}${r.fxsvg && !/<defs>/.test(r.html || '') ? SF.fxid(r.fxsvg, 'sf-fx-1') : ''}`;
  }
  M.typeOf = () => { const k = M.tool.kind; return k === 'svg' ? 'svg' : (k === 'canvas' || k === 'gl') ? 'js' : 'css'; };
  M.saveDlg = () => {
    const heads = SF.lib.d.heads;
    const o = U.dlg('Save to Library', `<h3>Name</h3><input type="text" id="sn" placeholder="e.g. Soft card shadow" value="${esc(M.tool.name)}"><h3>Heading</h3><select id="sh">${heads.map(h => `<option value="${h.id}">${esc(h.n)}</option>`).join('')}<option value="__new">＋ New heading…</option></select><input type="text" id="snh" placeholder="e.g. Buttons I like" style="display:none;margin-top:6px">`, [['Cancel'], ['Save', o => {
      let hid = $('#sh', o).value; const nm = $('#sn', o).value.trim() || M.tool.name;
      if (hid === '__new') { const n = $('#snh', o).value.trim(); if (!n) { U.toast('Type a name for the new heading'); return false; } hid = SF.lib.addHead(n).id; }
      const r = M.res, it = SF.lib.add({ n: nm, t: M.typeOf(), head: hid, code: codeOf(), tool: M.tool.id, vals: Object.assign({}, M.vals), html: (M.typeOf() === 'css' && r.html && r.html.length < 6000) ? r.html : undefined, bg: r.bg });
      U.toast('Saved to "' + SF.lib.head(it.head).n + '"');
    }, 1]]);
    $('#sh', o).onchange = e => { $('#snh', o).style.display = e.target.value === '__new' ? '' : 'none'; };
  };
  M.aiDlg = () => {
    if (!SF.ai.ready()) { U.dlg('Ask AI', '<p>The AI helper is optional and needs your own key (Gemini or Claude). Nothing is sent anywhere until you press <b>Ask</b>.</p>', [['Cancel'], ['Open settings', () => { SF.settings(); }, 1]]); return; }
    U.dlg('Ask AI', `<h3>What should change?</h3><textarea id="aw" rows="3" placeholder='e.g. "make it warmer and softer"'></textarea><p class="hint">Only the settings of this tool are sent, never your library.</p>`, [['Cancel'], ['Ask', async o => {
      const w = $('#aw', o).value.trim(); if (!w) { U.toast('Type what you would like changed'); return false; }
      U.toast('Asking the AI…', 1500);
      try { const r = await SF.ai.tweak(M.tool, M.vals, w); M.vals = r.vals; M.commit(); M.panel(); U.dlg('The AI changed these settings', r.changes.length ? '<ul class="exp">' + r.changes.map(c => `<li>${esc(c)}</li>`).join('') + '</ul><p class="hint">Not what you wanted? Press Undo.</p>' : '<p>The AI did not change anything.</p>' + (r.skipped.length ? `<p class="hint">It suggested values I could not use for: ${esc(r.skipped.join(', '))}.</p>` : ''), [['OK', null, 1]]); }
      catch (e) { U.dlg('The AI did not work', `<p>${esc(e.message)}</p>`, [['OK', null, 1]]); }
    }, 1]]);
  };
  M.toBuilder = () => { if (!SF.builder) return; SF.builder.insertResult(M.res, M.tool); };
})();
