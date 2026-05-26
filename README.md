# About — Motion Playground

Interactive sandbox for testing motion patterns used in `widaryanto.com`.
Focus: draggable panels, loading states, toast behavior, and micro-interaction timing.

## Purpose

Use this repo to quickly explore:
- loading UI variations
- toast transition behavior
- small interaction polish before shipping to main site

## Current UI Modules

- `UnifiedLoadingPanel`:
  Loading suite with spinner, braille spinner, pulse dots, and matrix dots.
- `ToastPanel`:
  Toast demo with `slide`, `fade`, and `scale` transitions.
- `MotionExamples`:
  Extra motion patterns (for example skeleton shimmer).
- `EmilModalDemo`:
  Modal interaction sample.

Source: `/Users/hypefast/Documents/about/src/main.js`

## Run Locally

1. Install dependencies:
```bash
npm install
```
2. Start dev server:
```bash
npm run dev
```
3. Open local URL from Vite output (usually `http://127.0.0.1:5173`).

## Important Preview Note

Do not preview with `file:///.../index.html`.
This app imports React and Framer Motion from ESM URL modules, so `file://` preview can fail and show only background.

Use HTTP instead:
- `npm run dev`
- or `python3 -m http.server 8001 --bind 127.0.0.1`

## Scripts

- `npm run dev`: start dev server
- `npm run build`: create production build in `dist/`
- `npm run preview`: preview production build
- `npm run lint`: run ESLint

## Project Structure

- `/Users/hypefast/Documents/about/index.html`: HTML shell + metadata
- `/Users/hypefast/Documents/about/src/main.js`: all UI logic/components/animation
- `/Users/hypefast/Documents/about/styles/main.css`: styling, layout, motion timing

## Editing Guide

- Width and placement defaults:
  edit `getDefaultLoadingPos`, `getDefaultToastPos`, `getDefaultMotionExamplesPos` in `src/main.js`.
- Panel visuals:
  edit `.loading-suite-panel`, `.toast-panel`, `.motion-example-panel` in `styles/main.css`.
- Metadata:
  edit `<title>` and `<meta name="description">` in `index.html`.

## Quality Check Before Push

```bash
npm run lint
npm run build
```
