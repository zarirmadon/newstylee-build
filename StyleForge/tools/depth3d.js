/* StyleForge (working name) — tools/depth3d.js — Copyright (C) 2026 Zarir Madon — GNU GPL v3 or later (see LICENSE) */
(function () {
  const { R, C, S, B } = SF, U = SF.u;
  SF.category('3D & depth', 'Tilt, flip, cube, parallax, extruded text, page fold and floating motion — no 3D software needed');
  /* helper for tools that output full CSS rules (with keyframes): preview uses the very same text */
  const rulesTool = (def) => SF.tool({
    id: def.id, name: def.name, cat: def.cat, p: def.p, learn: def.learn, kind: 'css', presets: def.presets,
    r(p) { const code = def.rules(p); return { css: code, code, html: `<style>${code}</style>${def.html(p)}`, bg: def.bg || '#0f1320' }; }
  });

  SF.cssTool({
    id: 'tilt', name: '3D tilt card', cat: '3D & depth', bg: '#0f1320',
    el: (d, p) => `<div style="perspective:${p.persp}px"><div style="width:230px;height:150px;border-radius:16px;background:linear-gradient(135deg,${p.c1},${p.c2});${d}"></div></div>`,
    learn: 'Perspective makes things nearer look bigger. Rotating a card slightly on X and Y gives an instant 3D tilt, often used on hover.',
    p: [R('rx', 'Tilt up/down', -60, 60, 14, '°'), R('ry', 'Tilt left/right', -60, 60, -22, '°'), R('persp', 'Perspective', 300, 2000, 900, 'px', 10), R('sc', 'Scale', 80, 130, 100, '%', 1, 1), R('sh', 'Shadow', 0, 80, 40, 'px', 1, 1), C('c1', 'Colour 1', '#7c5cff'), C('c2', 'Colour 2', '#ff5c9d')],
    css(p) { return `transform: rotateX(${p.rx}deg) rotateY(${p.ry}deg) scale(${p.sc / 100}); transform-style: preserve-3d; box-shadow: ${-p.ry * .8}px ${p.rx * .8 + p.sh / 2}px ${p.sh}px rgba(0,0,0,.45);`; },
    code: (p, d) => `.tilt-wrap { perspective: ${p.persp}px; }\n.tilt-card { ${d} }`
  });

  rulesTool({
    id: 'flip', name: 'Flip card', cat: '3D & depth',
    learn: 'Two faces back to back, the back one pre-turned 180°. Rotating the parent shows one or the other.',
    p: [R('dur', 'Flip time', .3, 3, 1.2, 's', .1), S('axis', 'Flip axis', ['Y (sideways)', 'X (up/down)'], 'Y (sideways)'), C('c1', 'Front', '#7c5cff'), C('c2', 'Back', '#ff5c9d'), R('rad', 'Roundness', 0, 40, 16, 'px', 1, 1)],
    rules: p => { const a = p.axis[0]; return `.sf-flip { width: 220px; height: 140px; perspective: 800px; }\n.sf-flip-inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform ${p.dur}s; animation: sf-flip-demo ${p.dur * 4}s infinite; }\n.sf-flip:hover .sf-flip-inner { transform: rotate${a}(180deg); }\n.sf-flip-front, .sf-flip-back { position: absolute; inset: 0; backface-visibility: hidden; border-radius: ${p.rad}px; display: grid; place-items: center; font: 700 22px system-ui; color: #fff; }\n.sf-flip-front { background: ${p.c1}; }\n.sf-flip-back { background: ${p.c2}; transform: rotate${a}(180deg); }\n@keyframes sf-flip-demo { 0%, 40% { transform: rotate${a}(0); } 50%, 90% { transform: rotate${a}(180deg); } 100% { transform: rotate${a}(360deg); } }`; },
    html: () => '<div class="sf-flip"><div class="sf-flip-inner"><div class="sf-flip-front">Front</div><div class="sf-flip-back">Back</div></div></div>'
  });

  rulesTool({
    id: 'cube', name: 'Rotating cube', cat: '3D & depth',
    learn: 'Six squares are placed around a centre, each pushed out by half the cube size. Rotating the whole thing spins the cube.',
    p: [R('size', 'Size', 60, 200, 130, 'px'), R('dur', 'Spin time', 2, 30, 9, 's'), C('c1', 'Colour 1', '#7c5cff'), C('c2', 'Colour 2', '#ff5c9d'), C('c3', 'Colour 3', '#35d0ba'), R('op', 'Transparency', 30, 100, 85, '%', 1, 1)],
    rules: p => { const s = p.size, h = s / 2, f = (c, t) => `background: ${U.rgba(c, p.op / 100)}; transform: ${t};`; return `.sf-cube-scene { width: ${s}px; height: ${s}px; perspective: ${s * 5}px; }\n.sf-cube { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; animation: sf-cube-spin ${p.dur}s linear infinite; }\n.sf-cube > div { position: absolute; width: ${s}px; height: ${s}px; border: 1px solid rgba(255,255,255,.35); }\n.sf-cube .f { ${f(p.c1, `translateZ(${h}px)`)} }\n.sf-cube .b { ${f(p.c1, `rotateY(180deg) translateZ(${h}px)`)} }\n.sf-cube .r { ${f(p.c2, `rotateY(90deg) translateZ(${h}px)`)} }\n.sf-cube .l { ${f(p.c2, `rotateY(-90deg) translateZ(${h}px)`)} }\n.sf-cube .t { ${f(p.c3, `rotateX(90deg) translateZ(${h}px)`)} }\n.sf-cube .u { ${f(p.c3, `rotateX(-90deg) translateZ(${h}px)`)} }\n@keyframes sf-cube-spin { from { transform: rotateX(-25deg) rotateY(0); } to { transform: rotateX(-25deg) rotateY(360deg); } }`; },
    html: () => '<div class="sf-cube-scene"><div class="sf-cube"><div class="f"></div><div class="b"></div><div class="r"></div><div class="l"></div><div class="t"></div><div class="u"></div></div></div>'
  });

  rulesTool({
    id: 'parallax', name: 'Parallax layers', cat: '3D & depth', bg: '#1a1240',
    learn: 'Layers that are further away move more slowly. Three bands scrolling at different speeds create depth.',
    p: [R('speed', 'Base loop time', 4, 60, 16, 's'), C('sky1', 'Sky top', '#2b1c6e'), C('sky2', 'Sky bottom', '#ff7ab3'), C('far', 'Far hills', '#4a2f8a'), C('mid', 'Middle hills', '#2f2a74'), C('near', 'Near hills', '#14124a'), R('ht', 'Hill height', 30, 120, 70, 'px', 1, 1)],
    rules: p => { const svg = (c, h, k) => { let d = 'M0,' + h; for (let x = 0; x <= 400; x += 10) d += ` L${x},${(h * .5 + Math.sin(x / 400 * Math.PI * 2 * k) * h * .35 + Math.sin(x / 400 * Math.PI * 6 * k + 1) * h * .12).toFixed(1)}`; d += ` L400,${h} Z`; return U.svgURI(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="${h}" viewBox="0 0 400 ${h}" preserveAspectRatio="none"><path d="M0,${h} L0,${h * .5}${d.slice(d.indexOf(' L'))}" fill="${c}"/></svg>`); }; const h = +p.ht; return `.sf-parallax { position: relative; width: 480px; height: 280px; overflow: hidden; border-radius: 16px; background: linear-gradient(${p.sky1}, ${p.sky2}); }\n.sf-parallax i { position: absolute; left: 0; right: 0; bottom: 0; background-repeat: repeat-x; background-size: 400px 100%; }\n.sf-parallax .l1 { height: ${h * 1.6}px; background-image: url("${svg(p.far, h * 1.6, 1)}"); animation: sf-par ${p.speed * 3}s linear infinite; }\n.sf-parallax .l2 { height: ${h * 1.2}px; background-image: url("${svg(p.mid, h * 1.2, 1.3)}"); animation: sf-par ${p.speed * 1.8}s linear infinite; }\n.sf-parallax .l3 { height: ${h}px; background-image: url("${svg(p.near, h, 1.6)}"); animation: sf-par ${p.speed}s linear infinite; }\n@keyframes sf-par { to { background-position-x: -400px; } }`; },
    html: () => '<div class="sf-parallax"><i class="l1"></i><i class="l2"></i><i class="l3"></i></div>'
  });

  SF.cssTool({
    id: 'extrude', name: 'Extruded 3D text', cat: '3D & depth', bg: '#ffb15c', el: (d, p) => SF.demo.TXT(`color:${p.face};${d}`, 'Depth'),
    learn: 'Dozens of text-shadows, each one pixel further and slightly darker, stack up into a solid block behind the letters.',
    p: [C('face', 'Face colour', '#ffffff'), C('side', 'Side colour', '#d9602a'), R('depth', 'Depth', 2, 60, 22, 'px'), S('dir', 'Direction', ['Down-right', 'Down-left', 'Down', 'Up-right'], 'Down-right'), B('shade', 'Darken with depth', 1), B('floor', 'Soft floor shadow', 1)],
    css(p) { const [dx, dy] = { 'Down-right': [1, 1], 'Down-left': [-1, 1], Down: [0, 1], 'Up-right': [1, -1] }[p.dir], a = []; for (let i = 1; i <= p.depth; i++) a.push(`${dx * i}px ${dy * i}px 0 ${p.shade ? U.mix(p.side, '#000000', i / p.depth * .35) : p.side}`); if (p.floor) a.push(`${dx * p.depth}px ${dy * p.depth + 6}px 24px rgba(0,0,0,.35)`); return `text-shadow: ${a.join(', ')};`; }
  });

  rulesTool({
    id: 'fold', name: 'Page fold corner', cat: '3D & depth', bg: '#e9ecf5',
    learn: 'A folded corner is a small triangle with a gradient (the back of the paper) and a soft shadow, positioned over a clipped corner.',
    p: [C('paper', 'Paper', '#ffffff'), C('back', 'Fold colour', '#d6d9e6'), R('size', 'Fold size', 20, 120, 60, 'px'), S('corner', 'Corner', ['Top-right', 'Bottom-right', 'Bottom-left', 'Top-left'], 'Bottom-right'), R('sh', 'Shadow', 0, 50, 22, '%', 1, 1)],
    rules: p => { const s = p.size, c = p.corner, v = c.startsWith('Top') ? 'top' : 'bottom', h = c.endsWith('right') ? 'right' : 'left'; const clip = { 'Top-right': `polygon(0 0, calc(100% - ${s}px) 0, 100% ${s}px, 100% 100%, 0 100%)`, 'Bottom-right': `polygon(0 0, 100% 0, 100% calc(100% - ${s}px), calc(100% - ${s}px) 100%, 0 100%)`, 'Bottom-left': `polygon(0 0, 100% 0, 100% 100%, ${s}px 100%, 0 calc(100% - ${s}px))`, 'Top-left': `polygon(${s}px 0, 100% 0, 100% 100%, 0 100%, 0 ${s}px)` }[c]; const ang = { 'Top-right': '225deg', 'Bottom-right': '315deg', 'Bottom-left': '45deg', 'Top-left': '135deg' }[c]; return `.sf-fold { position: relative; width: 240px; height: 150px; background: ${p.paper}; clip-path: ${clip}; filter: drop-shadow(0 8px 14px rgba(0,0,0,.2)); }\n.sf-fold::after { content: ""; position: absolute; ${v}: 0; ${h}: 0; width: ${s}px; height: ${s}px; background: linear-gradient(${ang}, ${p.back} 50%, rgba(0,0,0,${p.sh / 100}) 50%, transparent 70%); }`; },
    html: () => '<div class="sf-fold"></div>'
  });

  rulesTool({
    id: 'float', name: 'Floating object', cat: '3D & depth', bg: '#e9ecf5',
    learn: 'An object that gently bobs up and down while its shadow shrinks and fades looks like it is hovering.',
    p: [R('h', 'Float height', 4, 60, 22, 'px'), R('dur', 'Cycle time', 1, 8, 3.2, 's', .1), C('col', 'Object colour', '#7c5cff'), R('rad', 'Roundness', 0, 100, 24, '%', 1, 1), R('tilt', 'Tilt sway', 0, 20, 4, '°', 1, 1)],
    rules: p => `.sf-float { width: 120px; height: 120px; background: ${p.col}; border-radius: ${p.rad}%; animation: sf-bob ${p.dur}s ease-in-out infinite; }\n.sf-float-shadow { width: 120px; height: 16px; margin-top: ${p.h + 26}px; border-radius: 50%; background: rgba(20,24,60,.3); filter: blur(6px); animation: sf-shadow ${p.dur}s ease-in-out infinite; }\n@keyframes sf-bob { 50% { transform: translateY(-${p.h}px) rotate(${p.tilt}deg); } }\n@keyframes sf-shadow { 50% { transform: scale(.72); opacity: .5; } }`,
    html: () => '<div style="position:relative;display:flex;flex-direction:column;align-items:center"><div class="sf-float"></div><div class="sf-float-shadow"></div></div>'
  });
})();
