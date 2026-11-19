/*
 * StyleForge (working name) — core/explain.js : turns CSS into plain English
 * Copyright (C) 2026 Zarir Madon — GNU GPL v3 or later (see LICENSE)
 */
(function () {
  const D = {
    'background': 'the fill behind the content (colour, gradient or picture)', 'background-color': 'the flat colour behind the content', 'background-image': 'a picture or gradient behind the content', 'background-size': 'how big the background picture is drawn', 'background-position': 'where the background picture sits', 'background-repeat': 'whether the background picture tiles', 'background-clip': 'how far the background reaches (text means only inside the letters)', 'background-blend-mode': 'how background layers mix with each other',
    'color': 'the text colour', 'font': 'text style in one go (weight, size, font)', 'font-family': 'which font is used', 'font-size': 'how big the text is', 'font-weight': 'how bold the text is', 'font-style': 'italic or normal', 'letter-spacing': 'space between letters', 'line-height': 'space between lines of text', 'text-align': 'left, centre or right alignment of text', 'text-shadow': 'a soft shadow or glow behind letters', 'text-transform': 'upper or lower case', 'text-decoration': 'underline or strike-through', 'white-space': 'whether text wraps onto new lines',
    'border': 'a line around the box', 'border-radius': 'rounds the corners (bigger number = rounder)', 'border-color': 'colour of the border', 'border-width': 'thickness of the border', 'border-style': 'solid, dashed, dotted…', 'border-image': 'a gradient or picture used as the border', 'outline': 'a line drawn outside the border (does not take up room)', 'outline-offset': 'gap between the box and its outline',
    'box-shadow': 'a soft shadow (or glow) round the box', 'filter': 'a visual effect on the whole element (blur, brightness, shadow…)', 'backdrop-filter': 'blurs or tints whatever is behind the element (frosted glass)', 'mix-blend-mode': 'how the element mixes with what is behind it', 'opacity': 'how see-through it is (1 = solid, 0 = invisible)', 'mask': 'hides parts of the element using a shape or gradient', 'mask-image': 'the shape or gradient used to hide parts', 'clip-path': 'cuts the element to a shape',
    'display': 'how the box behaves (block, flex, grid, none = hidden)', 'position': 'how the box is placed (relative, absolute, fixed, sticky)', 'top': 'distance from the top', 'left': 'distance from the left', 'right': 'distance from the right', 'bottom': 'distance from the bottom', 'inset': 'distance from all four edges', 'z-index': 'which element sits in front when they overlap',
    'width': 'how wide', 'height': 'how tall', 'min-width': 'never narrower than this', 'max-width': 'never wider than this', 'min-height': 'never shorter than this', 'max-height': 'never taller than this', 'aspect-ratio': 'keeps width and height in proportion', 'margin': 'space outside the box', 'padding': 'space inside the box, around the content', 'gap': 'space between items in a row or grid', 'overflow': 'what happens to content that does not fit (scroll, hide…)', 'box-sizing': 'whether width includes padding and border',
    'flex': 'how a flex item grows and shrinks', 'flex-direction': 'row or column layout', 'flex-wrap': 'whether items wrap onto new lines', 'justify-content': 'spreads items along the main direction', 'align-items': 'aligns items across the main direction', 'align-self': 'aligns just this item', 'place-items': 'centres items both ways', 'place-content': 'centres the whole group both ways', 'grid-template-columns': 'the column sizes of the grid', 'grid-template-rows': 'the row sizes of the grid', 'grid-column': 'which columns an item covers', 'grid-row': 'which rows an item covers', 'grid-auto-flow': 'how new items fill the grid',
    'transform': 'moves, rotates, scales or tilts the element', 'transform-origin': 'the pivot point for the transform', 'transform-style': 'whether children keep their 3D position', 'perspective': 'how strong the 3D depth effect is', 'backface-visibility': 'whether the back of a flipped element shows', 'transition': 'smooth change between states (e.g. on hover)', 'animation': 'plays a keyframe animation', 'animation-duration': 'how long one animation cycle takes', 'animation-delay': 'wait before the animation starts', 'will-change': 'hints to the browser that this will animate',
    'cursor': 'the mouse pointer shape', 'pointer-events': 'whether it can be clicked', 'user-select': 'whether text can be selected', 'appearance': 'removes the default browser look of a control', 'content': 'text or picture inserted by ::before / ::after', 'list-style': 'bullets or numbers of a list', 'object-fit': 'how a picture fills its box', 'scrollbar-color': 'colours of the scrollbar', 'scrollbar-width': 'thickness of the scrollbar', 'column-count': 'number of text columns', 'column-gap': 'space between text columns', 'resize': 'whether the user can drag to resize', 'paint-order': 'whether outline is drawn over or under the fill',
    '-webkit-background-clip': 'cuts the background to the shape of the letters', '-webkit-text-fill-color': 'the text fill colour (transparent shows the background through)', '-webkit-text-stroke': 'an outline around each letter', '-webkit-appearance': 'removes the default look of a control'
  };
  const VAL = {
    'display': { flex: 'items sit in a flexible row or column', grid: 'items sit in rows and columns', none: 'the element is hidden', block: 'takes the full width on its own line', 'inline-block': 'sits in a line like text but keeps its box size' },
    'position': { absolute: 'placed exactly, relative to its parent', fixed: 'stays put on screen when scrolling', sticky: 'sticks when it reaches the edge while scrolling', relative: 'normal place, but can be nudged' },
    'cursor': { pointer: 'a hand, as over a link' }
  };
  function parse(css) {
    const out = []; let cur = '', depth = 0, q = '';
    for (const ch of css) {
      if (q) { cur += ch; if (ch === q) q = ''; continue; }
      if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; }
      if (ch === '(') depth++; if (ch === ')') depth--;
      if (ch === ';' && depth <= 0) { out.push(cur); cur = ''; } else cur += ch;
    }
    if (cur.trim()) out.push(cur);
    return out.map(s => { const i = s.indexOf(':'); return i < 0 ? null : [s.slice(0, i).trim(), s.slice(i + 1).trim()]; }).filter(Boolean);
  }
  function note(p, v) {
    const x = [];
    if (/gradient\(/.test(v)) x.push('a smooth blend between colours');
    if (/url\(/.test(v) && !/gradient/.test(v)) x.push('uses a picture');
    if (/blur\(/.test(v)) x.push('includes a blur');
    if (VAL[p] && VAL[p][v]) x.push(VAL[p][v]);
    if (/var\(/.test(v)) x.push('uses a saved variable');
    if (/calc\(|clamp\(|min\(|max\(/.test(v)) x.push('the size is calculated so it adapts to the screen');
    return x.length ? ' — ' + x.join('; ') : '';
  }
  /* css text (declarations or rules) → list of {sel?, prop, val, text} */
  function explain(css) {
    const lines = [];
    const blocks = /[{]/.test(css) ? [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => [m[1].trim(), m[2]]) : [['', css]];
    blocks.forEach(([sel, body]) => {
      if (sel.startsWith('@keyframes')) { lines.push({ sel, text: 'An animation named "' + sel.replace('@keyframes', '').trim() + '"; its steps are listed in the code.' }); return; }
      parse(body).forEach(([p, v]) => { const d = D[p] || D[p.replace(/^-(webkit|moz)-/, '')]; lines.push({ sel, prop: p, val: v, text: d ? `${p}: ${d}${note(p, v)}` : `${p}: a style setting (${v.slice(0, 40)})` }); });
    });
    return lines;
  }
  SF.explain = explain; SF.cssParse = parse; SF.cssProps = D;
})();
