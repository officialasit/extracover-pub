import { chromium } from 'playwright';
const url = process.argv[2];
if (!url?.startsWith('http://127.0.0.1:')) throw new Error('Pass the local Pack Studio URL printed by dev:all.');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.getByText('Pitch & boundary', { exact: true }).click();
  await page.waitForLoadState('networkidle');
  await page.locator('.mark').first().evaluate(async image => {
    await image.decode();
    if (!image.naturalWidth) throw new Error('Pack Studio brand icon did not load');
  });
  await page.screenshot({ path: 'public/images/pack-studio-live.png' });
} finally { await browser.close(); }
