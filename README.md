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

All components live in a single `src/main.js` file using React elements via `esm.sh`. Each motion panel (loading, toast, braille spinner, dot pulse) is a draggable widget you can rearrange on the canvas. The playground supports two motion modes — **standard** and **calm** — to compare animation feel side-by-side.

Double-click a loading card to duplicate it. Toasts can be triggered from the toast panel controls and cycle through slide, push, and stacked transition modes.
