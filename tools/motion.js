/* StyleForge (working name) — tools/motion.js — Copyright (C) 2026 Zarir Madon — GNU GPL v3 or later (see LICENSE) */
(function () {
  const { R, C, S, B, X } = SF, U = SF.u;
  SF.category('Motion', 'Easing, keyframes, loaders, typing, scroll reveals, path drawing, morphing and confetti');
  const rulesTool = def => SF.tool({
    id: def.id, name: def.name, cat: 'Motion', p: def.p, learn: def.learn, kind: 'css',
    r(p) { const code = def.rules(p); return { css: code, code, html: `<style>${code}</style>${def.html(p)}`, bg: def.bg || '#0f1320' }; }
  });
  const ball = 'width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,#7c5cff,#ff5c9d)';

  SF.tool({
    id: 'easing', name: 'Easing curve', cat: 'Motion', kind: 'css', anim: true,
    learn: 'Easing decides how an animation speeds up and slows down. The curve plots progress (up) against time (across).',
    p: [R('x1', 'Start pull', 0, 1, .17, '', .01), R('y1', 'Start lift', -.6, 1.6, .67, '', .01), R('x2', 'End pull', 0, 1, .83, '', .01), R('y2', 'End lift', -.6, 1.6, .67, '', .01), R('dur', 'Duration', .2, 4, 1.2, 's', .1)],
    r(p) {
      const cb = `cubic-bezier(${p.x1}, ${p.y1}, ${p.x2}, ${p.y2})`, d = `transition: transform ${p.dur}s ${cb};`;
      const html = `<style>.sf-er{position:relative;width:78%;height:60px}.sf-er i{position:absolute;left:0;top:2px;${ball};animation:sf-erun ${p.dur * 2 + .8}s ${cb} infinite}@keyframes sf-erun{0%,12%{left:0}50%,62%{left:calc(100% - 56px)}100%{left:0}}</style><div style="width:80%;text-align:center"><div class="sf-er"><i></i></div><svg viewBox="-10 -30 120 160" style="width:150px;margin-top:10px"><path d="M0,100H100V0" fill="none" stroke="#2a3248"/><path d="M0,100 C${p.x1 * 100},${100 - p.y1 * 100} ${p.x2 * 100},${100 - p.y2 * 100} 100,0" fill="none" stroke="#ff5c9d" stroke-width="3"/></svg></div>`;
      return { css: d, code: `${d}\n/* or as an animation timing-function: */\nanimation-timing-function: ${cb};`, html, bg: '#0f1320' };
    }
  });

  const KF = {
    Bounce: '0%,20%,53%,100%{transform:translateY(0)}40%,43%{transform:translateY(-30px)}70%{transform:translateY(-15px)}90%{transform:translateY(-4px)}',
    Pulse: '0%,100%{transform:scale(1)}50%{transform:scale(1.12)}',
    Shake: '0%,100%{transform:translateX(0)}15%,45%,75%{transform:translateX(-10px)}30%,60%,90%{transform:translateX(10px)}',
    Swing: '20%{transform:rotate(15deg)}40%{transform:rotate(-10deg)}60%{transform:rotate(5deg)}80%{transform:rotate(-5deg)}100%{transform:rotate(0)}',
    Jello: '0%,100%{transform:none}22%{transform:skewX(-12deg) skewY(-12deg)}33%{transform:skewX(6deg) skewY(6deg)}44%{transform:skewX(-3deg) skewY(-3deg)}',
    Heartbeat: '0%,100%{transform:scale(1)}14%{transform:scale(1.25)}28%{transform:scale(1)}42%{transform:scale(1.25)}70%{transform:scale(1)}',
    Tada: '0%{transform:scale(1)}10%,20%{transform:scale(.9) rotate(-3deg)}30%,50%,70%,90%{transform:scale(1.1) rotate(3deg)}40%,60%,80%{transform:scale(1.1) rotate(-3deg)}100%{transform:scale(1) rotate(0)}',
    Wobble: '0%,100%{transform:none}15%{transform:translateX(-25%) rotate(-5deg)}30%{transform:translateX(20%) rotate(3deg)}45%{transform:translateX(-15%) rotate(-3deg)}60%{transform:translateX(10%) rotate(2deg)}75%{transform:translateX(-5%) rotate(-1deg)}',
    'Fade up': '0%{opacity:0;transform:translateY(30px)}100%{opacity:1;transform:none}',
    'Zoom in': '0%{opacity:0;transform:scale(.3)}60%{opacity:1;transform:scale(1.08)}100%{transform:scale(1)}',
    'Spin': '0%{transform:rotate(0)}100%{transform:rotate(360deg)}',
    'Slide in': '0%{opacity:0;transform:translateX(-80px)}100%{opacity:1;transform:none}'
  };
  rulesTool({
    id: 'keyframes', name: 'Ready-made animations', learn: 'Keyframes describe the steps of an animation. These are twelve classic ones; change the timing to make each feel different.',
    p: [S('kind', 'Animation', Object.keys(KF), 'Bounce'), R('dur', 'Duration', .2, 4, 1.2, 's', .1), R('delay', 'Pause between', 0, 3, .6, 's', .1), S('ease', 'Timing', ['ease', 'ease-in-out', 'linear', 'ease-out', 'cubic-bezier(.34,1.56,.64,1)'], 'ease-in-out'), C('c1', 'Colour 1', '#7c5cff'), C('c2', 'Colour 2', '#ff5c9d')],
    rules: p => { const n = 'sf-' + p.kind.toLowerCase().replace(/\s+/g, '-'), tot = +p.dur + +p.delay; const pct = +p.dur / tot * 100; const body = KF[p.kind].replace(/(\d+)%/g, (m, a) => (a * pct / 100).toFixed(1) + '%'); return `.sf-anim { width: 56px; height: 56px; border-radius: 14px; background: linear-gradient(135deg, ${p.c1}, ${p.c2}); animation: ${n} ${tot}s ${p.ease} infinite; }\n@keyframes ${n} { ${body} }`; },
    html: () => '<div class="sf-anim"></div>'
  });

  const LOAD = {
    Spinner: p => ({ html: '<div class="sf-ld"></div>', css: `.sf-ld { width: ${p.size}px; height: ${p.size}px; border: ${Math.max(2, p.size / 10)}px solid ${U.rgba(p.c1, .2)}; border-top-color: ${p.c1}; border-radius: 50%; animation: sf-spin ${p.t}s linear infinite; }\n@keyframes sf-spin { to { transform: rotate(360deg); } }` }),
    Dots: p => ({ html: '<div class="sf-ld"><i></i><i></i><i></i></div>', css: `.sf-ld { display: flex; gap: ${p.size / 5}px; }\n.sf-ld i { width: ${p.size / 3}px; height: ${p.size / 3}px; border-radius: 50%; background: ${p.c1}; animation: sf-dot ${p.t}s ease-in-out infinite; }\n.sf-ld i:nth-child(2) { animation-delay: ${p.t / 6}s; background: ${p.c2}; }\n.sf-ld i:nth-child(3) { animation-delay: ${p.t / 3}s; }\n@keyframes sf-dot { 0%, 80%, 100% { transform: scale(.4); opacity: .4; } 40% { transform: scale(1); opacity: 1; } }` }),
    Bars: p => ({ html: '<div class="sf-ld"><i></i><i></i><i></i><i></i><i></i></div>', css: `.sf-ld { display: flex; gap: ${p.size / 10}px; align-items: center; height: ${p.size}px; }\n.sf-ld i { width: ${p.size / 8}px; height: 100%; background: ${p.c1}; border-radius: 3px; animation: sf-bar ${p.t}s ease-in-out infinite; }\n.sf-ld i:nth-child(2) { animation-delay: ${p.t * .1}s; } .sf-ld i:nth-child(3) { animation-delay: ${p.t * .2}s; background: ${p.c2}; } .sf-ld i:nth-child(4) { animation-delay: ${p.t * .3}s; } .sf-ld i:nth-child(5) { animation-delay: ${p.t * .4}s; }\n@keyframes sf-bar { 0%, 100% { transform: scaleY(.3); } 50% { transform: scaleY(1); } }` }),
    'Pulse ring': p => ({ html: '<div class="sf-ld"></div>', css: `.sf-ld { width: ${p.size}px; height: ${p.size}px; border-radius: 50%; background: ${p.c1}; animation: sf-ring ${p.t}s ease-out infinite; }\n@keyframes sf-ring { 0% { transform: scale(.3); opacity: 1; } 100% { transform: scale(1.3); opacity: 0; } }` }),
    'Dual ring': p => ({ html: '<div class="sf-ld"></div>', css: `.sf-ld { width: ${p.size}px; height: ${p.size}px; border-radius: 50%; border: ${Math.max(3, p.size / 9)}px solid transparent; border-top-color: ${p.c1}; border-bottom-color: ${p.c2}; animation: sf-spin ${p.t}s linear infinite; }\n@keyframes sf-spin { to { transform: rotate(360deg); } }` }),
    Orbit: p => ({ html: '<div class="sf-ld"><i></i></div>', css: `.sf-ld { position: relative; width: ${p.size}px; height: ${p.size}px; border: 2px dashed ${U.rgba(p.c1, .35)}; border-radius: 50%; animation: sf-spin ${p.t * 2}s linear infinite; }\n.sf-ld i { position: absolute; top: -${p.size / 8}px; left: 50%; margin-left: -${p.size / 8}px; width: ${p.size / 4}px; height: ${p.size / 4}px; border-radius: 50%; background: ${p.c2}; box-shadow: 0 0 12px ${p.c2}; }\n@keyframes sf-spin { to { transform: rotate(360deg); } }` })
  };
  rulesTool({
    id: 'loaders', name: 'Loaders & spinners', learn: 'Pure-CSS loading animations: no images, no scripts, and they scale to any size.',
    p: [S('kind', 'Style', Object.keys(LOAD), 'Dual ring'), R('size', 'Size', 24, 160, 80, 'px'), R('t', 'Speed (seconds per loop)', .4, 4, 1.1, 's', .1), C('c1', 'Colour 1', '#7c5cff'), C('c2', 'Colour 2', '#ff5c9d')],
    rules: p => LOAD[p.kind](p).css, html: p => LOAD[p.kind](p).html
  });

  rulesTool({
    id: 'typewriter', name: 'Typewriter text', learn: 'The text sits in a box that is revealed one character at a time using steps(), with a blinking caret on the right edge.',
    p: [S('text', 'Text', ['Hello, world!', 'Design without limits', 'StyleForge', 'Welcome back'], 'Design without limits'), R('size', 'Text size', 16, 56, 34, 'px'), R('speed', 'Typing time', 1, 10, 3.2, 's', .1), C('col', 'Text colour', '#ffffff'), C('caret', 'Caret colour', '#ff5c9d')],
    rules: p => `.sf-type { font: 600 ${p.size}px/1.2 ui-monospace, Menlo, Consolas, monospace; color: ${p.col}; width: ${p.text.length}ch; white-space: nowrap; overflow: hidden; border-right: .12em solid ${p.caret}; animation: sf-typing ${p.speed}s steps(${p.text.length}) infinite alternate, sf-caret .8s step-end infinite; }\n@keyframes sf-typing { from { width: 0; } }\n@keyframes sf-caret { 50% { border-color: transparent; } }\n/* <div class="sf-type">${p.text}</div> */`,
    html: p => `<div class="sf-type">${p.text}</div>`
  });

  rulesTool({
    id: 'marquee', name: 'Scrolling marquee', learn: 'Two copies of the text slide left by exactly one copy width, then snap back unnoticed, which makes an endless ticker.',
    p: [S('text', 'Text', ['LATEST NEWS ✦ NEW TOOLS ✦ FREE FOREVER ✦', 'SALE ✦ 20% OFF ✦ THIS WEEK ONLY ✦', 'STYLE ✦ FORGE ✦ MAKE ✦ SHARE ✦'], 'SALE ✦ 20% OFF ✦ THIS WEEK ONLY ✦'), R('size', 'Text size', 14, 60, 30, 'px'), R('dur', 'Loop time', 2, 40, 10, 's'), S('dir', 'Direction', ['Left', 'Right'], 'Left'), C('col', 'Text colour', '#ffffff'), C('bg', 'Band colour', '#7c5cff')],
    rules: p => `.sf-marquee { width: 560px; overflow: hidden; background: ${p.bg}; border-radius: 10px; }\n.sf-marquee div { display: inline-block; white-space: nowrap; padding: 12px 0; font: 800 ${p.size}px system-ui; color: ${p.col}; animation: sf-scroll ${p.dur}s linear infinite${p.dir === 'Right' ? ' reverse' : ''}; }\n@keyframes sf-scroll { to { transform: translateX(-50%); } }`,
    html: p => `<div class="sf-marquee"><div>${p.text} ${p.text} ${p.text} ${p.text}</div></div>`
  });

  const REVEAL = { 'Fade up': ['translateY(36px)', 'none'], 'Fade in': ['none', 'none'], 'Slide left': ['translateX(60px)', 'none'], 'Zoom': ['scale(.6)', 'none'], 'Blur in': ['scale(1.05)', 'none'], 'Rotate in': ['rotate(-12deg) translateY(20px)', 'none'] };
  rulesTool({
    id: 'reveal', name: 'Scroll reveal', learn: 'Elements start hidden and animate in as they scroll into view. The snippet includes the tiny script that watches for that.',
    p: [S('kind', 'Effect', Object.keys(REVEAL), 'Fade up'), R('dur', 'Duration', .2, 2, .7, 's', .1), R('stag', 'Stagger between items', 0, .6, .15, 's', .01), S('ease', 'Timing', ['ease-out', 'ease-in-out', 'cubic-bezier(.34,1.56,.64,1)'], 'ease-out'), C('c1', 'Colour', '#7c5cff')],
    rules: p => { const [from] = REVEAL[p.kind], blur = p.kind === 'Blur in' ? 'filter: blur(12px); ' : ''; return `.sf-reveal { opacity: 0; ${blur}transform: ${from}; transition: opacity ${p.dur}s ${p.ease}, transform ${p.dur}s ${p.ease}${blur ? `, filter ${p.dur}s` : ''}; }\n.sf-reveal.in { opacity: 1; transform: none; ${blur ? 'filter: none; ' : ''}}\n.sf-reveal:nth-child(2) { transition-delay: ${p.stag}s; } .sf-reveal:nth-child(3) { transition-delay: ${p.stag * 2}s; }\n\n/* add once to your page: */\n/* new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('in')), {threshold: .2}).observe(...) — call .observe() for each .sf-reveal */\n\n/* demo: loop */\n.sf-demo-loop .sf-reveal { animation: sf-demo ${p.dur * 5 + 1}s infinite; }\n@keyframes sf-demo { 0%, 8% { opacity: 0; transform: ${from}; ${blur} } 25%, 80% { opacity: 1; transform: none; ${blur ? 'filter: none;' : ''} } 100% { opacity: 0; transform: ${from}; ${blur} } }`; },
    html: p => `<div class="sf-demo-loop" style="display:flex;gap:14px"><div class="sf-reveal" style="${ball};background:${p.c1}"></div><div class="sf-reveal" style="${ball};background:${p.c1}"></div><div class="sf-reveal" style="${ball};background:${p.c1}"></div></div>`
  });

  const PATHS = { Heart: 'M100,170 C20,110 10,60 55,40 C80,30 100,50 100,65 C100,50 120,30 145,40 C190,60 180,110 100,170 Z', Star: 'M100,20 L122,80 L186,82 L135,120 L154,182 L100,146 L46,182 L65,120 L14,82 L78,80 Z', Infinity: 'M100,100 C140,40 190,40 190,100 C190,160 140,160 100,100 C60,40 10,40 10,100 C10,160 60,160 100,100 Z', Wave: 'M10,100 C40,30 70,170 100,100 S160,30 190,100', Spiral: 'M100,100 m0,0 c0,-8 8,-14 16,-14 c18,0 28,16 28,32 c0,26 -24,42 -48,42 c-34,0 -56,-26 -56,-60 c0,-44 36,-72 80,-72' };
  rulesTool({
    id: 'pathdraw', name: 'Line drawing animation', learn: 'A path is hidden by making its dashes as long as the path, then sliding the dash offset to zero so the line appears to draw itself.',
    p: [S('shape', 'Shape', Object.keys(PATHS), 'Heart'), R('w', 'Line width', 1, 14, 4, 'px', .5), R('dur', 'Draw time', .5, 8, 2.6, 's', .1), C('c1', 'Line colour', '#ff5c9d'), B('fill', 'Fill when done', 1), C('c2', 'Fill colour', '#ff5c9d', 1)],
    rules: p => `.sf-draw path { fill: ${p.fill ? 'transparent' : 'none'}; stroke: ${p.c1}; stroke-width: ${p.w}; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: sf-draw ${p.dur}s ease-in-out infinite alternate${p.fill ? `, sf-fill ${p.dur}s ease-in infinite alternate` : ''}; }\n@keyframes sf-draw { to { stroke-dashoffset: 0; } }\n${p.fill ? `@keyframes sf-fill { 0%, 70% { fill: transparent; } 100% { fill: ${U.rgba(p.c2, .35)}; } }\n` : ''}/* <svg class="sf-draw" viewBox="0 0 200 200"><path d="${PATHS[p.shape]}" pathLength="1000"/></svg> */`,
    html: p => `<svg class="sf-draw" viewBox="0 0 200 200" style="width:240px"><path d="${PATHS[p.shape]}" pathLength="1000"/></svg>`
  });

  function blobPath(seed, n, rnd, cx = 100, cy = 100, rad = 75) {
    const rn = U.rng(seed), pt = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, rr = rad * (1 - rn() * rnd / 100 * .6); pt.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
    let d = `M${pt[0][0].toFixed(1)},${pt[0][1].toFixed(1)}`; for (let i = 0; i < n; i++) { const p0 = pt[(i - 1 + n) % n], p1 = pt[i], p2 = pt[(i + 1) % n], p3 = pt[(i + 2) % n]; d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`; } return d + ' Z';
  }
  SF.tool({
    id: 'morph', name: 'Shape morph', cat: 'Motion', kind: 'svg',
    learn: 'Two shapes built from the same number of points can blend into each other. An SVG <animate> tag does the in-between frames, no script required.',
    p: [R('n', 'Bumps', 3, 10, 6, '', 1), R('a', 'Shape A', 1, 99, 4, '', 1), R('b', 'Shape B', 1, 99, 31, '', 1), R('rnd', 'Wobble', 20, 100, 70, '%'), R('dur', 'Loop time', 1, 12, 4, 's'), C('c1', 'Colour 1', '#7c5cff'), C('c2', 'Colour 2', '#ff5c9d'), C('bg', 'Background', '#14182a', 1)],
    r(p) {
      const A = blobPath(+p.a, +p.n, +p.rnd), Bp = blobPath(+p.b, +p.n, +p.rnd);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.c1}"/><stop offset="1" stop-color="${p.c2}"/></linearGradient></defs><rect width="200" height="200" fill="${p.bg}"/><path d="${A}" fill="url(#g)"><animate attributeName="d" dur="${p.dur}s" repeatCount="indefinite" calcMode="spline" keyTimes="0;.5;1" keySplines=".4 0 .6 1;.4 0 .6 1" values="${A};${Bp};${A}"/></path></svg>`;
      return { svg, html: svg, code: svg, bg: p.bg };
    }
  });

  SF.cvTool({
    id: 'confetti', name: 'Confetti', cat: 'Motion', anim: true, learn: 'Each piece falls at its own speed and spins as it goes. Position is worked out from the clock, so it loops smoothly with no stored state.',
    p: [R('seed', 'Shuffle', 1, 999, 8, '', 1), R('n', 'Pieces', 20, 400, 140, '', 10), R('speed', 'Fall speed', .2, 3, 1, '×', .1), R('size', 'Piece size', 4, 24, 10, 'px', 1), R('sway', 'Sway', 0, 80, 30, 'px', 1), C('c1', 'Colour 1', '#ff5c9d'), C('c2', 'Colour 2', '#ffd166'), C('c3', 'Colour 3', '#35d0ba'), C('c4', 'Colour 4', '#7c5cff'), C('bg', 'Background', '#0d1020')],
    draw(ctx, w, h, p, t) { const r = rng(+p.seed), k = w / 800, pal = [p.c1, p.c2, p.c3, p.c4]; ctx.fillStyle = p.bg; ctx.fillRect(0, 0, w, h); for (let i = 0; i < p.n; i++) { const x0 = r() * w, ph = r() * 6.28, v = (.4 + r()) * 90 * p.speed * k, s = (.5 + r()) * p.size * k, c = pal[i % 4], y = ((r() * h + t * v) % (h + 40 * k)) - 20 * k, x = x0 + Math.sin(t * .9 + ph) * p.sway * k; ctx.save(); ctx.translate(x, y); ctx.rotate(t * (1 + r()) * 2 + ph); ctx.scale(1, Math.cos(t * 2 + ph)); ctx.fillStyle = c; ctx.fillRect(-s / 2, -s / 3, s, s * .66); ctx.restore(); } }
  });

  rulesTool({
    id: 'hover', name: 'Hover lift transition', learn: 'A transition animates between a normal and a :hover state. A small lift plus a slightly deeper shadow feels responsive.',
    p: [R('lift', 'Lift', 0, 24, 8, 'px'), R('sc', 'Grow', 100, 120, 104, '%'), R('dur', 'Speed', .08, .8, .25, 's', .01), S('ease', 'Timing', ['ease', 'ease-out', 'cubic-bezier(.34,1.56,.64,1)'], 'cubic-bezier(.34,1.56,.64,1)'), C('c1', 'Colour', '#7c5cff')],
    rules: p => `.sf-hover { width: 200px; height: 120px; border-radius: 16px; background: ${p.c1}; box-shadow: 0 4px 10px rgba(0,0,0,.3); transition: transform ${p.dur}s ${p.ease}, box-shadow ${p.dur}s ${p.ease}; }\n.sf-hover:hover { transform: translateY(-${p.lift}px) scale(${p.sc / 100}); box-shadow: 0 ${8 + p.lift}px ${16 + p.lift * 2}px rgba(0,0,0,.4); }\n/* preview loops the hover */\n.sf-hover { animation: sf-hv ${p.dur * 6 + 1}s infinite; }\n@keyframes sf-hv { 0%, 20% { transform: none; } 30%, 70% { transform: translateY(-${p.lift}px) scale(${p.sc / 100}); box-shadow: 0 ${8 + p.lift}px ${16 + p.lift * 2}px rgba(0,0,0,.4); } 80%, 100% { transform: none; } }`,
    html: () => '<div class="sf-hover"></div>'
  });
})();
