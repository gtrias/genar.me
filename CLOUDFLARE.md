# Cloudflare Pages Configuration

This project is configured for deployment on Cloudflare Pages.

## Deployment Instructions

### Option 1: Git Integration (Recommended)
1. Push your code to a Git repository (GitHub, GitLab)
2. Connect your repository to Cloudflare Pages
3. Set build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node.js version**: `18` or higher

### Option 2: Direct Upload
1. Build the project locally:
   ```bash
   npm run build
   ```
2. Upload the `dist` folder to Cloudflare Pages

### Environment Variables
Set these in your Cloudflare Pages dashboard if needed:
- `NODE_VERSION`: `18`

## Features
- ✅ Static site generation for optimal performance
- ✅ Automatic HTTPS and CDN
- ✅ Custom redirects for clean URLs
- ✅ Security headers
- ✅ Asset optimization and caching

## Build Configuration
The project uses:
- **Framework**: Astro with Cloudflare adapter
- **Output**: Static files
- **Node.js**: Version 18+
- **Build command**: `npm run build`
- **Output directory**: `dist`