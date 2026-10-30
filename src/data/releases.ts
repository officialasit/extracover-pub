// Open-beta downloads from github.com/officialasit/extracover-releases.
// Each build asks GitHub for the newest release containing each app's file, so
// the site follows new releases on its next build (the deploy workflow also
// rebuilds on a schedule). The values below are the fallback if GitHub cannot
// be reached; keep them pointing at a real, anonymously downloadable release.
const repo = 'officialasit/extracover-releases';
const repoUrl = `https://github.com/${repo}`;

type Release = { name: string; version: string; file: string; url: string; notes: string; size: string; kind: string; downloads: number | null };
const extraCoverAsset = /^extra-cover-Setup-[\d.]+(?:-[\w.]+)?\.exe$/;
const packStudioAsset = /^packstudio-win-x64\.zip$/;

const fallback: { extraCover: Release; packStudio: Release } = {
  extraCover: {
    name: 'Extra Cover',
    version: '0.2.5',
    file: 'extra-cover-Setup-0.2.5.exe',
    url: `${repoUrl}/releases/download/v0.2.5/extra-cover-Setup-0.2.5.exe`,
    notes: `${repoUrl}/releases/tag/v0.2.5`,
    size: '143 MB',
    kind: 'Windows installer',
    downloads: null,
  },
  packStudio: {
    name: 'Pack Studio',
    version: '0.1.3',
    file: 'packstudio-win-x64.zip',
    url: `${repoUrl}/releases/download/packstudio/packstudio-win-x64.zip`,
    notes: `${repoUrl}/releases/tag/packstudio`,
    size: '102 MB',
    kind: 'Windows ZIP',
    downloads: null,
  },
};

type GitHubRelease = { draft: boolean; prerelease: boolean; tag_name: string; name: string | null; html_url: string; assets: { name: string; size: number; browser_download_url: string; download_count: number }[] };

function totalDownloads(list: GitHubRelease[], asset: RegExp): number {
  return list.filter(release => !release.draft).reduce((total, release) => {
    return total + release.assets.filter(file => asset.test(file.name)).reduce((sum, file) => {
      if (!Number.isSafeInteger(file.download_count) || file.download_count < 0) throw new Error('Invalid GitHub download count');
      return sum + file.download_count;
    }, 0);
  }, 0);
}

// Pick by asset name, not by GitHub's "latest" flag: both apps share one repo,
// and Pack Studio can ship prereleases that /releases/latest never selects.
function pick(list: GitHubRelease[], asset: RegExp, version: (r: GitHubRelease, file: string) => string | undefined, base: Release, allowPrerelease: boolean): Release {
  for (const release of list) {
    if (release.draft || (release.prerelease && !allowPrerelease)) continue;
    const file = release.assets.find(a => asset.test(a.name));
    if (!file) continue;
    return {
      ...base,
      version: version(release, file.name) ?? base.version,
      file: file.name,
      url: file.browser_download_url,
      notes: release.html_url,
      size: `${Math.round(file.size / 1048576)} MB`,
    };
  }
  return base;
}

async function load() {
  if (process.env.RELEASES_OFFLINE === 'true') return fallback;
  try {
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json', 'User-Agent': 'extra-cover-site' };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const signal = AbortSignal.timeout(12000);
    async function page(number: number): Promise<GitHubRelease[]> {
      const response = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=100&page=${number}`, { headers, signal });
      if (!response.ok) throw new Error(`GitHub API ${response.status}`);
      return await response.json() as GitHubRelease[];
    }
    const list = await page(1);
    const result = {
      extraCover: pick(list, extraCoverAsset, (_, file) => file.match(/Setup-(.+)\.exe$/)?.[1], fallback.extraCover, false),
      packStudio: pick(list, packStudioAsset, r => r.name?.match(/Pack Studio\s+(\S+)/)?.[1], fallback.packStudio, true),
    };
    try {
      // Counts cover all retained releases, including public prereleases. Never
      // display a partial total if fetching an older page fails.
      let batch = list;
      for (let number = 2; batch.length === 100; number++) {
        batch = await page(number);
        list.push(...batch);
      }
      result.extraCover = { ...pick(list, extraCoverAsset, (_, file) => file.match(/Setup-(.+)\.exe$/)?.[1], fallback.extraCover, false), downloads: totalDownloads(list, extraCoverAsset) };
      result.packStudio = { ...pick(list, packStudioAsset, r => r.name?.match(/Pack Studio\s+(\S+)/)?.[1], fallback.packStudio, true), downloads: totalDownloads(list, packStudioAsset) };
    } catch (error) {
      result.extraCover.downloads = null;
      result.packStudio.downloads = null;
      console.warn(`[releases] Omitting download counts: ${(error as Error).message}`);
    }
    return result;
  } catch (error) {
    console.warn(`[releases] Using fallback download links: ${(error as Error).message}`);
    return fallback;
  }
}

export const releases = { ...(await load()), all: `${repoUrl}/releases` };
