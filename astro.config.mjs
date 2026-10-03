import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

const site = process.env.SITE_URL;
if (site && !/^https:\/\//.test(site)) {
  throw new Error(
    'SITE_URL must be the absolute HTTPS URL of the published site.',
  );
}

export default defineConfig({
  output: 'static',
  devToolbar: { enabled: false },
  ...(site ? { site } : {}),
  server: { host: '127.0.0.1', port: 4321 },
  vite: {
    plugins: [tailwindcss()],
    server: {
      strictPort: true,
      // Only allow the public preview service, not arbitrary hostnames.
      allowedHosts: ['.trycloudflare.com'],
    },
  },
});
