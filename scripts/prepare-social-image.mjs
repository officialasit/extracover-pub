import sharp from 'sharp';

// A standard social-card size, derived from existing brand artwork.
await sharp('public/images/extra-cover-banner-dark.webp')
  .resize(1200, 630, { fit: 'contain', background: '#0e1116' })
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile('public/images/social-preview.jpg');
console.log('Prepared public/images/social-preview.jpg (1200 × 630).');
