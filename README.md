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

- `/` is the employer-facing site. The `3D / Plain` toggle (or `?view=plain`) switches to a fast table view.
- `/projects/<slug>` is one page per project, so each can be linked directly.
- `/services` is the AJA IT Services freelance page. It is not in the main navigation on purpose.

## Content

All copy lives in `src/data/projects.ts`. Every claim there must match
the profile notes kept outside this repo.

## The 3D scenes use real data

| Scene | Data | Regenerate with |
|---|---|---|
| Hero embroidery | `public/data/stitches.json`, a Kadha PES file | `python scripts/export_stitches.py <file.pes> public/data/stitches.json` |
| fitness-ai skeleton | `public/data/pose.json`, MediaPipe over the demo clip | `python scripts/export_pose.py <video.mp4> public/data/pose.json` |
| Monte Carlo fan | `public/data/montecarlo.json`, from the trading-bot backtester | run `scripts/export_montecarlo.py` from the trading-bot folder with its venv |

## Deploy

```bash
npm run deploy
```

This builds the site and pushes `dist/` to the `gh-pages` branch, which GitHub Pages serves.
The site assumes it is served from the domain root (a repo named `allwinandrews.github.io`).
For any other repo name, change `base` in `vite.config.ts`.
