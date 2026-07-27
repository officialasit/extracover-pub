// Throwaway: rasterise the hero's inline icon set so it can be eyeballed.
// Reads the glyphs out of Hero.astro so what is shown is what ships.
import fs from 'node:fs';
import sharp from 'sharp';

const src = fs.readFileSync(new URL('../src/components/Hero.astro', import.meta.url), 'utf8');
const table = src.slice(src.indexOf('const icon = {'), src.indexOf('const terms = ['));

const names = ['shield', 'cursor', 'tag', 'steam'];
const glyphs = names.map((n) => {
  const re = new RegExp(n + ':\\s*`([\\s\\S]*?)`', 'm');
  const m = table.match(re);
  if (!m) throw new Error('no glyph for ' + n);
  return m[1];
});

const cell = 34;
const groups = glyphs
  .map((g, i) => `<g transform="translate(${i * cell + 5},5)">${g}</g>`)
  .join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cell * 4}" height="${cell}" viewBox="0 0 ${cell * 4} ${cell}">
  <rect width="100%" height="100%" fill="#141417"/>
  <g fill="none" stroke="#b9b9bf" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${groups}</g>
</svg>`;

await sharp(Buffer.from(svg)).resize({ width: cell * 4 * 6 }).png().toFile('icons-preview.png');
console.log('wrote web/icons-preview.png —', names.join(', '));
