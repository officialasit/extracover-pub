// Explicit workspace maintenance command; static builds also work in the standalone site repo.
import { copyFile } from 'node:fs/promises';
const assets = [
  ['app/renderer/shared/brand-icon.png', 'images/brand-icon.png'],
  ['app/assets/icon.ico', 'favicon.ico'],
  ['app/assets/banner-light.webp', 'images/extra-cover-banner-light.webp'],
  ['app/assets/banner-dark.webp', 'images/extra-cover-banner-dark.webp'],
];
for (const [source, target] of assets) {
  await copyFile(new URL(`../../${source}`, import.meta.url), new URL(`../public/${target}`, import.meta.url));
  console.log(`Synced ${target}`);
}
await import('./prepare-delivery-images.mjs');
await import('./prepare-social-image.mjs');
