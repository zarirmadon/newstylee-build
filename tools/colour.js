/* StyleForge (working name) — tools/colour.js — Copyright (C) 2026 Zarir Madon — GNU GPL v3 or later (see LICENSE) */
(function () {
  const { R, C, S, B } = SF, U = SF.u;
  SF.category('Colour', 'Gradients, palettes, contrast and colour scales');

  SF.cssTool({
    id: 'gradient', name: 'Gradient', cat: 'Colour', el: SF.demo.FILL,
    learn: 'A gradient fades smoothly between colours. Linear runs in a straight line, radial spreads from a centre, conic sweeps around like a colour wheel.',
    p: [S('type', 'Type', ['Linear', 'Radial', 'Conic'], 'Linear'), R('angle', 'Direction', 0, 360, 135, '°'), C('c1', 'Colour 1', '#7c5cff'), C('c2', 'Colour 2', '#ff5c9d'), C('c3', 'Colour 3', '#ffb15c'),
      R('mid', 'Middle position', 5, 95, 50, '%', 1, 1), R('x', 'Centre across', 0, 100, 50, '%', 1, 1), R('y', 'Centre down', 0, 100, 50, '%', 1, 1), B('rep', 'Repeat as stripes', 0, 1)],
    css(p) {
      const rep = p.rep ? 'repeating-' : '';
      const st = p.rep ? `${p.c1} 0px, ${p.c2} ${p.mid}px, ${p.c3} ${p.mid * 2}px` : `${p.c1}, ${p.c2} ${p.mid}%, ${p.c3}`;
      if (p.type === 'Radial') return `background: ${rep}radial-gradient(circle at ${p.x}% ${p.y}%, ${st});`;
      if (p.type === 'Conic') return `background: ${rep}conic-gradient(from ${p.angle}deg at ${p.x}% ${p.y}%, ${p.c1}, ${p.c2} ${p.mid}%, ${p.c3}, ${p.c1});`;
      return `background: ${rep}linear-gradient(${p.angle}deg, ${st});`;
    }
  });

  SF.cssTool({
    id: 'mesh', name: 'Mesh gradient', cat: 'Colour', el: SF.demo.FILL,
    learn: 'A mesh gradient layers several soft colour glows on one base colour, giving the smooth, modern "aurora" look.',
    p: [C('base', 'Base colour', '#14102e'), C('c1', 'Glow 1', '#7c5cff'), C('c2', 'Glow 2', '#ff5c9d'), C('c3', 'Glow 3', '#ffb15c'), C('c4', 'Glow 4', '#35d0ba'), R('spread', 'Spread', 20, 90, 55, '%'), R('shift', 'Shift', 0, 30, 0, '%', 1, 1)],
    css(p) {
      const s = p.shift, g = (x, y, c) => `radial-gradient(at ${x}% ${y}%, ${c} 0, transparent ${p.spread}%)`;
      return `background-color: ${p.base}; background-image: ${g(15 + s, 20, p.c1)}, ${g(85 - s, 15, p.c2)}, ${g(80, 85 - s, p.c3)}, ${g(15, 85, p.c4)};`;
    }
  });

  SF.tool({
    id: 'palette', name: 'Palette', cat: 'Colour', kind: 'css',
    learn: 'Colour harmonies are combinations that sit well together because of where they fall on the colour wheel.',
    p: [S('h', 'Harmony', ['Complementary', 'Analogous', 'Triadic', 'Split', 'Tetradic', 'Monochrome'], 'Triadic'), C('base', 'Base colour', '#7c5cff'), R('sat', 'Saturation boost', -40, 40, 0, '%', 1, 1), R('lig', 'Lightness shift', -30, 30, 0, '%', 1, 1)],
    r(p) {
      const [h, s, l] = U.hex2hsl(p.base);
      const offs = { Complementary: [0, 180], Analogous: [-30, 0, 30], Triadic: [0, 120, 240], Split: [0, 150, 210], Tetradic: [0, 90, 180, 270], Monochrome: [0, 0, 0, 0, 0] }[p.h];
      const cols = offs.map((o, i) => U.hsl2hex(h + o, s + +p.sat, p.h === 'Monochrome' ? 18 + i * 16 + +p.lig : l + +p.lig));
      cols.push(U.hsl2hex(h, 12, 94), U.hsl2hex(h, 20, 12));
      const code = ':root {\n' + cols.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n') + '\n}';
      const html = `<div style="display:flex;gap:6px">${cols.map(c => `<div style="width:78px;height:150px;border-radius:12px;background:${c};display:flex;align-items:flex-end;justify-content:center;padding:6px;font:600 11px ui-monospace,monospace;color:${U.contrast(c, '#fff') > 3 ? '#fff' : '#111'}">${c}</div>`).join('')}</div>`;
      return { html, code, css: '', bg: '#0f1320' };
    }
  });

  SF.tool({
    id: 'contrast', name: 'Contrast check', cat: 'Colour', kind: 'css',
    learn: 'WCAG contrast tells you whether text is readable. 4.5:1 is the AA minimum for normal text, 7:1 is AAA.',
    p: [C('fg', 'Text colour', '#ffffff'), C('bg', 'Background', '#5b3df0'), R('size', 'Text size', 12, 40, 18, 'px')],
    r(p) {
      const ratio = U.contrast(p.fg, p.bg), big = p.size >= 24, aa = ratio >= (big ? 3 : 4.5), aaa = ratio >= (big ? 4.5 : 7);
      const html = `<div style="width:300px;padding:20px;border-radius:14px;background:${p.bg};color:${p.fg};font-size:${p.size}px">Sample text<div style="margin-top:10px;font:600 13px system-ui">Ratio ${ratio.toFixed(2)}:1 · AA ${aa ? 'pass ✓' : 'fail ✗'} · AAA ${aaa ? 'pass ✓' : 'fail ✗'}</div></div>`;
      const code = `color: ${p.fg};\nbackground: ${p.bg};\nfont-size: ${p.size}px;\n/* contrast ${ratio.toFixed(2)}:1 — AA ${aa ? 'pass' : 'FAIL'}, AAA ${aaa ? 'pass' : 'FAIL'} */`;
      return { html, code, css: `color: ${p.fg}; background: ${p.bg}; font-size: ${p.size}px;`, bg: '#0f1320' };
    }
  });

  SF.tool({
    id: 'scale', name: 'Colour scale', cat: 'Colour', kind: 'css',
    learn: 'Turns one colour into a ten-step scale from very light (50) to very dark (900), like the scales used by design systems.',
    p: [C('base', 'Main colour (500)', '#7c5cff'), B('cm', 'Write as color-mix()', 0, 1), C('lo', 'Light end', '#ffffff', 1), C('hi', 'Dark end', '#0b0820', 1)],
    r(p) {
      const names = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
      const cols = names.map((n, i) => i < 5 ? U.mix(p.lo, p.base, .12 + .88 * (i / 5)) : i === 5 ? p.base : U.mix(p.base, p.hi, (i - 5) / 4 * .8));
      const code = ':root {\n' + names.map((n, i) => p.cm && i !== 5 ? `  --brand-${n}: color-mix(in oklch, ${i < 5 ? p.lo : p.hi} ${Math.round(i < 5 ? (1 - (.12 + .88 * i / 5)) * 100 : (i - 5) / 4 * 80)}%, ${p.base});` : `  --brand-${n}: ${cols[i]};`).join('\n') + '\n}';
      const html = `<div style="display:flex;border-radius:12px;overflow:hidden">${cols.map((c, i) => `<div style="width:62px;height:140px;background:${c};display:flex;align-items:flex-end;justify-content:center;padding:6px;font:600 11px system-ui;color:${U.contrast(c, '#fff') > 3 ? '#fff' : '#111'}">${names[i]}</div>`).join('')}</div>`;
      return { html, code, css: '', bg: '#0f1320' };
    }
  });
})();
