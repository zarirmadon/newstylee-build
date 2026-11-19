/*
 * StyleForge (working name) — ui/styles.js : the Stylesheets screen (editor, live preview, format/minify/variables/dark theme/explain)
 * Copyright (C) 2026 Zarir Madon — GNU GPL v3 or later (see LICENSE)
 */
(function () {
  const U = SF.u, { $, $$, esc } = U;
  const SAMPLE_CSS = `:root {\n  --brand: #7c5cff;\n}\nbody { font-family: system-ui, sans-serif; background: #f4f5fb; color: #1b2240; margin: 0; padding: 24px; }\n.card { background: #ffffff; border-radius: 16px; padding: 20px; max-width: 320px; box-shadow: 0 10px 30px rgba(20, 24, 60, .15); }\n.card h2 { margin: 0 0 8px; color: #7c5cff; }\n.btn { background: linear-gradient(135deg, #7c5cff, #ff5c9d); color: #fff; border: 0; border-radius: 10px; padding: 10px 18px; font-weight: 600; }\n`;
  const SAMPLE_HTML = `<div class="card">\n  <h2>Hello there</h2>\n  <p>Edit the CSS on the left and watch this card change.</p>\n  <button class="btn">A button</button>\n</div>`;
  const S = { id: null, t: 0 };
  const sheets = () => U.store.get('sheets', []);
  const cur = () => sheets().find(s => s.id === S.id);
  const saveSheet = patch => { const a = sheets(), s = a.find(x => x.id === S.id); if (s) { Object.assign(s, patch, { at: Date.now() }); U.store.set('sheets', a); } };

  /* --- tools on CSS text --- */
  function fmt(css) {
    let out = '', ind = 0, depth = 0, q = '', i = 0, nl = true; css = css.replace(/\r/g, '');
    const pad = () => '  '.repeat(Math.max(0, ind));
    while (i < css.length) {
      const ch = css[i];
      if (q) { out += ch; if (ch === '\\') { out += css[++i] || ''; } else if (ch === q) q = ''; i++; continue; }
      if (ch === '/' && css[i + 1] === '*') { const e = css.indexOf('*/', i + 2); const c = css.slice(i, e < 0 ? css.length : e + 2); out += (nl ? pad() : ' ') + c + '\n'; nl = true; i += c.length; continue; }
      if (ch === '"' || ch === "'") { if (nl) { out += pad(); nl = false; } q = ch; out += ch; i++; continue; }
      if (ch === '(') depth++; if (ch === ')') depth--;
      if (depth > 0) { if (/\s/.test(ch)) { if (!/\s$/.test(out)) out += ' '; } else { if (nl) { out += pad(); nl = false; } out += ch; } i++; continue; }
      if (ch === '{') { out = out.trimEnd() + ' {\n'; ind++; nl = true; }
      else if (ch === '}') { out = out.trimEnd(); if (!/[;{]$/.test(out) && !/\n$/.test(out)) out += ';'; ind--; out += '\n' + pad() + '}\n' + (ind === 0 ? '\n' : ''); nl = true; }
      else if (ch === ';') { out = out.trimEnd() + ';\n'; nl = true; }
      else if (/\s/.test(ch)) { if (!nl && !/\s$/.test(out)) out += ' '; }
      else { if (nl) { out += pad(); nl = false; } out += ch; if (ch === ':' && /^\s*\S/.test(css.slice(i + 1)) && ind > 0 && !/^[\w-]/.test(css.slice(i + 1, i + 2))) { } }
      i++;
    }
    return out.replace(/\n{3,}/g, '\n\n').trim().split('\n').map(spaceLine).join('\n') + '\n';
  }
  /* inside a declaration line: "prop:value" → "prop: value", and a space after commas (but never inside url(...) or quotes) */
  function spaceLine(l) {
    if (!/;\s*$/.test(l) || /^\s*\/\*/.test(l)) return l;
    l = l.replace(/^(\s*[-\w]+):(?=\S)/, '$1: ');
    let o = '', d = 0, q = '', inUrl = [];
    for (let i = 0; i < l.length; i++) { const c = l[i];
      if (q) { o += c; if (c === q) q = ''; continue; }
      if (c === '"' || c === "'") { q = c; o += c; continue; }
      if (c === '(') { d++; inUrl.push(/url$/i.test(o)); }
      if (c === ')') { d--; inUrl.pop(); }
      o += c;
      if (c === ',' && !inUrl.includes(true) && l[i + 1] !== ' ') o += ' ';
    }
    return o;
  }
  function minify(css) { return css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};,>])\s*/g, '$1').replace(/;}/g, '}').replace(/:\s+/g, ':').trim(); }
  const COLRE = /#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/gi;
  function darken(css) {
    let n = 0;
    const conv = c => { let m, h, s, l, a = '';
      if (m = c.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)) { [h, s, l] = U.hex2hsl('#' + m[1]); }
      else if (m = c.match(/^rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.]+))?/i)) { [h, s, l] = U.hex2hsl(U.r2h(+m[1], +m[2], +m[3])); a = m[4] !== undefined ? m[4] : ''; }
      else return c; n++;
      const nl = U.clamp(100 - l, 6, 94), ns = s * .9, hex = U.hsl2hex(h, ns, nl);
      if (a !== '') { const [r, g, b] = U.h2r(hex); return `rgba(${r}, ${g}, ${b}, ${a})`; } return hex; };
    const body = css.replace(COLRE, conv);
    return { css: body, n };
  }
  function repeated(css) { const m = new Map(); (css.match(/#[0-9a-f]{6}\b/gi) || []).forEach(c => { c = c.toLowerCase(); m.set(c, (m.get(c) || 0) + 1); }); return [...m].filter(x => x[1] >= 2).sort((a, b) => b[1] - a[1]); }

  SF.screens.styles = {
    init() {
      if (!sheets().length) U.store.set('sheets', [{ id: U.uid(), n: 'My first stylesheet', css: SAMPLE_CSS, html: SAMPLE_HTML, at: Date.now() }]);
      S.id = U.store.get('sheet', null); if (!cur()) S.id = sheets()[0].id;
      $('#s-styles').innerHTML = `<div class="pg"><div class="pgh"><select id="ss" style="width:auto;min-width:150px"></select>
        <button class="btn sm" id="s-new">${SF.ic('plus', 'green')}New</button><button class="btn sm" id="s-ren">Rename</button><button class="btn sm dng" id="s-del">Delete</button>
        <label class="btn sm">${SF.ic('grab', 'teal')}Open .css<input type="file" id="s-open" accept=".css,text/css,.txt" hidden></label><button class="btn sm" id="s-dl">${SF.ic('out', 'blue')}Download</button><span class="hint grow" id="s-st"></span></div>
        <div class="pgh"><button class="btn sm" id="s-fmt">Tidy up</button><button class="btn sm" id="s-min">Shrink</button><button class="btn sm" id="s-var">Colour variables</button><button class="btn sm" id="s-dark">Make a dark version</button><button class="btn sm" id="s-exp">Explain</button><button class="btn sm" id="s-lib">Add from Library</button><button class="btn sm" id="s-save">${SF.ic('save', 'pink')}Save to Library</button><button class="btn sm" id="s-ai">${SF.ic('ai', 'pink')}Ask AI</button><button class="btn sm" id="s-cp">Copy</button></div>
        <div class="ed"><div><label class="hint">Your CSS</label><textarea id="s-css" spellcheck="false" placeholder="e.g. .card { border-radius: 16px; }"></textarea><label class="hint">Test page (HTML to see the CSS on)</label><textarea id="s-html" spellcheck="false" style="flex:.7" placeholder="e.g. <div class=&quot;card&quot;>Hello</div>"></textarea></div><div><label class="hint">Live preview (scripts are switched off)</label><iframe id="s-fr" sandbox="allow-same-origin"></iframe></div></div></div>`;
      const css = $('#s-css'), html = $('#s-html');
      const upd = () => { $('#s-fr').srcdoc = `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css.value}</style>${html.value}`; };
      const sv = () => { clearTimeout(S.t); S.t = setTimeout(() => { saveSheet({ css: css.value, html: html.value }); $('#s-st').textContent = 'Saved on this device at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }, 500); upd(); };
      css.oninput = html.oninput = sv;
      const load = () => { const s = cur(); $('#ss').innerHTML = sheets().map(x => `<option value="${x.id}" ${x.id === S.id ? 'selected' : ''}>${esc(x.n)}</option>`).join(''); css.value = s.css; html.value = s.html; upd(); $('#s-st').textContent = ''; };
      this.load = load; $('#ss').onchange = e => { S.id = e.target.value; U.store.set('sheet', S.id); load(); };
      const edit = (txt, why) => { css.value = txt; sv(); U.toast(why); };
      $('#s-new').onclick = () => U.dlg('New stylesheet', '<h3>Name</h3><input type="text" id="nn" placeholder="e.g. Shop homepage">', [['Cancel'], ['Create', o => { const n = $('#nn', o).value.trim(); if (!n) { U.toast('Type a name first'); return false; } const a = sheets(), s = { id: U.uid(), n, css: '', html: SAMPLE_HTML, at: Date.now() }; a.push(s); U.store.set('sheets', a); S.id = s.id; U.store.set('sheet', S.id); load(); }, 1]]);
      $('#s-ren').onclick = () => U.dlg('Rename', `<h3>Name</h3><input type="text" id="nn" value="${esc(cur().n)}" placeholder="e.g. Shop homepage">`, [['Cancel'], ['Rename', o => { const n = $('#nn', o).value.trim(); if (!n) return false; saveSheet({ n }); load(); }, 1]]);
      $('#s-del').onclick = () => U.dlg('Delete stylesheet?', `<p>"${esc(cur().n)}" will be deleted from this device. If it was synced to GitHub, the copy there stays until you remove it.</p>`, [['Cancel'], ['Delete', () => { let a = sheets().filter(s => s.id !== S.id); if (!a.length) a = [{ id: U.uid(), n: 'Untitled', css: '', html: SAMPLE_HTML, at: Date.now() }]; U.store.set('sheets', a); S.id = a[0].id; load(); U.toast('Deleted'); }, 1]]);
      $('#s-open').onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { const a = sheets(), s = { id: U.uid(), n: f.name, css: String(r.result), html: SAMPLE_HTML, at: Date.now() }; a.push(s); U.store.set('sheets', a); S.id = s.id; load(); U.toast('Opened ' + f.name + ' as a new stylesheet'); }; r.readAsText(f); e.target.value = ''; };
      $('#s-dl').onclick = () => { U.download((cur().n.replace(/[^\w.-]+/g, '-').replace(/\.css$/, '') || 'style') + '.css', css.value, 'text/css'); U.toast('CSS file saved to Downloads'); };
      $('#s-fmt').onclick = () => edit(fmt(css.value), 'Tidied up (indented and one rule per line)');
      $('#s-min').onclick = () => { const a = css.value.length, m = minify(css.value); edit(m, `Shrunk from ${a} to ${m.length} characters. Tidy up expands it again`); };
      $('#s-var').onclick = () => { const r = repeated(css.value); if (!r.length) { U.dlg('Colour variables', '<p>No colour (#rrggbb) is used twice or more, so there is nothing to turn into a variable.</p>', [['OK', null, 1]]); return; }
        U.dlg('Colour variables', `<h3>Colours used more than once</h3><ul class="exp">${r.map(([c, n], i) => `<li><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${c};vertical-align:middle"></span> ${c} → <b>--color-${i + 1}</b> (${n} times)</li>`).join('')}</ul><p class="hint">Each repeated colour is replaced by a named variable, so you can change it in one place.</p>`, [['Cancel'], ['Replace them', () => { let t = css.value; r.forEach(([c], i) => { t = t.replace(new RegExp(c.replace('#', '#'), 'gi'), `var(--color-${i + 1})`); }); const vars = ':root {\n' + r.map(([c], i) => `  --color-${i + 1}: ${c};`).join('\n') + '\n}\n\n'; edit(vars + t, `${r.length} variable${r.length === 1 ? '' : 's'} created`); }, 1]]); };
      $('#s-dark').onclick = () => { const d = darken(css.value); if (!d.n) { U.dlg('Dark version', '<p>No colours I can convert were found.</p>', [['OK', null, 1]]); return; } U.dlg('Make a dark version', `<p>${d.n} colours would be flipped (light becomes dark, dark becomes light) and added at the bottom as a dark-mode copy that only applies when the visitor\'s device is set to dark.</p><p class="hint">It is automatic, so look it over afterwards.</p>`, [['Cancel'], ['Add it', () => edit(css.value.trimEnd() + `\n\n@media (prefers-color-scheme: dark) {\n${d.css.split('\n').map(l => '  ' + l).join('\n')}\n}\n`, 'Dark version added at the bottom'), 1]]); };
      $('#s-exp').onclick = () => { const t = css.selectionEnd > css.selectionStart ? css.value.slice(css.selectionStart, css.selectionEnd) : css.value; const ls = SF.explain(t); U.dlg('In plain English', ls.length ? '<ul class="exp">' + ls.slice(0, 120).map(l => `<li>${l.sel ? `<b>${esc(l.sel)}</b> · ` : ''}${esc(l.text)}</li>`).join('') + '</ul>' + (css.selectionEnd > css.selectionStart ? '<p class="hint">Explained the part you selected.</p>' : '<p class="hint">Tip: select part of the CSS first to explain just that.</p>') : '<p>Nothing to explain yet.</p>', [['OK', null, 1]]); };
      $('#s-lib').onclick = () => { const its = SF.lib.d.items.filter(i => i.t === 'css' || i.t === 'color'); if (!its.length) { U.dlg('Add from Library', '<p>Your library has no CSS items yet. Save some from Make or Grab.</p>', [['OK', null, 1]]); return; } const o = U.dlg('Add from Library', '<h3>Pick one to add at the bottom</h3><div id="ll"></div>', [['Close']]); its.forEach(i => { const b = document.createElement('button'); b.className = 'btn'; b.style.cssText = 'width:100%;margin:3px 0;justify-content:flex-start'; b.textContent = i.n + ' · ' + i.code.replace(/\s+/g, ' ').slice(0, 50); b.onclick = () => { const slug = i.n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item'; const add = i.t === 'color' ? `/* ${i.n} */\n:root { --${slug}: ${i.code}; }` : /[{}]/.test(i.code) ? i.code : `.${slug} {\n${i.code.split('\n').map(l => '  ' + l.trim()).join('\n')}\n}`; edit(css.value.trimEnd() + '\n\n' + add + '\n', `Added "${i.n}" at the bottom`); o.remove(); }; $('#ll', o).appendChild(b); }); };
      $('#s-save').onclick = () => { const t = css.selectionEnd > css.selectionStart ? css.value.slice(css.selectionStart, css.selectionEnd) : css.value; const o = U.dlg('Save to Library', `<h3>Name</h3><input type="text" id="sn" placeholder="e.g. Card styles" value="${esc(cur().n)}"><h3>Heading</h3><select id="sh">${SF.lib.d.heads.map(h => `<option value="${h.id}">${esc(h.n)}</option>`).join('')}</select><p class="hint">${css.selectionEnd > css.selectionStart ? 'Saving the part you selected.' : 'Saving the whole stylesheet (select part of it first to save only that).'}</p>`, [['Cancel'], ['Save', o => { SF.lib.add({ n: $('#sn', o).value.trim() || 'Stylesheet', t: 'css', head: $('#sh', o).value, code: t, src: 'stylesheet' }); U.toast('Saved to the Library'); }, 1]]); };
      $('#s-cp').onclick = async () => U.toast(await U.copy(css.value) ? 'CSS copied' : 'Could not copy');
      $('#s-ai').onclick = () => {
        if (!SF.ai.ready()) { U.dlg('Ask AI', '<p>The AI helper is optional and needs your own key. Nothing is sent until you press Ask.</p>', [['Cancel'], ['Open settings', () => SF.settings(), 1]]); return; }
        U.dlg('Ask AI', `<h3>What do you want?</h3><textarea id="aw" rows="3" placeholder='e.g. "explain why my card has no shadow" or "make the buttons rounder"'></textarea><p class="hint">This sends your CSS to the AI service you chose. It will not change your stylesheet; it shows you its answer.</p>`, [['Cancel'], ['Ask', async o => { const w = $('#aw', o).value.trim(); if (!w) { U.toast('Type your question first'); return false; } U.toast('Asking the AI…', 1500); try { const t = await SF.ai.call('You are a friendly CSS helper for a non-programmer. Answer in plain language, short, with small CSS snippets if useful.', `My CSS:\n${css.value.slice(0, 12000)}\n\nRequest: ${w}`); U.dlg('The AI says', `<div class="code" style="max-height:50dvh">${esc(t)}</div>`, [['OK', null, 1]]); } catch (e) { U.dlg('The AI did not work', `<p>${esc(e.message)}</p>`, [['OK', null, 1]]); } }, 1]]); };
      load();
    },
    show() { if (this.load && !U.$('#s-css').value && cur()) this.load(); }
  };
  SF.cssFmt = fmt; SF.cssMin = minify;
})();
