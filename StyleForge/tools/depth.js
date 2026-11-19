/* StyleForge (working name) — tools/depth.js — Copyright (C) 2026 Zarir Madon — GNU GPL v3 or later (see LICENSE) */
(function () {
  const { R, C, S, B } = SF, U = SF.u, { CARD, TXT } = SF.demo;
  SF.category('Depth', 'Shadows, glows and soft or raised surfaces');
  const light = '#eef0f6';

  SF.cssTool({
    id: 'shadow', name: 'Soft shadow', cat: 'Depth', bg: light,
    learn: 'Real shadows are soft and layered. Stacking several faint shadows looks far more natural than one hard one.',
    p: [R('y', 'Lift', 0, 100, 18, 'px'), R('x', 'Sideways', -60, 60, 0, 'px'), R('blur', 'Softness', 0, 160, 40, 'px'), R('op', 'Strength', 0, 70, 22, '%'), C('col', 'Shadow colour', '#1b2240'), R('lay', 'Smoothness (layers)', 1, 8, 4, '', 1, 1), R('spr', 'Spread', -40, 40, 0, 'px', 1, 1)],
    css(p) { const a = []; for (let i = 1; i <= p.lay; i++) { const f = i / p.lay; a.push(`${Math.round(p.x * f)}px ${Math.round(p.y * f)}px ${Math.round(p.blur * f)}px ${Math.round(p.spr * f)}px ${U.rgba(p.col, p.op / 100 / p.lay * 1.6)}`); } return `box-shadow: ${a.join(', ')};`; },
    el: d => CARD(`background:#fff;${d}`)
  });

  SF.cssTool({
    id: 'textshadow', name: 'Text shadow', cat: 'Depth', bg: '#e9ecf5', el: (d, p) => TXT(`color:${p.text};${d}`, 'Shadow'),
    learn: 'Text-shadow adds depth or a glow behind letters. Offsets move it; blur softens it.',
    p: [C('text', 'Text colour', '#2b2f4a'), C('col', 'Shadow colour', '#7c5cff'), R('x', 'Sideways', -30, 30, 4, 'px'), R('y', 'Down', -30, 30, 6, 'px'), R('blur', 'Softness', 0, 40, 10, 'px'), R('op', 'Strength', 0, 100, 60, '%'), R('lay', 'Layers', 1, 5, 2, '', 1, 1)],
    css(p) { const a = []; for (let i = 1; i <= p.lay; i++) a.push(`${p.x * i}px ${p.y * i}px ${p.blur * i}px ${U.rgba(p.col, p.op / 100 / i)}`); return `text-shadow: ${a.join(', ')};`; }
  });

  SF.cssTool({
    id: 'glow', name: 'Glow', cat: 'Depth', bg: '#080a14',
    learn: 'A glow is a shadow with no offset and a bright colour. Layers of different sizes make it feel like real light.',
    p: [C('col', 'Glow colour', '#7c5cff'), R('size', 'Size', 4, 120, 40, 'px'), R('op', 'Brightness', 10, 100, 70, '%'), R('lay', 'Layers', 1, 6, 3, '', 1, 1), B('inset', 'Also glow inside', 1), C('fill', 'Card colour', '#14172b', 1)],
    css(p) { const a = []; for (let i = 1; i <= p.lay; i++) a.push(`0 0 ${Math.round(p.size * i / p.lay)}px ${U.rgba(p.col, p.op / 100)}`); if (p.inset) a.push(`inset 0 0 ${Math.round(p.size / 2)}px ${U.rgba(p.col, p.op / 200)}`); return `box-shadow: ${a.join(', ')}; border: 1px solid ${U.rgba(p.col, .8)};`; },
    el: (d, p) => CARD(`background:${p.fill};${d}`)
  });

  SF.cssTool({
    id: 'neu', name: 'Soft UI (neumorphic)', cat: 'Depth', bg: p => p.bg,
    learn: 'Soft UI makes shapes look pushed out of (or into) the background using one light and one dark shadow of the same colour.',
    p: [C('bg', 'Surface colour', '#e0e5ec'), S('shape', 'Shape', ['Flat', 'Convex', 'Concave', 'Pressed'], 'Flat'), R('dist', 'Distance', 2, 40, 14, 'px'), R('blur', 'Softness', 4, 80, 28, 'px'), R('int', 'Intensity', 5, 40, 18, '%'), R('rad', 'Roundness', 0, 70, 24, 'px', 1, 1)],
    css(p) {
      const hi = U.mix(p.bg, '#ffffff', p.int / 40 + .15), lo = U.mix(p.bg, '#000000', p.int / 100 + .05), d = p.dist, b = p.blur;
      const bgc = p.shape === 'Convex' ? `linear-gradient(145deg, ${U.mix(p.bg, '#ffffff', .25)}, ${U.mix(p.bg, '#000000', .08)})` : p.shape === 'Concave' ? `linear-gradient(145deg, ${U.mix(p.bg, '#000000', .08)}, ${U.mix(p.bg, '#ffffff', .25)})` : p.bg;
      const sh = p.shape === 'Pressed' ? `inset ${d}px ${d}px ${b}px ${lo}, inset -${d}px -${d}px ${b}px ${hi}` : `${d}px ${d}px ${b}px ${lo}, -${d}px -${d}px ${b}px ${hi}`;
      return `background: ${bgc}; border-radius: ${p.rad}px; box-shadow: ${sh};`;
    }
  });

  SF.cssTool({
    id: 'clay', name: 'Clay (puffy 3D)', cat: 'Depth', bg: '#f1ecff',
    learn: 'Claymorphism looks like a puffy toy: a big rounded shape with light inside edges and a soft coloured drop shadow.',
    p: [C('col', 'Clay colour', '#9b7dff'), R('rad', 'Roundness', 10, 80, 40, 'px'), R('puff', 'Puffiness', 4, 30, 14, 'px'), R('drop', 'Drop shadow', 0, 60, 30, 'px'), R('hi', 'Highlight', 10, 90, 55, '%', 1, 1)],
    css(p) { return `background: ${p.col}; border-radius: ${p.rad}px; box-shadow: inset ${p.puff}px ${p.puff}px ${p.puff * 2}px ${U.rgba('#ffffff', p.hi / 100)}, inset -${p.puff}px -${p.puff}px ${p.puff * 2}px ${U.rgba('#000000', .22)}, ${p.drop / 2}px ${p.drop}px ${p.drop * 2}px ${U.rgba(p.col, .45)};`; }
  });

  SF.cssTool({
    id: 'longshadow', name: 'Long shadow', cat: 'Depth', bg: '#ffb15c', el: (d, p) => TXT(`color:${p.text};${d}`, 'Long'),
    learn: 'A long shadow stretches diagonally away from the shape, a classic flat-design effect.',
    p: [C('text', 'Text colour', '#ffffff'), C('col', 'Shadow colour', '#c76b1a'), R('len', 'Length', 5, 150, 60, 'px'), S('dir', 'Direction', ['Down-right', 'Down-left', 'Up-right', 'Up-left'], 'Down-right'), B('fade', 'Fade out', 1)],
    css(p) { const sx = p.dir.includes('right') ? 1 : -1, sy = p.dir.includes('Down') ? 1 : -1, a = []; for (let i = 1; i <= p.len; i++) a.push(`${i * sx}px ${i * sy}px 0 ${p.fade ? U.rgba(p.col, 1 - i / (p.len * 1.15)) : p.col}`); return `text-shadow: ${a.join(', ')};`; }
  });
})();
