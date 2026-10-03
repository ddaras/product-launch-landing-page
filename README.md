# Product launch landing page

An accessible, single-page launch **preview**, implemented directly in Pi. Astro static output, TypeScript, Tailwind CSS, pnpm, and ESM. No application features, signup forms, fake brands, customer claims, or fabricated testimonials.

## Requirements & public preview

- Node.js 22.12+ (Node 24 recommended)
- pnpm 11.8.0

```sh
pnpm install --frozen-lockfile
pnpm dev
```

`pnpm dev` starts Astro on `127.0.0.1:4321`, waits for a successful response, then runs the project-installed `cloudflared tunnel --url http://127.0.0.1:4321`. It parses Cloudflare output and prints:

```text
Public preview: https://<assigned-name>.trycloudflare.com
```

Use the **printed public HTTPS link** to view or share the page. The temporary URL changes each time and only works while the process is running. Ctrl+C closes both services. Quick tunnels are development previews, not production hosting. Anything served by the dev server is publicly reachable while the tunnel is open; never place secrets in source files or `public/`.

The launcher checks for port conflicts, handles split output lines, refuses to silently change ports, times out failed startup, and shuts down the sibling process if either service exits. It strips `GITHUB_TOKEN` from child environments. `cloudflared` is a project devDependency; no global installation is required. Its binary is installed on demand if missing. Network access to Cloudflare and GitHub releases may be required. A local Cloudflare `config.yaml` can interfere with quick tunnels; use an environment without an active named-tunnel configuration.

`pnpm dev:local` is available for automated tooling without a public tunnel.

## Checks

```sh
pnpm check
pnpm test
pnpm format:check
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
PUBLIC_ANALYTICS_ENABLED=true pnpm test:e2e
```

Browser tests build and serve the static output themselves; stop the public preview before running them because they use the same port. They cover desktop/mobile, an above-the-fold CTA, navigation, native keyboard-accessible FAQs, no-JavaScript behavior, WCAG 2.2 AA automated checks, overflow at five widths, metadata, and both analytics states. Automated accessibility checks supplement, rather than replace, manual review.

## Structure

- `src/pages/index.astro` — hero, reserved social-proof section, feature overview grid, FAQ, and launch status.
- `src/styles/global.css` — responsive visual system, focus indicators, reduced-motion support.
- `src/layouts/Layout.astro` — document metadata, Open Graph, favicon, and analytics entry point.
- `src/scripts/analytics.ts` — opt-in local analytics hook.
- `scripts/dev.mjs` — Astro / Cloudflare process supervisor.
- `public/` — local SVG favicon, texture, and 1200×630 PNG social image.
- `docs/content-checklist.md` — the inputs required before a real launch.

Fonts are bundled locally. There are no remote font requests, trackers, or image services. The hero illustration is abstract CSS artwork, explicitly not a product screenshot. FAQ disclosures and all navigation work without JavaScript.

## Analytics & metadata

Copy `.env.example` to `.env` if needed. `PUBLIC_ANALYTICS_ENABLED` is **false by default** and only the exact value `true` enables the hook. When enabled, it dispatches `launch:analytics` CustomEvents for `page_view` and `primary_cta_click`, with the pathname only. It respects Do Not Track and makes **no network requests, cookies, or storage writes**. Add an approved provider and any required consent handling in `src/scripts/analytics.ts` before collecting real data. Public-prefixed variables are not secrets.

Set `SITE_URL` to the final HTTPS origin at build time to generate canonical, `og:url`, and absolute social-image URLs. The preview omits an unverified canonical URL rather than inventing a domain. Draft pages intentionally carry `noindex, nofollow`; remove that in `src/layouts/Layout.astro` only after the content is approved. Social crawlers generally require a production build with `SITE_URL` set.

The social image is committed. To regenerate it after editing `scripts/og-image.svg`:

```sh
node --input-type=module -e "import sharp from 'sharp'; await sharp('scripts/og-image.svg').png().toFile('public/og-image.png');"
```

## Production

Run `SITE_URL=https://<actual-production-domain> pnpm build` with the real domain substituted. Deploy **`dist/`** to any static host (for example, Cloudflare Pages). No runtime server or adapter is required. This repository does not provision hosting, claim a launch date, or create a production deployment. It is intended for a domain root; configure Astro's `base` and asset paths before choosing subpath hosting.

Repository: <https://github.com/ddaras/product-launch-landing-page>
