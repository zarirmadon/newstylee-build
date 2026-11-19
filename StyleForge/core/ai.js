/*
 * StyleForge (working name) — core/ai.js : optional bring-your-own-key AI helper (only runs when you press a button)
 * Copyright (C) 2026 Zarir Madon — GNU GPL v3 or later (see LICENSE)
 */
(function () {
  const U = SF.u;
  const A = SF.ai = {
    cfg() { return Object.assign({ prov: 'none', key: '', model: '' }, U.store.get('ai', {})); },
    set(c) { U.store.set('ai', c); },
    ready() { const c = A.cfg(); return c.prov !== 'none' && !!c.key; },
    model(c) { return c.model || (c.prov === 'gemini' ? 'gemini-2.5-flash' : 'claude-sonnet-5-5'); },
    /* returns text, or throws an Error with a plain-English message */
    async call(system, user) {
      const c = A.cfg(); if (!A.ready()) throw new Error('No AI key is set yet. Open Settings and paste a key first.');
      let r;
      try {
        if (c.prov === 'gemini') {
          r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(A.model(c))}:generateContent?key=${encodeURIComponent(c.key)}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: user }] }], generationConfig: { temperature: .7 } }) });
        } else {
          r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': c.key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }, body: JSON.stringify({ model: A.model(c), max_tokens: 3000, system, messages: [{ role: 'user', content: user }] }) });
        }
      } catch (e) { throw new Error('Could not reach the AI service (' + e.message + '). Check your internet connection.'); }
      let j; try { j = await r.json(); } catch (e) { throw new Error('The AI service sent back something unreadable (HTTP ' + r.status + ').'); }
      if (!r.ok) throw new Error('The AI service said no (HTTP ' + r.status + '): ' + ((j.error && (j.error.message || j.error.type)) || 'unknown reason'));
      const t = c.prov === 'gemini' ? (j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts || []).map(p => p.text || '').join('') : (j.content || []).map(p => p.text || '').join('');
      if (!t) throw new Error('The AI sent back an empty answer.');
      return t;
    },
    json(t) { const a = t.indexOf('{'); if (a < 0) throw new Error('The AI did not answer with settings I can use.'); let d = 0, q = '', e = -1; for (let i = a; i < t.length; i++) { const ch = t[i]; if (q) { if (ch === '\\') i++; else if (ch === q) q = ''; continue; } if (ch === '"') q = ch; else if (ch === '{') d++; else if (ch === '}') { d--; if (!d) { e = i; break; } } } if (e < 0) throw new Error('The AI answer was cut off.'); try { return JSON.parse(t.slice(a, e + 1)); } catch (x) { throw new Error('The AI answer was not valid settings.'); } },
    /* ask for new values for a tool; returns {vals, changes[]} where only valid keys are accepted */
    async tweak(tool, vals, wish) {
      const spec = tool.p.map(p => ({ key: p.k, label: p.l, type: p.t || 'number', min: p.min, max: p.max, options: p.o, current: vals[p.k] }));
      const sys = 'You adjust settings of a web design tool. Reply with ONLY a JSON object of the keys you want to change, with new values. Numbers must stay within min/max. Colours are #rrggbb. Selects must be one of the options. Toggles are 0 or 1. No explanation.';
      const t = await A.call(sys, `Tool: ${tool.name}\nSettings: ${JSON.stringify(spec)}\nRequest: ${wish}`);
      const o = A.json(t), nv = Object.assign({}, vals), changes = [], skipped = [];
      tool.p.forEach(p => {
        if (!(p.k in o)) return; let v = o[p.k], ok = true;
        if (p.t === 'c') ok = /^#[0-9a-f]{6}$/i.test(v); else if (p.t === 's') ok = p.o.includes(v); else if (p.t === 'b') v = v ? 1 : 0; else if (p.t === 'x') v = String(v); else { v = +v; ok = isFinite(v); if (ok) v = U.clamp(v, p.min, p.max); }
        if (!ok) { skipped.push(p.l); return; }
        if (String(nv[p.k]) !== String(v)) { changes.push(`${p.l}: ${nv[p.k]} → ${v}`); nv[p.k] = v; }
      });
      return { vals: nv, changes, skipped };
    }
  };
})();
