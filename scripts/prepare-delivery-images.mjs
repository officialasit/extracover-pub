import sharp from 'sharp';

await sharp('public/images/brand-icon.png').resize(64, 64).webp({ quality: 90 }).toFile('public/images/brand-icon-small.webp');
await sharp('public/images/cricket-26-logo.png').resize(320).webp({ quality: 90 }).toFile('public/images/cricket-26-logo-small.webp');
for (const theme of ['light', 'dark']) {
  for (const width of [640, 1280]) {
    await sharp(`public/images/extra-cover-banner-${theme}.webp`).resize(width).webp({ quality: 85 }).toFile(`public/images/extra-cover-banner-${theme}-${width}.webp`);
  }
}
for (const name of ['setup', 'pack', 'play']) {
  await sharp(`public/images/install-${name}.webp`).resize(320).webp({ quality: 85 }).toFile(`public/images/install-${name}-320.webp`);
}
console.log('Prepared compact brand, logo, banner, and installation delivery images.');
