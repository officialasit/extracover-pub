import sharp from 'sharp';
import { access, stat } from 'node:fs/promises';

const images = [
  'cricket-minimal',
  'cricket-hero-concept',
  'stadium-concept',
  'extra-cover-live',
  'pack-studio-live',
  'hero-cricket-still-life-gpt',
  'stadium-blue-hour-gpt',
  'commentary-booth-gpt',
  'creator-texture-workspace-gpt',
  'hud-broadcast-monitor-gpt',
  'logo-badge-workspace-gpt',
  'stadium-sound-system-gpt',
  'pack-studio-campaign-gpt',
];

for (const name of images) {
  const source = `public/images/${name}.png`;
  try { await access(source); } catch { continue; }
  const quality = name.includes('live') ? 88 : 84;
  await sharp(source)
    .resize({ width: 1680, withoutEnlargement: true })
    .webp({ quality })
    .toFile(`public/images/${name}.webp`);
  console.log(name, Math.round((await stat(`public/images/${name}.webp`)).size / 1024), 'KB');
}
