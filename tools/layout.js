/* StyleForge (working name) — tools/layout.js — Copyright (C) 2026 Zarir Madon — GNU GPL v3 or later (see LICENSE) */
(function () {
  const { R, C, S, B } = SF, U = SF.u;
  SF.category('Layout', 'Grid, flexbox, spacing scale, aspect ratios and columns');
  const cell = (i, extra = '') => `<div style="background:linear-gradient(135deg,#7c5cff,#ff5c9d);border-radius:8px;display:grid;place-items:center;font:700 14px system-ui;color:#fff;min-height:36px;${extra}">${i}</div>`;
  const layoutTool = (id, name, p, learn, make) => SF.tool({ id, name, cat: 'Layout', kind: 'css', p, learn, r(q) { const { rules, inner, css } = make(q); return { css: css || rules, code: rules, html: `<div style="width:min(94%,560px);max-height:92%;overflow:hidden;border:1px dashed #3a4466;border-radius:10px;padding:8px">${inner}</div>`, bg: '#0f1320' }; } });

  layoutTool('grid', 'CSS grid', [R('cols', 'Columns', 1, 12, 4, '', 1), R('rows', 'Rows', 1, 8, 2, '', 1), R('gap', 'Gap', 0, 48, 12, 'px'), S('mode', 'Column sizing', ['Equal columns', 'Auto-fit (responsive)', 'Sidebar + content', 'Holy grail'], 'Equal columns'), R('min', 'Smallest column (auto-fit)', 80, 300, 140, 'px', 10, 1), S('flow', 'Fill order', ['row', 'column', 'row dense'], 'row', 1)],
    'Grid lays items out in rows and columns at once. fr units split the free space, and auto-fit adds as many columns as will fit.',
    p => {
      const cols = p.mode === 'Equal columns' ? `repeat(${p.cols}, 1fr)` : p.mode === 'Auto-fit (responsive)' ? `repeat(auto-fit, minmax(${p.min}px, 1fr))` : p.mode === 'Sidebar + content' ? '240px 1fr' : '200px 1fr 200px';
      const n = p.mode === 'Holy grail' ? 5 : p.mode === 'Sidebar + content' ? 2 : p.cols * p.rows;
      let items = ''; for (let i = 1; i <= n; i++) items += cell(i, p.mode === 'Holy grail' && i === 1 ? 'grid-column:1/-1' : p.mode === 'Holy grail' && i === 5 ? 'grid-column:1/-1' : '');
      const rules = `.grid {\n  display: grid;\n  grid-template-columns: ${cols};\n  gap: ${p.gap}px;${p.flow !== 'row' ? `\n  grid-auto-flow: ${p.flow};` : ''}\n}`;
      return { rules, inner: `<div style="display:grid;grid-template-columns:${p.mode === 'Auto-fit (responsive)' ? `repeat(auto-fit,minmax(${Math.min(p.min, 120)}px,1fr))` : cols.replace('240px', '80px').replace(/200px/g, '70px')};gap:${p.gap}px;grid-auto-flow:${p.flow}">${items}</div>` };
    });

  layoutTool('flex', 'Flexbox', [S('dir', 'Direction', ['row', 'row-reverse', 'column', 'column-reverse'], 'row'), S('wrap', 'Wrap', ['nowrap', 'wrap', 'wrap-reverse'], 'wrap'), S('just', 'Along the line', ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'], 'space-between'), S('alignI', 'Across the line', ['stretch', 'flex-start', 'center', 'flex-end', 'baseline'], 'center'), R('gap', 'Gap', 0, 40, 10, 'px'), R('n', 'Items', 1, 10, 5, '', 1), B('grow', 'Let items grow', 0)],
    'Flexbox arranges items in one direction. "justify" spreads them along the line; "align" places them across it.',
    p => {
      let items = ''; for (let i = 1; i <= p.n; i++) items += cell(i, `width:${40 + (i * 23) % 50}px;height:${36 + (i * 17) % 40}px;${p.grow ? 'flex:1;' : ''}`);
      const rules = `.flex {\n  display: flex;\n  flex-direction: ${p.dir};\n  flex-wrap: ${p.wrap};\n  justify-content: ${p.just};\n  align-items: ${p.alignI};\n  gap: ${p.gap}px;\n}${p.grow ? '\n.flex > * { flex: 1; }' : ''}`;
      return { rules, inner: `<div style="display:flex;flex-direction:${p.dir};flex-wrap:${p.wrap};justify-content:${p.just};align-items:${p.alignI};gap:${p.gap}px;height:230px">${items}</div>` };
    });

  layoutTool('spacing', 'Spacing scale', [R('base', 'Base unit', 2, 16, 4, 'px'), S('mode', 'Growth', ['Linear (×1, ×2, ×3…)', 'Doubling', 'Golden ratio', 'Tailwind-style'], 'Tailwind-style'), R('steps', 'Steps', 4, 14, 10, '', 1)],
    'A spacing scale keeps margins and paddings consistent so layouts feel tidy. Designers use a handful of fixed steps.',
    p => {
      const TW = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32]; const v = i => p.mode.startsWith('Linear') ? p.base * (i + 1) : p.mode === 'Doubling' ? p.base * Math.pow(2, i) : p.mode === 'Golden ratio' ? Math.round(p.base * Math.pow(1.618, i + 1)) : p.base * (TW[i + 1] || TW[TW.length - 1]);
      const rows = Array.from({ length: p.steps }, (_, i) => [i + 1, v(i)]);
      const rules = ':root {\n' + rows.map(([i, s]) => `  --space-${i}: ${(s / 16).toFixed(3).replace(/\.?0+$/, '')}rem; /* ${s}px */`).join('\n') + '\n}';
      return { rules, inner: rows.map(([i, s]) => `<div style="display:flex;align-items:center;gap:10px;margin:4px 0"><span style="font:11px ui-monospace,monospace;color:#8b93ab;width:70px;flex:none">space-${i} · ${s}px</span><div style="height:12px;width:${Math.min(s, 380)}px;background:linear-gradient(90deg,#7c5cff,#ff5c9d);border-radius:4px"></div></div>`).join('') };
    });

  layoutTool('aspect', 'Aspect ratio box', [S('ratio', 'Ratio', ['16 / 9', '4 / 3', '1 / 1', '3 / 2', '21 / 9', '9 / 16', '4 / 5', '2 / 1'], '16 / 9'), R('w', 'Preview width', 100, 520, 360, 'px', 10), R('rad', 'Roundness', 0, 40, 12, 'px', 1, 1), B('cover', 'Image fills box (object-fit: cover)', 1)],
    'aspect-ratio keeps a box in proportion whatever its width, perfect for video thumbnails and cards.',
    p => { const rules = `.media {\n  aspect-ratio: ${p.ratio};\n  width: 100%;\n  border-radius: ${p.rad}px;${p.cover ? '\n  object-fit: cover;' : ''}\n}`; return { rules, inner: `<div style="width:${p.w}px;max-width:100%;aspect-ratio:${p.ratio};border-radius:${p.rad}px;background:${SF.scene()};margin:auto;position:relative"><span style="position:absolute;left:8px;top:8px;font:600 12px system-ui;color:#fff;background:#0007;border-radius:6px;padding:2px 8px">${p.ratio}</span></div>` }; });

  layoutTool('columns', 'Text / masonry columns', [R('n', 'Columns', 1, 6, 3, '', 1), R('gap', 'Gap', 0, 48, 16, 'px'), R('rule', 'Divider line', 0, 6, 1, 'px', 1, 1), B('avoid', 'Keep items whole', 1), R('items', 'Demo items', 4, 20, 9, '', 1, 1)],
    'CSS columns flow content from one column into the next. With break-inside: avoid it makes a simple masonry layout.',
    p => { const rules = `.columns {\n  column-count: ${p.n};\n  column-gap: ${p.gap}px;${p.rule ? `\n  column-rule: ${p.rule}px solid #7c5cff55;` : ''}\n}\n.columns > * {\n  ${p.avoid ? 'break-inside: avoid;\n  ' : ''}margin-bottom: ${p.gap}px;\n}`; let it = ''; for (let i = 0; i < p.items; i++) it += cell(i + 1, `height:${50 + (i * 37) % 90}px;margin-bottom:${p.gap}px;${p.avoid ? 'break-inside:avoid;' : ''}`); return { rules, inner: `<div style="column-count:${p.n};column-gap:${p.gap}px;${p.rule ? `column-rule:${p.rule}px solid #7c5cff88;` : ''}">${it}</div>` }; });
})();
