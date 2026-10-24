import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';
import { identity } from './src/brand/identity.js';

// Fills %brand.*% placeholders in index.html so metadata never drifts from genar-brand.
function brandHtml(): Plugin {
  const values: Record<string, string> = {
    name: identity.name,
    bio: identity.intro.join(' '),
    site: identity.site,
  };
  return {
    name: 'brand-html',
    transformIndexHtml: (html) =>
      html.replace(/%brand\.(\w+)%/g, (match, key: string) => {
        if (!(key in values)) throw new Error(`index.html: unknown placeholder ${match}`);
        return values[key].replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
      }),
  };
}

export default defineConfig({
  plugins: [devtools(), solidPlugin(), tailwindcss(), brandHtml()],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
});
