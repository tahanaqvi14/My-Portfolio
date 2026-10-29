# Taha Naqvi — Portfolio v4

Personal portfolio of Taha Naqvi, full-stack software engineer. The whole site is
one 3D world rendered with WebGL: scrolling flies a camera along a curving route
through ten stops, and every heading, paragraph and project lives in that space.

## The stops

| #  | Stop         | In the scene                                                              |
| -- | ------------ | ------------------------------------------------------------------------- |
| 01 | Hello        | the name in solid chrome letters inside a glowing eclipse ring            |
| 02 | Intent       | a spiral galaxy beside the statement                                      |
| 03 | About        | a globe turned to face Karachi, with a beacon and arcs to cities worldwide |
| 04 | Toolbox      | a floating keyboard: MERN on the top row, the rest of the stack below     |
| 05 | DocMind AI   | a floating screen running an animated version of the product              |
| 06 | CodeArena    | the same, with a live match, timer and scoreboard                         |
| 07 | Anchor       | the same, with a negotiation, its ledger and a feedback report            |
| 08 | Journey      | three glowing gates, one per step so far                                  |
| 09 | Contact      | a paper plane — it takes off when a message is sent                       |
| 10 | Fin          | the sign-off in chrome under a dimmer echo of the opening ring            |

Leaving the first stop, the two words part and the camera flies through the
ring; between stops, light streaks and wireframe scenery rush past.

## Things to try

- **Move the mouse** over the name: a light follows the cursor across the chrome.
- **Hover (or tap) the keys** on the keyboard; when idle it types by itself.
- **Click a project screen** to open the live demo.
- **Send a message**: the paper plane takes off and glides back in.

## How it works

- `src/world/World.js` — renderer (bloom + MSAA, studio reflections), the camera's
  flight path, scroll → camera mapping, pointer and click picking, adaptive
  quality for slower devices.
- `src/world/stations/*` — one module per stop: its 3D objects, its copy and its
  layout for wide and tall screens.
- `src/world/Panel.js` — stacks blocks of 3D text like a column of HTML, sized in
  CSS pixels so copy reads at a steady size on every screen.
- `src/world/text.js` — crisp 3D text (troika-three-text) with self-hosted fonts.
- `src/world/lettering.js` + `glyphs.json` — bevelled extruded letters. The glyph
  outlines are generated from Archivo Black by `node scripts/build-glyphs.mjs`.
- `src/world/mockups.js` — the animated product screens, drawn on canvases.
- `src/sections/Content.jsx` — the same content as real HTML: read by screen
  readers and search engines, it also gives each stop its scroll length and
  becomes the visible page when WebGL is unavailable.

Respects `prefers-reduced-motion` (cuts between stops instead of flying, no idle
animation), works with keyboard and touch, and lays out for phones, tablets,
landscape phones and desktops.

## Tech

React 19 · Vite · three.js · troika-three-text · Tailwind CSS v4 · GSAP · Lenis ·
EmailJS · Archivo, Fraunces and IBM Plex Mono

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the production build
npm run lint
```

## Editing content

Copy, links, projects, experience, socials and the EmailJS keys live in
[`src/data/content.js`](src/data/content.js); the order of the stops is in
[`src/data/chapters.js`](src/data/chapters.js) and
[`src/world/stations/index.js`](src/world/stations/index.js). The résumé is
[`public/Resume1.pdf`](public/Resume1.pdf).

Text drawn in 3D can only use characters the bundled fonts contain (no arrows
such as ↗); anything else is dropped, so the page never fetches fallback fonts.

The contact form sends through EmailJS. If messages stop arriving and the
browser console shows `412 Gmail_API: Invalid grant`, reconnect the Gmail
account under **Email Services** in the EmailJS dashboard.

## Deploying

Works out of the box on Vercel (`vercel.json`) and Netlify (`public/_redirects`).
Old links to `/lastpage` land on the first project.
