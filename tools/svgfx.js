/* StyleForge (working name) — tools/svgfx.js — SVG filter effects — Copyright (C) 2026 Zarir Madon — GNU GPL v3 or later (see LICENSE) */
(function () {
  const { R, C, S, B } = SF, U = SF.u;
  SF.category('SVG effects', 'Paper, watercolour, liquid, glitch, grain, pixel and more, applied to any image or element');
  const f1 = n => (+n).toFixed(3).replace(/0+$/, '').replace(/\.$/, '');

  SF.fxTool({
    id: 'fx-paper', name: 'Paper texture', learn: 'Noise is turned into a bumpy surface and lit from the side, then multiplied over the picture so it looks printed on paper.',
    p: [R('freq', 'Fibre size', 5, 100, 40, '', 1), R('oct', 'Detail', 1, 6, 5, '', 1, 1), R('depth', 'Roughness', 0.5, 8, 2.5, '', .5), R('light', 'Light height', 20, 80, 60, '°', 1, 1), R('az', 'Light direction', 0, 360, 45, '°', 1, 1), C('tint', 'Paper tint', '#fff4e0')],
    f: p => `<feTurbulence type="fractalNoise" baseFrequency="${f1(p.freq / 1000)}" numOctaves="${p.oct}" result="n"/><feDiffuseLighting in="n" lighting-color="${p.tint}" surfaceScale="${p.depth}" result="l"><feDistantLight azimuth="${p.az}" elevation="${p.light}"/></feDiffuseLighting><feComposite in="SourceGraphic" in2="l" operator="arithmetic" k1="1.1" k2="0" k3="0" k4="0"/>`
  });

  SF.fxTool({
    id: 'fx-watercolor', name: 'Watercolour', learn: 'Edges are wobbled with noise, colours bleed softly, and a paper grain sits on top, like pigment drying on wet paper.',
    p: [R('wob', 'Edge wobble', 2, 60, 22, ''), R('freq', 'Wobble size', 5, 80, 22, '', 1), R('soft', 'Softness', 0, 6, 1.4, 'px', .1), R('sat', 'Colour boost', 80, 220, 130, '%', 1, 1), R('grain', 'Paper grain', 0, 100, 40, '%')],
    f: p => `<feTurbulence type="fractalNoise" baseFrequency="${f1(p.freq / 1000)}" numOctaves="3" seed="3" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="${p.wob}" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="${p.soft}" result="b"/><feColorMatrix in="b" type="saturate" values="${p.sat / 100}" result="s"/><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="pn"/><feDiffuseLighting in="pn" lighting-color="#fff" surfaceScale="${f1(p.grain / 25)}" result="pl"><feDistantLight azimuth="45" elevation="60"/></feDiffuseLighting><feComposite in="s" in2="pl" operator="arithmetic" k1="1" k2="0" k3="0" k4="0"/>`
  });

  SF.fxTool({
    id: 'fx-liquid', name: 'Liquid ripple', learn: 'A displacement map pushes each pixel sideways by an amount taken from smooth noise, so the picture looks like it is underwater.',
    p: [R('scale', 'Strength', 0, 120, 40, ''), R('fx', 'Ripple width', 1, 60, 8, '', 1), R('fy', 'Ripple height', 1, 60, 18, '', 1), R('oct', 'Detail', 1, 5, 2, '', 1, 1), R('seed', 'Shuffle', 0, 99, 2, '', 1, 1)],
    f: p => `<feTurbulence type="turbulence" baseFrequency="${f1(p.fx / 1000)} ${f1(p.fy / 1000)}" numOctaves="${p.oct}" seed="${p.seed}" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="${p.scale}" xChannelSelector="R" yChannelSelector="G"/>`
  });

  SF.fxTool({
    id: 'fx-glitch', name: 'Glitch / RGB split', learn: 'Each colour channel is separated, shifted a little, and recombined. The mismatch gives the classic digital glitch edge.',
    p: [R('dx', 'Red shift', -40, 40, 8, 'px'), R('bx', 'Blue shift', -40, 40, -8, 'px'), R('gy', 'Green up/down', -20, 20, 0, 'px', 1, 1), R('soft', 'Softness', 0, 4, 0, 'px', .5, 1)],
    f: p => `<feColorMatrix in="SourceGraphic" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/><feOffset in="r" dx="${p.dx}" dy="0" result="ro"/><feColorMatrix in="SourceGraphic" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g"/><feOffset in="g" dx="0" dy="${p.gy}" result="go"/><feColorMatrix in="SourceGraphic" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b"/><feOffset in="b" dx="${p.bx}" dy="0" result="bo"/><feBlend in="ro" in2="go" mode="screen" result="rg"/><feBlend in="rg" in2="bo" mode="screen" result="rgb"/><feGaussianBlur in="rgb" stdDeviation="${p.soft}"/>`
  });

  SF.fxTool({
    id: 'fx-emboss', name: 'Emboss', learn: 'A 3×3 kernel compares each pixel with its neighbours, turning edges into raised ridges.',
    p: [R('amt', 'Depth', 0.2, 3, 1, '', .1), B('keep', 'Keep original colours', 1), R('soft', 'Smooth first', 0, 3, 0, 'px', .5, 1)],
    f: p => `<feGaussianBlur in="SourceGraphic" stdDeviation="${p.soft}" result="s"/><feConvolveMatrix in="s" order="3" kernelMatrix="${-2 * p.amt} ${-p.amt} 0 ${-p.amt} 1 ${p.amt} 0 ${p.amt} ${2 * p.amt}" preserveAlpha="true" result="e"/>${p.keep ? `<feBlend in="e" in2="SourceGraphic" mode="overlay"/>` : '<feColorMatrix type="saturate" values="0"/>'}`
  });

  SF.fxTool({
    id: 'fx-grain', name: 'Film grain', learn: 'Fine noise is blended over the picture. Real film has grain because light is captured by tiny silver crystals.',
    p: [R('freq', 'Grain size', 30, 300, 120, '', 1), R('amt', 'Amount', 0, 100, 45, '%'), S('mode', 'Blend', ['overlay', 'soft-light', 'multiply', 'screen', 'normal'], 'overlay'), B('mono', 'Black & white grain', 1)],
    f: p => `<feTurbulence type="fractalNoise" baseFrequency="${f1(p.freq / 100)}" numOctaves="2" stitchTiles="stitch" result="n"/>${p.mono ? '<feColorMatrix type="saturate" values="0" result="n2"/>' : '<feOffset result="n2"/>'}<feComponentTransfer in="n2" result="n3"><feFuncA type="linear" slope="${f1(p.amt / 100)}" intercept="0"/></feComponentTransfer><feBlend in="n3" in2="SourceGraphic" mode="${p.mode}"/>`
  });

  SF.fxTool({
    id: 'fx-haze', name: 'Heat haze (animated)', learn: 'The noise slowly changes over time, so the picture shimmers like air above hot tarmac. This uses a built-in SVG animation, no script.',
    p: [R('scale', 'Strength', 2, 60, 14, ''), R('speed', 'Speed (seconds per loop)', 1, 20, 6, 's'), R('fx', 'Width', 2, 40, 8, '', 1), R('fy', 'Height', 2, 80, 30, '', 1)],
    f: p => `<feTurbulence type="turbulence" baseFrequency="${f1(p.fx / 1000)} ${f1(p.fy / 1000)}" numOctaves="2" result="t"><animate attributeName="baseFrequency" dur="${p.speed}s" values="${f1(p.fx / 1000)} ${f1(p.fy / 1000)};${f1(p.fx / 600)} ${f1(p.fy / 700)};${f1(p.fx / 1000)} ${f1(p.fy / 1000)}" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" in2="t" scale="${p.scale}" xChannelSelector="R" yChannelSelector="G"/>`
  });

  SF.fxTool({
    id: 'fx-ink', name: 'Rough ink edges', learn: 'Noise bends every edge a little and a tiny erode makes lines uneven, like a woodcut or a stamp.',
    p: [R('rough', 'Roughness', 1, 30, 8, ''), R('freq', 'Roughness size', 10, 200, 60, '', 1), R('erode', 'Thin edges', 0, 3, 1, 'px', .5), R('con', 'Contrast', 100, 400, 220, '%', 1, 1)],
    f: p => `<feTurbulence type="fractalNoise" baseFrequency="${f1(p.freq / 1000)}" numOctaves="3" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="${p.rough}" xChannelSelector="R" yChannelSelector="G" result="d"/><feMorphology in="d" operator="erode" radius="${p.erode}" result="m"/><feComponentTransfer in="m"><feFuncR type="linear" slope="${p.con / 100}" intercept="${f1(-(p.con / 100 - 1) / 2)}"/><feFuncG type="linear" slope="${p.con / 100}" intercept="${f1(-(p.con / 100 - 1) / 2)}"/><feFuncB type="linear" slope="${p.con / 100}" intercept="${f1(-(p.con / 100 - 1) / 2)}"/></feComponentTransfer>`
  });

  SF.fxTool({
    id: 'fx-pixel', name: 'Pixelate', learn: 'The picture is sampled in a grid and each cell is filled with one colour, which gives chunky pixels.',
    p: [R('s', 'Pixel size', 4, 40, 12, 'px', 2)],
    f: p => { const s = +p.s, r = s / 2 - 1; return `<feFlood x="${r}" y="${r}" height="2" width="2"/><feComposite width="${s}" height="${s}"/><feTile result="a"/><feComposite in="SourceGraphic" in2="a" operator="in"/><feMorphology operator="dilate" radius="${r}"/>`; }
  });

  SF.fxTool({
    id: 'fx-poster', name: 'Posterise & duotone', learn: 'Posterising limits each channel to a few levels. Duotone then maps shadows and highlights to two colours of your choice.',
    p: [R('lv', 'Levels', 2, 12, 4, '', 1), B('duo', 'Duotone', 1), C('dark', 'Shadow colour', '#2b1055'), C('light', 'Highlight colour', '#ffb15c'), R('con', 'Contrast', 80, 220, 120, '%', 1, 1)],
    f(p) {
      const tv = n => Array.from({ length: n }, (_, i) => f1(i / (n - 1))).join(' ');
      const [r1, g1, b1] = U.h2r(p.dark).map(x => x / 255), [r2, g2, b2] = U.h2r(p.light).map(x => x / 255);
      const gray = '<feColorMatrix type="matrix" values="0.33 0.59 0.11 0 0  0.33 0.59 0.11 0 0  0.33 0.59 0.11 0 0  0 0 0 1 0" result="g"/>';
      const c = p.con / 100, ct = `<feComponentTransfer in="${p.duo ? 'g' : 'SourceGraphic'}" result="c"><feFuncR type="linear" slope="${c}" intercept="${f1(-(c - 1) / 2)}"/><feFuncG type="linear" slope="${c}" intercept="${f1(-(c - 1) / 2)}"/><feFuncB type="linear" slope="${c}" intercept="${f1(-(c - 1) / 2)}"/></feComponentTransfer>`;
      const post = `<feComponentTransfer in="c" result="p"><feFuncR type="discrete" tableValues="${tv(p.lv)}"/><feFuncG type="discrete" tableValues="${tv(p.lv)}"/><feFuncB type="discrete" tableValues="${tv(p.lv)}"/></feComponentTransfer>`;
      const duo = p.duo ? `<feComponentTransfer in="p"><feFuncR type="table" tableValues="${f1(r1)} ${f1(r2)}"/><feFuncG type="table" tableValues="${f1(g1)} ${f1(g2)}"/><feFuncB type="table" tableValues="${f1(b1)} ${f1(b2)}"/></feComponentTransfer>` : '';
      return (p.duo ? gray : '') + ct + post + duo;
    }
  });

  SF.fxTool({
    id: 'fx-sketch', name: 'Pencil sketch', learn: 'Edge detection finds where brightness changes sharply. Inverting the result gives dark lines on white, like a pencil drawing.',
    p: [R('amt', 'Line strength', 0.5, 4, 1.5, '', .1), R('soft', 'Smooth first', 0, 3, 0.6, 'px', .1), B('col', 'Keep a hint of colour', 0), R('tone', 'Paper brightness', 80, 140, 105, '%', 1, 1)],
    f: p => `<feColorMatrix type="saturate" values="0" result="g"/><feGaussianBlur in="g" stdDeviation="${p.soft}" result="b"/><feConvolveMatrix in="b" order="3" kernelMatrix="${-p.amt} ${-p.amt} ${-p.amt} ${-p.amt} ${8 * p.amt} ${-p.amt} ${-p.amt} ${-p.amt} ${-p.amt}" divisor="1" bias="0" preserveAlpha="true" result="e"/><feColorMatrix in="e" type="matrix" values="-1 0 0 0 ${f1(p.tone / 100)}  0 -1 0 0 ${f1(p.tone / 100)}  0 0 -1 0 ${f1(p.tone / 100)}  0 0 0 1 0" result="inv"/>${p.col ? '<feBlend in="inv" in2="SourceGraphic" mode="multiply"/>' : ''}`
  });

  SF.fxTool({
    id: 'fx-chroma', name: 'Chromatic aberration', learn: 'Cheap lenses focus colours at slightly different spots, leaving coloured fringes on edges. A touch adds a photographic feel.',
    p: [R('amt', 'Fringe size', 0, 14, 3, 'px', .5), R('soft', 'Blur', 0, 3, 0.3, 'px', .1), S('dir', 'Direction', ['Horizontal', 'Vertical', 'Diagonal'], 'Horizontal')],
    f(p) { const a = +p.amt, [rx, ry, bx, by] = p.dir === 'Horizontal' ? [a, 0, -a, 0] : p.dir === 'Vertical' ? [0, a, 0, -a] : [a, a, -a, -a]; return `<feColorMatrix in="SourceGraphic" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/><feOffset in="r" dx="${rx}" dy="${ry}" result="ro"/><feColorMatrix in="SourceGraphic" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g"/><feColorMatrix in="SourceGraphic" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b"/><feOffset in="b" dx="${bx}" dy="${by}" result="bo"/><feBlend in="ro" in2="g" mode="screen" result="rg"/><feBlend in="rg" in2="bo" mode="screen" result="o"/><feGaussianBlur in="o" stdDeviation="${p.soft}"/>`; }
  });

  SF.fxTool({
    id: 'fx-sharp', name: 'Sharpen & clarity', learn: 'Sharpening exaggerates the difference between a pixel and its neighbours, making edges crisper.',
    p: [R('amt', 'Amount', 0, 3, 1, '', .1), R('con', 'Clarity (contrast)', 80, 160, 110, '%', 1)],
    f: p => { const a = +p.amt, c = p.con / 100; return `<feConvolveMatrix order="3" kernelMatrix="0 ${-a} 0 ${-a} ${1 + 4 * a} ${-a} 0 ${-a} 0" preserveAlpha="true" result="s"/><feComponentTransfer in="s"><feFuncR type="linear" slope="${c}" intercept="${f1(-(c - 1) / 2)}"/><feFuncG type="linear" slope="${c}" intercept="${f1(-(c - 1) / 2)}"/><feFuncB type="linear" slope="${c}" intercept="${f1(-(c - 1) / 2)}"/></feComponentTransfer>`; }
  });

  SF.fxTool({
    id: 'fx-lit', name: 'Lit surface (3D bump)', learn: 'A bump map plus a moving light fakes a 3D surface: the picture looks embossed, with highlights where the light hits.',
    p: [R('depth', 'Bump depth', 0.5, 12, 4, '', .5), R('az', 'Light direction', 0, 360, 225, '°'), R('el', 'Light height', 10, 80, 45, '°'), R('spec', 'Shininess', 0.2, 3, 1.2, '', .1), C('lc', 'Light colour', '#fff2cf'), R('blur', 'Smooth bumps', 0, 4, 1, 'px', .5, 1)],
    f: p => `<feGaussianBlur in="SourceAlpha" stdDeviation="${p.blur}" result="a"/><feColorMatrix in="SourceGraphic" type="matrix" values="0.33 0.59 0.11 0 0  0.33 0.59 0.11 0 0  0.33 0.59 0.11 0 0  0.33 0.59 0.11 0 0" result="bump"/><feSpecularLighting in="bump" surfaceScale="${p.depth}" specularConstant="${p.spec}" specularExponent="20" lighting-color="${p.lc}" result="sp"><feDistantLight azimuth="${p.az}" elevation="${p.el}"/></feSpecularLighting><feComposite in="sp" in2="SourceGraphic" operator="in" result="spi"/><feComposite in="SourceGraphic" in2="spi" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>`
  });
})();
