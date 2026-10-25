# Repository Guidelines

## Project Structure & Module Organization
- Solid + Vite client lives in `src/` (`App.tsx`, `components/Terminal.tsx` for the CRT monitor and xterm UI, `components/CRTFrame.tsx` for the moulded bezel drawn as SVG over the glass, `components/ControlPanel.tsx` for the side panel with avatar, links and keypad, `utils/` for shell + texture helpers, `shaders/` for CRT visuals).
- The look reproduces the approved mock `retrofuturism-1` (1979 console). Proportions and colours were sampled from it: sizes live as container units in `src/index.css`, band widths and per-face colours in `CRTFrame.tsx` (lit from above-left: the top slope of the recess is in shadow, the bottom one bright). Keep them in sync with the mock rather than eyeballing. Green-phosphor colours are in `src/config/phosphor.ts`, the text area inside the glass in `src/config/screen.ts`.
- Textures in `public/textures/` (`grime.svg` for the plastic, `metal.svg` for the panel, `screw.svg`) are static SVGs: noise filters plus seeded rust specks.
- Fonts are self-hosted: JetBrains Mono for the terminal, Barlow Semi Condensed (800) for the panel labels and keypad. The terminal font is sized so the banner's longest intro line fits on one row; xterm snaps cells to whole device pixels and FitAddon always reserves 15px for a scrollbar, both accounted for in `Terminal.tsx` / `screen.ts`.
- The logo is box-drawing characters, which xterm draws as 1px lines; `utils/terminalTexture.ts` thickens rows containing them when compositing the WebGL texture.
- `src/brand/` is vendored from genar-brand by its propagate workflow: never edit it. Links, bio, projects and page metadata (`index.html` `%brand.*%` placeholders, filled in `vite.config.ts`) all read from it; change them in genar-brand.
- `public/_redirects` sends the old 2017-2019 Hexo paths to `/`.
- Top-level config lives in `vite.config.ts`, `tsconfig.json`, and package manager locks (`pnpm-lock.yaml`, `package-lock.json`, `bun.lock`).

## Build, Test, and Development Commands
- Install: `npm install` (pnpm/yarn also fine).
- Dev server: `npm run dev` (Vite on http://localhost:3000).
- Production build: `npm run build` (bundle in `dist/`). Preview with Pages semantics (redirects): `npx wrangler pages dev dist`.
- Deploy: `npm run deploy` (Cloudflare Pages project `genar-me`, serves genar.me).

## Coding Style & Naming Conventions
- TypeScript/TSX uses 2-space indent, semicolons, and `const` by default. Components and files are PascalCase in `components/` and camelCase utilities in `utils/`. Keep Solid patterns (signals/hooks) and prefer descriptive variable names over abbreviations.
- Styling mixes Tailwind utility classes and handcrafted CSS; keep CRT theming in `src/index.css` or new module-scoped files.

## Testing Guidelines
- No automated tests exist yet. For manual checks: `npm run build`, preview, ensure the terminal renders and accepts input (`help`, `ls projects`, `cat projects/<id>.md`, keypad keys) on desktop and a ~390px mobile viewport.
- Check rendering in a browser with a real device pixel ratio (e.g. Chromium with `--force-device-scale-factor`). Browsers that only emulate a fractional DPR confuse xterm's canvas sizing and cut the text off on the right.

## Commit & Pull Request Guidelines
- Commit messages follow short, imperative subjects similar to current history (e.g., “Add Spectrum-style power button”). Keep them under ~72 chars; no trailing period.
- PRs should include: what changed and why, affected areas (UI, deployment), test notes/commands executed, and screenshots or recordings for UI changes. Link issues or TODOs when applicable.

