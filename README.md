# upnest — Client Console (Next.js)

Client portal for the upnest platform. Mirrors the original `upnest.html` Client app pixel-for-pixel.

## Run

```bash
npm install
npm run dev
```

Then open http://localhost:3002

## Architecture

A native Next.js 14 (App Router) app, fully TypeScript. The original
inline-JSX prototype that ran via `@babel/standalone` has been ported to
real ESM modules under `components/` and `lib/`:

- `app/(app)/` — authenticated routes (overview, roles, candidates, etc.).
  Each page imports its TSX section directly and wraps it in
  `<LoadingFrame>` for the skeleton transition.
- `app/(public)/` — login & signup.
- `components/` — every UI piece (sections, modals, shell, icons,
  toasts, skeletons). All `.tsx`.
- `lib/admin-data.ts` — shared mock dataset (typed).
- `lib/candidate-store.ts` — in-memory pipeline store with subscribe/notify.
- `app/globals.css` — the original `styles.css`, untouched.

There is no longer any browser-time Babel, no `window.*` registry, and no
`public/src/*.jsx`. Every component is type-checked and tree-shaken at
build time.

## Auth (demo)

Auth state is kept in `localStorage` under `upnest:auth`. Use the Login
screen's "Enter as client" button (or the bottom route bar) to sign in.

## Mock data

All data is generated in `lib/admin-data.ts` — no backend.
