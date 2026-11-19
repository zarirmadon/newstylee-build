/*
 * StyleForge (working name) — ui/grab.js : pull colours, fonts, gradients, shadows, SVGs and animations out of a web page.
 * Only the things you tick are saved.
 * Copyright (C) 2026 Zarir Madon — GNU GPL v3 or later (see LICENSE)
 */
(function () {
  const U = SF.u, { $, $$, esc } = U;
  const G = SF.grab = { data: null, tab: 'colors', sel: new Set(), src: '', html: '' };
  const TABS = [['colors', 'Colours'], ['fonts', 'Fonts'], ['gradients', 'Gradients'], ['shadows', 'Shadows'], ['svgs', 'SVGs'], ['anims', 'Animations'], ['picked', 'Picked']];
  const GENERIC = /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-[\w-]+|inherit|initial|unset|inherit|-apple-system|blinkmacsystemfont|var\(.*\)|emoji|math|fangsong)$/i;

  /* ---------- extraction ---------- */
  const hex = n => '#' + [n[0], n[1], n[2]].map(x => U.clamp(Math.round(x), 0, 255).toString(16).padStart(2, '0')).join('');
  function toHex(s) {
    s = s.trim().toLowerCase(); let m;
    if (m = s.match(/^#([0-9a-f]{3,8})$/)) { let h = m[1]; if (h.length === 3 || h.length === 4) h = h.split('').map(c => c + c).join(''); if (h.length === 8 && parseInt(h.slice(6), 16) < 20) return null; return '#' + h.slice(0, 6); }
    if (m = s.match(/^rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.%]+))?\s*\)$/)) { const a = m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : +m[4]; if (a < .08) return null; return hex([+m[1], +m[2], +m[3]]); }
    if (m = s.match(/^hsla?\(\s*([\d.]+)(?:deg)?[ ,]+([\d.]+)%[ ,]+([\d.]+)%(?:[ ,/]+([\d.%]+))?\s*\)$/)) { const a = m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : +m[4]; if (a < .08) return null; return U.hsl2hex(+m[1], +m[2], +m[3]); }
    return null;
  }
  function balanced(str, from, open = '(', close = ')') { let d = 0; for (let i = from; i < str.length; i++) { if (str[i] === open) d++; else if (str[i] === close) { d--; if (!d) return i; } } return -1; }
  function tally(arr) { const m = new Map(); arr.forEach(v => m.set(v, (m.get(v) || 0) + 1)); return [...m].sort((a, b) => b[1] - a[1]); }

  G.extract = (html, extraCss = '') => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    let css = extraCss + '\n' + [...doc.querySelectorAll('style')].map(s => s.textContent).join('\n') + '\n' + [...doc.querySelectorAll('[style]')].map(e => e.getAttribute('style')).join(';\n');
    const out = { title: (doc.title || '').trim(), colors: [], fonts: [], gradients: [], shadows: [], svgs: [], anims: [], picked: [] };
    const cols = []; (css.match(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/gi) || []).forEach(c => { const h = toHex(c); if (h) cols.push(h); });
    (html.match(/(?:fill|stroke|stop-color|color)=["']#[0-9a-f]{3,6}["']/gi) || []).forEach(c => { const h = toHex(c.match(/#[0-9a-f]+/i)[0]); if (h) cols.push(h); });
    out.colors = tally(cols).slice(0, 80).map(([v, n]) => ({ v, n }));
    const fonts = []; (css.match(/font-family\s*:\s*[^;}]+/gi) || []).forEach(m => { const val = m.replace(/font-family\s*:\s*/i, '').replace(/!important/i, '').trim(); const first = val.split(',')[0].trim().replace(/^["']|["']$/g, ''); if (first && !GENERIC.test(first) && first.length < 60) fonts.push(first + '\u0001' + val); });
    [...doc.querySelectorAll('link[href*="fonts.googleapis.com"]')].forEach(l => { (l.href.match(/family=([^&:]+)/g) || []).forEach(f => { const nm = decodeURIComponent(f.slice(7)).replace(/\+/g, ' '); fonts.push(nm + '\u0001' + `"${nm}", sans-serif`); }); });
    out.fonts = tally(fonts).slice(0, 40).map(([v, n]) => { const [name, stack] = v.split('\u0001'); return { v: name, stack, n }; });
    const gr = new Set(), re = /(repeating-)?(linear|radial|conic)-gradient\(/gi; let m;
    while ((m = re.exec(css))) { const e = balanced(css, m.index + m[0].length - 1); if (e > 0) { gr.add(css.slice(m.index, e + 1).replace(/\s+/g, ' ')); re.lastIndex = e; } }
    out.gradients = [...gr].slice(0, 60).map(v => ({ v }));
    const sh = new Map(); const rs = /(box|text)-shadow\s*:\s*([^;}]+)/gi; while ((m = rs.exec(css))) { const v = m[2].replace(/!important/i, '').trim(); if (/^(none|inherit|initial|unset)$/i.test(v) || /^var\(/.test(v)) continue; sh.set(m[1] + '|' + v, 1); }
    out.shadows = [...sh.keys()].slice(0, 60).map(k => { const i = k.indexOf('|'); return { kind: k.slice(0, i), v: k.slice(i + 1) }; });
    const sv = new Set(); doc.querySelectorAll('svg').forEach(s => { if (s.querySelector('svg') === s) return; let o = s.outerHTML; if (!/xmlns=/.test(o)) o = o.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"'); if (o.length < 60000 && o.length > 60) sv.add(o); });
    (css.match(/url\(["']?data:image\/svg\+xml[^)]+\)/gi) || []).forEach(u => { try { let d = u.replace(/^url\(["']?data:image\/svg\+xml[;,]?(?:charset=[\w-]+,)?/i, '').replace(/["']?\)$/, ''); if (/^base64,/.test(d)) d = U.unb64(d.slice(7)); else d = decodeURIComponent(d); if (/<svg/.test(d) && d.length < 60000) sv.add(d); } catch (e) { } });
    out.svgs = [...sv].slice(0, 60).map(v => ({ v }));
    const an = [], rk = /@keyframes\s+([\w-]+)\s*\{/g; while ((m = rk.exec(css))) { const e = balanced(css, m.index + m[0].length - 1, '{', '}'); if (e > 0) { an.push({ n: m[1], v: css.slice(m.index, e + 1).replace(/\s+/g, ' ') }); rk.lastIndex = e; } }
    out.anims = an.slice(0, 40);
    return out;
  };

  /* .mht / .mhtml (single-file web archive) → {html, css} */
  G.mht = text => {
    const bm = text.match(/boundary="?([^"\r\n;]+)"?/i); if (!bm) return null;
    const parts = text.split('--' + bm[1]); let html = '', css = '';
    const qp = (s, cs) => { s = s.replace(/=\r?\n/g, ''); const bytes = []; for (let i = 0; i < s.length; i++) { if (s[i] === '=' && /^[0-9A-F]{2}$/i.test(s.substr(i + 1, 2))) { bytes.push(parseInt(s.substr(i + 1, 2), 16)); i += 2; } else bytes.push(s.charCodeAt(i) & 255); } try { return new TextDecoder(cs || 'utf-8').decode(new Uint8Array(bytes)); } catch (e) { return new TextDecoder().decode(new Uint8Array(bytes)); } };
    parts.forEach(p => {
      const i = p.search(/\r?\n\r?\n/); if (i < 0) return; const head = p.slice(0, i), body = p.slice(i).replace(/^\s+/, '');
      const ct = (head.match(/Content-Type:\s*([^;\r\n]+)/i) || [])[1] || '', cs = (head.match(/charset="?([\w-]+)/i) || [])[1], te = (head.match(/Content-Transfer-Encoding:\s*(\S+)/i) || [])[1] || '';
      if (!/text\/(html|css)/i.test(ct)) return;
      let t = /quoted-printable/i.test(te) ? qp(body, cs) : /base64/i.test(te) ? (() => { try { return new TextDecoder(cs || 'utf-8').decode(Uint8Array.from(atob(body.replace(/\s+/g, '')), c => c.charCodeAt(0))); } catch (e) { return ''; } })() : body;
      if (/html/i.test(ct)) html += t + '\n'; else css += t + '\n';
    });
    return { html, css };
  };

  /* ---------- the Grab button for other browsers (runs inside the page you are viewing) ---------- */
  function bm() {
    try {
      const hx = c => { const m = c.match(/rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)(?:[ ,/]+([\d.]+))?/); if (!m) return null; if (m[4] !== undefined && +m[4] < .08) return null; return '#' + [m[1], m[2], m[3]].map(x => (+x).toString(16).padStart(2, '0')).join(''); };
      const cs = {}, fo = {}, gr = new Set(), sh = new Set(), els = [...document.querySelectorAll('*')].slice(0, 5000);
      els.forEach(e => { const s = getComputedStyle(e);['color', 'backgroundColor', 'borderTopColor', 'fill', 'stroke'].forEach(k => { const h = hx(s[k] || ''); if (h) cs[h] = (cs[h] || 0) + 1; }); const f = (s.fontFamily || '').split(',')[0].replace(/["']/g, '').trim(); if (f) fo[f + '\u0001' + s.fontFamily] = (fo[f + '\u0001' + s.fontFamily] || 0) + 1; if (/gradient/.test(s.backgroundImage)) { const m = s.backgroundImage.match(/(repeating-)?(linear|radial|conic)-gradient\(.*\)/); if (m) gr.add(m[0]); } if (s.boxShadow && s.boxShadow !== 'none') sh.add('box|' + s.boxShadow); if (s.textShadow && s.textShadow !== 'none') sh.add('text|' + s.textShadow); });
      const an = []; for (const ss of document.styleSheets) { try { for (const r of ss.cssRules) if (r.type === 7) an.push({ n: r.name, v: r.cssText }); } catch (e) { } }
      const sv = [...document.querySelectorAll('svg')].map(s => s.outerHTML).filter(s => s.length > 60 && s.length < 60000).slice(0, 60);
      const o = { sfgrab: 1, url: location.href, title: document.title, colors: Object.entries(cs).sort((a, b) => b[1] - a[1]).slice(0, 80).map(([v, n]) => ({ v, n })), fonts: Object.entries(fo).map(([k, n]) => { const [v, stack] = k.split('\u0001'); return { v, stack, n }; }), gradients: [...gr].map(v => ({ v })), shadows: [...sh].map(k => { const i = k.indexOf('|'); return { kind: k.slice(0, i), v: k.slice(i + 1) }; }), svgs: sv.map(v => ({ v })), anims: an.slice(0, 40) };
      const j = JSON.stringify(o);
      const done = () => alert('StyleForge Grab copied ' + o.colors.length + ' colours, ' + o.fonts.length + ' fonts, ' + o.gradients.length + ' gradients, ' + o.shadows.length + ' shadows, ' + o.svgs.length + ' SVGs.\nNow switch to StyleForge and press "Paste from the Grab button".');
      navigator.clipboard.writeText(j).then(done, () => { prompt('Copy this text, then paste it into StyleForge:', j); });
    } catch (e) { alert('StyleForge Grab could not read this page: ' + e.message); }
  }
  G.bookmarklet = () => 'javascript:(' + bm.toString().replace(/\/\/.*$/gm, '').replace(/\s*\n\s*/g, ' ') + ')()';

  /* ---------- screen ---------- */
  function load(res, src, html) {
    G.data = res; G.src = src; G.html = html || ''; G.sel.clear(); G.tab = res.colors.length ? 'colors' : TABS.find(t => res[t[0]] && res[t[0]].length)?.[0] || 'colors';
    draw();
    const n = ['colors', 'fonts', 'gradients', 'shadows', 'svgs', 'anims'].map(k => `${res[k].length} ${k === 'anims' ? 'animations' : k}`).join(', ');
    U.dlg('Found on that page', `<p>${esc(n)}.</p><p class="hint">Nothing has been saved yet. Tick what you want, then press Save.</p>${res.colors.length + res.svgs.length + res.gradients.length === 0 ? '<p class="hint"><b>Not much found.</b> Many sites keep their styles in separate files that a saved page does not include. Try the Grab button (it reads the live page) or "Tap to pick".</p>' : ''}`, [['OK', null, 1]]);
  }
  function fromText(text, name) {
    let html = text, css = '';
    if (/^(MIME-Version|From:|Subject:|Content-Type: multipart)/mi.test(text.slice(0, 600)) && /boundary=/i.test(text.slice(0, 2000))) { const r = G.mht(text); if (!r || !r.html) { U.dlg('Could not read that file', '<p>It looks like a web archive (.mht) but no page was found inside.</p>', [['OK', null, 1]]); return; } html = r.html; css = r.css; }
    if (text.trim().startsWith('{') && /"sfgrab"/.test(text.slice(0, 200))) return fromJSON(text);
    load(G.extract(html, css), name || 'page', html);
  }
  function fromJSON(text) {
    let o; try { o = JSON.parse(text); } catch (e) { U.dlg('That did not work', '<p>The pasted text is not from the Grab button. Press the Grab button on the page first, then try again.</p>', [['OK', null, 1]]); return; }
    if (!o.sfgrab) { U.dlg('That did not work', '<p>This is not Grab button data.</p>', [['OK', null, 1]]); return; }
    ['colors', 'fonts', 'gradients', 'shadows', 'svgs', 'anims'].forEach(k => o[k] = o[k] || []); o.picked = [];
    let host = 'page'; try { host = new URL(o.url).hostname; } catch (e) { }
    load(o, host, '');
  }
  SF.screens.grab = {
    init() {
      $('#s-grab').innerHTML = `<div class="pg"><div class="pgh"><b style="font-size:14px">Grab from a web page</b><span class="hint grow">Pull out only what you want. Nothing is saved until you press Save.</span></div><div class="pgb" id="gb"></div></div>`;
      draw();
    },
    show() { draw(); }
  };

  function srcCards() {
    return `<div class="grid" style="margin-bottom:12px">
      <button class="card" id="g-file"><div class="cv" style="height:62px">${SF.ic('folder', 'amber', 'big')}</div><div class="ct">Open a saved page</div><div class="cs">.html, .htm or .mht file</div></button>
      <button class="card" id="g-paste"><div class="cv" style="height:62px">${SF.ic('file', 'blue')}</div><div class="ct">Paste page source</div><div class="cs">View source → copy → paste</div></button>
      <button class="card" id="g-clip"><div class="cv" style="height:62px">${SF.ic('grab', 'teal')}</div><div class="ct">Paste from the Grab button</div><div class="cs">Best: reads the live page</div></button>
      <button class="card" id="g-url"><div class="cv" style="height:62px">${SF.ic('sync', 'green')}</div><div class="ct">From a link</div><div class="cs">Works only if the site allows it</div></button>
      <button class="card" id="g-bm"><div class="cv" style="height:62px">${SF.ic('info', 'purple')}</div><div class="ct">Get the Grab button</div><div class="cs">A one-tap bookmark, any browser</div></button>
    </div><input type="file" id="g-fi" accept=".html,.htm,.mht,.mhtml,.txt,.json,text/html" hidden>`;
  }

  function draw() {
    const gb = $('#gb'); if (!gb) return;
    gb.innerHTML = srcCards() + '<div id="gr"></div>';
    $('#g-file').onclick = () => $('#g-fi').click();
    $('#g-fi').onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => fromText(String(r.result), f.name.replace(/\.[^.]+$/, '')); r.readAsText(f); e.target.value = ''; };
    $('#g-paste').onclick = () => U.dlg('Paste page source', '<h3>Source</h3><textarea id="gp" rows="8" placeholder="Paste the page\'s HTML here, e.g. <html><head>…"></textarea><p class="hint">On a computer: right-click the page → View page source → select all → copy.</p>', [['Cancel'], ['Look inside', o => { const t = $('#gp', o).value; if (t.trim().length < 20) { U.toast('Paste the page source first'); return false; } fromText(t, 'pasted page'); }, 1]]);
    $('#g-clip').onclick = async () => { try { const t = await navigator.clipboard.readText(); if (t && /sfgrab/.test(t.slice(0, 300))) return fromJSON(t); U.toast('Nothing from the Grab button on the clipboard — pasting by hand instead', 2600); } catch (e) { } U.dlg('Paste from the Grab button', '<h3>Text</h3><textarea id="gp" rows="6" placeholder="Paste here after pressing the Grab button on the page"></textarea>', [['Cancel'], ['Look inside', o => { fromJSON($('#gp', o).value); }, 1]]); };
    $('#g-url').onclick = () => U.dlg('From a link', '<h3>Web address</h3><input type="url" id="gu" placeholder="e.g. https://example.com"><p class="hint">Browsers only let apps read a page if that site allows it, and most do not. If it fails, use the Grab button instead — it reads the page while you are looking at it.</p>', [['Cancel'], ['Fetch', async o => { let u = $('#gu', o).value.trim(); if (!/^https?:\/\//.test(u)) u = 'https://' + u; if (u.length < 10) return false; U.toast('Trying to read ' + u, 1500); try { const r = await fetch(u); if (!r.ok) throw new Error('HTTP ' + r.status); const t = await r.text(); fromText(t, new URL(u).hostname); } catch (e) { U.dlg('The site did not let me in', `<p>${esc(e.message)}.</p><p class="hint">This is the browser protecting that site, not a fault in StyleForge. Use "Get the Grab button" instead.</p>`, [['OK', null, 1]]); } }, 1]]);
    $('#g-bm').onclick = () => { const code = G.bookmarklet(); const o = U.dlg('The Grab button', `<h3>How it works</h3><p class="hint">1. Make a bookmark in your browser (any page, any name, e.g. "Grab").<br>2. Edit the bookmark and replace its address with the code below.<br>3. Visit any web page, tap the bookmark. It copies what it finds.<br>4. Come back here and press "Paste from the Grab button".</p><h3>Code</h3><textarea rows="4" readonly id="bmc">${esc(code)}</textarea>`, [['Close'], ['Copy code', async () => { U.toast(await U.copy(code) ? 'Grab button code copied' : 'Could not copy'); }, 1]]); $('#bmc', o).onclick = e => e.target.select(); };
    if (G.data) results();
  }

  function items(k) { return G.data[k] || []; }
  function results() {
    const d = G.data, gr = $('#gr');
    gr.innerHTML = `<div class="row" style="margin-bottom:8px"><b style="font-size:14px">${esc(G.src)}</b><span class="hint grow">${esc(d.title || '')}</span>${G.html ? `<button class="btn sm" id="g-pick">${SF.ic('make', 'pink')}Tap to pick</button>` : ''}</div>
      <div class="row" style="flex-wrap:wrap;margin-bottom:8px">${TABS.map(([k, n]) => `<button class="chip ${G.tab === k ? 'on' : ''}" data-t="${k}">${n} ${items(k).length}</button>`).join('')}</div><div id="gi"></div>
      <div class="row" style="position:sticky;bottom:-10px;background:var(--bg);padding:8px 0;flex-wrap:wrap"><button class="btn sm" id="g-all">Tick all here</button><button class="btn sm" id="g-none">Tick none</button><span class="grow"></span><span id="g-n" class="hint"></span><button class="btn pri" id="g-save">${SF.ic('save', 'pink')}Save ticked…</button></div>`;
    $$('[data-t]', gr).forEach(b => b.onclick = () => { G.tab = b.dataset.t; results(); });
    const box = $('#gi', gr), list = items(G.tab);
    if (!list.length) box.innerHTML = `<div class="empty"><b>None found here</b>${G.tab === 'picked' ? 'Use "Tap to pick" and tap things on the page.' : 'This page has none of these, or keeps them in files that were not included.'}</div>`;
    const sw = G.tab === 'colors'; const wrap = document.createElement('div'); wrap.className = sw ? 'swr' : ''; box.appendChild(wrap);
    list.forEach((it, i) => {
      const key = G.tab + ':' + i, on = G.sel.has(key);
      let el;
      if (sw) { el = document.createElement('button'); el.className = 'sw' + (on ? ' on' : ''); el.innerHTML = `<i style="background:${it.v}"></i><span>${it.v}</span><em>×${it.n}</em>`; }
      else { el = document.createElement('button'); el.className = 'gi' + (on ? ' on' : ''); el.innerHTML = `<span class="ck">${on ? '✓' : ''}</span><div class="pv2"></div><div class="grow"><b style="font-size:12px">${esc(label(G.tab, it, i))}</b><code>${esc(codeOf(G.tab, it).slice(0, 140))}</code></div>`; prev($('.pv2', el), G.tab, it); }
      el.onclick = () => { if (G.sel.has(key)) G.sel.delete(key); else G.sel.add(key); results(); };
      wrap.appendChild(el);
    });
    $('#g-all', gr).onclick = () => { list.forEach((_, i) => G.sel.add(G.tab + ':' + i)); results(); };
    $('#g-none', gr).onclick = () => { list.forEach((_, i) => G.sel.delete(G.tab + ':' + i)); results(); };
    $('#g-n', gr).textContent = G.sel.size ? G.sel.size + ' ticked' : 'Nothing ticked yet';
    $('#g-save', gr).onclick = saveDlg;
    const pk = $('#g-pick', gr); if (pk) pk.onclick = pick;
  }
  const label = (k, it, i) => k === 'fonts' ? it.v : k === 'gradients' ? 'Gradient ' + (i + 1) : k === 'shadows' ? (it.kind === 'text' ? 'Text shadow ' : 'Shadow ') + (i + 1) : k === 'svgs' ? 'SVG ' + (i + 1) : k === 'anims' ? it.n : it.n || 'Picked ' + (i + 1);
  const codeOf = (k, it) => k === 'colors' ? it.v : k === 'fonts' ? `font-family: ${it.stack || it.v};` : k === 'gradients' ? `background: ${it.v};` : k === 'shadows' ? `${it.kind}-shadow: ${it.v};` : k === 'svgs' ? it.v : k === 'anims' ? it.v.replace(/\s*\{\s*/, ' {\n  ').replace(/\}\s*$/, '\n}') : it.v;
  function prev(h, k, it) {
    if (k === 'fonts') h.innerHTML = `<b style="font:700 22px ${it.stack || it.v};color:#fff">Aa</b>`;
    else if (k === 'gradients') h.style.background = it.v;
    else if (k === 'shadows') h.innerHTML = it.kind === 'text' ? `<b style="font:800 26px system-ui;color:#fff;text-shadow:${it.v}">Aa</b>` : `<div style="width:56px;height:28px;background:#fff;border-radius:6px;box-shadow:${it.v}"></div>`, h.style.background = it.kind === 'text' ? '#0f1320' : '#e9ecf5';
    else if (k === 'svgs') SF.pv.lazy(h, () => ({ html: `<div style="width:80%;height:80%;display:grid;place-items:center">${it.v}</div><style>svg{width:100%;height:100%}</style>`, bg: '#fff' }));
    else if (k === 'picked') { h.innerHTML = `<div style="width:50px;height:28px;border-radius:6px;${it.v}"></div>`; }
    else h.innerHTML = '<span class="hint">code</span>';
  }
  function saveDlg() {
    if (!G.sel.size) { U.toast('Tick at least one thing first'); return; }
    const o = U.dlg('Save ticked', `<h3>${G.sel.size} item${G.sel.size === 1 ? '' : 's'} will be saved</h3><p class="hint">Only the ticked ones. Nothing else from the page is kept.</p><h3>Heading</h3><select id="gh">${SF.lib.d.heads.map(h => `<option value="${h.id}">${esc(h.n)}</option>`).join('')}<option value="__new">＋ New heading…</option></select><input type="text" id="gnh" placeholder="e.g. Ideas from a shop site" style="display:none;margin-top:6px">`, [['Cancel'], ['Save', o => {
      let hid = $('#gh', o).value; if (hid === '__new') { const n = $('#gnh', o).value.trim(); if (!n) { U.toast('Type a name for the new heading'); return false; } hid = SF.lib.addHead(n).id; }
      const out = []; G.sel.forEach(key => { const [k, i] = key.split(':'), it = items(k)[+i]; if (!it) return;
        const base = { head: hid, src: G.src };
        if (k === 'colors') out.push({ ...base, t: 'color', n: it.v, code: it.v });
        else if (k === 'fonts') out.push({ ...base, t: 'font', n: it.v, code: codeOf(k, it) });
        else if (k === 'gradients') out.push({ ...base, t: 'css', n: 'Gradient', code: codeOf(k, it) });
        else if (k === 'shadows') out.push({ ...base, t: 'css', n: it.kind === 'text' ? 'Text shadow' : 'Shadow', code: codeOf(k, it) });
        else if (k === 'svgs') out.push({ ...base, t: 'svg', n: 'SVG', code: it.v });
        else if (k === 'anims') out.push({ ...base, t: 'css', n: it.n, code: codeOf(k, it) });
        else out.push({ ...base, t: 'css', n: it.n || 'Picked style', code: it.v }); });
      const n = SF.lib.addMany(out); G.sel.clear(); results(); U.toast(`${n} saved to "${SF.lib.head(hid).n}"`);
    }, 1]]);
    $('#gh', o).onchange = e => { $('#gnh', o).style.display = e.target.value === '__new' ? '' : 'none'; };
  }

  /* tap to pick: shows the page (no scripts run) and reads the styles of whatever you tap */
  function pick() {
    const o = U.dlg('Tap to pick', `<p class="hint">Tap anything on the page. Its look is added to the "Picked" tab. Scripts on the page are switched off.</p><iframe class="pickf" id="pf" sandbox="allow-same-origin"></iframe><div id="pi" class="hint" style="margin-top:6px">Nothing picked yet</div>`, [['Done', null, 1]]);
    o.querySelector('.dlg').classList.add('wide'); const f = $('#pf', o); f.style.height = '46dvh'; f.srcdoc = G.html;
    f.onload = () => { const d = f.contentDocument; if (!d) return; d.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); let el = e.target; const w = f.contentWindow, cs = w.getComputedStyle(el), P = ['color', 'background-color', 'background-image', 'font-family', 'font-size', 'font-weight', 'border-radius', 'box-shadow', 'text-shadow', 'padding'], skip = { 'background-color': /rgba\(0, 0, 0, 0\)/, 'background-image': /^none$/, 'box-shadow': /^none$/, 'text-shadow': /^none$/, 'border-radius': /^0px$/, padding: /^0px$/ };
      const decl = P.filter(p => !(skip[p] && skip[p].test(cs.getPropertyValue(p)))).map(p => `${p}: ${cs.getPropertyValue(p)};`).join('\n');
      G.data.picked.push({ n: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''), v: decl });
      const sv = el.closest && el.closest('svg'); if (sv) { let s = sv.outerHTML; if (!/xmlns=/.test(s)) s = s.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"'); G.data.svgs.push({ v: s }); }
      el.style.outline = '2px solid #35d0ba'; $('#pi', o).textContent = `Picked <${el.tagName.toLowerCase()}>${sv ? ' (and its SVG)' : ''}. ${G.data.picked.length} picked so far.`; G.tab = 'picked'; results(); }, true); };
  }
})();
