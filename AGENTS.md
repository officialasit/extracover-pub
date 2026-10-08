# Landing page guide

These instructions apply to this standalone website repository. Preserve the established design and
functionality unless the requested change calls for a redesign.

## Product context

- **Extra Cover** is a free-to-use Windows mod manager for Cricket 26 on Steam.
  It detects the game, performs an initial scan, and installs compatible
  `.c26pack` files. Setup and downloading packs are separate from installation.
- **Pack Studio** is the optional creator companion. It runs locally, opens in
  a browser, exports supported textures as PNGs, and builds texture packs after
  users edit them in their own image editor. Keep filenames, dimensions, and
  transparency. Some textures are view-only; audio needs separate preparation.
- Both tools are independent community products. Do not imply affiliation with
  Big Ant Studios or Nacon. Cricket 26 is required and sold separately.
- Extra Cover is proprietary; the separate engine is
  GPL-3.0-or-later. Refer to `../LICENSING.md` for the current boundaries.
- Both tools are in public open beta (from 8 October 2026). Download links come
  from `src/data/releases.ts` and point at explicit assets in
  github.com/officialasit/extracover-releases. When a release ships, update that
  file and check each URL works without a GitHub login. Do not use
  `/releases/latest` for Pack Studio; it is a prerelease.

## Source map and commands

- `src/pages/index.astro`: main page, copy, section order, and dialogs.
- `src/styles/minimal.css`: active landing-page styles and theme tokens.
- `src/data/features.ts`: six feature tabs and their content.
- `src/scripts/interactions.ts`: tabs, navigation, theme, dialogs, walkthrough,
  and motion.
- `src/lib/seo.ts`: metadata, canonical URLs, indexing policy, and JSON-LD.
- `src/pages/robots.txt.ts` and `sitemap.xml.ts`: generated crawler endpoints.
- `src/components/Brand.astro`: Extra Cover identity.
- `src/components/Icon.astro`: local Tabler outline icons.
- `src/pages/guides/install-cricket-26-mods.astro` + `src/styles/guide.css`:
  a short install guide (download, get a pack, install, undo, troubleshooting).
  The app handles onboarding, so keep setup steps out. Screenshots in
  `public/images/guide/` are real captures.
- `public/images/` and `public/fonts/`: shipped assets and self-hosted Manrope.
- `src/pages/style-lab.astro`: separate design reference; do not use its styles
  to change the main page. `global.css` is also not the main page stylesheet.

Run commands from this folder:

```powershell
npm run dev                     # http://127.0.0.1:4321
npm run build                   # static output in dist/
node scripts/check-responsive.mjs
npm run check:seo               # validate the built SEO output
```

The responsive check serves the built site on port 4337 and uses installed
Chrome. Build first. It writes screenshots and results to ignored
`review/responsive/`. It assumes the default root base path.

## Design direction

- Clean, compact, premium cricket software landing page. Use clear hierarchy,
  generous spacing, restrained borders, and familiar product language.
- **Red is the landing-page accent.** Do not copy the desktop app's blue
  controls back into this site. Use `--accent`, `--accent-soft`,
  `--accent-on-dark`, `--button-fill`, and `--button-hover`; keep white button
  labels readable in both themes.
- Keep Manrope, neutral light/dark surfaces, the centered content width, and
  the existing rounded corners. Avoid decorative gradients, heavy shadows,
  excessive badges, and nested cards.
- Section order: hero → feature tabs → installation → Pack Studio → FAQ →
  download CTA → footer.
- Hero: retain the text headline, theme-specific Extra Cover banner, and small
  Cricket 26 logo over the banner. Do not put the game logo inside the headline
  or a separate boxed badge.
- Installation: centered heading and three numbered cards, with transparent
  illustrations for setup, choosing a pack, and playing. The final card has a
  soft red highlight. Keep descriptions short; no undo note below the cards.
- Pack Studio: keep the creator campaign banner and the three-slide guide
  explaining the concept, Collect/Create/Ship, and requirements. No separate
  app screenshot blocks beneath installation or Pack Studio.
- FAQ: keep answers focused. Order from cost, the unsigned-installer warning
  and platforms through finding packs, undoing mods, updates, the creator
  tool, and independent status.
- CTA: “Get Extra Cover.” Two aligned product cards without duplicate logos.
  Align titles, descriptions, buttons, and availability notes across cards.
- Download links are plain `<a>` elements with `data-download-dialog`: the
  file downloads in the background and `DownloadDialogs.astro` opens next steps
  (SmartScreen “More info → Run anyway”, extract the Pack Studio ZIP) with the
  Discord invite. Keep links working without JavaScript. The header “Download”
  scrolls to the CTA cards; the hero and cards download directly.
- Footer: one closing brand mark, Install guide, FAQ, Pack Studio, Join Discord, and
  About & credits. Keep it quiet and avoid another download CTA.
- Keep the subtle divider between installation and Pack Studio.

## Responsive behavior and accessibility

- Check narrow phones, larger phones, tablets, laptops, and wide desktops.
  Current check widths: 320, 390, 600, 768, 1024, 1366, and 1920px in both themes.
- Use flexible layouts and appropriate breakpoints. Never hide page overflow
  to disguise broken sizing. Avoid tiny text and cramped navigation.
- Stack cards on phones; preserve equal rows in side-by-side CTA cards. Use
  comfortable touch targets (roughly 44px) for primary controls.
- Dialogs must fit short screens, scroll when needed, and keep navigation
  reachable. The Pack Studio guide resets on opening and supports Back, Next,
  Done, arrow keys, and Escape.
- Retain semantic headings, tab keyboard behavior, visible focus indicators,
  mobile-menu state, image alternative text, and native dialog behavior.
- Motion is brief and subtle: once-per-load section reveals, staggered groups,
  small hover movements, and dialog/slide transitions. No looping animations.
  Honor reduced motion, including preference changes while the page is open.
  Keep content readable before JavaScript enhancement.

## Assets and content integrity

- Use local, optimized assets; do not introduce runtime CDN dependencies.
  Preserve alpha for transparent illustrations. The installation images are
  480px WebPs; their full-resolution originals live outside shipped assets.
- Construct image and link paths with `import.meta.env.BASE_URL`, following the
  existing page helper. Preserve `SITE_URL` / `SITE_BASE` deployment support.
- `npm run sync:brand` pulls app branding from the surrounding workspace;
  ordinary website builds must not depend on that workspace being present.
- Do not regenerate real logos with AI. Keep the original game-logo asset.
  Campaign artwork is conceptual; never describe it as gameplay footage.
- Do not add analytics, accounts, or promises of public pack availability
  without an explicit product change. Preserve accurate release status.
- Public landing-page indexing was explicitly authorized on 28 September 2026.
  Production builds are indexable; dev and `SITE_INDEXING=false` staging builds
  use noindex. The style lab remains unindexed and excluded from the sitemap.

## SEO and answer-engine behavior

- Keep title, description, canonical, Open Graph, Twitter cards, JSON-LD, and
  sitemap consistent through the shared SEO helper. Metadata must use absolute
  production URLs with the deployment base path, never localhost.
- FAQ schema comes from the same array as the on-page questions. Do not invent
  ratings, download URLs, availability, pricing offers, or affiliations.
- Maintain static text, semantic headings, accessible FAQs, and the
  no-JavaScript feature fallback. Do not add hidden keyword copy or make claims
  about guaranteed rankings, rich results, or AI citations.
- Regenerate the 1200×630 social image with `npm run prepare:social` after banner
  changes. Follow `docs/SEO.md` for deployment, crawler constraints, and checks.
- Regenerate compact image variants with `npm run prepare:images` after source
  changes. The hero preloads the correct theme/resolution; keep those filenames
  and background image sets in sync. Do not reintroduce the unused gallery code.

## Verification and supporting docs

- Build after markup, styling, interaction, or asset changes.
- Run `check-responsive.mjs` for layout or interaction changes; inspect relevant
  screenshots as well as automated results. Include short-screen dialogs and
  reduced-motion behavior when they are affected.
- `scripts/review.mjs` is a legacy screenshot-gallery review and currently
  expects removed screenshot blocks. Update it before relying on it.
- Do not add tests for simple copy edits. Keep checks proportional to changes.
- Keep this guide and `README.md` consistent with the shipped design.
- Product details: `../tools/packstudio/README.md` and `../CLAUDE.md`.
  Page brief: `../docs/LANDING_PAGE_PRD.md`. Launch readiness:
  `../docs/OPEN_BETA_READINESS.md`. Asset history:
  `../docs/LANDING_PAGE_ASSET_PROMPTS.md`. Historical docs can lag behind the
  current page; use current implementation and explicit user decisions.
