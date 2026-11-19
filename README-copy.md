# StyleForge (working name)

One place for web-design work: make CSS and effects (124 tools), grab colours, fonts,
gradients, shadows, SVGs and animations from web pages, keep them in a Library under
your own headings, edit stylesheets, build pages by drag and drop, and sync it all
with your own private GitHub repo.

Created and designed by Zarir Madon — www.zarirmadon.com — Coded by Claude Sonnet 5.5.
Licence: GPL-3 (see LICENSE).

## Run it
Put the folder on any static web host (GitHub Pages works) and open index.html over
https. It installs as an app (PWA) and then works offline. No build step, no outside links.
Locally: `python3 -m http.server` in this folder, then open http://localhost:8000.

## Sync
Make a private repo, a fine-grained token with Contents read+write for that repo only,
paste both on the Sync screen. The token stays on that device.

## AI helper (optional)
Settings -> paste your own Gemini or Claude key. It runs only when you press an AI button.

## Honest limits
- Sync and AI were tested against pretend servers, not the real GitHub/Gemini/Claude.
- Grab from a link only works if the site allows it; use the Grab button, a saved page, or paste.
- Builder has no per-screen-size styles, and shader/canvas effects are inserted as pictures.
- Tailwind export uses arbitrary-property classes.
- No Android app shell and no QR code yet.
- It is many small files (modular by design), not one file.
