// @ts-check
import { defineConfig } from 'astro/config';

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
  build: {
    // Emit `about.html` rather than `about/index.html`. Simpler to reason about
    // on a static host, and irrelevant while this is a single page.
    format: 'file',
  },
  image: {
    // The hero art is a 1.7 MB PNG. Astro's sharp pipeline re-encodes it to
    // WebP at the sizes actually used, which is the single biggest win on this
    // page — see the note in Hero.astro.
    responsiveStyles: true,
  },
});
