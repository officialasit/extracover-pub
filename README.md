# Extra Cover website

A standalone Astro landing page deployed to GitHub Pages from this repository.
Run these commands from the repository root:

```powershell
npm install
npm run dev
```

Open http://127.0.0.1:4321. `npm run build` produces the static site in `dist/`.

## Current direction

The current revision uses the app's X icon, Extra Cover wordmark, self-hosted Manrope, neutral surfaces and cricket-red controls in light and dark themes. The hero includes the official theme-specific banner with a small Cricket 26 logo overlay. Six feature tabs, three illustrated installation cards, a Pack Studio campaign section and three-slide creator guide, seven FAQs, aligned download cards, and a quiet footer complete the page. A separate install guide lives at `/guides/install-cricket-26-mods/`, linked from the footer. Separate app screenshot blocks have been removed.

See [AGENTS.md](AGENTS.md) for the design direction, product context, accessibility requirements, and verification workflow.

- Page and copy: `src/pages/index.astro`
- Current styles: `src/styles/minimal.css`
- Feature content: `src/data/features.ts`
- Interactions: `src/scripts/interactions.ts`
- Previous visual treatment retained for reference: `src/styles/global.css` (not loaded)

The existing campaign artwork is retained. Red accents align with the brand artwork; deeper red button fills keep white labels readable in both themes.

Motion adds brief section reveals, staggered groups, tab and dialog transitions, and small hover feedback. Reduced-motion preferences are respected. Dependencies are installed locally and bundled. Unused gallery JavaScript and CSS have been removed from the page.

Dependency checks on 2026-09-08: `npm audit` reported zero known vulnerabilities; `npm audit signatures` verified registry signatures for 301 installed packages and attestations for 94. These establish registry integrity and known-advisory status, not a guarantee that code is harmless. Keep the lockfile and repeat checks before release.

## Media

The page ships optimized WebP assets. Each feature tab has a unique campaign image, the hero uses the official light/dark Extra Cover banners, and Pack Studio has a dedicated creator-workbench banner. The generated-image prompts and usage notes live in `../docs/LANDING_PAGE_ASSET_PROMPTS.md`.

`extra-cover-live.webp` and `pack-studio-live.webp` are retained reference captures from the real apps; they are no longer displayed on the page. Installation uses transparent `install-setup.webp`, `install-pack.webp`, and `install-play.webp` illustrations, optimized to 480px and about 105 KB combined. The game-logo PNG is sourced from Big Ant's official Cricket 26 page.

From this directory, `npm run sync:brand` copies the current app icon, Windows favicon and official banners. Run it when app branding changes, then commit the copied assets to the standalone website repo. It requires the surrounding workspace; normal site builds do not.

To refresh screenshots, start `npm run dev:all` at the workspace root, then run `node scripts/capture-electron.mjs` here and `node scripts/capture-studio.mjs '<local Pack Studio URL>'` with the URL printed by the dev server. Run `node scripts/prepare-images.mjs` and inspect the resulting WebPs. These captures navigate the UI without installing or editing packs.

Uncompressed PNG working files are intentionally ignored to keep the repository and deployment lean. `scripts/prepare-images.mjs` converts any locally available PNG sources into compressed WebP delivery images and safely skips sources that are not present. Manrope is self-hosted; its licence is in `public/fonts/`.

## Review behaviour

Public downloads are still marked as coming soon. No game files are modified by this website. No analytics or account flow is installed. Public landing-page indexing was authorized on 28 September 2026: production builds are indexable, while local development and builds with `SITE_INDEXING=false` are unindexed. The style lab always remains unindexed.

The concrete launch checklist and remaining release blockers are in `../docs/OPEN_BETA_READINESS.md`.

For the configured GitHub Pages destination, build with:

```powershell
$env:SITE_URL = 'https://officialasit.github.io'
$env:SITE_BASE = '/extracover-pub/'
npm run build
```

The font URLs in the main page's CSS are processed by Vite so they follow the base path. For local root-path development, clear `SITE_BASE`. For a custom domain, set `SITE_URL` to that origin and `SITE_BASE` to `/`. Confirm the canonical and social image URLs in the generated HTML before deployment. The separate design-only style lab remains unindexed.

Pushing to `main` runs `.github/workflows/deploy-pages.yml`, which installs the locked dependencies and builds with the GitHub Pages origin and base path above. Images, fonts, and the social preview are committed; deployment does not require the surrounding app workspace.

## Checks

Run `npm run build`, then `node scripts/check-responsive.mjs`. The check serves the static build locally on port 4337 and uses installed Chrome to verify seven widths in both themes, image loading, overflow, CTA alignment, feature tabs, mobile navigation, the three-slide guide, short-screen dialogs, and motion preferences. Inspect screenshots in the ignored `review/responsive/` folder. It assumes a root-path build.

`scripts/review.mjs` is a legacy check that still expects the removed screenshot gallery; update it before using it. `npm run build` verifies static generation.

Run `npm run check:seo` after building to verify metadata, canonical URLs, JSON-LD/FAQ parity, sitemap, robots, and social-image dimensions. Use the same `SITE_URL`, `SITE_BASE`, and `SITE_INDEXING` values for the build and this check. See [docs/SEO.md](docs/SEO.md) for technical SEO and answer-engine notes.

`npm run prepare:images` regenerates compact brand/logo images, two banner resolutions, and smaller installation illustrations from the retained sources. `sync:brand` also regenerates these delivery images and the social preview. `node scripts/audit-lighthouse.mjs` audits a root-path build locally with mobile throttling; results are written to `review/seo/`.
