/* StyleForge (working name) — tools/glow.js — Copyright (C) 2026 Zarir Madon — GNU GPL v3 or later (see LICENSE) */
(function () {
  const { R, C, S, B } = SF, U = SF.u, { TXT } = SF.demo;
  SF.category('Light & glow', 'Neon, bloom, lens flare, light rays, aurora and bubbles');

  SF.cssTool({
    id: 'neon', name: 'Neon sign', cat: 'Light & glow', bg: '#05060d',
    learn: 'Neon is white-hot text with several layers of coloured glow behind it, from tight to very wide.',
    p: [C('col', 'Neon colour', '#ff2fb3'), C('core', 'Core colour', '#ffffff'), R('size', 'Glow size', 4, 100, 30, 'px'), R('lay', 'Layers', 2, 8, 5, '', 1, 1), B('flick', 'Flicker (animated)', 0)],
    css(p) { const a = []; for (let i = 1; i <= p.lay; i++) a.push(`0 0 ${Math.round(p.size * i / p.lay)}px ${p.col}`); return `color: ${p.core}; text-shadow: ${a.join(', ')};`; },
    code(p, d) { return p.flick ? `${d}\nanimation: neon-flicker 3s infinite;\n\n@keyframes neon-flicker {\n  0%, 18%, 22%, 62%, 64%, 100% { opacity: 1; }\n  20%, 63% { opacity: .55; }\n}` : d; },
    style: p => p.flick ? '@keyframes neon-flicker{0%,18%,22%,62%,64%,100%{opacity:1}20%,63%{opacity:.55}}' : '',
    el: (d, p) => `<div style="font:800 96px/1 system-ui;letter-spacing:4px;${d}${p.flick ? 'animation:neon-flicker 3s infinite;' : ''}">NEON</div>`
  });

  SF.cssTool({
    id: 'bloom', name: 'Bloom glow', cat: 'Light & glow', bg: '#05060d',
    learn: 'Bloom is the soft halo bright things throw in photos. drop-shadow layers in the same colour as the object fake it.',
    p: [C('col', 'Light colour', '#6ae0ff'), R('size', 'Spread', 5, 120, 40, 'px'), R('op', 'Brightness', 10, 100, 80, '%'), R('lay', 'Layers', 1, 5, 3, '', 1, 1), C('obj', 'Object colour', '#ffffff')],
    css(p) { const a = []; for (let i = 1; i <= p.lay; i++) a.push(`drop-shadow(0 0 ${Math.round(p.size * i / p.lay)}px ${U.rgba(p.col, p.op / 100)})`); return `filter: ${a.join(' ')};`; },
    el: (d, p) => `<div style="width:90px;height:90px;border-radius:50%;background:${p.obj};${d}"></div>`
  });

  SF.cssTool({
    id: 'flare', name: 'Lens flare', cat: 'Light & glow', bg: '#05060d', el: SF.demo.FILL,
    learn: 'A lens flare is a bright core, a wide soft halo and a few coloured streaks and discs. Stacked radial gradients do it all.',
    p: [R('x', 'Light across', 0, 100, 35, '%'), R('y', 'Light down', 0, 100, 35, '%'), C('col', 'Flare colour', '#ffd36b'), R('size', 'Halo size', 10, 80, 38, '%'), R('streak', 'Streak', 0, 100, 60, '%'), B('discs', 'Ghost discs', 1)],
    css(p) { const x = p.x, y = p.y, ox = 100 - x, oy = 100 - y, L = [`radial-gradient(circle at ${x}% ${y}%, #fff 0, ${U.rgba(p.col, .9)} 2%, ${U.rgba(p.col, .35)} ${p.size / 3}%, transparent ${p.size}%)`]; if (p.discs) { L.push(`radial-gradient(circle at ${(x + ox) / 2 + (ox - x) * .1}% ${(y + oy) / 2}%, ${U.rgba('#ff5c9d', .35)} 0, transparent 7%)`, `radial-gradient(circle at ${ox - (ox - x) * .1}% ${oy}%, ${U.rgba('#5cc8ff', .35)} 0, transparent 12%)`); } L.push(`linear-gradient(90deg, transparent, ${U.rgba(p.col, p.streak / 300)} ${x}%, transparent) ${x}% ${y}% / 100% 3px no-repeat`); return `background: ${L.join(', ')}, #05060d;`; }
  });

  SF.cssTool({
    id: 'rays', name: 'Light rays', cat: 'Light & glow', bg: '#0b0d1c', el: SF.demo.FILL,
    learn: 'A repeating conic gradient makes beams that fan out from one point, softened with a fade.',
    p: [C('col', 'Ray colour', '#ffe9a8'), R('n', 'Number of rays', 3, 40, 14), R('width', 'Ray width', 5, 90, 35, '%'), R('op', 'Strength', 5, 100, 45, '%'), R('x', 'Source across', 0, 100, 50, '%', 1, 1), R('y', 'Source down', -20, 100, 0, '%', 1, 1), R('fade', 'Fade distance', 30, 150, 90, '%', 1, 1)],
    css(p) { const seg = 360 / p.n, on = seg * p.width / 100; return `background: radial-gradient(circle at ${p.x}% ${p.y}%, transparent 0, #0b0d1c ${p.fade}%), repeating-conic-gradient(from 0deg at ${p.x}% ${p.y}%, ${U.rgba(p.col, p.op / 100)} 0deg ${on}deg, transparent ${on}deg ${seg}deg), #0b0d1c;`; }
  });

  SF.tool({
    id: 'aurora', name: 'Aurora (animated)', cat: 'Light & glow', kind: 'css',
    learn: 'Large blurred colour blobs drift slowly over each other, which creates a northern-lights style background without any script.',
    p: [C('c1', 'Colour 1', '#35d0ba'), C('c2', 'Colour 2', '#7c5cff'), C('c3', 'Colour 3', '#ff5c9d'), C('bg', 'Sky', '#070a18'), R('blur', 'Softness', 20, 140, 70, 'px'), R('speed', 'Loop time', 4, 40, 14, 's')],
    r(p) {
      const css = `.aurora { position: relative; overflow: hidden; background: ${p.bg}; }\n.aurora i { position: absolute; width: 55%; height: 55%; border-radius: 50%; filter: blur(${p.blur}px); opacity: .75; animation: drift ${p.speed}s ease-in-out infinite alternate; }\n.aurora i:nth-child(1) { background: ${p.c1}; left: -5%; top: 5%; }\n.aurora i:nth-child(2) { background: ${p.c2}; right: -5%; top: 25%; animation-delay: -${p.speed / 3}s; }\n.aurora i:nth-child(3) { background: ${p.c3}; left: 25%; bottom: -15%; animation-delay: -${p.speed * 2 / 3}s; }\n@keyframes drift { to { transform: translate(14%, -12%) scale(1.25) rotate(25deg); } }`;
      const html = `<style>${css.replace(/\.aurora/g, '.sfa')}</style><div class="sfa" style="position:absolute;inset:0"><i></i><i></i><i></i></div>`;
      return { css, code: css, html, bg: p.bg };
    }
  });

  SF.cssTool({
    id: 'soapbubble', name: 'Soap-bubble sheen', cat: 'Light & glow', bg: '#12163a', el: d => `<div style="width:220px;height:220px;border-radius:50%;${d}"></div>`,
    learn: 'A thin film of soap shows swirling rainbow colours. A faint conic rainbow, a highlight and a rim light sell the effect.',
    p: [R('hue', 'Hue shift', 0, 360, 0, '°'), R('op', 'Transparency', 10, 90, 55, '%'), R('shine', 'Highlight', 0, 100, 80, '%'), R('rim', 'Rim light', 0, 100, 60, '%', 1, 1)],
    css(p) { const rb = [0, 60, 120, 180, 240, 300, 360].map(h => U.hsl2hex(h + +p.hue, 90, 70)).join(', '); return `background: radial-gradient(circle at 30% 28%, rgba(255,255,255,${p.shine / 100}) 0, transparent 22%), radial-gradient(circle at 50% 50%, transparent 58%, rgba(255,255,255,${p.rim / 200}) 74%, rgba(255,255,255,${p.rim / 100}) 80%, transparent 82%), conic-gradient(from ${p.hue}deg, ${rb}); opacity: ${p.op / 100 + .25 > 1 ? 1 : p.op / 100 + .25}; box-shadow: inset 0 0 40px rgba(255,255,255,.35);`; }
  });
})();
