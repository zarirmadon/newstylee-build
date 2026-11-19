/* StyleForge (working name) — tools/surfaces.js — Copyright (C) 2026 Zarir Madon — GNU GPL v3 or later (see LICENSE) */
(function () {
  const { R, C, S, B } = SF, U = SF.u, { CARD, BTN } = SF.demo;
  SF.category('Surfaces', 'Glass, metal, foil, borders and bevels');
  const blobsBg = 'radial-gradient(circle at 25% 30%,#ff5c9d 0 22%,transparent 23%),radial-gradient(circle at 75% 70%,#5cc8ff 0 25%,transparent 26%),linear-gradient(135deg,#3a2a7a,#18123a)';

  SF.cssTool({
    id: 'glass', name: 'Glass', cat: 'Surfaces', bg: blobsBg, el: d => CARD(d),
    learn: 'Glassmorphism blurs whatever is behind a see-through panel, like frosted glass. It needs something colourful behind it to shine.',
    p: [R('blur', 'Frost', 0, 40, 12, 'px'), R('op', 'Clarity', 2, 70, 22, '%'), R('rad', 'Roundness', 0, 50, 18, 'px'), R('bo', 'Edge shine', 0, 90, 35, '%', 1, 1), R('sat', 'Colour boost', 80, 220, 140, '%', 1, 1), C('tint', 'Tint', '#ffffff', 1)],
    css(p) { return `background: ${U.rgba(p.tint, p.op / 100)}; backdrop-filter: blur(${p.blur}px) saturate(${p.sat}%); -webkit-backdrop-filter: blur(${p.blur}px) saturate(${p.sat}%); border: 1px solid ${U.rgba('#ffffff', p.bo / 100)}; border-radius: ${p.rad}px; box-shadow: 0 8px 32px rgba(0,0,0,.25);`; }
  });

  SF.cssTool({
    id: 'gradborder', name: 'Gradient border', cat: 'Surfaces', bg: '#0f1320',
    learn: 'CSS borders cannot be gradients directly. The trick is two backgrounds: the inside colour clipped to the padding, and a gradient clipped to the border area.',
    p: [C('c1', 'Colour 1', '#7c5cff'), C('c2', 'Colour 2', '#ff5c9d'), R('angle', 'Direction', 0, 360, 135, '°'), R('w', 'Thickness', 1, 16, 4, 'px'), R('rad', 'Roundness', 0, 60, 20, 'px'), C('inner', 'Inside colour', '#14182a')],
    css(p) { return `border: ${p.w}px solid transparent; border-radius: ${p.rad}px; background: linear-gradient(${p.inner}, ${p.inner}) padding-box, linear-gradient(${p.angle}deg, ${p.c1}, ${p.c2}) border-box;`; }
  });

  SF.cssTool({
    id: 'ring', name: 'Ring & outline', cat: 'Surfaces', bg: '#0f1320',
    learn: 'Rings are focus outlines and halo borders. A ring made with box-shadow follows rounded corners and can be layered.',
    p: [C('c1', 'Inner ring', '#7c5cff'), C('c2', 'Outer ring', '#ff5c9d'), R('w1', 'Inner width', 0, 14, 3, 'px'), R('gap', 'Gap', 0, 20, 5, 'px'), R('w2', 'Outer width', 0, 14, 3, 'px'), R('rad', 'Roundness', 0, 60, 18, 'px'), C('fill', 'Fill', '#1c2233', 1)],
    css(p) { return `background: ${p.fill}; border-radius: ${p.rad}px; box-shadow: 0 0 0 ${p.w1}px ${p.c1}, 0 0 0 ${+p.w1 + +p.gap}px ${p.fill}, 0 0 0 ${+p.w1 + +p.gap + +p.w2}px ${p.c2};`; }
  });

  const METALS = {
    Chrome: ['#f7f7f8', '#8a8f98', '#ffffff', '#6b7078', '#eceef1', '#9aa0a8'],
    Gold: ['#7a5c12', '#f6e27a', '#b8860b', '#fff2a8', '#a67c00', '#e6c35c'],
    Silver: ['#d9dde2', '#8e949c', '#f5f7fa', '#9aa1a9', '#e1e5ea', '#a9afb6'],
    Copper: ['#6e2f14', '#e9967a', '#b5562c', '#ffcfb0', '#9b4723', '#d98a63'],
    'Rose gold': ['#8a5a55', '#f4c6bf', '#c98b84', '#ffe6e0', '#b5736c', '#e8b1a9']
  };
  SF.cssTool({
    id: 'metal', name: 'Metal', cat: 'Surfaces', bg: '#10131f',
    learn: 'Metal is mostly bright and dark bands that mimic reflections. Brushed metal adds fine lines on top.',
    p: [S('kind', 'Metal', Object.keys(METALS), 'Gold'), R('angle', 'Light angle', 0, 360, 135, '°'), B('brush', 'Brushed lines', 1), R('rad', 'Roundness', 0, 60, 20, 'px', 1, 1)],
    css(p) { const m = METALS[p.kind], st = m.map((c, i) => `${c} ${Math.round(i / (m.length - 1) * 100)}%`).join(', '); return `background: ${p.brush ? 'repeating-linear-gradient(90deg, rgba(255,255,255,.07) 0 1px, rgba(0,0,0,.05) 1px 3px), ' : ''}linear-gradient(${p.angle}deg, ${st}); border-radius: ${p.rad}px; box-shadow: inset 0 1px 0 rgba(255,255,255,.6), 0 10px 30px rgba(0,0,0,.45);`; }
  });

  SF.cssTool({
    id: 'holo', name: 'Holographic foil', cat: 'Surfaces', bg: '#0f1320',
    learn: 'Holographic foil shifts hue as the angle changes. A conic rainbow with a soft light sweep over it fakes that shimmer.',
    p: [R('hue', 'Hue shift', 0, 360, 0, '°'), R('sat', 'Saturation', 30, 100, 80, '%'), R('shine', 'Shine', 0, 80, 35, '%'), R('angle', 'Shine angle', 0, 360, 115, '°', 1, 1), R('rad', 'Roundness', 0, 60, 20, 'px', 1, 1)],
    css(p) { const stops = [0, 60, 120, 180, 240, 300, 360].map(h => U.hsl2hex(h + +p.hue, p.sat, 62)).join(', '); return `background: linear-gradient(${p.angle}deg, transparent 20%, ${U.rgba('#ffffff', p.shine / 100)} 45%, transparent 70%), conic-gradient(from ${p.hue}deg at 30% 30%, ${stops}); border-radius: ${p.rad}px; box-shadow: 0 10px 30px rgba(0,0,0,.4);`; }
  });

  SF.cssTool({
    id: 'bevel', name: 'Bevel button', cat: 'Surfaces', bg: '#e9ecf5', el: d => `<button style="border:0;padding:16px 38px;font:700 20px system-ui;color:#fff;${d}">Press me</button>`,
    learn: 'A bevel uses a light inner edge on top and a dark one at the bottom so a flat shape looks raised.',
    p: [C('col', 'Button colour', '#7c5cff'), R('rad', 'Roundness', 0, 40, 14, 'px'), R('bevel', 'Bevel depth', 1, 10, 3, 'px'), R('drop', 'Drop shadow', 0, 30, 10, 'px'), B('grad', 'Top-to-bottom shade', 1)],
    css(p) { const top = U.mix(p.col, '#ffffff', .18), bot = U.mix(p.col, '#000000', .18); return `background: ${p.grad ? `linear-gradient(180deg, ${top}, ${bot})` : p.col}; border-radius: ${p.rad}px; box-shadow: inset 0 ${p.bevel}px 0 rgba(255,255,255,.4), inset 0 -${p.bevel}px 0 rgba(0,0,0,.25), 0 ${p.drop}px ${p.drop * 2}px ${U.rgba(p.col, .45)};`; }
  });

  SF.cssTool({
    id: 'frost', name: 'Frosted panel', cat: 'Surfaces', bg: 'linear-gradient(135deg,#ffb15c,#ff5c9d 50%,#5c9dff)', el: d => `<div style="width:260px;height:120px;display:grid;place-items:center;color:#fff;font:600 20px system-ui;${d}">Frosted panel</div>`,
    learn: 'A heavier, tinted cousin of glass, good for navigation bars and modals.',
    p: [C('tint', 'Tint colour', '#0f1320'), R('op', 'Tint strength', 10, 90, 45, '%'), R('blur', 'Frost', 4, 60, 24, 'px'), R('rad', 'Roundness', 0, 40, 16, 'px', 1, 1)],
    css(p) { return `background: ${U.rgba(p.tint, p.op / 100)}; backdrop-filter: blur(${p.blur}px) saturate(160%); -webkit-backdrop-filter: blur(${p.blur}px) saturate(160%); border-radius: ${p.rad}px; border: 1px solid rgba(255,255,255,.18);`; }
  });
})();
