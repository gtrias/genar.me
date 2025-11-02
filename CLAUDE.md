# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website built with Astro, featuring a retro cyberpunk aesthetic with authentic CRT terminal effects. The site includes an interactive xterm.js-based terminal as the main interface on the homepage, deployed to Cloudflare Pages.

## Key Technologies

- **Astro 5.15+** - Static site generator
- **Tailwind CSS 4** - Utility-first CSS framework
- **xterm.js** - Terminal emulator library
- **TypeScript** - Type-safe development
- **Cloudflare Pages** - Static hosting with edge network

## Common Commands

### Development
```bash
npm run dev              # Start dev server at http://localhost:4321 with --host flag
npm run build            # Build for production to ./dist/
npm run preview          # Preview production build locally
```

### Cloudflare-specific
```bash
npm run cf:build         # Build for Cloudflare (same as npm run build)
npm run cf:preview       # Preview with Wrangler locally
wrangler pages dev dist  # Direct Wrangler preview
```

### Testing
There are no automated tests in this project currently.

## Architecture

### Terminal Command System

The interactive terminal uses a command registry pattern located in `src/commands/`:

**Core Structure:**
- `src/commands/types.ts` - Defines `Command` interface and `CommandContext`
- `src/commands/index.ts` - Central registry that imports and exports all commands
- Individual command files (e.g., `help.ts`, `about.ts`) - Each exports a command object

**Command Interface:**
```typescript
interface Command {
  name: string;
  description: string;
  usage?: string;
  category: 'portfolio' | 'system';
  execute: (context: CommandContext) => void | Promise<void>;
}
```

**Adding a New Command:**
1. Create a new file in `src/commands/` (e.g., `mycommand.ts`)
2. Export a command object following the `Command` interface
3. Import and register it in `src/commands/index.ts` in the `commands` array
4. The command is automatically available in the terminal

Commands can be synchronous or asynchronous (return Promise). Async commands should use `context.onComplete()` callback when done to re-enable input and show the prompt.

### Terminal Component Flow

**BIOS Boot Sequence (`src/components/Terminal.astro`):**
1. Terminal initializes with fullscreen mode
2. Runs `runBIOSBootSequence()` with typewriter effect displaying fake system checks
3. After boot completes, clears screen and calls `setupInteractiveTerminal()`
4. Interactive terminal becomes available with command execution

**Terminal Features:**
- Command history (up/down arrows)
- Tab autocomplete
- Input blocking while commands execute
- Typewriter effects with mobile detection for faster rendering

### Page Structure

- `src/layouts/Layout.astro` - Main layout with cyberpunk navigation and CRT effects
- `src/pages/index.astro` - Homepage with fullscreen terminal and hidden content
- `src/pages/projects.astro` - Projects page
- `src/components/Terminal.astro` - xterm.js terminal with boot sequence
- `src/components/CRTEffects.astro` - Visual CRT effects

### CRT Visual Effects

The cyberpunk aesthetic is achieved through multiple layered effects in `src/styles/global.css`:

**Key Effects:**
- **Screen curvature** - Convex bulge effect using CSS transforms and perspective
- **Phosphor glow** - Radial gradients simulating CRT phosphor distribution
- **Scanlines** - Repeating linear gradients for horizontal lines
- **Flicker animation** - Subtle opacity changes (0.95-1.0)
- **Chromatic aberration** - RGB color separation on text
- **Static noise** - Low-opacity repeating patterns
- **Random glitches** - JavaScript-triggered visual effects (flicker, shift, color)

**Mobile Optimizations:**
- Reduced effect intensity (lower opacity)
- Faster typewriter speed
- Less intensive curvature transforms
- Simplified glitch effects

### Styling System

**Tailwind 4 Configuration:**
- Uses `@import "tailwindcss"` with `@theme` directive
- Custom cyberpunk color palette defined in theme
- Utility classes for neon effects (.neon-text-cyan, .neon-border-pink, etc.)

**Key Colors:**
- Cyan: `#22e9d8` - Primary accent
- Pink: `#e34880` - Secondary accent
- Purple: `#8b5cf6` - Tertiary accent
- Dark: `#0a0a0f` / `#050508` - Backgrounds

## Configuration Files

### `astro.config.mjs`
- Output: `static` (pre-rendered HTML)
- Adapter: Cloudflare Pages
- Build format: `directory` (creates index.html in folders)

### `wrangler.toml`
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18
- Includes redirects for clean URLs (/projects → /projects/)
- Security headers configured (X-Frame-Options, CSP, etc.)
- Cache headers for static assets (CSS, JS, images)

### `package.json`
- Dev server runs with `--host` flag for network access
- OpenCode integration scripts available
- Wrangler for local Cloudflare preview

## File Organization

```
src/
├── commands/           # Terminal command modules
│   ├── types.ts       # Command interfaces
│   ├── index.ts       # Command registry
│   └── *.ts           # Individual commands
├── components/        # Astro components
│   ├── Terminal.astro # xterm.js terminal
│   └── CRTEffects.astro
├── layouts/           # Page layouts
│   └── Layout.astro   # Main layout with nav/footer
├── pages/             # Route pages
│   ├── index.astro    # Homepage with terminal
│   └── projects.astro
└── styles/
    └── global.css     # Tailwind + CRT effects
```

## Development Notes

### Terminal Development
- Terminal state is managed in `Terminal.astro` script block
- Command execution blocks user input with `commandRunning` flag
- Mobile detection: `/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i`
- Character delay: 10ms desktop, 5ms mobile
- Line delay: 30ms desktop, 20ms mobile

### CRT Effects Development
- Main effects in `global.css` apply globally via body pseudo-elements
- Terminal-specific effects in `Terminal.astro` style block
- Effects use `position: fixed` with high z-index for layering
- `pointer-events: none` prevents interference with interactions
- Glitch effects triggered via JavaScript at 2% probability every 3 seconds

### Adding Pages
Create `.astro` files in `src/pages/`. Astro uses file-based routing:
- `src/pages/about.astro` → `/about`
- `src/pages/blog/index.astro` → `/blog/`
- `src/pages/blog/[slug].astro` → `/blog/:slug` (dynamic)

### Deployment
The site deploys to Cloudflare Pages via Git integration. Push to main branch triggers automatic build and deployment.

Build command: `npm run build`
Output directory: `dist`
