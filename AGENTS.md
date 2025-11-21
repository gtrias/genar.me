# Repository Guidelines

## Project Structure & Module Organization
- Solid + Vite client lives in `src/` (`App.tsx`, `components/Terminal.tsx` for the xterm UI, `utils/` for shell + texture helpers, `shaders/` for CRT visuals). Styling is centralized in `src/index.css` with Tailwind v4 utilities.
- Go SSH/WebSocket backend is under `ssh-server/` (`main.go`, `websocket.go`, `commands.go`, `tui.go`); the built binary `genar-ssh` is kept there alongside `Dockerfile` and `fly.toml`.
- Top-level config lives in `vite.config.ts`, `tsconfig.json`, and package manager locks (`pnpm-lock.yaml`, `package-lock.json`, `bun.lock`).

## Build, Test, and Development Commands
- Install: `npm install` (pnpm/yarn also fine).
- Frontend dev only: `npm start` or `npm run dev:vite` (Vite on http://localhost:5173).
- Full stack dev loop: `npm run dev` (concurrently runs Vite and Go nodemon inside `ssh-server`).
- Production builds: `npm run build` (frontend bundle in `dist/`), `npm run build:go` (produces `ssh-server/genar-ssh`).
- Preview static bundle: `npm run serve`.

## Coding Style & Naming Conventions
- TypeScript/TSX uses 2-space indent, semicolons, and `const` by default. Components and files are PascalCase in `components/` and camelCase utilities in `utils/`. Keep Solid patterns (signals/hooks) and prefer descriptive variable names over abbreviations.
- Styling mixes Tailwind utility classes and handcrafted CSS; keep CRT theming in `src/index.css` or new module-scoped files.
- Go code should remain gofmt-clean, use small focused functions, and follow the existing Wish/Bubble Tea middleware structure. Filenames stay lowercase with hyphens or underscores as already used.

## Testing Guidelines
- No automated tests exist yet. For manual checks: run `npm run dev`, load the UI, ensure the terminal renders and accepts input; in another shell, `npm run dev:go` (or let `npm run dev` handle it) and hit `ssh localhost -p 23234` or `ws://localhost:8080/ws` to confirm interactive echo.
- Before shipping, at minimum run `npm run build` and `npm run build:go` to catch type or compile errors.

## Commit & Pull Request Guidelines
- Commit messages follow short, imperative subjects similar to current history (e.g., “Add Spectrum-style power button”). Keep them under ~72 chars; no trailing period.
- PRs should include: what changed and why, affected areas (UI, Go server, deployment), test notes/commands executed, and screenshots or recordings for UI changes. Link issues or TODOs when applicable.

## Security & Configuration Tips
- The SSH server currently permits open password/key auth for demos. Harden `ssh-server/main.go` before production (remove password auth, restrict keys) and keep `.ssh` keys out of git.
- Ports default to 23234 (SSH) and 8080 (`/ws`). Update constants or env overrides consistently in frontend configs if you change them.
