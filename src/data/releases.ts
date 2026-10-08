// Open-beta downloads from github.com/officialasit/extracover-releases.
// Each build asks GitHub for the newest release containing each app's file, so
// the site follows new releases on its next build (the deploy workflow also
// rebuilds on a schedule). The values below are the fallback if GitHub cannot
// be reached; keep them pointing at a real, anonymously downloadable release.
const repo = 'officialasit/extracover-releases';
const repoUrl = `https://github.com/${repo}`;

type Release = { name: string; version: string; file: string; url: string; notes: string; size: string; kind: string };

const fallback: { extraCover: Release; packStudio: Release } = {
  extraCover: {
    name: 'Extra Cover',
    version: '0.2.2',
    file: 'extra-cover-Setup-0.2.2.exe',
    url: `${repoUrl}/releases/download/v0.2.2/extra-cover-Setup-0.2.2.exe`,
    notes: `${repoUrl}/releases/tag/v0.2.2`,
    size: '143 MB',
    kind: 'Windows installer',
  },
  packStudio: {
    name: 'Pack Studio',
    version: '0.1.1-beta.2',
    file: 'packstudio-win-x64.zip',
    url: `${repoUrl}/releases/download/packstudio-beta/packstudio-win-x64.zip`,
    notes: `${repoUrl}/releases/tag/packstudio-beta`,
    size: '102 MB',
    kind: 'Windows ZIP',
  },
};

type GitHubRelease = { draft: boolean; prerelease: boolean; tag_name: string; name: string | null; html_url: string; assets: { name: string; size: number; browser_download_url: string }[] };

// Pick by asset name, not by GitHub's "latest" flag: both apps share one repo,
// and Pack Studio ships as a prerelease that /releases/latest never selects.
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
    const response = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=30`, { headers, signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error(`GitHub API ${response.status}`);
    const list = await response.json() as GitHubRelease[];
    return {
      extraCover: pick(list, /^extra-cover-Setup-[\d.]+(?:-[\w.]+)?\.exe$/, (_, file) => file.match(/Setup-(.+)\.exe$/)?.[1], fallback.extraCover, false),
      packStudio: pick(list, /^packstudio-win-x64\.zip$/, r => r.name?.match(/Pack Studio\s+(\S+)/)?.[1], fallback.packStudio, true),
    };
  } catch (error) {
    console.warn(`[releases] Using fallback download links: ${(error as Error).message}`);
    return fallback;
  }
}

export const releases = { ...(await load()), all: `${repoUrl}/releases` };
