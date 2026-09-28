import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ channel: 'chrome', headless: true });

try {
  for (const [name, width, height] of [
    ['desktop', 1440, 1000],
    ['mobile', 390, 844],
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });
    await page.goto('http://127.0.0.1:4321/style-lab/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(async () => {
      await Promise.all([...document.images].map(image => {
        image.loading = 'eager';
        return image.decode();
      }));
    });
    const result = await page.evaluate(() => ({
      viewportWidth: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      headings: document.querySelectorAll('.direction h2').length,
      samples: document.querySelectorAll('.sample').length,
      brokenImages: [...document.images].filter(image => !image.naturalWidth).length,
    }));
    assert.equal(result.scrollWidth, width, `${name} has horizontal overflow`);
    assert.equal(result.headings, 4, `${name} is missing direction headings`);
    assert.equal(result.samples, 4, `${name} is missing component samples`);
    assert.equal(result.brokenImages, 0, `${name} has broken images`);
    assert.deepEqual(errors, [], `${name} has page errors`);
    await page.screenshot({ path: `review/style-lab-${name}.png`, fullPage: true });
    console.log(name, result);
    await page.close();
  }
} finally {
  await browser.close();
}
