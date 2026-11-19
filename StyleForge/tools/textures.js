/* StyleForge (working name) — tools/textures.js — Copyright (C) 2026 Zarir Madon — GNU GPL v3 or later (see LICENSE) */
(function () {
  const { R, C, S, B } = SF, U = SF.u, { FILL } = SF.demo;
  SF.category('Textures', 'Paper, linen, wood, marble, concrete, brushed metal and grunge, made from maths (no image files)');
  const f1 = n => (+n).toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
  function duo(dark, light) { const [r1, g1, b1] = U.h2r(dark).map(x => x / 255), [r2, g2, b2] = U.h2r(light).map(x => x / 255); return `<feComponentTransfer><feFuncR type="table" tableValues="${f1(r1)} ${f1(r2)}"/><feFuncG type="table" tableValues="${f1(g1)} ${f1(g2)}"/><feFuncB type="table" tableValues="${f1(b1)} ${f1(b2)}"/></feComponentTransfer>`; }
  const gray = '<feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0 1"/>';
  function contrast(c) { const k = c / 100 * 3, i = f1(.5 - .5 * k), t = `slope="${f1(k)}" intercept="${i}"`; return `<feComponentTransfer><feFuncR type="linear" ${t}/><feFuncG type="linear" ${t}/><feFuncB type="linear" ${t}/></feComponentTransfer>`; }
  const base = [R('scale', 'Detail size', 10, 300, 100, '%'), R('con', 'Contrast', 40, 300, 120, '%'), C('dark', 'Dark colour', '#3a2a1c'), C('light', 'Light colour', '#d9c3a0'), R('tile', 'Tile size', 120, 480, 300, 'px', 10, 1)];
  function tex(id, name, learn, pdef, turb) {
    SF.cssTool({
      id, name, cat: 'Textures', el: FILL, learn, p: [...pdef, ...base.map((b, i) => Object.assign({}, b, pdef.find(q => q.k === b.k) ? {} : {}))].filter((p, i, a) => a.findIndex(q => q.k === p.k) === i),
      css(p) {
        const sc = p.scale / 100, T = +p.tile;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${T}" height="${T}"><filter id="t" x="0" y="0" width="100%" height="100%">${turb(p, sc)}${gray}${contrast(p.con)}${p.post ? p.post : ''}${duo(p.dark, p.light)}</filter><rect width="100%" height="100%" filter="url(#t)"/></svg>`;
        return `background-color: ${p.dark}; background-image: url("${U.svgURI(svg)}"); background-size: ${T}px ${T}px;`;
      }
    });
  }
  const col = (d, l) => [C('dark', 'Dark colour', d), C('light', 'Light colour', l)];
  const mk = (extra, d, l, con = 120) => [...extra, ...col(d, l), R('scale', 'Detail size', 10, 300, 100, '%'), R('con', 'Contrast', 40, 300, con, '%'), R('tile', 'Tile size', 120, 480, 300, 'px', 10, 1)];

  tex('tx-paper', 'Paper', 'Fine, even noise at low contrast looks like the fibres of watercolour or cartridge paper.', mk([], '#cdbf9f', '#faf4e6', 230), (p, s) => `<feTurbulence type="fractalNoise" baseFrequency="${f1(.8 / s)}" numOctaves="4" stitchTiles="stitch"/>`);
  tex('tx-linen', 'Linen / fabric', 'Two noise layers stretched in opposite directions cross each other like warp and weft threads.', mk([], '#6b6a68', '#c9c6c0'), (p, s) => `<feTurbulence type="fractalNoise" baseFrequency="${f1(.9 / s)} ${f1(.035 / s)}" numOctaves="2" stitchTiles="stitch" result="a"/><feTurbulence type="fractalNoise" baseFrequency="${f1(.035 / s)} ${f1(.9 / s)}" numOctaves="2" stitchTiles="stitch" result="b"/><feBlend in="a" in2="b" mode="multiply"/>`);
  tex('tx-wood', 'Wood grain', 'Noise stretched very tall in one direction forms long fibres; extra octaves add knots and variation.', mk([R('rings', 'Grain waviness', 1, 12, 4, '', 1)], '#4a2c14', '#c98f56'), (p, s) => `<feTurbulence type="fractalNoise" baseFrequency="${f1(.012 / s)} ${f1((.35 + p.rings * .03) / s)}" numOctaves="3" seed="4" stitchTiles="stitch"/>`);
  tex('tx-marble', 'Marble', 'Turbulence passed through a wavy colour table produces thin veins where the value crosses the same level repeatedly.', mk([R('veins', 'Number of veins', 1, 8, 3, '', 1)], '#2b2b33', '#f4f4f6'), (p, s) => `<feTurbulence type="turbulence" baseFrequency="${f1(.007 / s)} ${f1(.011 / s)}" numOctaves="5" seed="9" stitchTiles="stitch"/><feComponentTransfer><feFuncR type="table" tableValues="${Array.from({ length: p.veins * 2 + 1 }, (_, i) => i % 2 ? 1 : 0).join(' ')}"/><feFuncG type="table" tableValues="${Array.from({ length: p.veins * 2 + 1 }, (_, i) => i % 2 ? 1 : 0).join(' ')}"/><feFuncB type="table" tableValues="${Array.from({ length: p.veins * 2 + 1 }, (_, i) => i % 2 ? 1 : 0).join(' ')}"/></feComponentTransfer>`);
  tex('tx-concrete', 'Concrete', 'Several layers of noise at different scales, mixed to a grey, give that pitted, mottled surface.', mk([], '#5d6166', '#c4c8cd', 200), (p, s) => `<feTurbulence type="fractalNoise" baseFrequency="${f1(.55 / s)}" numOctaves="6" seed="2" stitchTiles="stitch"/>`);
  tex('tx-brushed', 'Brushed metal', 'Noise stretched to be extremely wide and thin looks like fine scratches left by a wire brush.', mk([], '#6a7078', '#d6dbe0'), (p, s) => `<feTurbulence type="fractalNoise" baseFrequency="${f1(.004 / s)} ${f1(.95 / s)}" numOctaves="3" seed="6" stitchTiles="stitch"/>`);
  tex('tx-grunge', 'Grunge speckle', 'High-contrast noise with a hard threshold leaves rough speckles, perfect for distressed overlays.', mk([], '#1a1814', '#ece4d4'), (p, s) => `<feTurbulence type="fractalNoise" baseFrequency="${f1(.045 / s)}" numOctaves="6" seed="12" stitchTiles="stitch"/>`);
})();
