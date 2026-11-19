/*
 * StyleForge (working name) — sw.js : makes the app work offline
 * Copyright (C) 2026 Zarir Madon — GNU GPL v3 or later (see LICENSE)
 */
const V = 'styleforge-1.0.0';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'style.css', 'assets/icon.svg', 'core/ai.js', 'core/explain.js', 'core/gl.js', 'core/kit.js', 'core/library.js', 'core/sync.js', 'core/util.js', 'tools/assets.js', 'tools/backgrounds.js', 'tools/colour.js', 'tools/controls.js', 'tools/depth.js', 'tools/depth3d.js', 'tools/filters.js', 'tools/generative.js', 'tools/glow.js', 'tools/layout.js', 'tools/motion.js', 'tools/shaders.js', 'tools/shapes.js', 'tools/surfaces.js', 'tools/svgfx.js', 'tools/textures.js', 'tools/type.js', 'ui/app.js', 'ui/builder.js', 'ui/grab.js', 'ui/icons.js', 'ui/library.js', 'ui/make.js', 'ui/preview.js', 'ui/styles.js', 'ui/syncui.js'];
self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
