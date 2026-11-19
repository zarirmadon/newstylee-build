/* StyleForge (working name) — tools/type.js — Copyright (C) 2026 Zarir Madon — GNU GPL v3 or later (see LICENSE) */
(function () {
  const { R, C, S, B } = SF, U = SF.u, { TXT } = SF.demo;
  SF.category('Type', 'Gradient, outline and glitch text, text on a path, fluid sizes, scales and font pairings');
  const rulesTool = def => SF.tool({ id: def.id, name: def.name, cat: 'Type', p: def.p, learn: def.learn, kind: 'css', r(p) { const code = def.rules(p); return { css: code, code, html: `<style>${code}</style>${def.html(p)}`, bg: def.bg || '#0f1320' }; } });

  SF.cssTool({
    id: 'text-gradient', name: 'Gradient text', cat: 'Type', el: (d, p) => TXT(d, 'Gradient'),
    learn: 'The gradient is painted as the background, then clipped so it only shows through the letters.',
    p: [C('c1', 'Colour 1', '#7c5cff'), C('c2', 'Colour 2', '#ff5c9d'), C('c3', 'Colour 3', '#ffb15c'), R('angle', 'Direction', 0, 360, 90, '°'), B('three', 'Use 3 colours', 1)],
    css(p) { return `background: linear-gradient(${p.angle}deg, ${p.c1}, ${p.c2}${p.three ? ', ' + p.c3 : ''}); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;`; }
  });

  SF.cssTool({
    id: 'text-outline', name: 'Outline text', cat: 'Type', el: (d, p) => TXT(d, 'Outline'),
    learn: '-webkit-text-stroke draws a line round each letter. Fill can be transparent or a soft colour.',
    p: [C('stroke', 'Outline colour', '#ff5c9d'), R('w', 'Outline width', 1, 12, 3, 'px', .5), C('fill', 'Fill colour', '#ff5c9d'), R('fo', 'Fill strength', 0, 100, 0, '%'), B('shadow', 'Offset echo', 1)],
    css(p) { return `-webkit-text-stroke: ${p.w}px ${p.stroke}; color: ${U.rgba(p.fill, p.fo / 100)};${p.shadow ? ` text-shadow: ${p.w * 2}px ${p.w * 2}px 0 ${U.rgba(p.stroke, .35)};` : ''} paint-order: stroke fill;`; }
  });

  rulesTool({
    id: 'text-glitch', name: 'Glitch text', learn: 'Two coloured copies of the text slide and slice against each other in quick bursts.',
    p: [R('size', 'Text size', 30, 120, 80, 'px'), R('dur', 'Cycle time', .5, 6, 2.4, 's', .1), R('shift', 'Shift distance', 1, 14, 5, 'px'), C('c1', 'Colour A', '#00fff0'), C('c2', 'Colour B', '#ff2f6d'), C('text', 'Text colour', '#ffffff')],
    rules: p => `.sf-glitch { position: relative; font: 900 ${p.size}px/1 system-ui; color: ${p.text}; letter-spacing: 2px; }\n.sf-glitch::before, .sf-glitch::after { content: attr(data-text); position: absolute; inset: 0; }\n.sf-glitch::before { color: ${p.c1}; transform: translate(-${p.shift}px, 0); clip-path: inset(0 0 55% 0); animation: sf-gl1 ${p.dur}s steps(2) infinite; }\n.sf-glitch::after { color: ${p.c2}; transform: translate(${p.shift}px, 0); clip-path: inset(50% 0 0 0); animation: sf-gl2 ${p.dur}s steps(2) infinite; }\n@keyframes sf-gl1 { 0%, 85%, 100% { transform: translate(-${p.shift}px, 0); } 90% { transform: translate(${p.shift}px, -3px); } 95% { transform: translate(-${p.shift * 2}px, 3px); } }\n@keyframes sf-gl2 { 0%, 80%, 100% { transform: translate(${p.shift}px, 0); } 85% { transform: translate(-${p.shift}px, 4px); } 92% { transform: translate(${p.shift * 2}px, -2px); } }\n/* <div class="sf-glitch" data-text="GLITCH">GLITCH</div> */`,
    html: () => '<div class="sf-glitch" data-text="GLITCH">GLITCH</div>'
  });

  const TP = { Arc: 'M20,160 Q200,10 380,160', Wave: 'M10,100 C80,10 120,190 200,100 S320,10 390,100', Circle: 'M200,40 a80,80 0 1,1 -0.01,0', Hill: 'M10,170 C80,170 120,30 200,30 S320,170 390,170', Spiral: 'M200,100 m-5,0 a5,5 0 1,1 10,0 a15,15 0 1,1 -30,0 a30,30 0 1,1 60,0 a50,50 0 1,1 -100,0 a75,75 0 1,1 150,0' };
  SF.tool({
    id: 'text-path', name: 'Text on a path', cat: 'Type', kind: 'svg',
    learn: 'SVG can run text along any curve with <textPath>. The offset slides it along; animate the offset for a scrolling effect.',
    p: [S('path', 'Curve', Object.keys(TP), 'Arc'), S('text', 'Text', ['Curved text looks great', 'Round and round we go', 'Make something beautiful'], 'Curved text looks great'), R('size', 'Text size', 12, 48, 26, 'px'), R('space', 'Letter spacing', 0, 12, 2, 'px', .5), C('c1', 'Colour 1', '#ff5c9d'), C('c2', 'Colour 2', '#7c5cff'), B('anim', 'Slide along (animated)', 0), B('show', 'Show the curve', 0, 1), C('bg', 'Background', '#14182a', 1)],
    r(p) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${p.c1}"/><stop offset="1" stop-color="${p.c2}"/></linearGradient><path id="p" d="${TP[p.path]}"/></defs><rect width="400" height="200" fill="${p.bg}"/>${p.show ? `<use href="#p" fill="none" stroke="#ffffff33"/>` : ''}<text font-family="system-ui,sans-serif" font-weight="800" font-size="${p.size}" letter-spacing="${p.space}" fill="url(#g)"><textPath href="#p" startOffset="${p.anim ? '0%' : '50%'}" ${p.anim ? '' : 'text-anchor="middle"'}>${p.text}${p.anim ? '<animate attributeName="startOffset" from="-30%" to="100%" dur="8s" repeatCount="indefinite"/>' : ''}</textPath></text></svg>`;
      return { svg, html: svg, code: svg, bg: p.bg };
    }
  });

  SF.tool({
    id: 'fluid-type', name: 'Fluid text size', cat: 'Type', kind: 'css',
    learn: 'clamp() lets text grow smoothly between a minimum and maximum size as the screen widens, so you need no breakpoints.',
    p: [R('min', 'Smallest size', 10, 40, 16, 'px'), R('max', 'Largest size', 16, 120, 48, 'px'), R('vmin', 'Smallest at screen width', 280, 700, 360, 'px', 10), R('vmax', 'Largest at screen width', 700, 2000, 1280, 'px', 10), R('view', 'Preview a screen width', 280, 2000, 800, 'px', 10)],
    r(p) {
      const mn = p.min / 16, mx = p.max / 16, slope = (p.max - p.min) / (p.vmax - p.vmin), inter = mn - slope * p.vmin / 16;
      const val = `clamp(${mn.toFixed(3)}rem, ${inter.toFixed(3)}rem + ${(slope * 100).toFixed(3)}vw, ${mx.toFixed(3)}rem)`;
      const cur = U.clamp(p.min + (p.view - p.vmin) * slope, p.min, p.max);
      const css = `font-size: ${val};`;
      return { css, code: css, html: `<div style="text-align:center"><div style="font:800 ${cur}px/1.1 system-ui;color:#fff">Fluid text</div><div style="margin-top:14px;font:12px ui-monospace,monospace;color:#8b93ab">at a ${p.view}px wide screen it is ${cur.toFixed(1)}px</div></div>`, bg: '#0f1320' };
    }
  });

  const RATIOS = { 'Minor second 1.067': 1.067, 'Major second 1.125': 1.125, 'Minor third 1.2': 1.2, 'Major third 1.25': 1.25, 'Perfect fourth 1.333': 1.333, 'Augmented fourth 1.414': 1.414, 'Perfect fifth 1.5': 1.5, 'Golden ratio 1.618': 1.618 };
  SF.tool({
    id: 'type-scale', name: 'Type scale', cat: 'Type', kind: 'css',
    learn: 'A type scale multiplies a base size by the same ratio at each step, so headings and body text feel related.',
    p: [R('base', 'Base size', 12, 24, 16, 'px'), S('ratio', 'Ratio', Object.keys(RATIOS), 'Major third 1.25'), R('up', 'Steps up', 2, 8, 6, '', 1), R('down', 'Steps down', 0, 3, 1, '', 1), C('col', 'Text colour', '#ffffff', 1)],
    r(p) {
      const q = RATIOS[p.ratio], rows = []; for (let i = -p.down; i <= p.up; i++) rows.push([i, p.base * Math.pow(q, i)]);
      const names = i => i === 0 ? 'base' : i > 0 ? (i <= 5 ? ['lg', 'xl', '2xl', '3xl', '4xl'][i - 1] : i + 'x') : 'sm';
      const code = ':root {\n' + rows.map(([i, s]) => `  --text-${names(i)}: ${(s / 16).toFixed(3)}rem; /* ${s.toFixed(1)}px */`).join('\n') + '\n}';
      const html = `<div style="width:420px;color:${p.col};max-height:360px;overflow:hidden">${rows.slice().reverse().map(([i, s]) => `<div style="display:flex;align-items:baseline;gap:12px;line-height:1.15;margin:2px 0"><span style="font:11px ui-monospace,monospace;color:#8b93ab;width:64px;flex:none">${s.toFixed(0)}px</span><span style="font:600 ${Math.min(s, 64)}px system-ui;white-space:nowrap;overflow:hidden">Scale step ${i}</span></div>`).join('')}</div>`;
      return { css: code, code, html, bg: '#0f1320' };
    }
  });

  const PAIRS = { 'Classic serif + sans': ['Georgia, "Times New Roman", serif', 'system-ui, -apple-system, "Segoe UI", sans-serif'], 'Modern geometric': ['"Avenir Next", "Segoe UI", system-ui, sans-serif', 'system-ui, sans-serif'], 'Editorial': ['"Palatino Linotype", Palatino, "Book Antiqua", serif', '"Helvetica Neue", Arial, sans-serif'], 'Tech mono': ['ui-monospace, "SF Mono", Menlo, Consolas, monospace', 'system-ui, sans-serif'], 'Humanist': ['"Gill Sans", "Trebuchet MS", sans-serif', 'Georgia, serif'], 'Bold display': ['Impact, "Arial Black", sans-serif', 'system-ui, sans-serif'] };
  SF.tool({
    id: 'font-pair', name: 'Font pairing', cat: 'Type', kind: 'css',
    learn: 'A heading font and a body font should contrast but not clash. These use fonts already on every device, so there is nothing to download.',
    p: [S('pair', 'Pairing', Object.keys(PAIRS), 'Classic serif + sans'), R('h', 'Heading size', 24, 72, 44, 'px'), R('b', 'Body size', 12, 22, 16, 'px'), R('lh', 'Line height', 1, 2, 1.55, '', .05), R('hw', 'Heading weight', 300, 900, 700, '', 100, 1), C('hc', 'Heading colour', '#ffffff', 1), C('bc', 'Body colour', '#b8bfd6', 1)],
    r(p) {
      const [H, Bd] = PAIRS[p.pair], css = `h1, h2, h3 { font-family: ${H}; font-weight: ${p.hw}; }\nbody { font-family: ${Bd}; font-size: ${p.b}px; line-height: ${p.lh}; }`;
      return { css, code: css, html: `<div style="width:420px"><div style="font:${p.hw} ${p.h}px/1.1 ${H};color:${p.hc}">A heading with presence</div><p style="font:${p.b}px/${p.lh} ${Bd};color:${p.bc};margin:14px 0 0">Good typography is mostly about contrast and rhythm. The heading carries the personality while the body text stays calm and easy to read for a long time.</p></div>`, bg: '#0f1320' };
    }
  });

  SF.tool({
    id: 'text-knockout', name: 'Knockout text over image', cat: 'Type', kind: 'css', usesImage: true,
    learn: 'The picture is the background, clipped to the shape of the letters, so it shows only through the text.',
    p: [R('size', 'Text size', 40, 180, 120, 'px'), R('wt', 'Weight', 400, 900, 900, '', 100), R('ls', 'Letter spacing', -4, 20, 0, 'px'), S('text', 'Text', ['SUNSET', 'WILD', 'FORGE', 'OPEN'], 'SUNSET'), R('stroke', 'Edge outline', 0, 6, 0, 'px', .5, 1)],
    r(p) {
      const d = `font: ${p.wt} ${p.size}px/1 system-ui; letter-spacing: ${p.ls}px; background: ${SF.scene()}; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;${p.stroke ? ` -webkit-text-stroke: ${p.stroke}px rgba(255,255,255,.6);` : ''}`;
      return { css: d, code: d.replace(/background: [^;]*url\([^)]*\)[^;]*;/, 'background: url(your-image.jpg) center / cover;'), html: `<div style="${d}">${p.text}</div>`, bg: '#0f1320' };
    }
  });
})();
