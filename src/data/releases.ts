// Public open-beta downloads from github.com/officialasit/extracover-releases.
// Update these when a new release is published; check each URL works without a
// GitHub login. Use explicit asset URLs: /releases/latest skips prereleases.
const repo = 'https://github.com/officialasit/extracover-releases';

export const releases = {
  extraCover: {
    name: 'Extra Cover',
    version: '0.2.1',
    file: 'extra-cover-Setup-0.2.1.exe',
    url: `${repo}/releases/download/v0.2.1/extra-cover-Setup-0.2.1.exe`,
    notes: `${repo}/releases/tag/v0.2.1`,
    size: '143 MB',
    kind: 'Windows installer',
  },
  packStudio: {
    name: 'Pack Studio',
    version: '0.1.1-beta.2',
    file: 'packstudio-win-x64.zip',
    url: `${repo}/releases/download/packstudio-beta/packstudio-win-x64.zip`,
    notes: `${repo}/releases/tag/packstudio-beta`,
    size: '102 MB',
    kind: 'Windows ZIP',
  },
  all: `${repo}/releases`,
};
