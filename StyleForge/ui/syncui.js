/*
 * StyleForge (working name) — ui/syncui.js : the Sync screen (your private GitHub repository)
 * Copyright (C) 2026 Zarir Madon — GNU GPL v3 or later (see LICENSE)
 */
(function () {
  const U = SF.u, { $, esc } = U;
  SF.screens.sync = {
    init() {
      const c = SF.sync.cfg();
      $('#s-sync').innerHTML = `<div class="pg"><div class="pgh"><b style="font-size:14px">Sync with your GitHub</b><span class="hint grow">Keeps your Library, pages and stylesheets safe, and the same on every device.</span></div>
      <div class="pgb"><div style="max-width:560px;margin:0 auto">
        <h3>Your private repository</h3>
        <div class="fld"><label>Repository</label><input type="text" id="y-repo" value="${esc(c.repo)}" placeholder="e.g. yourname/my-styleforge-library"></div>
        <div class="fld"><label>Token (pasted once, kept on this device only)</label><input type="password" id="y-tok" value="${esc(c.token)}" placeholder="e.g. github_pat_…" autocomplete="off"></div>
        <div class="row"><div class="fld grow"><label>Branch</label><input type="text" id="y-br" value="${esc(c.branch)}" placeholder="e.g. main"></div><div class="fld grow"><label>Folder inside the repo</label><input type="text" id="y-dir" value="${esc(c.dir)}" placeholder="e.g. styleforge"></div></div>
        <div class="row" style="flex-wrap:wrap;margin:10px 0"><button class="btn" id="y-save">Save these details</button><button class="btn" id="y-pull">${SF.ic('grab', 'teal')}Pull only</button><button class="btn pri" id="y-go">${SF.ic('sync', 'green')}Sync both ways</button></div>
        <p class="hint" id="y-last"></p>
        <h3>Log</h3><div class="log" id="y-log">Nothing has happened yet.</div>
        <h3>How to set it up</h3>
        <p class="hint">1. On GitHub make a <b>private</b> repository (any name).<br>2. In GitHub settings → Developer settings → Fine-grained tokens, make a token that can use only that repository, with <b>Contents: read and write</b>.<br>3. Paste the repository and token above, then press Sync.<br><br><b>Sync both ways</b> first reads what is on GitHub and merges it with what is here (nothing is overwritten: if the same item differs in both places you get both copies), then writes the result back. Deleting something on one device removes it on the others next sync.</p>
      </div></div></div>`;
      const read = () => ({ repo: $('#y-repo').value.trim(), token: $('#y-tok').value.trim(), branch: $('#y-br').value.trim() || 'main', dir: $('#y-dir').value.trim() || 'styleforge' });
      const log = (t, k) => { const l = $('#y-log'); if (l.textContent === 'Nothing has happened yet.') l.textContent = ''; const d = document.createElement('div'); if (k) d.className = k; d.textContent = new Date().toLocaleTimeString() + '  ' + t; l.appendChild(d); l.scrollTop = l.scrollHeight; };
      $('#y-save').onclick = () => { SF.sync.set(read()); U.toast('Sync details saved on this device'); };
      const go = async mode => { SF.sync.set(read()); $('#y-log').textContent = ''; try { await SF.sync.run(mode, log); this.last(); U.toast(mode === 'pull' ? 'Pull finished' : 'Sync finished'); } catch (e) { log('Stopped: ' + e.message, 'er'); U.dlg('Sync stopped', `<p>${esc(e.message)}</p><p class="hint">Nothing was claimed as done. See the log for what did happen before this.</p>`, [['OK', null, 1]]); } };
      $('#y-go').onclick = () => go('both'); $('#y-pull').onclick = () => go('pull'); this.last();
    },
    last() { const t = U.store.get('lastsync', 0), e = $('#y-last'); if (e) e.textContent = t ? 'Last full sync: ' + new Date(t).toLocaleString() : 'Never synced from this device yet.'; },
    show() { }
  };
})();
