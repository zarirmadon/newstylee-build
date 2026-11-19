/*
 * StyleForge (working name) — ui/icons.js : filled gradient glyphs with a thin darker same-hue outline
 * Copyright (C) 2026 Zarir Madon — GNU GPL v3 or later (see LICENSE)
 */
(function () {
  const U = SF.u;
  const HUES = { purple: '#7c5cff', pink: '#ff5c9d', teal: '#35d0ba', amber: '#ffb15c', blue: '#4aa8ff', green: '#6bd968', red: '#ff6b81' };
  const gear = (() => { let d = ''; const n = 8; for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2 - Math.PI / 16, r = i % 2 ? 9.5 : 13.5, a2 = a + (i % 2 ? 0 : 0); d += (i ? 'L' : 'M') + (16 + Math.cos(a2) * r).toFixed(2) + ' ' + (16 + Math.sin(a2) * r).toFixed(2); } return d + 'Z M16 11a5 5 0 100 10 5 5 0 000-10z'; })();
  const G = {
    make: 'M16 3l3.2 8.3L28 14.5l-8.8 3.2L16 27l-3.2-9.3L4 14.5l8.8-3.2z',
    grab: 'M13 3h6v10h5l-8 9-8-9h5z M4 24h24v5H4z',
    folder: 'M3 8a3 3 0 013-3h7l3 3h10a3 3 0 013 3v13a3 3 0 01-3 3H6a3 3 0 01-3-3z',
    file: 'M7 3h12l7 7v16a3 3 0 01-3 3H7a3 3 0 01-3-3V6a3 3 0 013-3z',
    styles: 'M16 3C8 3 3 9 3 16s5 13 12 13c3 0 3-2 2-4s0-4 3-4h4c4 0 7-2 7-6 0-8-6-12-15-12z',
    build: 'M4 4h11v11H4z M17 4h11v7H17z M17 13h11v15H17z M4 17h11v11H4z',
    sync: 'M9 26a6 6 0 01-.7-12A8 8 0 0123.600 12 6.500 6.500 0 0124 26z',
    gear,
    dice: 'M7 4h18a3 3 0 013 3v18a3 3 0 01-3 3H7a3 3 0 01-3-3V7a3 3 0 013-3z M10.500 8.500a2 2 0 100 4 2 2 0 000-4z M21.500 8.500a2 2 0 100 4 2 2 0 000-4z M16 14a2 2 0 100 4 2 2 0 000-4z M10.500 19.500a2 2 0 100 4 2 2 0 000-4z M21.500 19.500a2 2 0 100 4 2 2 0 000-4z',
    undo: 'M12 6L3 14l9 8v-5c6 0 9 2 12 8 0-9-4-15-12-15z',
    redo: 'M20 6l9 8-9 8v-5c-6 0-9 2-12 8 0-9 4-15 12-15z',
    save: 'M7 3h18v26l-9-6-9 6z',
    copy: 'M11 3h16v18H11z M5 9h4v14h12v4H5z',
    out: 'M16 3l9 9h-5v9h-8v-9H7z M5 25h22v4H5z',
    ai: 'M13 4l2.400 6.600L22 13l-6.600 2.400L13 22l-2.400-6.600L4 13l6.600-2.400z M24 16l1.400 3.600L29 21l-3.600 1.400L24 26l-1.400-3.600L19 21l3.600-1.400z',
    info: 'M16 3a13 13 0 100 26 13 13 0 000-26z M14.500 13h3v9h-3z M14.500 9h3v3h-3z',
    layers: 'M16 3l14 8-14 8L2 11z M4 16.500l12 7 12-7 2 3-14 8-14-8z',
    shape: 'M16 3c6 0 13 5 13 12 0 8-7 14-14 14C8 29 3 23 3 16 3 8 9 3 16 3z',
    grid: 'M4 4h10v10H4z M18 4h10v10H18z M4 18h10v10H4z M18 18h10v10H18z',
    sun: 'M16 9a7 7 0 100 14 7 7 0 000-14z M15 1h2v5h-2z M15 26h2v5h-2z M1 15h5v2H1z M26 15h5v2h-5z',
    drop: 'M16 3C11 11 6 15 6 20a10 10 0 0020 0c0-5-5-9-10-17z',
    wave: 'M2 12c4-6 8-6 12 0s8 6 12 0l4 4c-4 6-8 6-12 0s-8-6-12 0z M2 22c4-6 8-6 12 0s8 6 12 0v4c-4 6-8 6-12 0s-8-6-12 0z',
    cube: 'M16 2l12 7v14l-12 7L4 23V9z',
    text: 'M5 5h22v6h-2V8h-7v17h3v3H11v-3h3V8H7v3H5z',
    rows: 'M4 5h24v6H4z M4 13h24v6H4z M4 21h24v6H4z',
    ctl: 'M3 9a6 6 0 016-6h14a6 6 0 010 12H9a6 6 0 01-6-6z M3 23a6 6 0 016-6h14a6 6 0 010 12H9a6 6 0 01-6-6z',
    play: 'M8 4l20 12L8 28z',
    pic: 'M4 5h24a1 1 0 011 1v20a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z M9 10a3 3 0 100 6 3 3 0 000-6z M5 25l8-9 5 5 4-4 6 8z',
    trash: 'M10 4h12v3h6v3H4V7h6z M6 12h20l-2 17H8z',
    plus: 'M13 4h6v9h9v6h-9v9h-6v-9H4v-6h9z',
    cloudup: 'M9 26a6 6 0 01-.7-12A8 8 0 0123.600 12 6.500 6.500 0 0124 26z',
    eye: 'M16 7C9 7 4 12 2 16c2 4 7 9 14 9s12-5 14-9c-2-4-7-9-14-9z M16 12a4 4 0 100 8 4 4 0 000-8z'
  };
  const CATI = { 'Colour': ['styles', 'pink'], 'Depth': ['layers', 'blue'], 'Surfaces': ['cube', 'purple'], 'Shapes': ['shape', 'teal'], 'Backgrounds': ['grid', 'amber'], 'Filters': ['pic', 'green'], 'SVG effects': ['make', 'pink'], 'Light & glow': ['sun', 'amber'], 'Shader effects': ['play', 'purple'], 'Generative': ['wave', 'teal'], '3D & depth': ['cube', 'blue'], 'Motion': ['play', 'pink'], 'Textures': ['grid', 'green'], 'Type': ['text', 'purple'], 'Layout': ['rows', 'blue'], 'Controls': ['ctl', 'teal'], 'Assets': ['pic', 'amber'] };
  SF.catIcon = c => { const i = CATI[c] || ['make', 'purple']; return SF.ic(i[0], i[1]); };
  SF.ic = (name, hue = 'purple', cls = '') => {
    const base = HUES[hue] || hue, dark = U.mix(base, '#000000', .42);
    return `<svg class="${cls}" viewBox="0 0 32 32" aria-hidden="true"><path d="${G[name] || G.make}" fill="url(#sfg-${hue})" stroke="${dark}" stroke-width=".45" stroke-linejoin="round" fill-rule="evenodd"/></svg>`;
  };
  SF.iconSprite = () => {
    let s = '<svg width="0" height="0" style="position:absolute"><defs>';
    for (const k in HUES) s += `<linearGradient id="sfg-${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${U.mix(HUES[k], '#ffffff', .22)}"/><stop offset="1" stop-color="${HUES[k]}"/></linearGradient>`;
    const d = document.createElement('div'); d.innerHTML = s + '</defs></svg>'; document.body.appendChild(d.firstChild);
  };
})();
