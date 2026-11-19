/*
 * StyleForge (working name) — core/sync.js : two-way library sync with your own private GitHub repository
 * Copyright (C) 2026 Zarir Madon — GNU GPL v3 or later (see LICENSE)
 */
(function () {
  const U = SF.u;
  const S = SF.sync = {
    cfg() { return Object.assign({ repo: '', token: '', branch: 'main', dir: 'styleforge' }, U.store.get('gh', {})); },
    set(c) { U.store.set('gh', c); },
    async api(c, method, path, body) {
      const r = await fetch('https://api.github.com/repos/' + c.repo + path, { method, headers: { Authorization: 'Bearer ' + c.token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
      let j = null; try { j = await r.json(); } catch (e) { }
      return { ok: r.ok, status: r.status, j };
    },
    async getFile(c, path) {
      const r = await S.api(c, 'GET', `/contents/${path}?ref=${encodeURIComponent(c.branch)}`);
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(`GitHub said ${r.status} for ${path}: ${(r.j && r.j.message) || ''}`);
      return { sha: r.j.sha, data: JSON.parse(U.unb64(r.j.content.replace(/\n/g, ''))) };
    },
    async putFile(c, path, obj, sha, msg) {
      const r = await S.api(c, 'PUT', `/contents/${path}`, { message: msg, content: U.b64(JSON.stringify(obj, null, 1)), branch: c.branch, ...(sha ? { sha } : {}) });
      if (!r.ok) throw new Error(`Could not write ${path} (${r.status}): ${(r.j && r.j.message) || ''}`);
    },
    /* mode: 'both' | 'pull'. log(text, kind) tells the person exactly what is happening. */
    async run(mode, log) {
      const c = S.cfg();
      if (!/^[\w.-]+\/[\w.-]+$/.test(c.repo)) throw new Error('The repository should look like  yourname/my-library');
      if (!c.token) throw new Error('No token yet. Paste your GitHub token in the Sync screen first.');
      log('Checking the repository…');
      const t = await S.api(c, 'GET', '');
      if (!t.ok) throw new Error(t.status === 404 ? 'GitHub cannot find that repository (or the token cannot see it).' : t.status === 401 ? 'GitHub did not accept the token (401). It may be wrong or expired.' : 'GitHub said ' + t.status + ': ' + ((t.j && t.j.message) || ''));
      log(`Connected to ${t.j.full_name} (${t.j.private ? 'private' : 'PUBLIC — anyone can read what you push'}).`, t.j.private ? 'ok' : 'er');
      const D = c.dir.replace(/^\/|\/$/g, '');
      /* 1. pull library files */
      let list = await S.api(c, 'GET', `/contents/${D}/library?ref=${encodeURIComponent(c.branch)}`);
      const files = list.ok && Array.isArray(list.j) ? list.j.filter(f => f.name.endsWith('.json')) : [];
      log(`Found ${files.length} heading file(s) on GitHub.`);
      const remote = {};
      const meta = await S.getFile(c, `${D}/meta.json`);
      if (meta && meta.data.del) { const m = SF.lib.merge({ heads: [], items: [], del: meta.data.del }); log('Deletions from GitHub applied. ' + m[m.length - 1]); }
      for (const f of files) {
        const id = f.name.replace(/\.json$/, '');
        if (SF.lib.d.del[id]) { const r = await S.api(c, 'DELETE', `/contents/${f.path}`, { message: 'StyleForge: heading deleted', sha: f.sha, branch: c.branch }); log(r.ok ? `Removed deleted heading file ${f.name} from GitHub.` : `Could not remove ${f.name}: ${r.status}`, r.ok ? 'ok' : 'er'); continue; }
        const g = await S.getFile(c, f.path); remote[id] = g;
        const m = SF.lib.merge({ heads: [g.data.head], items: g.data.items || [], del: {} }, 'GitHub');
        log(`Pulled "${g.data.head.n}": ` + m[m.length - 1]);
      }
      const pullList = async (key) => { const g = await S.getFile(c, `${D}/${key}.json`); if (g && Array.isArray(g.data)) { const cur = U.store.get(key, []); let a = 0, cl = 0; g.data.forEach(x => { const m = cur.find(y => y.id === x.id); if (!m) { cur.push(x); a++; } else if (JSON.stringify(m) !== JSON.stringify(x)) { cur.push(Object.assign({}, x, { id: U.uid(), n: (x.n || 'Untitled') + ' (GitHub copy)' })); cl++; } }); U.store.set(key, cur); log(`Pulled ${key}: ${a} new, ${cl} clashes kept as two copies.`); } return g; };
      const rp = await pullList('pages'), rs = await pullList('sheets');
      if (mode === 'pull') { log('Pull finished. Nothing was written to GitHub.', 'ok'); return; }
      /* 2. push */
      let pushed = 0, same = 0;
      const stable = o => JSON.stringify(o);
      for (const h of SF.lib.d.heads) {
        const items = SF.lib.byHead(h.id), obj = { head: h, items }, r = remote[h.id];
        if (r && stable(r.data) === stable(obj)) { same++; continue; }
        if (!items.length && !r) continue;
        await S.putFile(c, `${D}/library/${h.id}.json`, obj, r && r.sha, `StyleForge: ${h.n}`); pushed++; log(`Pushed "${h.n}" (${items.length} item${items.length === 1 ? '' : 's'}).`, 'ok');
      }
      const pushList = async (key, rr) => { const cur = U.store.get(key, []); if (!cur.length && !rr) return; if (rr && stable(rr.data) === stable(cur)) return; const fresh = await S.getFile(c, `${D}/${key}.json`); await S.putFile(c, `${D}/${key}.json`, cur, fresh && fresh.sha, 'StyleForge: ' + key); log(`Pushed ${key} (${cur.length}).`, 'ok'); pushed++; };
      await pushList('pages', rp); await pushList('sheets', rs);
      const freshMeta = await S.getFile(c, `${D}/meta.json`), md = { del: SF.lib.d.del };
      if ((freshMeta || Object.keys(md.del).length) && (!freshMeta || stable(freshMeta.data) !== stable(md))) { await S.putFile(c, `${D}/meta.json`, md, freshMeta && freshMeta.sha, 'StyleForge: deletions'); log('Pushed deletion list.', 'ok'); pushed++; }
      log(`Done. ${pushed} file(s) written, ${same} heading file(s) already identical.`, 'ok');
      U.store.set('lastsync', Date.now());
    }
  };
})();
