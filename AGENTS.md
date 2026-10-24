# Repository Guidelines

## Project Structure & Module Organization
- Solid + Vite client lives in `src/` (`App.tsx`, `components/Terminal.tsx` for the xterm UI, `utils/` for shell + texture helpers, `shaders/` for CRT visuals). Styling is centralized in `src/index.css` with Tailwind v4 utilities.
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
- No automated tests exist yet. For manual checks: `npm run build`, preview, ensure the terminal renders and accepts input (`help`, `ls projects`, `cat projects/<id>.md`) on desktop and a ~390px mobile viewport.

## Commit & Pull Request Guidelines
- Commit messages follow short, imperative subjects similar to current history (e.g., “Add Spectrum-style power button”). Keep them under ~72 chars; no trailing period.
- PRs should include: what changed and why, affected areas (UI, deployment), test notes/commands executed, and screenshots or recordings for UI changes. Link issues or TODOs when applicable.

