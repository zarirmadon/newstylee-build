/* StyleForge (working name) — tools/assets.js — Copyright (C) 2026 Zarir Madon — GNU GPL v3 or later (see LICENSE) */
(function () {
  const { R, C, S, B, X } = SF, U = SF.u;
  SF.category('Assets', 'Icon maker and SVG cleaner');

  SF.cvTool({
    id: 'icon-maker', name: 'App icon maker', cat: 'Assets', learn: 'Makes a square gradient icon with a glyph. Export as PNG, and use the same file for app icons and favicons.',
    p: [S('shape', 'Shape', ['Rounded square', 'Circle', 'Squircle', 'Full square'], 'Rounded square'), C('c1', 'Gradient start', '#7c5cff'), C('c2', 'Gradient end', '#ff5c9d'), R('angle', 'Gradient direction', 0, 360, 135, '°'), S('glyph', 'Glyph', ['A', 'S', 'F', '★', '✦', '●', '▲', '♥', '☀', '⚡', '✿', 'Aa'], 'S'), R('gs', 'Glyph size', 20, 90, 58, '%'), C('gc', 'Glyph colour', '#ffffff'), R('sh', 'Glyph shadow', 0, 40, 14, '%', 1, 1), B('shine', 'Top shine', 1)],
    draw(ctx, w, h, p) {
      const s = Math.min(w, h), x0 = (w - s) / 2, y0 = (h - s) / 2; ctx.clearRect(0, 0, w, h); ctx.fillStyle = '#0d1020'; ctx.fillRect(0, 0, w, h);
      const a = p.angle * Math.PI / 180, cx = w / 2, cy = h / 2, dx = Math.cos(a) * s / 2, dy = Math.sin(a) * s / 2, g = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy); g.addColorStop(0, p.c1); g.addColorStop(1, p.c2);
      const m = s * .12, S0 = s - m * 2, X0 = x0 + m, Y0 = y0 + m; ctx.beginPath();
      if (p.shape === 'Circle') ctx.arc(cx, cy, S0 / 2, 0, 7); else if (p.shape === 'Full square') ctx.rect(x0, y0, s, s); else { const r = p.shape === 'Squircle' ? S0 * .34 : S0 * .22, R0 = p.shape === 'Full square' ? 0 : r; ctx.moveTo(X0 + R0, Y0); ctx.arcTo(X0 + S0, Y0, X0 + S0, Y0 + S0, R0); ctx.arcTo(X0 + S0, Y0 + S0, X0, Y0 + S0, R0); ctx.arcTo(X0, Y0 + S0, X0, Y0, R0); ctx.arcTo(X0, Y0, X0 + S0, Y0, R0); ctx.closePath(); }
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = s * .04; ctx.shadowOffsetY = s * .02; ctx.fillStyle = g; ctx.fill(); ctx.restore();
      if (p.shine) { ctx.save(); ctx.clip(); const sg = ctx.createLinearGradient(0, y0, 0, y0 + s * .6); sg.addColorStop(0, 'rgba(255,255,255,.3)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = sg; ctx.fillRect(x0, y0, s, s * .6); ctx.restore(); }
      ctx.save(); ctx.fillStyle = p.gc; ctx.font = `800 ${S0 * p.gs / 100}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = `rgba(0,0,0,${p.sh / 100})`; ctx.shadowBlur = s * .03; ctx.shadowOffsetY = s * .015; ctx.fillText(p.glyph, cx, cy + S0 * .03); ctx.restore();
    }
  });

  const SAMPLE = '<?xml version="1.0" encoding="UTF-8"?>\n<!-- Created with an editor -->\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" viewBox="0 0 100 100" width="100.000" height="100.000">\n  <metadata>editor stuff</metadata>\n  <circle cx="50.123456" cy="50.123456" r="40.000000" fill="#ff5c9d"  stroke="#7c5cff" stroke-width="6.000"/>\n  <path d="M30.55555 52.11111 L45.98765 66.43210 L72.00000 34.12345" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>\n</svg>';
  SF.tool({
    id: 'svg-clean', name: 'SVG cleaner', cat: 'Assets', kind: 'svg',
    learn: 'Editors leave comments, metadata and long decimals in SVG files. Cleaning them makes the file smaller and faster without changing how it looks.',
    p: [SF.X('src', 'Paste your SVG here', SAMPLE, 0, 8), R('dec', 'Decimal places', 0, 5, 2, '', 1), B('comments', 'Remove comments', 1), B('meta', 'Remove metadata & editor tags', 1), B('ws', 'Squash spaces', 1)],
    r(p) {
      let s = String(p.src || ''); const before = s.length;
      if (p.comments) s = s.replace(/<!--[\s\S]*?-->/g, '');
      s = s.replace(/<\?xml[\s\S]*?\?>/g, '');
      if (p.meta) { s = s.replace(/<metadata[\s\S]*?<\/metadata>/gi, '').replace(/\s(xmlns:(inkscape|sodipodi|dc|cc|rdf)|inkscape:[\w-]+|sodipodi:[\w-]+)="[^"]*"/g, ''); }
      s = s.replace(/-?\d*\.\d+/g, m => { const n = +(+m).toFixed(p.dec); return String(n); });
      if (p.ws) s = s.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').replace(/\s+\/>/g, '/>').trim();
      const after = s.length, pct = before ? Math.round((1 - after / before) * 100) : 0;
      const code = s + `\n<!-- ${before} → ${after} bytes (${pct}% smaller) -->`;
      const ok = /<svg[\s>]/.test(s) ? s : '<div style="color:#ff8fa3;font:14px system-ui">Paste a full &lt;svg&gt; … &lt;/svg&gt; to see it here</div>';
      return { svg: /<svg[\s>]/.test(s) ? s : '', html: `<div style="width:60%;height:70%;display:grid;place-items:center">${ok}</div><div style="position:absolute;left:12px;bottom:10px;font:600 12px system-ui;color:#35d0ba">${before} → ${after} bytes · ${pct}% smaller</div>`, code, bg: '#0f1320' };
    }
  });
})();
