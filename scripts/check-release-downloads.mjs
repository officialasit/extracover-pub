import assert from 'node:assert/strict';

// Run with Node 22.18+ (native TypeScript stripping). No network requests.
const originalFetch = globalThis.fetch;
const originalOffline = process.env.RELEASES_OFFLINE;
const asset = (name, download_count) => ({ name, download_count, size: 1048576, browser_download_url: `https://example.com/${name}` });
const release = (assets, fields = {}) => ({ draft: false, prerelease: false, tag_name: 'v1.0.0', name: 'Pack Studio 1.0.0', html_url: 'https://example.com/release', assets, ...fields });
let scenario = 0;
async function load(fetcher) {
  globalThis.fetch = fetcher;
  return (await import(`../src/data/releases.ts?scenario=${scenario++}`)).releases;
}
const firstPage = [
  release([asset('extra-cover-Setup-2.0.0-beta.exe', 13)], { prerelease: true }),
  release([asset('extra-cover-Setup-1.0.0.exe', 11), asset('latest.yml', 900), asset('extra-cover-Setup-1.0.0.exe.blockmap', 800)]),
  release([asset('packstudio-win-x64.zip', 7), asset('packstudio-engine-source.zip', 700), asset('packstudio-win-x64.zip.sha256', 600)], { prerelease: true }),
  release([asset('extra-cover-Setup-9.0.0.exe', 99)], { draft: true }),
  ...Array.from({ length: 96 }, () => release([])),
];
try {
  delete process.env.RELEASES_OFFLINE;
  const pages = [];
  const totals = await load(async url => {
    const page = new URL(url).searchParams.get('page');
    pages.push(page);
    return Response.json(page === '1' ? firstPage : [release([asset('extra-cover-Setup-0.9.0.exe', 5), asset('packstudio-win-x64.zip', 3)])]);
  });
  assert.deepEqual(pages, ['1', '2']);
  assert.equal(totals.extraCover.downloads, 29);
  assert.equal(totals.packStudio.downloads, 10);
  assert.equal(totals.extraCover.version, '1.0.0', 'Public prereleases count but do not replace the stable installer');
  assert.equal(totals.packStudio.version, '1.0.0');

  const partial = await load(async url => new URL(url).searchParams.get('page') === '1' ? Response.json(firstPage) : new Response('', { status: 503 }));
  assert.equal(partial.extraCover.downloads, null);
  assert.equal(partial.packStudio.downloads, null);
  assert.equal(partial.extraCover.version, '1.0.0', 'Pagination failure preserves the fetched download link');

  const invalid = await load(async () => Response.json([release([asset('extra-cover-Setup-1.0.0.exe', -1)])]));
  assert.equal(invalid.extraCover.downloads, null);
  assert.equal(invalid.packStudio.downloads, null);

  const zero = await load(async () => Response.json([release([asset('extra-cover-Setup-1.0.0.exe', 0)])]));
  assert.equal(zero.extraCover.downloads, 0, 'Zero is a valid total');

  const unavailable = await load(async () => { throw new Error('Simulated network failure'); });
  assert.equal(unavailable.extraCover.downloads, null);
  assert.ok(unavailable.extraCover.url.startsWith('https://github.com/'));

  process.env.RELEASES_OFFLINE = 'true';
  const offline = await load(async () => { assert.fail('Offline mode must not fetch'); });
  assert.equal(offline.extraCover.downloads, null);
  assert.equal(offline.packStudio.downloads, null);
  console.log('Release download checks passed: pagination, asset filtering, prereleases, drafts, partial failure, invalid counts, zero, API failure and offline mode.');
} finally {
  globalThis.fetch = originalFetch;
  if (originalOffline === undefined) delete process.env.RELEASES_OFFLINE;
  else process.env.RELEASES_OFFLINE = originalOffline;
}
