/*
 * StyleForge (working name) — core/util.js
 * Copyright (C) 2026 Zarir Madon
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with
 * this program. If not, see <https://www.gnu.org/licenses/>.
 */
window.SF = window.SF || {};
SF.cfg = { name: 'StyleForge', version: '1.0.0', credit1: 'Created and designed by Zarir Madon', credit2: 'www.zarirmadon.com', credit3: 'Coded by Claude Sonnet 5.5' };
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const h2r = h => { h = (h || '#000000').replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16) || 0); };
  const r2h = (r, g, b) => '#' + [r, g, b].map(x => clamp(Math.round(x), 0, 255).toString(16).padStart(2, '0')).join('');
  const rgba = (h, a) => { const [r, g, b] = h2r(h); return `rgba(${r},${g},${b},${+(+a).toFixed(3)})`; };
  const hsl2hex = (h, s, l) => { h = ((h % 360) + 360) % 360; s = clamp(s, 0, 100) / 100; l = clamp(l, 0, 100) / 100; const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return r2h(f(0) * 255, f(8) * 255, f(4) * 255); };
  const hex2hsl = hex => { let [r, g, b] = h2r(hex).map(x => x / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s * 100, l * 100]; };
  const mix = (a, b, t) => { const A = h2r(a), B = h2r(b); return r2h(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); };
  const lum = hex => { const [r, g, b] = h2r(hex).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
  const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  function rng(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  let _id = 0; const uid = () => Date.now().toString(36) + (++_id).toString(36) + Math.random().toString(36).slice(2, 5);
  const store = {
    get(k, d) { try { const v = localStorage.getItem('sf_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('sf_' + k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  function toast(m, ms = 1800) { $$('.toast').forEach(x => x.remove()); const t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), ms); }
  /* Consistent dialog: centred title, bold section headings, centred buttons */
  function dlg(title, body, btns) {
    const o = document.createElement('div'); o.className = 'ov';
    o.innerHTML = `<div class="dlg"><h2>${title}</h2><div class="dbody">${body}</div><div class="bt"></div></div>`;
    const bt = $('.bt', o);
    (btns || [['Close', null, 1]]).forEach(([l, f, pri]) => { const b = document.createElement('button'); b.className = 'btn' + (pri ? ' pri' : ''); b.textContent = l; b.onclick = () => { if (f && f(o) === false) return; o.remove(); }; bt.appendChild(b); });
    document.body.appendChild(o); return o;
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) {
      try { const t = document.createElement('textarea'); t.value = text; t.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(t); t.select(); const ok = document.execCommand('copy'); t.remove(); return ok; } catch (e2) { return false; }
    }
  }
  function download(name, data, type) {
    const blob = data instanceof Blob ? data : new Blob([data], { type: type || 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  const b64 = s => btoa(unescape(encodeURIComponent(s)));
  const unb64 = s => decodeURIComponent(escape(atob(s)));
  const svgURI = svg => 'data:image/svg+xml,' + encodeURIComponent(svg).replace(/'/g, '%27').replace(/"/g, '%22');
  SF.u = { $, $$, esc, clamp, h2r, r2h, rgba, hsl2hex, hex2hsl, mix, lum, contrast, rng, uid, store, toast, dlg, copy, download, b64, unb64, svgURI };
})();
