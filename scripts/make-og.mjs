// Generates public/og-banner.png — the preview card shown when the site is
// linked in Discord, WhatsApp, Reddit, Twitter and so on.
//
//   node scripts/make-og.mjs
//
// This card matters more than its size suggests. The site has no organic
// traffic; it spreads by someone pasting the link into a modding community, and
// at that moment the preview is the advertisement. A card carrying only the
// logo says nothing to a reader scrolling a busy channel, so this one carries
// the pitch: the lockup, the promise, and the three terms that answer "will
// this wreck my game" before anyone clicks.
//
// Built on the dark banner rather than the white one. Feeds are overwhelmingly
// dark-themed, and the dark art is the same lockup on a ground that matches the
// site, so the card and the page it opens look like the same product.
//
// sharp is already a dependency (Astro's image pipeline uses it), so this adds
// nothing to install. Text is rendered through sharp's SVG input, which uses
// librsvg and has no access to the site's webfonts — hence the system stack.
// The lockup is a bitmap, so the brand itself is pixel-accurate regardless.

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const LOGO = path.join(here, '..', 'src', 'assets', 'logo.png');
const OUT  = path.join(here, '..', 'public', 'og-banner.png');

const W = 1200;
const H = 630;
const PAD = 82;

// Same tokens as src/styles/global.css, so the card and the page it opens read
// as one product rather than two.
const BG    = '#09090b';
const INK   = '#fafafa';
const INK_2 = '#a1a1aa';
const INK_3 = '#71717a';
const RED   = '#e11d48';

const LOGO_W = 380;

const logo = await sharp(LOGO).resize({ width: LOGO_W }).toBuffer();
const { height: logoH } = await sharp(logo).metadata();

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const terms = [
  ['ORIGINALS', 'Backed up'],
  ['INSTALL',   '1 click'],
  ['RUNS ON',   'Windows · Steam'],
];

// The headline is the hero's, verbatim. Two places now say the same sentence;
// they are the two places a first-time visitor sees, and they should not
// disagree about what this is.
const HEAD_1 = 'MOD CRICKET 26';
const HEAD_2 = 'IN 1 CLICK.';
const SUB    = 'Stadium textures, broadcast HUDs, and a built-in Pack Studio.';

// Absolute baselines rather than offsets chained off other offsets. The first
// version derived the divider from the terms block and the sub-headline from
// the logo height, and the two silently collided.
const Y_HEAD_1 = 322;
const Y_HEAD_2 = 390;
const Y_SUB    = 448;
const Y_RULE   = 496;
const Y_LABEL  = Y_RULE + 32;
const Y_VALUE  = Y_RULE + 62;

const termCells = terms
  .map(([label, value], i) => {
    const x = PAD + i * 296;
    return `
      <text x="${x}" y="${Y_LABEL}" class="tl">${esc(label)}</text>
      <text x="${x}" y="${Y_VALUE}" class="tv">${esc(value)}</text>
      ${i > 0 ? `<line x1="${x - 34}" y1="${Y_RULE + 8}" x2="${x - 34}" y2="${Y_VALUE + 10}" class="rule"/>` : ''}`;
  })
  .join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <style>
    .h  { font: 700 62px "Segoe UI", "DejaVu Sans", sans-serif; fill: ${INK}; letter-spacing: -1.6px; }
    .s  { font: 400 27px "Segoe UI", "DejaVu Sans", sans-serif; fill: ${INK_2}; }
    .tl { font: 600 15px "Consolas", "DejaVu Sans Mono", monospace; fill: ${INK_3}; letter-spacing: 2.4px; }
    .tv { font: 600 24px "Segoe UI", "DejaVu Sans", sans-serif; fill: ${INK}; }
    .rule { stroke: #1f1f23; stroke-width: 1; }
  </style>

  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect width="${W}" height="6" fill="${RED}"/>

  <text x="${PAD}" y="${Y_HEAD_1}" class="h">${esc(HEAD_1)}</text>
  <text x="${PAD}" y="${Y_HEAD_2}" class="h">${esc(HEAD_2)}</text>

  <text x="${PAD}" y="${Y_SUB}" class="s">${esc(SUB)}</text>

  <line x1="${PAD}" y1="${Y_RULE}" x2="${W - PAD}" y2="${Y_RULE}" class="rule"/>
  ${termCells}
</svg>`;

await sharp({ create: { width: W, height: H, channels: 4, background: BG } })
  .composite([
    { input: Buffer.from(svg), top: 0, left: 0 },
    // `screen` for the same reason the page uses mix-blend-mode: screen — the
    // lockup's ground is pure black, and screen over black is a no-op, so it
    // drops out instead of sitting on the card as a black rectangle. sharp does
    // not inherit the CSS blend, so it has to be asked for here too.
    { input: logo, top: PAD, left: PAD, blend: 'screen' },
  ])
  .png({ compressionLevel: 9 })
  .toFile(OUT);

const { size } = fs.statSync(OUT);
console.log(`wrote ${path.relative(process.cwd(), OUT)} — ${W}x${H}, ${(size / 1024).toFixed(0)} KB`);
