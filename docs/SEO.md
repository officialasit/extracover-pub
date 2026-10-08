# Technical SEO and answer-engine support

The public page is indexable in production, as authorized on 28 September 2026.
This does not change the tools' coming-soon download status or publish the site.

## What is implemented

- Shared title/description and absolute canonical, Open Graph, and Twitter URLs.
- A local 1200×630 JPEG social preview derived from existing brand artwork.
- JSON-LD identifying the website, page, Extra Cover, Pack Studio, and FAQs.
  Questions and answers come from the exact array used to render the FAQ.
- An XML sitemap with the landing page and install guide. The style lab is
  excluded and keeps its noindex. The guide has TechArticle + breadcrumb JSON-LD.
- Generated robots.txt with crawling allowed so bots can read page-level
  noindex. Production includes the absolute sitemap URL.
- Static product descriptions, one primary heading, native expandable FAQs,
  and a no-JavaScript fallback exposing every feature's content. Optional
  creator and release information is also available without JavaScript.
- Existing optimized local imagery/fonts, responsive layouts, and reduced
  motion behavior are retained. No analytics or additional runtime SEO scripts.
- Compact brand/logo images, resolution-aware hero banners with an early
  theme-aware preload, and responsive installation-image sources reduce loading
  cost. Removed screenshot-gallery JavaScript/CSS is no longer bundled.

The software nodes intentionally omit reviews, offers, download URLs, and
versions until those facts are verifiable. Free-to-use and Windows requirements
are represented, without promising public availability. FAQ markup describes
the content; it is not a promise of Google FAQ rich results.

## Build for the real destination

For the existing GitHub Pages project destination:

```powershell
$env:SITE_URL = 'https://officialasit.github.io'
$env:SITE_BASE = '/extracover-pub/'
npm run build
npm run check:seo
```

For a custom domain, use that origin for `SITE_URL` and `/` for `SITE_BASE`.
For a staging build, also set `$env:SITE_INDEXING = 'false'`. This removes the
landing-page URL from the sitemap and emits noindex. Development is unindexed.
Remove staging overrides before building the public deployment.

Default builds retain the existing root-path configuration for local review.
Always supply the actual hosted origin and path for deployment. The SEO checker
uses the same environment values and verifies the generated files in `dist/`.

## Host-level crawler configuration

Search crawlers read robots.txt at the origin root. On a project site such as
`officialasit.github.io/extracover-pub/`, the generated project robots.txt is at
`/extracover-pub/robots.txt`, and cannot control the origin's `/robots.txt`.
If the origin-level file is maintained elsewhere, add this sitemap there and
ensure it allows this project path. The HTML sitemap link is also provided.
On a custom domain served at `/`, the generated robots.txt is at the right root.

After deployment, confirm the canonical and social image URLs return 200 and
check that host headers do not add `X-Robots-Tag: noindex`. Submit the deployed
sitemap in Search Console and Bing Webmaster Tools. These steps require the
actual published site and the relevant account access.

## Verification

```powershell
npm run prepare:social          # only needed after changing banner artwork
npm run prepare:images          # only needed after changing source imagery
npm run build
npm run check:seo
node scripts/check-responsive.mjs
```

The responsive check expects the root-path local review build. It includes
JavaScript-disabled pages, along with mobile/desktop and dialog checks.
The SEO check can run on root-path, subpath, custom-domain, or staging builds.
Do not use fresh timestamps, keyword meta tags, or fake review data as SEO fixes.

`node scripts/audit-lighthouse.mjs` serves a root-path build on port 4338 and
records a mobile Lighthouse audit in `review/seo/lighthouse-mobile.json`.
It uses a project-local temporary Chrome profile. Lab scores are local evidence;
deployed performance and field Core Web Vitals still require the real host.

## Scope and primary references

Answer-engine support here means crawlable, readable product facts and matching
structured data. Google states that its AI search features use foundational SEO
and do not require special AI files or schema. Inclusion and indexing are not
guaranteed. No `llms.txt` or bot-specific ranking claims are added.

- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google: structured-data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Google: robots.txt placement](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt)
- [Schema.org: SoftwareApplication](https://schema.org/SoftwareApplication)
- [Schema.org: FAQPage](https://schema.org/FAQPage)
- [Astro: static endpoints](https://docs.astro.build/en/guides/endpoints/)
