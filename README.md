# Extra Cover — website & releases

Landing page for **Extra Cover**, a one-click mod tool for Cricket 26 (Steam/PC).

- **Site:** https://officialasit.github.io/extracover-pub/
- **Downloads:** [Releases](../../releases)

This repo holds the public face of the project — the landing page source and
every release artifact. The application source lives in a separate repository.

## Local development

```bash
npm install
npm run dev                  # http://localhost:4321/extracover-pub/
node scripts/make-og.mjs     # regenerate the social preview card
npm run build                # -> dist/
```

Astro static site, deployed to GitHub Pages by
`.github/workflows/deploy-pages.yml` on every push to `main`.

## Notes

**Base path.** `astro.config.mjs` sets `base: '/extracover-pub/'` because a
GitHub project site is served from a subpath. Get this wrong and every asset
404s in production while working perfectly in `astro dev`. It must match the
repo name.

**Images.** The hero PNG is 1.7 MB; Astro's sharp pipeline emits WebP at the
widths actually rendered, taking it to 9–63 kB. The social card is generated at
build time from the same source rather than committed, so it cannot drift.

**Fonts** are self-hosted via `@fontsource` rather than fetched from a CDN — no
third-party request on the critical path.

**The waitlist form has no endpoint yet.** GitHub Pages is static, so there is
nothing to receive a POST. Rather than show a fake success message it tells
visitors signups aren't open — silently discarding an address someone typed is
the worse failure. To wire it up, set a `PUBLIC_SUBSCRIBE_ENDPOINT` repository
variable (Settings → Secrets and variables → Actions → Variables) to a
Formspree / Buttondown / Worker URL.

## Licence

GPL-3.0. Extra Cover is an unofficial fan project, not affiliated with or
endorsed by Big Ant Studios, the BCCI, or the Indian Premier League.
