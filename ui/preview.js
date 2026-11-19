/*
 * StyleForge (working name) — ui/preview.js : renders tool results (live, thumbnails, PNG/SVG export)
 * Copyright (C) 2026 Zarir Madon — GNU GPL v3 or later (see LICENSE)
 */
(function () {
  const U = SF.u;
  let n = 0;
  const BASE = bg => `:host{display:block;position:relative;width:100%;height:100%;overflow:hidden;background:${bg}}.pvr{position:absolute;left:0;top:0;display:flex;align-items:center;justify-content:center;transform-origin:0 0}.fill{width:80%;height:78%;max-width:620px;border-radius:18px;position:relative}canvas{display:block}`;
  const fxfix = (s, id) => s ? SF.fxid(s, id) : s;
  /* wrap tree-scoped content in an XHTML-safe string */
  function xhtml(html) { const d = document.createElement('div'); d.innerHTML = html; return new XMLSerializer().serializeToString(d); }

  /* mount a result into host (shadow DOM keeps every tool's CSS separate). opts: {thumb, still} */
  function mount(host, res, opts = {}) {
    if (host._pv) host._pv.stop();
    const sr = host._sr || (host._sr = host.attachShadow({ mode: 'open' }));
    const id = 'fx' + (++n), W = host.clientWidth || 300, H = host.clientHeight || 200;
    let vw, vh, s;
    if (opts.thumb) { vw = 560; vh = 340; s = Math.max(W / vw, H / vh); }
    else { const z = opts.zoom || 1; vw = Math.max(W, 600) / z; s = W / vw; vh = H / s; }
    const ox = opts.thumb ? (W - vw * s) / 2 : 0, oy = opts.thumb ? (H - vh * s) / 2 : 0;
    const frozen = opts.thumb || opts.still ? '*{animation-play-state:paused!important;animation-delay:-.7s!important}' : '';
    let inner = '', cv = null;
    if (res.gl || res.draw) inner = `<canvas></canvas>`;
    else inner = (fxfix(res.html, id) || '') + (res.fxsvg && !/<defs>/.test(res.html || '') ? fxfix(res.fxsvg, id) : '');
    sr.innerHTML = `<style>${BASE(res.bg || '#0f1320')}${frozen}</style><div class="pvr" style="width:${vw}px;height:${vh}px;transform:translate(${ox}px,${oy}px) scale(${s})">${inner}</div>`;
    const h = { stop() { this.dead = true; if (this.gl) this.gl.stop(); cancelAnimationFrame(this.raf); } };
    host._pv = h;
    cv = sr.querySelector('canvas');
    if (cv) {
      const dpr = opts.thumb ? 1 : Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round((opts.thumb ? 280 : vw) * dpr); cv.height = Math.round((opts.thumb ? 170 : vh) * dpr);
      cv.style.width = '100%'; cv.style.height = '100%';
      if (res.gl) {
        if (opts.thumb || opts.still) { const u = SF.gl.still(res.gl, 280, 170, 2.2); if (u) { const im = new Image(); im.src = u; im.style.cssText = 'width:100%;height:100%'; cv.replaceWith(im); } else cv.replaceWith(Object.assign(document.createElement('div'), { textContent: 'WebGL not available', style: 'color:#8b93ab;font:12px system-ui;padding:8px' })); }
        else { try { h.gl = SF.gl.run(cv, res.gl, res.anim !== false); } catch (e) { cv.replaceWith(Object.assign(document.createElement('div'), { textContent: 'WebGL is not available on this device: ' + e.message, style: 'color:#ff8fa3;font:12px system-ui;padding:12px' })); } }
      } else {
        const ctx = cv.getContext('2d'), t0 = performance.now();
        const go = () => { if (h.dead) return; try { res.draw(ctx, cv.width, cv.height, opts.thumb || opts.still ? 2 : (performance.now() - t0) / 1000); } catch (e) { ctx.fillStyle = '#ff6b81'; ctx.font = '14px system-ui'; ctx.fillText('Drawing error: ' + e.message, 10, 24); return; } if (res.anim && !opts.thumb && !opts.still) h.raf = requestAnimationFrame(go); };
        go();
      }
    }
    if (!opts.thumb && !host._ro) { host._ro = new ResizeObserver(() => { if (host._last && !host._pending) { host._pending = 1; requestAnimationFrame(() => { host._pending = 0; if (host.clientWidth) mount(host, host._last, host._opts); }); } }); host._ro.observe(host); }
    host._last = res; host._opts = opts;
    return h;
  }

  /* lazy thumbnails: render a tool (or any result factory) when the card scrolls into view */
  let io, q = [], busy = 0;
  function pump() { if (busy || !q.length) return; busy = 1; const f = q.shift(); setTimeout(() => { try { f(); } catch (e) { } busy = 0; pump(); }, 0); }
  function lazy(host, make) {
    if (!io) io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); const h = e.target; q.push(() => { const r = h._make(); if (r) mount(h, r, { thumb: true }); }); pump(); } }), { rootMargin: '200px' });
    host._make = make; io.observe(host);
  }
  function toolThumb(host, tool) { lazy(host, () => tool.r(SF.defaults(tool))); }

  /* ---------- export ---------- */
  function loadImg(src) { return new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('The browser could not draw this as a picture')); i.src = src; }); }
  function foSvg(res, w, h) {
    const id = 'fxe' + (++n), body = xhtml(`<div class="pvr-e" style="position:relative;width:${w}px;height:${h}px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:${res.bg || '#0f1320'}"><style>.fill{width:80%;height:78%;max-width:620px;border-radius:18px;position:relative}</style>${fxfix(res.html, id) || ''}${res.fxsvg && !/<defs>/.test(res.html || '') ? fxfix(res.fxsvg, id) : ''}</div>`);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><foreignObject width="100%" height="100%">${body}</foreignObject></svg>`;
  }
  async function png(res, w = 1600, h = 1000) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
    if (res.draw) { res.draw(x, w, h, 2); }
    else if (res.gl) { const u = SF.gl.still(res.gl, w, h, 2.2); if (!u) throw new Error('WebGL is not available here'); x.drawImage(await loadImg(u), 0, 0); }
    else { const img = await loadImg(U.svgURI(foSvg(res, w / 2, h / 2))); x.drawImage(img, 0, 0, w, h); }
    return new Promise((ok, no) => c.toBlob(b => b ? ok(b) : no(new Error('The browser blocked saving this picture (it treats it as private)')), 'image/png'));
  }
  function svgFile(res) {
    if (res.svg) return res.svg;
    if (res.fxsvg) return null;
    if (res.html && !res.draw && !res.gl) return foSvg(res, 800, 500);
    return null;
  }
  SF.pv = { mount, lazy, toolThumb, png, svgFile, foSvg, xhtml };

  /* ---------- code conversion ---------- */
  /* Tailwind (arbitrary-property classes) for plain "prop: value;" declarations */
  SF.tw = css => {
    if (/[{}@]/.test(css)) return null;
    const out = css.split(';').map(s => s.trim()).filter(Boolean).map(s => { const i = s.indexOf(':'); if (i < 0) return ''; const k = s.slice(0, i).trim(), v = s.slice(i + 1).trim().replace(/\s*!important$/, ''); return `[${k}:${v.replace(/\s+/g, '_').replace(/'/g, '%27')}]`; }).filter(Boolean);
    return out.length ? out.join(' ') : null;
  };
  SF.scss = css => /[{}@]/.test(css) ? css : `.element {\n${css.split(';').map(s => s.trim()).filter(Boolean).map(s => '  ' + s + ';').join('\n')}\n}`;
  SF.jsStyle = css => {
    if (/[{}@]/.test(css)) return null;
    const o = css.split(';').map(s => s.trim()).filter(Boolean).map(s => { const i = s.indexOf(':'); const k = s.slice(0, i).trim().replace(/^-webkit-/, 'Webkit-').replace(/-([a-z])/g, (m, c) => c.toUpperCase()), v = s.slice(i + 1).trim().replace(/'/g, "\\'"); return `  ${k}: '${v}',`; });
    return `const style = {\n${o.join('\n')}\n};`;
  };
})();
