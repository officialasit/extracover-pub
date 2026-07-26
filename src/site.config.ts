// Everything on this page that is a decision rather than a design.
//
// Kept out of the components so the three things most likely to change — and
// the one thing that is currently a placeholder — are visible in one file.

export const REPO = 'officialasit/extracover-pub';

export const links = {
  releases: `https://github.com/${REPO}/releases/latest`,
  issues:   `https://github.com/${REPO}/issues`,
  source:   `https://github.com/${REPO}`,
};

/**
 * Where the waitlist form POSTs.
 *
 * GitHub Pages is static — there is no server here to receive a form. Until
 * this points at something real (Formspree, Buttondown, Tally, a Worker…) the
 * form deliberately does NOT fake a success message. Silently discarding an
 * address someone typed is worse than telling them the signup is not open yet.
 *
 * Set it at build time:  PUBLIC_SUBSCRIBE_ENDPOINT=https://… npm run build
 */
export const subscribeEndpoint: string | null =
  import.meta.env.PUBLIC_SUBSCRIBE_ENDPOINT ?? null;

/**
 * The design used `mailto:hello@extracover.app`. That domain was never
 * registered — we chose GitHub Releases over a paid domain — so mail to it
 * would bounce. Pointing at issues instead, which is public and actually
 * monitored. Swap this if a real address ever exists.
 */
export const contactUrl = links.issues;
export const contactLabel = 'Contact the developer';

/**
 * The design is a pre-launch waitlist page with no download button. The app is
 * buildable and releasable today, so flip this to true when you want the hero
 * to offer a download instead of a signup.
 */
export const showDownloadCta = false;
