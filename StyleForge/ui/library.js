/*
 * StyleForge (working name) — ui/library.js : the Library screen (headings, saved assets) + shared item previews
 * Copyright (C) 2026 Zarir Madon — GNU GPL v3 or later (see LICENSE)
 */
(function () {
  const U = SF.u, { $, $$, esc } = U;
  const TL = { css: 'CSS', svg: 'SVG', js: 'Script', color: 'Colour', font: 'Font', block: 'Block' };
  /* build a preview result for a library item; returns {res} or {text} */
  SF.itemRes = it => {
    const tool = it.tool && SF.get(it.tool);
    if (tool && it.vals) { try { return tool.r(Object.assign(SF.defaults(tool), it.vals)); } catch (e) { } }
    if (it.t === 'svg') return { html: `<div style="width:70%;height:80%;display:grid;place-items:center">${it.code}</div><style>svg{width:100%;height:100%}</style>`, bg: '#0f1320' };
    if (it.t === 'block') return { html: it.html || '', bg: '#fff' };
    if (it.t === 'css') {
      if (it.html) return { html: it.html, bg: it.bg || '#0f1320' };
      if (/[{}]/.test(it.code)) return null;
      const txt = /text-shadow|-webkit-text|text-stroke|background-clip:\s*text/.test(it.code);
      return { html: txt ? `<div style="font:800 64px system-ui;color:#fff;${it.code}">Aa</div>` : `<div style="width:200px;height:120px;border-radius:14px;${it.code}"></div>`, bg: /box-shadow|border|filter|backdrop/.test(it.code) && !/background/.test(it.code) ? '#e9ecf5' : '#0f1320' };
    }
    return null;
  };
  SF.itemPreview = (host, it) => {
    if (it.t === 'color') { host.style.background = it.code; host.innerHTML = `<b style="font:600 12px ui-monospace,monospace;background:#000a;color:#fff;border-radius:6px;padding:2px 7px">${esc(it.code)}</b>`; return; }
    if (it.t === 'font') { host.innerHTML = `<div style="font:700 30px ${it.code.replace(/^font-family:\s*/, '').replace(/;$/, '')};color:#fff">Aa Bb</div>`; return; }
    const r = SF.itemRes(it);
    if (r) { SF.pv.lazy(host, () => r); return; }
    host.innerHTML = `<code style="font:11px ui-monospace,monospace;color:#9aa3c4;padding:6px;white-space:pre-wrap;max-height:100%;overflow:hidden;text-align:left;width:100%">${esc(it.code.slice(0, 220))}</code>`;
  };

  const L = { head: 'all', q: '' };
  SF.screens.library = {
    init() {
      $('#s-library').innerHTML = `<div class="pg"><div class="pgh">
        <input type="search" id="lq" placeholder="Search your library, e.g. blue card" style="flex:1;min-width:140px">
        <button class="btn" id="l-add">${SF.ic('plus', 'green')}Heading</button>
        <button class="btn" id="l-ren">Rename</button><button class="btn dng" id="l-del">${SF.ic('trash', 'red')}Delete heading</button>
        <button class="btn" id="l-ex">${SF.ic('out', 'blue')}Export</button><label class="btn">${SF.ic('grab', 'teal')}Import<input type="file" id="l-im" accept=".json,application/json" hidden></label></div>
        <div class="layout2"><div class="side" id="lside"></div><div class="pgb" id="lgrid"></div></div></div>`;
      $('#lq').oninput = e => { L.q = e.target.value.trim().toLowerCase(); this.draw(); };
      $('#l-add').onclick = () => U.dlg('New heading', '<h3>Name</h3><input type="text" id="hn" placeholder="e.g. Buttons I like">', [['Cancel'], ['Create', o => { const n = $('#hn', o).value.trim(); if (!n) { U.toast('Type a name first'); return false; } L.head = SF.lib.addHead(n).id; this.draw(); U.toast('Heading "' + n + '" created'); }, 1]]);
      $('#l-ren').onclick = () => { const h = SF.lib.head(L.head); if (!h) { U.toast('Choose a heading on the left first'); return; } U.dlg('Rename heading', `<h3>Name</h3><input type="text" id="hn" value="${esc(h.n)}" placeholder="e.g. Buttons I like">`, [['Cancel'], ['Rename', o => { const n = $('#hn', o).value.trim(); if (!n) return false; SF.lib.renameHead(h.id, n); this.draw(); }, 1]]); };
      $('#l-del').onclick = () => { const h = SF.lib.head(L.head); if (!h) { U.toast('Choose a heading on the left first'); return; } const n = SF.lib.byHead(h.id).length; U.dlg('Delete heading?', `<p>"${esc(h.n)}" and its ${n} item${n === 1 ? '' : 's'} will be deleted. If you use Sync, they will be deleted on GitHub too.</p>`, [['Cancel'], ['Delete', () => { SF.lib.delHead(h.id); L.head = 'all'; this.draw(); U.toast('Heading deleted'); }, 1]]); };
      $('#l-ex').onclick = () => { U.download('styleforge-library-' + new Date().toISOString().slice(0, 10) + '.json', SF.lib.exportJSON(), 'application/json'); U.toast('Library file saved to Downloads'); };
      $('#l-im').onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { const x = SF.lib.importJSON(r.result); if (x.err) U.dlg('Could not import', `<p>${esc(x.err)}</p>`, [['OK', null, 1]]); else U.dlg('Imported', '<ul class="exp">' + x.log.map(l => `<li>${esc(l)}</li>`).join('') + '</ul>', [['OK', null, 1]]); this.draw(); }; r.readAsText(f); e.target.value = ''; };
      SF.lib.on(() => { if (SF.screen === 'library') this.draw(); });
    },
    show() { this.draw(); },
    draw() {
      const side = $('#lside'), grid = $('#lgrid'), heads = SF.lib.d.heads;
      side.innerHTML = `<button class="hrow ${L.head === 'all' ? 'on' : ''}" data-h="all">${SF.ic('grid', 'purple')}All<span class="n">${SF.lib.count()}</span></button>` + heads.map(h => `<button class="hrow ${L.head === h.id ? 'on' : ''}" data-h="${h.id}">${SF.ic('folder', 'amber')}<span style="overflow:hidden;text-overflow:ellipsis">${esc(h.n)}</span><span class="n">${SF.lib.byHead(h.id).length}</span></button>`).join('');
      $$('.hrow', side).forEach(b => b.onclick = () => { L.head = b.dataset.h; this.draw(); });
      if (L.head !== 'all' && !SF.lib.head(L.head)) L.head = 'all';
      let items = L.head === 'all' ? SF.lib.d.items : SF.lib.byHead(L.head);
      if (L.q) items = items.filter(i => (i.n + ' ' + i.code + ' ' + (TL[i.t] || '')).toLowerCase().includes(L.q));
      grid.innerHTML = '';
      if (!items.length) { grid.innerHTML = `<div class="empty"><b>${SF.lib.count() ? 'Nothing here yet' : 'Your library is empty'}</b>Save things from Make, or tick things in Grab, and they will show up here under your own headings.<div style="margin-top:12px"><button class="btn pri" id="l-demo">Add a small demo library</button></div></div>`; const d = $('#l-demo'); if (d) d.onclick = () => { SF.lib.demo(); U.toast('Demo items added'); }; return; }
      const g = document.createElement('div'); g.className = 'grid'; grid.appendChild(g);
      items.forEach(it => {
        const c = document.createElement('div'); c.className = 'card';
        const h = SF.lib.head(it.head);
        c.innerHTML = `<div class="cv"></div><div class="ct">${esc(it.n)}</div><div class="cs">${TL[it.t] || it.t}${h && L.head === 'all' ? ' · ' + esc(h.n) : ''}${it.src ? ' · ' + esc(it.src) : ''}</div><div class="ca"><button class="btn sm" data-a="copy">Copy</button>${it.tool && SF.get(it.tool) ? '<button class="btn sm" data-a="open">Edit</button>' : ''}${['css', 'svg', 'block', 'color'].includes(it.t) ? '<button class="btn sm" data-a="use">Use</button>' : ''}<button class="btn sm" data-a="more">More</button></div>`;
        g.appendChild(c); SF.itemPreview($('.cv', c), it);
        $('.ca', c).onclick = async e => { const a = e.target.closest('button'); if (!a) return; const k = a.dataset.a;
          if (k === 'copy') U.toast(await U.copy(it.code) ? 'Copied' : 'Could not copy');
          else if (k === 'open') SF.make.open(it.tool, it.vals);
          else if (k === 'use') SF.builder ? SF.builder.useItem(it) : 0;
          else this.more(it); };
      });
    },
    more(it) {
      const tw = it.t === 'css' && SF.tw(it.code);
      const o = U.dlg('Item', `<h3>Name</h3><input type="text" id="in" value="${esc(it.n)}" placeholder="e.g. Soft card shadow"><h3>Heading</h3><select id="ih">${SF.lib.d.heads.map(h => `<option value="${h.id}" ${h.id === it.head ? 'selected' : ''}>${esc(h.n)}</option>`).join('')}</select><h3>Code</h3><textarea id="ic" rows="7" placeholder="Code goes here">${esc(it.code)}</textarea>
        <div class="row" style="flex-wrap:wrap;margin-top:6px">${tw ? '<button class="btn sm" id="i-tw">Copy Tailwind</button>' : ''}${it.t === 'css' ? '<button class="btn sm" id="i-ex">Explain in plain English</button>' : ''}<button class="btn sm dng" id="i-del">Delete</button></div>`,
        [['Cancel'], ['Save', o => { SF.lib.update(it.id, { n: $('#in', o).value.trim() || it.n, head: $('#ih', o).value, code: $('#ic', o).value }); U.toast('Saved'); }, 1]]);
      if (tw) $('#i-tw', o).onclick = async () => U.toast(await U.copy(tw) ? 'Tailwind copied' : 'Could not copy');
      const ex = $('#i-ex', o); if (ex) ex.onclick = () => U.dlg('In plain English', '<ul class="exp">' + SF.explain($('#ic', o).value).map(l => `<li>${esc(l.text)}</li>`).join('') + '</ul>', [['OK', null, 1]]);
      $('#i-del', o).onclick = () => { SF.lib.remove(it.id); o.remove(); U.toast('Deleted'); };
    }
  };
})();
