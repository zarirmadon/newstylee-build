/*
 * StyleForge (working name) — core/library.js : the saved-assets library (headings + items) and its merge logic
 * Copyright (C) 2026 Zarir Madon — GNU GPL v3 or later (see LICENSE)
 */
(function () {
  const U = SF.u;
  const L = SF.lib = {
    d: { heads: [], items: [], del: {} },
    subs: [],
    on(f) { L.subs.push(f); },
    ping() { L.subs.forEach(f => { try { f(); } catch (e) { } }); },
    load() {
      const d = U.store.get('lib', null);
      if (d && d.heads) { L.d = d; L.d.del = L.d.del || {}; }
      if (!L.d.heads.length) L.d.heads.push({ id: 'h-fav', n: 'Favourites' });
      L.ok = true;
    },
    save() { const ok = U.store.set('lib', L.d); L.ping(); if (!ok) U.toast('Could not save: this browser is blocking storage. Use Export in the Library to keep your work.', 4000); return ok; },
    head: id => L.d.heads.find(h => h.id === id),
    addHead(n) { const h = { id: 'h-' + U.uid(), n: n || 'New heading' }; L.d.heads.push(h); L.save(); return h; },
    renameHead(id, n) { const h = L.head(id); if (h) { h.n = n; L.save(); } },
    delHead(id) { L.d.items.filter(i => i.head === id).forEach(i => L.d.del[i.id] = Date.now()); L.d.items = L.d.items.filter(i => i.head !== id); L.d.heads = L.d.heads.filter(h => h.id !== id); L.d.del[id] = Date.now(); if (!L.d.heads.length) L.d.heads.push({ id: 'h-fav', n: 'Favourites' }); L.save(); },
    add(it) { it = Object.assign({ id: U.uid(), at: Date.now(), t: 'css' }, it); if (!L.head(it.head)) it.head = L.d.heads[0].id; L.d.items.unshift(it); L.save(); return it; },
    addMany(list) { list.forEach(it => { it = Object.assign({ id: U.uid(), at: Date.now(), t: 'css' }, it); if (!L.head(it.head)) it.head = L.d.heads[0].id; L.d.items.push(it); }); L.save(); return list.length; },
    get: id => L.d.items.find(i => i.id === id),
    update(id, patch) { const i = L.get(id); if (i) { Object.assign(i, patch, { at: Date.now() }); L.save(); } },
    remove(id) { L.d.items = L.d.items.filter(i => i.id !== id); L.d.del[id] = Date.now(); L.save(); },
    byHead: id => L.d.items.filter(i => i.head === id),
    count: () => L.d.items.length,
    exportJSON() { return JSON.stringify({ app: 'StyleForge', v: 1, lib: L.d, pages: U.store.get('pages', []), sheets: U.store.get('sheets', []) }, null, 1); },
    /* merge another library in (import or sync). Same id + different content → both kept. Returns log lines. */
    merge(r, who = 'import') {
      const log = []; if (!r || !r.heads) return ['Nothing usable in that data'];
      const del = Object.assign({}, r.del || {});
      r.heads.forEach(h => { if (!L.head(h.id) && !L.d.del[h.id]) { L.d.heads.push({ id: h.id, n: h.n }); log.push(`+ heading "${h.n}"`); } });
      let add = 0, same = 0, clash = 0, gone = 0;
      (r.items || []).forEach(it => {
        const mine = L.get(it.id);
        if (L.d.del[it.id] && L.d.del[it.id] >= (it.at || 0)) return;
        if (!mine) { if (!L.head(it.head)) it.head = L.d.heads[0].id; L.d.items.push(it); add++; }
        else if (mine.code === it.code && mine.n === it.n && mine.head === it.head) same++;
        else if ((mine.at || 0) >= (it.at || 0) && mine.code === it.code) same++;
        else { const c = Object.assign({}, it, { id: U.uid(), n: it.n + ' (' + who + ' copy)' }); if (!L.head(c.head)) c.head = L.d.heads[0].id; L.d.items.push(c); clash++; log.push(`! "${it.n}" differs here and there, so both copies were kept`); }
      });
      for (const id in del) { const t = del[id]; if (!L.d.del[id] || L.d.del[id] < t) L.d.del[id] = t; const i = L.get(id); if (i && (i.at || 0) <= t) { L.d.items = L.d.items.filter(x => x.id !== id); gone++; } const h = L.head(id); if (h) { L.d.heads = L.d.heads.filter(x => x.id !== id); } }
      log.push(`${add} new, ${same} already the same, ${clash} clashes kept as two copies, ${gone} removed because they were deleted elsewhere`);
      if (!L.d.heads.length) L.d.heads.push({ id: 'h-fav', n: 'Favourites' });
      L.save(); return log;
    },
    importJSON(text) {
      let o; try { o = JSON.parse(text); } catch (e) { return { err: 'That is not a valid StyleForge file (could not read it as JSON).' }; }
      const lib = o.lib || (o.heads ? o : null); if (!lib) return { err: 'That file has no library in it.' };
      const log = L.merge(lib, 'imported');
      const mergeList = (key, list) => { if (!Array.isArray(list)) return; const cur = U.store.get(key, []); let a = 0; list.forEach(x => { if (!cur.some(y => y.id === x.id)) { cur.push(x); a++; } }); U.store.set(key, cur); if (a) log.push(`${a} ${key} added`); };
      mergeList('pages', o.pages); mergeList('sheets', o.sheets);
      return { log };
    },
    demo() {
      const h1 = L.addHead('Brand colours'), h2 = L.addHead('Cards & buttons'), h3 = L.addHead('Backgrounds');
      L.addMany([
        { head: h1.id, n: 'Sunset violet', t: 'color', code: '#7c5cff' }, { head: h1.id, n: 'Hot pink', t: 'color', code: '#ff5c9d' }, { head: h1.id, n: 'Mint', t: 'color', code: '#35d0ba' },
        { head: h2.id, n: 'Soft card', t: 'css', code: 'background: #ffffff;\nborder-radius: 18px;\nbox-shadow: 0 10px 30px rgba(20,24,60,.18);\npadding: 18px;', html: '<div style="width:200px;height:120px;background:#fff;border-radius:18px;box-shadow:0 10px 30px rgba(20,24,60,.18)"></div>', bg: '#e9ecf5' },
        { head: h2.id, n: 'Gradient button', t: 'css', code: 'background: linear-gradient(135deg,#7c5cff,#ff5c9d);\ncolor: #fff;\nborder: 0;\nborder-radius: 12px;\npadding: 12px 26px;\nfont-weight: 600;', html: '<button style="background:linear-gradient(135deg,#7c5cff,#ff5c9d);color:#fff;border:0;border-radius:12px;padding:12px 26px;font:600 16px system-ui">Click me</button>' },
        { head: h3.id, n: 'Dusk gradient', t: 'css', code: 'background: linear-gradient(160deg,#1b1340,#7c5cff 55%,#ff9ac1);' }
      ]);
    }
  };
})();
