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

/**
 * Whether a real pack exists for people to install.
 *
 * The hero renders a mock of the app holding two packs. While this is a
 * waitlist page that is a picture of the intended product and nobody can act on
 * it. The moment `showDownloadCta` goes true without a pack shipping, it
 * becomes a promise that breaks at the worst possible moment — someone installs
 * on the strength of that image and opens an empty library.
 *
 * The two flags are checked against each other at build time (see
 * astro.config.mjs) so that combination cannot ship silently.
 */
export const packsAvailable = false;

/**
 * Rough launch timing, shown in the hero pill.
 *
 * "Launching soon" is the weakest timing signal there is — it reads as
 * vapourware to anyone deciding whether to hand over an address. Set something
 * concrete as soon as there is one: 'First build: August'.
 */
export const launchWindow: string | null = 'Launching August';

/**
 * Discord invite.
 *
 * For a modding tool this is where retention and pack-sharing actually happen,
 * and it is the second CTA for anyone not ready to give an email.
 *
 * There is no fallback: pointing "Join the Discord" at the repo would be a lie,
 * and a repo link is not a community. While this is null the secondary CTA is
 * simply absent — one missing link beats a wrong one. Use a permanent invite
 * (Server Settings -> Invites -> never expire); a default 7-day invite compiled
 * into a static page turns into a dead link a week after launch.
 */
export const discordInvite: string | null = null;
