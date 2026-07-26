// Generates public/og-banner.png — the preview card shown when the site is
// linked in Discord, WhatsApp, Twitter and so on. Worth having for a tool that
// spreads by being shared in modding communities.
//
//   node scripts/make-og.mjs
//
// The source banner is 1983x793 (2.5:1) but the social standard is 1200x630
// (1.91:1), so it is contained on the site's own background rather than
// cropped — cropping would cut the wordmark.
//
// sharp is already a dependency (Astro's image pipeline uses it), so this adds
// nothing to install.

import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(here, '..', 'src', 'assets', 'white-banner.png');
const OUT = path.join(here, '..', 'public', 'og-banner.png');

const W = 1200;
const H = 630;
const PAD = 64;

const banner = await sharp(SRC)
  .resize({ width: W - PAD * 2, withoutEnlargement: true })
  .toBuffer();

const { height: bh } = await sharp(banner).metadata();

await sharp({
  create: {
    width: W,
    height: H,
    channels: 4,
    background: { r: 0x0d, g: 0x0d, b: 0x0f, alpha: 1 },   // --bg
  },
})
  .composite([{ input: banner, top: Math.round((H - bh) / 2), left: PAD }])
  .png({ compressionLevel: 9, palette: true })
  .toFile(OUT);

const { size } = await import('node:fs').then(fs => fs.statSync(OUT));
console.log(`wrote ${path.relative(process.cwd(), OUT)} — ${W}x${H}, ${(size / 1024).toFixed(0)} KB`);
