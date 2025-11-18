# Genar Trias - Personal Website

Modern Astro-based personal website deployed on Cloudflare Pages.

## 🚀 Features

- **Astro Framework** - Fast, modern static site generator
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Cloudflare Pages** - Global CDN with automatic HTTPS
- **TypeScript** - Type-safe development
- **Responsive Design** - Works on all devices

## 📁 Project Structure

```
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro          # Main layout component
│   ├── pages/
│   │   ├── index.astro          # Homepage
│   │   └── projects.astro       # Projects page
│   └── styles/
│       └── global.css           # Tailwind CSS imports
├── wrangler.toml               # Cloudflare Pages configuration
├── astro.config.mjs             # Astro configuration
└── package.json
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

| Command              | Action                                     |
| -------------------- | ------------------------------------------ |
| `npm run dev`        | Start local dev server at `localhost:4321` |
| `npm run build`      | Build production site to `./dist/`         |
| `npm run preview`    | Preview build locally                      |
| `npm run cf:build`   | Build for Cloudflare Pages                 |
| `npm run cf:preview` | Preview with Wrangler locally              |

## 🌐 Deployment

### Cloudflare Pages (Recommended)

#### Option 1: Git Integration

1. Push code to GitHub/GitLab repository
2. Connect repository to Cloudflare Pages
3. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node.js version**: `18`

#### Option 2: Direct Upload

1. Build locally: `npm run build`
2. Upload `dist` folder to Cloudflare Pages dashboard

### Environment Variables

- `NODE_VERSION`: `18` (automatically set by Cloudflare)

## 🎨 Customization

### Adding New Pages

Create `.astro` files in `src/pages/`:

```bash
src/pages/about.astro    # → /about
src/pages/blog/index.astro # → /blog/
```

### Styling

- Edit `src/styles/global.css` for global styles
- Use Tailwind CSS classes in components
- Customize colors in `tailwind.config.js`

### Layout

Modify `src/layouts/Layout.astro` to change:

- Navigation menu
- Footer content
- Meta tags
- Global styling

## 🔧 Configuration

### Astro Config (`astro.config.mjs`)

- Output mode: Static
- Adapter: Cloudflare Pages
- Tailwind CSS integration

### Cloudflare Config (`wrangler.toml`)

- Build settings
- Redirects
- Security headers
- Caching rules

## 📚 Content

The site includes:

- **Homepage**: Personal introduction and tech stack
- **Projects**: Portfolio of personal projects
- **Navigation**: Terminal-style navigation matching original design

## 🚀 Performance

- **Static Generation**: Pre-built HTML for optimal performance
- **Global CDN**: Cloudflare's edge network
- **Asset Optimization**: Automatic minification and compression
- **Caching**: Browser and CDN caching configured

## 📄 License

Personal project - all rights reserved.

---

Built with ❤️ using [Astro](https://astro.build) and [Cloudflare Pages](https://pages.cloudflare.com).

