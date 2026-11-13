# Portfolio

Personal site for Allwin James Andrews. Vite, React, TypeScript and Three.js (React Three Fiber).

## Run

```bash
npm install
npm run dev
```

```bash
npm run build
```

## Layout

Three ways to read it, switchable from every header (`ViewSwitch` in `src/components/Layout.tsx`):

- `/` is the book and the default (`src/pages/Book.tsx`, `src/book.css`). A page-turn book built from the same content:
  two-page spreads on wide screens, one page per turn on phones. Next/Previous, arrow keys, Home/End, swipe, and the
  contents page all turn pages, and a multi-page jump turns the leaves in a quick cascade. The current page is in
  `?p=<id>`, so Back from a case study returns to the same page. 3D demos and video only run on the visible page.
  `prefers-reduced-motion` turns the flip into an instant swap.
- `/world` is the walkable 3D game (`src/pages/World.tsx`, `src/world/`). Visitors walk a stitched path and open each
  project as a landmark. Landmark positions and collectibles are in `src/world/stations.ts`. It falls back to the
  book when WebGL is missing or the 3D context is lost.
- `/work` is the plain view: a table by default, with a toggle for cards and 3D demos.
- `/projects/<slug>` is one page per project, so each can be linked directly.
- `/services` is the AJA IT Services freelance page. It is not in the main navigation on purpose.

Controls: WASD or arrow keys, click or tap the ground, or drag to steer. E, Enter or tapping the prompt opens a landmark.

## Content

All copy lives in `src/data/projects.ts`. Every claim there must match
the profile notes kept outside this repo.

## The 3D scenes use real data

| Scene | Data | Regenerate with |
|---|---|---|
| Kadha designs (hero, hoop, picker) | `public/data/stitches/<id>.json`, one per design in `src/data/designs.ts` | `python scripts/export_stitches.py <file.pes> public/data/stitches/<id>.json`, plus an image at `public/media/kadha/<id>.jpg` |
| fitness-ai skeleton | `public/data/pose.json`, MediaPipe over the demo clip | `python scripts/export_pose.py <video.mp4> public/data/pose.json` |
| Monte Carlo fan | `public/data/montecarlo.json`, from the trading-bot backtester | run `scripts/export_montecarlo.py` from the trading-bot folder with its venv |

## Deploy

```bash
npm run deploy
```

This builds the site and pushes `dist/` to the `gh-pages` branch, which GitHub Pages serves.
The site assumes it is served from the domain root (a repo named `allwinandrews.github.io`).
For any other repo name, change `base` in `vite.config.ts`.
