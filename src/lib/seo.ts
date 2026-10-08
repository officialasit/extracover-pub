export const pageTitle = 'Extra Cover — Cricket 26 Mod Manager for Windows';
export const pageDescription = 'Download Extra Cover, the free Cricket 26 mod manager for Windows, now in open beta. Install community packs in one click or create your own with Pack Studio.';

import { releases } from '../data/releases';

// Production pages can be indexed. Set SITE_INDEXING=false for staging builds.
export const indexingEnabled = import.meta.env.PROD && import.meta.env.SITE_INDEXING !== 'false';

export function siteUrls(site: URL | undefined, base = import.meta.env.BASE_URL) {
  if (!site) throw new Error('Configure Astro site before generating SEO metadata.');
  const path = `/${base.replace(/^\/+|\/+$/g, '')}`.replace(/\/$/, '') + '/';
  const home = new URL(path, site).href;
  return {
    home,
    sitemap: new URL('sitemap.xml', home).href,
    socialImage: new URL('images/social-preview.jpg', home).href,
    logo: new URL('images/brand-icon.png', home).href,
    installGuide: new URL(installGuide.path, home).href,
  };
}

export const installGuide = {
  path: 'guides/install-cricket-26-mods/',
  title: 'How to Install Mods in Cricket 26 on PC — Extra Cover Guide',
  headline: 'How to install mods in Cricket 26 on PC',
  description: 'Step-by-step guide to installing Cricket 26 mods on a Windows PC with Extra Cover: download, setup, supported pack formats, installing and undoing packs, and troubleshooting.',
  published: '2026-10-08',
  modified: '2026-10-08',
};

export function guideStructuredData(urls: ReturnType<typeof siteUrls>) {
  const page = urls.installGuide;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle', '@id': `${page}#article`,
        headline: installGuide.headline, description: installGuide.description,
        url: page, mainEntityOfPage: page, inLanguage: 'en',
        datePublished: installGuide.published, dateModified: installGuide.modified,
        image: urls.socialImage,
        author: { '@type': 'Organization', name: 'Extra Cover', url: urls.home },
        publisher: { '@type': 'Organization', name: 'Extra Cover', url: urls.home, logo: { '@type': 'ImageObject', url: urls.logo } },
        isPartOf: { '@id': `${urls.home}#website` },
        about: { '@id': `${urls.home}#software` },
      },
      {
        '@type': 'BreadcrumbList', '@id': `${page}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Extra Cover', item: urls.home },
          { '@type': 'ListItem', position: 2, name: 'Install mods in Cricket 26', item: page },
        ],
      },
    ],
  };
}

export function structuredData(urls: ReturnType<typeof siteUrls>, faqs: string[][]) {
  const software = `${urls.home}#software`;
  const studio = `${urls.home}#studio-software`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite', '@id': `${urls.home}#website`,
        name: 'Extra Cover', url: urls.home, inLanguage: 'en',
      },
      {
        '@type': ['WebPage', 'FAQPage'], '@id': `${urls.home}#webpage`,
        url: urls.home, name: pageTitle, description: pageDescription,
        inLanguage: 'en', isPartOf: { '@id': `${urls.home}#website` },
        about: [{ '@id': software }, { '@id': studio }],
        primaryImageOfPage: { '@type': 'ImageObject', url: urls.socialImage, width: 1200, height: 630 },
        mainEntity: faqs.map(([question, answer]) => ({
          '@type': 'Question', name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      },
      {
        '@type': 'SoftwareApplication', '@id': software,
        name: 'Extra Cover', url: `${urls.home}#extra-cover`, image: urls.logo,
        applicationCategory: 'UtilitiesApplication', operatingSystem: 'Windows',
        isAccessibleForFree: true,
        description: 'Extra Cover is an independent, free-to-use Windows mod manager for Cricket 26 on Steam. It installs compatible .c26pack files after initial setup. Free open beta.',
        softwareVersion: releases.extraCover.version,
        downloadUrl: releases.extraCover.url, releaseNotes: releases.extraCover.notes,
        softwareRequirements: 'Windows 10 or 11 and Cricket 26 installed through Steam.',
      },
      {
        '@type': 'SoftwareApplication', '@id': studio,
        name: 'Pack Studio', url: `${urls.home}#pack-studio`,
        applicationCategory: 'DesignApplication', operatingSystem: 'Windows',
        isAccessibleForFree: true,
        description: 'Pack Studio is the free, optional Cricket 26 texture-pack creator. Export supported textures as PNGs, edit them in your own image editor, then build a .c26pack for Extra Cover. Free open beta.',
        softwareVersion: releases.packStudio.version,
        downloadUrl: releases.packStudio.url, releaseNotes: releases.packStudio.notes,
        softwareRequirements: 'Windows 10 or 11, Cricket 26 installed through Steam, and an image editor. Keep exported filenames, dimensions, and transparency.',
      },
    ],
  };
}

export function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]!);
}
