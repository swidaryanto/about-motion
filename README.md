# About — Motion Playground

Interactive sandbox for testing motion patterns used in `widaryanto.com`. Exploration at its best.

## Purpose

Use this repo to quickly explore:
- Loading UI variations (spinner cards, braille spinner, dot-pulse animation)
- Toast transition behavior (slide, push, stacked modes)
- Draggable UI components with spring physics
- Top-corner progress bar patterns
- Reduced-motion and mobile-responsive layouts

Before shipping any micro-interaction to the main site, prototype and iterate here.

## Tech Stack

- **Vite** — fast dev server and build tool
- **React 18** — loaded via `esm.sh` (no bundler needed)
- **Framer Motion** — animation primitives (`motion`, `AnimatePresence`, `useReducedMotion`)
- **ESLint** — linting for `src/**/*.js`

## Setup

```bash
# Clone the repo
git clone https://github.com/swidaryanto/about-motion.git
cd about-motion

# Install dependencies
npm install

# Start dev server
npm run dev
```

Then open the local URL printed by Vite (usually `http://localhost:5173`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint on `src/` |

## How it works

Components currently live in `src/main.js` and import locally installed React and Framer Motion packages. Each active motion panel is draggable on desktop and follows normal document flow on mobile.

Toast controls can add or reset notifications and compare slide, fade, and scale transitions. Motion examples cycle through skeleton, progress, and success states.
