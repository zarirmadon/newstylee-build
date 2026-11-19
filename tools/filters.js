/* StyleForge (working name) — tools/filters.js — Copyright (C) 2026 Zarir Madon — GNU GPL v3 or later (see LICENSE) */
(function () {
  const { R, C, S, B } = SF, U = SF.u;
  SF.category('Filters', 'Image filters, blend modes and shape-following shadows');

  SF.tool({
    id: 'imgfilter', name: 'Image filters', cat: 'Filters', kind: 'css', usesImage: true,
    learn: 'CSS filters adjust any element like photo-editing sliders: blur, brightness, contrast, colour and more. They can also be animated.',
    p: [R('bl', 'Blur', 0, 20, 0, 'px', .5), R('br', 'Brightness', 30, 200, 105, '%'), R('co', 'Contrast', 30, 200, 110, '%'), R('sa', 'Colour boost', 0, 300, 120, '%'), R('hu', 'Colour shift', 0, 360, 0, '°', 1, 1), R('se', 'Sepia', 0, 100, 0, '%', 1, 1), R('gr', 'Black & white', 0, 100, 0, '%', 1, 1), R('inv', 'Invert', 0, 100, 0, '%', 1, 1)],
    r(p) {
      const d = `filter: blur(${p.bl}px) brightness(${p.br}%) contrast(${p.co}%) saturate(${p.sa}%) hue-rotate(${p.hu}deg) sepia(${p.se}%) grayscale(${p.gr}%) invert(${p.inv}%);`;
      return { css: d, code: d, html: `<div class="fill" style="background:${SF.scene()};${d}"></div>`, bg: '#0f1320' };
    }
  });

  SF.tool({
    id: 'blend', name: 'Blend modes', cat: 'Filters', kind: 'css', usesImage: true,
    learn: 'Blend modes mix a layer with whatever is under it, exactly like layer blending in photo editors.',
    p: [S('mode', 'Blend mode', ['multiply', 'screen', 'overlay', 'soft-light', 'hard-light', 'color-dodge', 'color-burn', 'darken', 'lighten', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'], 'overlay'), C('c1', 'Top colour 1', '#ff5c9d'), C('c2', 'Top colour 2', '#35d0ba'), R('ang', 'Top direction', 0, 360, 135, '°'), R('op', 'Top opacity', 10, 100, 85, '%')],
    r(p) {
      const d = `mix-blend-mode: ${p.mode}; opacity: ${p.op / 100}; background: linear-gradient(${p.ang}deg, ${p.c1}, ${p.c2});`;
      return { css: d, code: `/* put the layer above another element or image */\n${d}`, html: `<div class="fill" style="background:${SF.scene()};isolation:isolate"><div class="fill" style="${d}"></div></div>`, bg: '#0f1320' };
    }
  });

  SF.cssTool({
    id: 'dropshadow', name: 'Shape-following shadow', cat: 'Filters', bg: '#eef0f6',
    el: d => `<div style="width:200px;height:200px;${d}"><div style="width:200px;height:200px;background:linear-gradient(135deg,#7c5cff,#ff5c9d);clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)"></div></div>`,
    learn: 'box-shadow only follows the rectangle. filter: drop-shadow follows the real outline of the shape, including transparent areas and clip-paths.',
    p: [R('x', 'Sideways', -40, 40, 0, 'px'), R('y', 'Down', -40, 60, 14, 'px'), R('blur', 'Softness', 0, 60, 16, 'px'), R('op', 'Strength', 0, 100, 40, '%'), C('col', 'Colour', '#1b2240'), R('lay', 'Layers', 1, 4, 2, '', 1, 1)],
    css(p) { const a = []; for (let i = 1; i <= p.lay; i++) a.push(`drop-shadow(${p.x * i / p.lay}px ${p.y * i / p.lay}px ${p.blur * i / p.lay}px ${U.rgba(p.col, p.op / 100 / p.lay * 1.4)})`); return `filter: ${a.join(' ')};`; }
  });
})();
