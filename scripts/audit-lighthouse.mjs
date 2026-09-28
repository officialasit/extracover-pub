import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';

const root = resolve('dist');
const profile = resolve('.cache/seo-audit/chrome');
await mkdir(profile, { recursive: true });
process.env.TEMP = resolve('.cache/seo-audit');
process.env.TMP = process.env.TEMP;
const server = createServer(async (req, res) => {
  const file = resolve(root, '.' + (req.url === '/' ? '/index.html' : req.url.split('?')[0]));
  if (!file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
  try {
    const body = await readFile(file);
    res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml' })[extname(file)] || 'application/octet-stream');
    res.end(body);
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(4338, '127.0.0.1', resolve));
let chrome;
try {
  chrome = await launch({ userDataDir: profile, chromeFlags: ['--headless', '--disable-gpu', '--no-first-run'] });
  const result = await lighthouse('http://127.0.0.1:4338/', {
    port: chrome.port, logLevel: 'error', output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  });
  await mkdir('review/seo', { recursive: true });
  await writeFile('review/seo/lighthouse-mobile.json', result.report);
  console.log(JSON.stringify({
    scores: Object.fromEntries(Object.entries(result.lhr.categories).map(([key, value]) => [key, Math.round(value.score * 100)])),
    metrics: { LCP: result.lhr.audits['largest-contentful-paint'].displayValue, CLS: result.lhr.audits['cumulative-layout-shift'].displayValue },
    failed: Object.values(result.lhr.audits).filter(audit => audit.score !== null && audit.score < 1 && audit.scoreDisplayMode === 'binary').map(audit => ({ id: audit.id, title: audit.title, items: audit.details?.items?.slice(0, 3) })),
  }, null, 2));
} finally { await chrome?.kill(); await new Promise(resolve => server.close(resolve)); }
