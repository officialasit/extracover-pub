// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages serves a *project* site under /<repo>/, not at the domain root,
// so `base` has to match the repo name or every asset URL 404s once deployed
// while working perfectly in `astro dev`. Both values must stay in step with
// app/release-config.js, which is where the same owner/repo pair is set for the
// update feed.
//
// If the site ever moves to a user page (a repo named <owner>.github.io) or a
// custom domain, set base back to '/'.
export default defineConfig({
  site: 'https://officialasit.github.io',
  base: '/extracover-pub/',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  // Default 'directory' format (guide/index.html, served at /guide/) now that
  // there's more than one page — clean extensionless URLs, and it keeps
  // Astro.url.pathname (used for the canonical tag) matching what's actually
  // served instead of diverging from a `.html`-suffixed file.
  image: {
    // The hero art is a 1.7 MB PNG. Astro's sharp pipeline re-encodes it to
    // WebP at the sizes actually used, which is the single biggest win on this
    // page — see the note in Hero.astro.
    responsiveStyles: true,
  },
});
