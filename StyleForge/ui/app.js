/*
 * StyleForge (working name) — ui/app.js : shell, navigation, settings, about, first-run welcome
 * Copyright (C) 2026 Zarir Madon — GNU GPL v3 or later (see LICENSE)
 */
(function () {
  const U = SF.u, { $, $$, esc } = U;
  const SCR = [['make', 'Make', 'make', 'purple'], ['grab', 'Grab', 'grab', 'teal'], ['library', 'Library', 'folder', 'amber'], ['styles', 'Styles', 'styles', 'pink'], ['build', 'Build', 'build', 'blue'], ['sync', 'Sync', 'sync', 'green']];
  SF.screens = {}; SF.screen = '';
  const inited = {};
  SF.go = name => {
    if (!SCR.some(s => s[0] === name)) return;
    SF.screen = name; U.store.set('screen', name);
    $$('.screen').forEach(s => s.classList.toggle('on', s.id === 's-' + name));
    $$('.tab[data-s]').forEach(t => t.classList.toggle('on', t.dataset.s === name));
    const sc = SF.screens[name]; if (sc) { if (!inited[name]) { inited[name] = 1; try { sc.init(); } catch (e) { fail(name, e); } } try { sc.show && sc.show(); } catch (e) { fail(name, e); } }
  };
  function fail(n, e) { console.error(e); $('#s-' + n).innerHTML = `<div class="empty"><b>This screen hit a problem</b>${esc(e.message)}</div>`; }

  function shell() {
    document.body.innerHTML = `<div class="app">
      <header class="top"><div class="brand"><i>✦</i>${esc(SF.cfg.name)}</div>
        <nav class="tabs">${SCR.map(s => `<button class="tab" data-s="${s[0]}">${SF.ic(s[2], s[3])}${s[1]}</button>`).join('')}</nav>
        <button class="ibtn" id="t-set" title="Settings">${SF.ic('gear', 'blue')}</button><button class="ibtn" id="t-abt" title="About">${SF.ic('info', 'purple')}</button></header>
      <main class="main">${SCR.map(s => `<section class="screen" id="s-${s[0]}"></section>`).join('')}</main>
      <nav class="bnav">${SCR.map(s => `<button class="tab" data-s="${s[0]}">${SF.ic(s[2], s[3])}${s[1]}</button>`).join('')}</nav></div>`;
    $$('.tab[data-s]').forEach(t => t.onclick = () => SF.go(t.dataset.s));
    $('#t-set').onclick = SF.settings; $('#t-abt').onclick = SF.about;
  }

  SF.about = () => U.dlg(esc(SF.cfg.name), `<div style="text-align:center"><div class="lg" style="width:64px;height:64px;border-radius:18px;margin:6px auto 10px;background:linear-gradient(135deg,var(--ac),var(--ac2));display:grid;place-items:center;font-size:34px">✦</div>
    <p style="margin:2px 0;font-weight:700">${esc(SF.cfg.credit1)}</p><p style="margin:2px 0">${esc(SF.cfg.credit2)}</p><p style="margin:2px 0">${esc(SF.cfg.credit3)}</p></div>
    <h3>About</h3><p class="hint">Version ${SF.cfg.version}. ${SF.tools.length} tools in ${SF.cats.length} categories. Everything runs on your device; nothing is sent anywhere unless you use Sync or the AI helper yourself.</p>
    <h3>Licence</h3><p class="hint">Free software under the GNU General Public License v3 or later. You may use, study, share and change it. See the LICENSE file for the full text.</p>`, [['Close', null, 1]]);

  let installEvt = null; window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; });
  SF.settings = () => {
    const a = SF.ai.cfg();
    const o = U.dlg('Settings', `<h3>AI helper (optional)</h3>
      <select id="ap"><option value="none" ${a.prov === 'none' ? 'selected' : ''}>Off</option><option value="gemini" ${a.prov === 'gemini' ? 'selected' : ''}>Google Gemini (your own key)</option><option value="claude" ${a.prov === 'claude' ? 'selected' : ''}>Claude (your own key)</option></select>
      <input type="password" id="ak" placeholder="Paste key, e.g. AIza… or sk-ant-…" value="${esc(a.key)}" style="margin-top:6px" autocomplete="off">
      <input type="text" id="am" placeholder="Model (optional), e.g. gemini-2.5-flash" value="${esc(a.model)}" style="margin-top:6px">
      <p class="hint">The key is kept only in this browser on this device. The AI is asked only when you press an Ask AI button, and each time it tells you exactly what it changed.</p>
      <h3>Your data</h3>
      <div class="row" style="flex-wrap:wrap"><button class="btn" id="s-ex">Export everything</button><label class="btn">Import<input type="file" id="s-im" accept=".json,application/json" hidden></label><button class="btn dng" id="s-rs">Erase everything…</button></div>
      <p class="hint">Library: ${SF.lib.count()} items under ${SF.lib.d.heads.length} heading(s). Export gives you a file you can keep.</p>
      <h3>Other</h3><div class="row" style="flex-wrap:wrap"><button class="btn" id="s-tour">Show the welcome tour</button>${installEvt ? '<button class="btn pri" id="s-inst">Install as an app</button>' : ''}</div>`,
      [['Cancel'], ['Save', o => { SF.ai.set({ prov: $('#ap', o).value, key: $('#ak', o).value.trim(), model: $('#am', o).value.trim() }); U.toast('Settings saved'); }, 1]]);
    $('#s-ex', o).onclick = () => { U.download('styleforge-backup-' + new Date().toISOString().slice(0, 10) + '.json', SF.lib.exportJSON(), 'application/json'); U.toast('Backup file saved to Downloads'); };
    $('#s-im', o).onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { const x = SF.lib.importJSON(r.result); o.remove(); if (x.err) U.dlg('Could not import', `<p>${esc(x.err)}</p>`, [['OK', null, 1]]); else { U.dlg('Imported', '<ul class="exp">' + x.log.map(l => `<li>${esc(l)}</li>`).join('') + '</ul>', [['OK', null, 1]]); if (SF.screens.library && SF.screens.library.show) SF.screens.library.show(); } }; r.readAsText(f); };
    $('#s-rs', o).onclick = () => U.dlg('Erase everything?', '<p>This deletes your library, pages, stylesheets and settings from this device. Export first if you want a copy. It cannot be undone.</p>', [['Cancel'], ['Erase', () => { Object.keys(localStorage).filter(k => k.startsWith('sf_')).forEach(k => localStorage.removeItem(k)); location.reload(); }, 1]]);
    $('#s-tour', o).onclick = () => { o.remove(); SF.welcome(); };
    const ib = $('#s-inst', o); if (ib) ib.onclick = async () => { installEvt.prompt(); const c = await installEvt.userChoice; U.toast(c.outcome === 'accepted' ? 'Installing…' : 'Install cancelled'); };
  };

  SF.welcome = () => {
    const slides = [
      ['✦', 'Welcome to StyleForge', 'A friendly workshop for making web designs. Pick an effect, move the sliders, and copy the code. No coding needed.'],
      ['🎛', 'Make', `${SF.tools.length} tools on the left (shadows, glass, waves, shaders, 3D, motion and more). Press the dice for surprises. Everything is explained in plain English.`],
      ['🧲', 'Grab and Library', 'Point Grab at a web page to pull out the colours, fonts, gradients, shadows and SVGs. Tick only what you want, and it lands in your Library under your own headings.'],
      ['🧱', 'Build and Sync', 'Drag blocks into a page, style them with your saved assets, export HTML and CSS or Tailwind. Sync keeps your Library safe in your own private GitHub.']
    ];
    let i = 0; const ob = document.createElement('div'); ob.className = 'ob'; document.body.appendChild(ob);
    const draw = () => {
      const s = slides[i], last = i === slides.length - 1;
      ob.innerHTML = `<div class="lg">${s[0]}</div><h1>${esc(s[1])}</h1><p>${esc(s[2])}</p><div class="dots">${slides.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div><div class="bt">${last ? '<button class="btn" id="o-demo">Enter demo</button><button class="btn pri" id="o-go">Start fresh</button>' : '<button class="btn" id="o-skip">Skip</button><button class="btn pri" id="o-next">Next</button>'}</div>`;
      const fin = demo => { U.store.set('seen', 1); if (demo) { SF.lib.demo(); U.toast('Demo library added: you can delete it any time'); } ob.remove(); SF.go(demo ? 'library' : 'make'); };
      if (last) { $('#o-demo', ob).onclick = () => fin(1); $('#o-go', ob).onclick = () => fin(0); } else { $('#o-next', ob).onclick = () => { i++; draw(); }; $('#o-skip', ob).onclick = () => fin(0); }
    };
    draw();
  };

  function boot() {
    shell(); SF.iconSprite();
    SF.lib.load();
    ['make', 'grab', 'library', 'styles', 'build', 'sync'].forEach(n => { if (n === 'make') SF.screens.make = { init: SF.make.init, show() { } }; });
    SF.go(U.store.get('screen', 'make') || 'make');
    if (!U.store.get('seen', 0)) SF.welcome();
    if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => { });
  }
  window.addEventListener('error', e => { if (SF.booted) U.toast('Something went wrong: ' + (e.message || 'unknown'), 3500); });
  window.addEventListener('unhandledrejection', e => { if (SF.booted) U.toast('Something went wrong: ' + ((e.reason && e.reason.message) || 'unknown'), 3500); });
  document.addEventListener('DOMContentLoaded', () => { boot(); SF.booted = true; });
})();
