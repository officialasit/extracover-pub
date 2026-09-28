import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve('dist');
const browserTmp = resolve('.cache/browser-tmp');
await mkdir(browserTmp, { recursive: true });
process.env.TEMP = browserTmp;
process.env.TMP = browserTmp;
const server = createServer(async (req, res) => {
  const file = resolve(root, '.' + (req.url === '/' ? '/index.html' : req.url.split('?')[0]));
  if (!file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
  try {
    const body = await readFile(file);
    res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2' })[extname(file)] || 'application/octet-stream');
    res.end(body);
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(4337, '127.0.0.1', resolve));
await mkdir('review/responsive', { recursive: true });
let browser;
const results = [];
try {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  for (const width of [320, 390, 600, 768, 1024, 1366, 1920]) {
    for (const theme of ['light', 'dark']) {
      const page = await browser.newPage({ viewport: { width, height: 844 }, colorScheme: theme, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('http://127.0.0.1:4337/', { waitUntil: 'networkidle' });
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(img => { img.loading = 'eager'; return img.decode(); })); });
      const layout = await page.evaluate(() => {
        const rect = e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
        return {
          overflow: document.documentElement.scrollWidth - innerWidth,
          hero: rect(document.querySelector('.hero')),
          installImages: [...document.querySelectorAll('.install-illustration')].map(rect),
          cta: [...document.querySelectorAll('.download-card')].map(card => [...card.children].map(rect)),
          overflowElements: [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1) && !e.matches('.skip-link'); }).slice(0, 8).map(e => e.className)
        };
      });
      assert.ok(layout.overflow <= 1, `${width}/${theme}: horizontal overflow ${JSON.stringify(layout)}`);
      if (width >= 768) layout.cta[0].forEach((r, i) => assert.ok(Math.abs(r.y - layout.cta[1][i].y) < 2, `${width}: CTA row ${i} misaligned`));
      for (const tab of await page.locator('[data-feature]').all()) {
        await tab.click();
        assert.equal(await page.locator('[role="tabpanel"]:visible').count(), 1);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${width}: feature overflow`);
      }
      await page.locator('[data-feature]').first().click();
      if (width < 768) {
        await page.locator('.mobile-menu').click();
        assert.equal(await page.locator('.mobile-menu').getAttribute('aria-expanded'), 'true');
        await page.locator('#main-nav a').first().click();
        assert.equal(await page.locator('.mobile-menu').getAttribute('aria-expanded'), 'false');
      }
      await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0); });
      await page.screenshot({ path: `review/responsive/${width}-${theme}.png`, fullPage: true });
      await page.locator('[data-dialog="studio-dialog"]').first().click();
      for (let slide = 1; slide <= 3; slide++) {
        assert.equal(await page.locator('.studio-slide-count').innerText(), `${slide} / 3`);
        assert.ok(await page.locator('#studio-dialog').evaluate(d => d.scrollWidth <= d.clientWidth + 1), `${width}: dialog overflow`);
        if (slide < 3) await page.locator('[data-studio-next]').click();
      }
      await page.screenshot({ path: `review/responsive/${width}-${theme}-dialog.png` });
      await page.keyboard.press('Escape');
      assert.deepEqual(errors, []);
      results.push({ width, theme, ...layout });
      await page.close();
    }
  }
  for (const width of [320, 1366]) {
    const page = await browser.newPage({ viewport: { width, height: 844 }, javaScriptEnabled: false });
    await page.goto('http://127.0.0.1:4337/', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('[role="tabpanel"]:visible').count(), 6, 'Feature text must remain readable without JavaScript');
    assert.equal(await page.locator('.faq-list details').count(), 7);
    assert.equal(await page.locator('.no-script-note').isVisible(), true);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No-JavaScript page overflow');
    await page.close();
  }
  for (const [width, height] of [[320, 568], [844, 390]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'no-preference' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:4337/', { waitUntil: 'networkidle' });
    await page.locator('[data-dialog="studio-dialog"]').first().click();
    for (let i = 0; i < 3; i++) {
      await page.waitForFunction(() => getComputedStyle(document.querySelector('#studio-dialog')).opacity === '1');
      assert.ok(await page.locator('#studio-dialog').evaluate(d => d.getBoundingClientRect().height <= innerHeight - 16), 'Short-screen dialog exceeds viewport');
      await page.locator('[data-studio-next]').click();
    }
    assert.equal(await page.locator('#studio-dialog').evaluate(d => d.open), false);
    await page.locator('#tab-commentary').click();
    await page.waitForFunction(() => getComputedStyle(document.querySelector('[role="tabpanel"]:not([hidden])')).opacity === '1');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('.install-illustration').first().evaluate(e => getComputedStyle(e).transitionDuration), '0s');
    assert.deepEqual(errors, []);
    await page.close();
  }
  await writeFile('review/responsive/results.json', JSON.stringify(results, null, 2));
  console.log('PASS: 14 screen/theme combinations, short-screen and landscape dialogs, image loading, CTA alignment, feature tabs, mobile navigation, motion and reduced-motion.');
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
