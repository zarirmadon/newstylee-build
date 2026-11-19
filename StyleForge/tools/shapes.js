/* StyleForge (working name) — tools/shapes.js — Copyright (C) 2026 Zarir Madon — GNU GPL v3 or later (see LICENSE) */
(function () {
  const { R, C, S, B } = SF, U = SF.u;
  SF.category('Shapes', 'Blobs, waves, clip-paths, dividers and polygons');
  const svgRes = (svg, bg) => ({ svg, html: svg, code: svg, bg: bg || '#0f1320' });

  SF.tool({
    id: 'blob', name: 'Blob', cat: 'Shapes', kind: 'svg', learn: 'A blob is a closed curve through random points around a centre. Wobble controls how irregular it is.',
    p: [R('pts', 'Bumps', 3, 12, 7), R('rnd', 'Wobble', 0, 100, 45, '%'), R('seed', 'Shuffle', 1, 999, 42), C('c1', 'Colour', '#ff5c9d'), C('c2', 'Second colour', '#7c5cff'), B('grad', 'Use gradient', 1), C('bg', 'Background', '#14182a', 1)],
    r(p) {
      const n = +p.pts, rn = U.rng(+p.seed), pt = [];
      for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, rr = 150 * (1 - rn() * p.rnd / 100 * .6); pt.push([200 + Math.cos(a) * rr, 200 + Math.sin(a) * rr]); }
      let d = `M${pt[0][0].toFixed(1)},${pt[0][1].toFixed(1)}`;
      for (let i = 0; i < n; i++) { const p0 = pt[(i - 1 + n) % n], p1 = pt[i], p2 = pt[(i + 1) % n], p3 = pt[(i + 2) % n]; d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`; }
      const fill = p.grad ? 'url(#g)' : p.c1;
      return svgRes(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.c1}"/><stop offset="1" stop-color="${p.c2}"/></linearGradient></defs><rect width="400" height="400" fill="${p.bg}"/><path d="${d} Z" fill="${fill}"/></svg>`, p.bg);
    }
  });

  SF.tool({
    id: 'waves', name: 'Layered waves', cat: 'Shapes', kind: 'svg', learn: 'Several sine waves stacked, each a little more opaque than the last, make a clean layered landscape.',
    p: [R('lay', 'Layers', 1, 8, 4), R('amp', 'Height', 10, 140, 50, 'px'), R('fr', 'Ripples', 1, 8, 2), R('seed', 'Shuffle', 1, 999, 7), C('col', 'Wave colour', '#fa7268'), C('bg', 'Background', '#001220')],
    r(p) {
      let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"><rect width="900" height="600" fill="${p.bg}"/>`; const rn = U.rng(+p.seed);
      for (let l = 0; l < p.lay; l++) { const base = 200 + l * (360 / p.lay), ph = rn() * 6; let d = `M0,600 L0,${base}`; for (let x = 0; x <= 900; x += 15) d += ` L${x},${(base + p.amp * Math.sin(x / 900 * p.fr * 6.283 + ph) + p.amp * .4 * Math.sin(x / 900 * p.fr * 13 + ph * 2)).toFixed(1)}`; s += `<path d="${d} L900,600 Z" fill="${p.col}" fill-opacity="${(.25 + .75 * (l + 1) / p.lay).toFixed(2)}"/>`; }
      return svgRes(s + '</svg>', p.bg);
    }
  });

  const POLY = {
    Triangle: '50% 0%, 0% 100%, 100% 100%', Trapezoid: '20% 0%, 80% 0%, 100% 100%, 0% 100%', Rhombus: '50% 0%, 100% 50%, 50% 100%, 0% 50%',
    Pentagon: '50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%', Hexagon: '25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%',
    Octagon: '30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%',
    Star: '50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%',
    Cross: '35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%',
    Arrow: '0% 35%, 60% 35%, 60% 10%, 100% 50%, 60% 90%, 60% 65%, 0% 65%', Chevron: '0% 0%, 70% 0%, 100% 50%, 70% 100%, 0% 100%, 30% 50%',
    Message: '0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%', Ribbon: '0% 0%, 100% 0%, 85% 50%, 100% 100%, 0% 100%'
  };
  SF.cssTool({
    id: 'clip', name: 'Clip-path shape', cat: 'Shapes', bg: '#0f1320', el: d => `<div style="width:230px;height:230px;${d}"></div>`,
    learn: 'clip-path cuts an element into a shape. The polygon() points are percentages across and down.',
    p: [S('shape', 'Shape', Object.keys(POLY), 'Hexagon'), C('c1', 'Colour 1', '#7c5cff'), C('c2', 'Colour 2', '#ff5c9d'), R('angle', 'Fill direction', 0, 360, 135, '°'), R('rot', 'Rotate', 0, 360, 0, '°', 1, 1)],
    css(p) { return `background: linear-gradient(${p.angle}deg, ${p.c1}, ${p.c2}); clip-path: polygon(${POLY[p.shape]});${p.rot ? ` transform: rotate(${p.rot}deg);` : ''}`; }
  });

  SF.cssTool({
    id: 'organic', name: 'Organic corners', cat: 'Shapes', bg: '#0f1320', el: d => `<div style="width:240px;height:240px;${d}"></div>`,
    learn: 'border-radius accepts eight numbers (horizontal and vertical radius for each corner) which makes soft, hand-drawn shapes.',
    p: [R('a', 'Top-left across', 20, 80, 60, '%'), R('b', 'Top-right across', 20, 80, 40, '%'), R('c', 'Bottom-right across', 20, 80, 55, '%'), R('d', 'Bottom-left across', 20, 80, 45, '%'), R('e', 'Top-left down', 20, 80, 55, '%'), R('f', 'Top-right down', 20, 80, 60, '%'), R('g', 'Bottom-right down', 20, 80, 40, '%'), R('h', 'Bottom-left down', 20, 80, 45, '%'), C('c1', 'Colour 1', '#35d0ba'), C('c2', 'Colour 2', '#7c5cff')],
    css(p) { return `background: linear-gradient(135deg, ${p.c1}, ${p.c2}); border-radius: ${p.a}% ${p.b}% ${p.c}% ${p.d}% / ${p.e}% ${p.f}% ${p.g}% ${p.h}%;`; }
  });

  SF.tool({
    id: 'divider', name: 'Section divider', cat: 'Shapes', kind: 'svg', learn: 'Dividers are shaped edges between page sections. They are SVG, so they stay sharp at any size.',
    p: [S('kind', 'Style', ['Wave', 'Curve', 'Tilt', 'Zigzag', 'Triangle', 'Clouds'], 'Wave'), R('h', 'Height', 20, 200, 90, 'px'), C('col', 'Shape colour', '#7c5cff'), C('bg', 'Page colour', '#14182a'), B('flip', 'Flip upside-down', 0), R('rep', 'Repeats', 1, 12, 3, '', 1, 1)],
    r(p) {
      const W = 1200, H = +p.h, n = +p.rep; let d;
      if (p.kind === 'Wave') { d = `M0,${H / 2}`; for (let i = 0; i < n; i++) { const x0 = W / n * i, w = W / n; d += ` C${x0 + w * .25},0 ${x0 + w * .25},0 ${x0 + w * .5},${H / 2} S${x0 + w * .75},${H} ${x0 + w},${H / 2}`; } d += ` L${W},${H} L0,${H} Z`; }
      else if (p.kind === 'Curve') d = `M0,0 Q${W / 2},${H * 2} ${W},0 L${W},${H} L0,${H} Z`;
      else if (p.kind === 'Tilt') d = `M0,${H} L${W},0 L${W},${H} Z`;
      else if (p.kind === 'Zigzag') { d = `M0,${H}`; const sw = W / (n * 4); for (let i = 0; i <= n * 4; i++) d += ` L${i * sw},${i % 2 ? H * .35 : H}`; d += ` L${W},${H} Z`; }
      else if (p.kind === 'Triangle') d = `M0,${H} L${W / 2 - 40},${H} L${W / 2},0 L${W / 2 + 40},${H} L${W},${H} Z`;
      else { d = `M0,${H}`; const cw = W / n; for (let i = 0; i < n; i++) d += ` A${cw / 2},${H * .7} 0 0 1 ${(i + 1) * cw},${H}`; d += ' Z'; }
      const t = p.flip ? ' transform="translate(0,' + H + ') scale(1,-1)"' : '';
      return svgRes(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><rect width="${W}" height="${H}" fill="${p.bg}"/><path d="${d}" fill="${p.col}"${t}/></svg>`, p.bg);
    }
  });

  SF.cssTool({
    id: 'bubble', name: 'Speech bubble', cat: 'Shapes', bg: '#e9ecf5',
    learn: 'A speech bubble is a rounded box with a small triangle (the tail) attached using a pseudo-element.',
    p: [C('col', 'Bubble colour', '#7c5cff'), C('text', 'Text colour', '#ffffff'), R('rad', 'Roundness', 0, 40, 18, 'px'), R('tail', 'Tail size', 6, 40, 18, 'px'), S('pos', 'Tail position', ['Bottom-left', 'Bottom-right', 'Top-left', 'Top-right', 'Left', 'Right'], 'Bottom-left')],
    css(p) { return `.bubble { position: relative; background: ${p.col}; color: ${p.text}; border-radius: ${p.rad}px; padding: 20px 26px; }`; },
    code(p) {
      const t = p.tail, side = { 'Bottom-left': `top:100%;left:24px;border-top-color:${p.col}`, 'Bottom-right': `top:100%;right:24px;border-top-color:${p.col}`, 'Top-left': `bottom:100%;left:24px;border-bottom-color:${p.col}`, 'Top-right': `bottom:100%;right:24px;border-bottom-color:${p.col}`, Left: `right:100%;top:50%;margin-top:-${t}px;border-right-color:${p.col}`, Right: `left:100%;top:50%;margin-top:-${t}px;border-left-color:${p.col}` }[p.pos];
      return `.bubble { position: relative; background: ${p.col}; color: ${p.text}; border-radius: ${p.rad}px; padding: 20px 26px; }\n.bubble::after { content: ""; position: absolute; border: ${t}px solid transparent; ${side.replace(/;/g, '; ')}; }`;
    },
    el(d, p) { return `<style>.sfb{position:relative;font:600 18px system-ui;background:${p.col};color:${p.text};border-radius:${p.rad}px;padding:20px 26px}.sfb::after{content:"";position:absolute;border:${p.tail}px solid transparent;${({ 'Bottom-left': `top:100%;left:24px;border-top-color:${p.col}`, 'Bottom-right': `top:100%;right:24px;border-top-color:${p.col}`, 'Top-left': `bottom:100%;left:24px;border-bottom-color:${p.col}`, 'Top-right': `bottom:100%;right:24px;border-bottom-color:${p.col}`, Left: `right:100%;top:50%;margin-top:-${p.tail}px;border-right-color:${p.col}`, Right: `left:100%;top:50%;margin-top:-${p.tail}px;border-left-color:${p.col}` })[p.pos]}}</style><div class="sfb">Hello there! 👋</div>`; }
  });

  SF.tool({
    id: 'star', name: 'Star & polygon', cat: 'Shapes', kind: 'svg', learn: 'A star is just points alternating between an outer and an inner radius. Set the inner ratio to 100% for a plain polygon.',
    p: [R('n', 'Points', 3, 16, 5), R('inner', 'Inner size', 20, 100, 45, '%'), R('rot', 'Rotate', 0, 360, 0, '°'), R('round', 'Soften corners', 0, 20, 0, 'px', 1, 1), C('c1', 'Colour 1', '#ffb15c'), C('c2', 'Colour 2', '#ff5c9d'), C('bg', 'Background', '#14182a', 1)],
    r(p) {
      const n = +p.n, pts = []; for (let i = 0; i < n * 2; i++) { const rr = i % 2 ? 150 * p.inner / 100 : 150, a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2 + p.rot * Math.PI / 180; pts.push(`${(200 + Math.cos(a) * rr).toFixed(1)},${(200 + Math.sin(a) * rr).toFixed(1)}`); }
      return svgRes(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.c1}"/><stop offset="1" stop-color="${p.c2}"/></linearGradient></defs><rect width="400" height="400" fill="${p.bg}"/><polygon points="${pts.join(' ')}" fill="url(#g)" stroke="url(#g)" stroke-width="${p.round * 2}" stroke-linejoin="round"/></svg>`, p.bg);
    }
  });
})();
