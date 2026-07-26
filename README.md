# Landing page

Astro static site for `officialasit.github.io/extracover-pub/`.

```bash
npm install
npm run dev                  # http://localhost:4321/extracover-pub/
node scripts/make-og.mjs     # regenerate the social card
npm run build                # -> dist/
```

Built from the Claude Design source *Extra Cover Landing.dc.html*. The
prototype's inline styles are consolidated into `src/styles/global.css` as
tokens; the values are unchanged. Its `<sc-for>` / `<sc-if>` / `DCLogic` runtime
(`support.js`) is not carried over — Astro templating replaces it. Copy is
verbatim.

## ⚠️ This directory belongs in the PUBLIC repo

It currently lives in the private source repo because that is where it was
built. To deploy it, copy `web/` into `officialasit/extracover-pub` and move
`deploy-pages.yml` to `.github/workflows/deploy-pages.yml` there.

It has to run from the public repo because `actions/deploy-pages` publishes to
the Pages site of the repo it runs in. A cross-repo push would need a personal
access token stored as a secret — a credential and an audit burden for a page
that isn't secret.

Then: **Settings → Pages → Source: GitHub Actions**.

## Three things that are placeholders

| | Where | Status |
|---|---|---|
| Waitlist endpoint | `PUBLIC_SUBSCRIBE_ENDPOINT` | **unset — the form collects nothing** |
| Contact link | `src/site.config.ts` | design used `hello@extracover.app`, a domain that was never registered; points at GitHub issues instead |
| Download CTA | `showDownloadCta` | `false` — the design is a pre-launch waitlist and has no download button |

**On the form:** GitHub Pages is static, so there is no server to receive a
POST. Until the endpoint is set the form deliberately does **not** show a fake
success message — it says signups aren't open. Silently discarding an address
someone typed is the worse failure. Set the endpoint as a repo variable
(Settings → Secrets and variables → Actions → Variables) once you have a
Formspree/Buttondown/Worker URL.

## Base path

`astro.config.mjs` sets `base: '/extracover-pub/'` because a GitHub project site is
served from a subpath. Get this wrong and every asset 404s in production while
working perfectly in `astro dev`. It must stay in step with the repo name — and
with `app/release-config.js`, which sets the same owner/repo for the update feed.

## Images

The hero is a 1.7 MB PNG. Astro's sharp pipeline emits WebP at the widths
actually rendered — **1666 kB → 9–63 kB**, the largest single win on the page.
The social card is generated at build time by `scripts/make-og.mjs` rather than
committed, so it cannot drift from the banner it is built from.
