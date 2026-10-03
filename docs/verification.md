# Verification notes

## Completed locally

- `pnpm check`: no errors, warnings, or hints.
- `pnpm test`: all three tunnel URL-parser tests pass.
- `pnpm test:e2e`: all 18 desktop/mobile tests pass on the static production build.
- `PUBLIC_ANALYTICS_ENABLED=true pnpm test:e2e`: all 18 tests pass with the stub enabled, including Do Not Track and no external requests/storage.
- Automated WCAG 2.2 AA scans report no violations in both browser projects.
- Responsive checks at 320, 375, 768, 1024, and 1440px; manual screenshot review at desktop and mobile sizes.
- `pnpm dev`: Astro binds to the requested loopback address and port, then the project cloudflared binary starts and the parsed public URL is printed.
- Port-conflict check: a second launcher exits with status 1 instead of exposing another service or choosing a different port.
- Graceful shutdown: SIGTERM to the launcher stops both Astro and cloudflared and releases port 4321.
- Public tunnel returned the correct page with HTTP 200 over verified TLS. This machine's default DNS initially returned NXDOMAIN for the new quick-tunnel hostname; Cloudflare's public resolver resolved it, and HTTPS/browser checks using that answer succeeded.

## Dependency audit follow-up

The project was upgraded to Astro 7.3.5 after auditing dependencies. One transitive advisory remains in `astro > http-cache-semantics@4.2.0`: [GHSA-ch52-4w7c-c8xp](https://github.com/advisories/GHSA-ch52-4w7c-c8xp), concerning cross-user cached responses with `max-stale`. The registry used by this workspace does not currently provide the advisory's proposed fixed version, 4.2.1. No advisory has been suppressed or ignored.

This site generates static files, has no authentication or per-user responses, does not fetch remote images, and does not ship a server-side cache at deployment. The affected cache-sharing behavior is not used by this implementation. Monitor the upstream release and rerun `pnpm update --depth 5 http-cache-semantics` and `pnpm audit` when the fixed version becomes available. The audit is not claimed to be clean.

## Publication boundary

A public development tunnel and a pushed repository do not constitute a production launch. Approved product copy, a real CTA destination, the final domain, and static-host deployment remain separate launch inputs. Preview pages deliberately remain `noindex`.
